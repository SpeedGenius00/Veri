import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { detectContent, getContentType, hashContent } from "@/lib/detection"
import { PLANS } from "@/lib/constants"

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    const userId = session?.user?.id || null

    // Check usage limits for logged-in users
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          plan: true, 
          detectionsToday: true,
          lastDailyReset: true 
        },
      })

      if (user) {
        // Reset daily count if needed
        const now = new Date()
        const lastReset = new Date(user.lastDailyReset)
        const shouldReset = now.toDateString() !== lastReset.toDateString()

        if (shouldReset) {
          await prisma.user.update({
            where: { id: userId },
            data: { 
              detectionsToday: 0, 
              lastDailyReset: now 
            },
          })
        }

        const plan = PLANS[user.plan as keyof typeof PLANS] || PLANS.FREE
        const currentDetections = shouldReset ? 0 : user.detectionsToday

        if (currentDetections >= plan.limits.detectionsPerDay) {
          return NextResponse.json(
            { error: "Daily detection limit reached. Upgrade your plan for more." },
            { status: 429 }
          )
        }
      }
    }

    // Parse form data
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const text = formData.get("text") as string | null

    if (!file && !text) {
      return NextResponse.json(
        { error: "Please provide a file or text to analyze" },
        { status: 400 }
      )
    }

    let contentType: "IMAGE" | "VIDEO" | "AUDIO" | "TEXT" | "DOCUMENT"
    let contentBuffer: Buffer | null = null
    let textContent: string | null = null
    let contentHash: string
    let contentSize: number
    let mimeType: string | null = null
    let originalFilename: string | null = null

    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File too large. Maximum size is 20MB." },
          { status: 400 }
        )
      }

      contentBuffer = Buffer.from(await file.arrayBuffer())
      contentHash = hashContent(contentBuffer)
      contentSize = contentBuffer.length
      mimeType = file.type
      originalFilename = file.name
      contentType = getContentType(file.type)
    } else if (text) {
      if (text.length < 50) {
        return NextResponse.json(
          { error: "Text must be at least 50 characters for accurate analysis" },
          { status: 400 }
        )
      }

      textContent = text
      contentType = "TEXT"
      contentHash = hashContent(Buffer.from(text))
      contentSize = Buffer.from(text).length
    } else {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      )
    }

    // Run detection
    const result = await detectContent(
      contentBuffer || textContent!,
      contentType,
      mimeType || undefined,
      originalFilename || undefined
    )

    // Save to database
    const detection = await prisma.detection.create({
      data: {
        userId,
        contentType,
        contentHash,
        contentSize,
        originalFilename,
        mimeType,
        textContent: textContent?.slice(0, 10000), // Limit stored text
        textLength: textContent?.length,
        status: "COMPLETED",
        authenticityScore: result.authenticityScore,
        verdict: result.verdict as any,
        confidence: result.confidence,
        analysisResults: result.analysis as any,
        processingTimeMs: result.processingTimeMs,
        completedAt: new Date(),
        ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0] || null,
        userAgent: req.headers.get("user-agent"),
      },
    })

    // Increment usage for logged-in users
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          detectionsToday: { increment: 1 },
          detectionsThisMonth: { increment: 1 },
        },
      })
    }

    return NextResponse.json({
      id: detection.id,
      contentType: detection.contentType,
      authenticityScore: detection.authenticityScore,
      verdict: detection.verdict,
      confidence: detection.confidence,
      analysis: detection.analysisResults,
      processingTimeMs: detection.processingTimeMs,
      createdAt: detection.createdAt,
    })
  } catch (error) {
    console.error("Detection error:", error)
    return NextResponse.json(
      { error: "Detection failed. Please try again." },
      { status: 500 }
    )
  }
}
