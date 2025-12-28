import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { createCertificate, hashContent } from "@/lib/certification"
import { PLANS } from "@/lib/constants"

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

const metadataSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  contentCreatedAt: z.string().datetime().optional(),
  tags: z.array(z.string()).max(10).optional(),
  isPublic: z.boolean().default(true),
})

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Check usage limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        certificatesThisMonth: true,
        lastMonthlyReset: true,
        name: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Reset monthly count if needed
    const now = new Date()
    const lastReset = new Date(user.lastMonthlyReset)
    const shouldReset = now.getMonth() !== lastReset.getMonth() || 
                        now.getFullYear() !== lastReset.getFullYear()

    if (shouldReset) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          certificatesThisMonth: 0,
          lastMonthlyReset: now,
        },
      })
    }

    const plan = PLANS[user.plan as keyof typeof PLANS] || PLANS.FREE
    const currentCerts = shouldReset ? 0 : user.certificatesThisMonth

    if (currentCerts >= plan.limits.certificatesPerMonth) {
      return NextResponse.json(
        { error: "Monthly certificate limit reached. Upgrade your plan for more." },
        { status: 429 }
      )
    }

    // Parse form data
    const formData = await req.formData()
    const file = formData.get("file") as File
    const metadataStr = formData.get("metadata") as string

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB." },
        { status: 400 }
      )
    }

    // Parse metadata
    let metadata
    try {
      metadata = metadataSchema.parse(JSON.parse(metadataStr || "{}"))
    } catch (e) {
      if (e instanceof z.ZodError) {
        return NextResponse.json(
          { error: e.issues[0].message },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: "Invalid metadata" },
        { status: 400 }
      )
    }

    // Process file
    const contentBuffer = Buffer.from(await file.arrayBuffer())
    const contentHash = hashContent(contentBuffer)
    const contentSize = contentBuffer.length
    const mimeType = file.type

    // Determine content type
    let contentType: "IMAGE" | "VIDEO" | "AUDIO" | "TEXT" | "DOCUMENT"
    if (mimeType.startsWith("image/")) {
      contentType = "IMAGE"
    } else if (mimeType.startsWith("video/")) {
      contentType = "VIDEO"
    } else if (mimeType.startsWith("audio/")) {
      contentType = "AUDIO"
    } else if (mimeType.startsWith("text/")) {
      contentType = "TEXT"
    } else {
      contentType = "DOCUMENT"
    }

    // Check for duplicate
    const existing = await prisma.certificate.findFirst({
      where: {
        contentHash,
        userId,
        status: "ACTIVE",
      },
    })

    if (existing) {
      return NextResponse.json(
        {
          error: "You have already certified this content",
          existingId: existing.certificateId,
        },
        { status: 409 }
      )
    }

    // Create cryptographic certificate
    const signedCert = createCertificate({
      contentHash,
      contentType,
      contentSize,
      creatorId: userId,
      creatorName: user.name || "Anonymous",
      title: metadata.title,
    })

    // Store in database
    // Note: In production, you'd upload to S3 and store the URL
    // For this version, we're not storing the actual file
    const certificate = await prisma.certificate.create({
      data: {
        certificateId: signedCert.certificateId,
        userId,
        contentType,
        contentUrl: `local://${contentHash}`, // Placeholder
        contentHash,
        contentSize,
        originalFilename: file.name,
        mimeType,
        title: metadata.title,
        description: metadata.description,
        contentCreatedAt: metadata.contentCreatedAt 
          ? new Date(metadata.contentCreatedAt) 
          : null,
        tags: metadata.tags || [],
        isPublic: metadata.isPublic,
        signature: signedCert.signature,
        publicKey: signedCert.publicKey,
        signatureAlgorithm: signedCert.algorithm,
        certifiedAt: new Date(signedCert.certifiedAt),
      },
    })

    // Increment usage
    await prisma.user.update({
      where: { id: userId },
      data: {
        certificatesThisMonth: { increment: 1 },
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: "CERTIFICATE_CREATED",
        title: "Certificate Created",
        message: `Your certificate for "${metadata.title}" has been created.`,
        data: { certificateId: certificate.certificateId },
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    return NextResponse.json(
      {
        id: certificate.id,
        certificateId: certificate.certificateId,
        contentHash,
        signature: certificate.signature,
        certifiedAt: certificate.certifiedAt,
        verifyUrl: `${appUrl}/verify/${certificate.certificateId}`,
        certificateUrl: `${appUrl}/certificate/${certificate.certificateId}`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Certification error:", error)
    return NextResponse.json(
      { error: "Certification failed. Please try again." },
      { status: 500 }
    )
  }
}

