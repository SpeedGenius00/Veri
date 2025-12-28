import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    const { id } = await params

    const detection = await prisma.detection.findUnique({
      where: { id },
    })

    if (!detection) {
      return NextResponse.json(
        { error: "Detection not found" },
        { status: 404 }
      )
    }

    // Check authorization (only owner or admin can see full details)
    if (detection.userId && detection.userId !== session?.user?.id) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      id: detection.id,
      contentType: detection.contentType,
      originalFilename: detection.originalFilename,
      contentSize: detection.contentSize,
      status: detection.status,
      authenticityScore: detection.authenticityScore,
      verdict: detection.verdict,
      confidence: detection.confidence,
      analysis: detection.analysisResults,
      processingTimeMs: detection.processingTimeMs,
      createdAt: detection.createdAt,
      completedAt: detection.completedAt,
    })
  } catch (error) {
    console.error("Get detection error:", error)
    return NextResponse.json(
      { error: "Failed to get detection" },
      { status: 500 }
    )
  }
}
