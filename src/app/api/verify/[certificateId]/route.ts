import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyCertificate } from "@/lib/certification"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params

    const certificate = await prisma.certificate.findUnique({
      where: { certificateId },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            image: true,
            isVerifiedCreator: true,
          },
        },
      },
    })

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      )
    }

    // Check if revoked
    if (certificate.status === "REVOKED") {
      return NextResponse.json({
        isValid: false,
        certificateId,
        status: "REVOKED",
        revokedAt: certificate.revokedAt,
        revokedReason: certificate.revokedReason,
        message: "This certificate has been revoked",
      })
    }

    // Verify cryptographic signature
    const verification = verifyCertificate({
      certificateId: certificate.certificateId,
      contentHash: certificate.contentHash,
      contentType: certificate.contentType,
      contentSize: certificate.contentSize,
      creatorId: certificate.userId,
      creatorName: certificate.user.name || "Anonymous",
      title: certificate.title,
      certifiedAt: certificate.certifiedAt.toISOString(),
      signature: certificate.signature,
      publicKey: certificate.publicKey,
    })

    // Record verification
    await prisma.verification.create({
      data: {
        certificateId: certificate.id,
        verifierIp: req.headers.get("x-forwarded-for")?.split(",")[0] || null,
        verifierUserAgent: req.headers.get("user-agent"),
        method: "LINK",
        contentHashMatch: true,
        signatureValid: verification.isValid,
        certificateActive: certificate.status === "ACTIVE",
        isValid: verification.isValid && certificate.status === "ACTIVE",
      },
    })

    // Update verification count
    await prisma.certificate.update({
      where: { id: certificate.id },
      data: {
        verificationCount: { increment: 1 },
        lastVerifiedAt: new Date(),
      },
    })

    return NextResponse.json({
      isValid: verification.isValid && certificate.status === "ACTIVE",
      certificateId: certificate.certificateId,
      status: certificate.status,

      certificate: {
        title: certificate.title,
        description: certificate.description,
        contentType: certificate.contentType,
        contentHash: certificate.contentHash,
        contentSize: certificate.contentSize,
        tags: certificate.tags,
        contentCreatedAt: certificate.contentCreatedAt,
        certifiedAt: certificate.certifiedAt,
      },

      creator: {
        name: certificate.user.name,
        username: certificate.user.username,
        image: certificate.user.image,
        isVerified: certificate.user.isVerifiedCreator,
      },

      verification: {
        signatureValid: verification.isValid,
        certificateActive: certificate.status === "ACTIVE",
        verificationCount: certificate.verificationCount + 1,
        lastVerifiedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    )
  }
}

