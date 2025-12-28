import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const revokeSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(500),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()

    let reason = "Revoked by owner"
    try {
      const parsed = revokeSchema.parse(body)
      reason = parsed.reason
    } catch (e) {
      // Use default reason
    }

    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          { id },
          { certificateId: id },
        ],
        userId: session.user.id,
      },
    })

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      )
    }

    if (certificate.status === "REVOKED") {
      return NextResponse.json(
        { error: "Certificate is already revoked" },
        { status: 400 }
      )
    }

    await prisma.certificate.update({
      where: { id: certificate.id },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
        revokedReason: reason,
      },
    })

    return NextResponse.json({
      success: true,
      certificateId: certificate.certificateId,
      status: "REVOKED",
      revokedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Revoke certificate error:", error)
    return NextResponse.json(
      { error: "Failed to revoke certificate" },
      { status: 500 }
    )
  }
}

