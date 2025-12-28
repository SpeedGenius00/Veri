import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          { id },
          { certificateId: id },
        ],
      },
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

    // Check if private
    if (!certificate.isPublic) {
      const session = await getServerSession()
      if (certificate.userId !== session?.user?.id) {
        return NextResponse.json(
          { error: "This certificate is private" },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({
      id: certificate.id,
      certificateId: certificate.certificateId,
      title: certificate.title,
      description: certificate.description,
      contentType: certificate.contentType,
      contentHash: certificate.contentHash,
      contentSize: certificate.contentSize,
      status: certificate.status,
      isPublic: certificate.isPublic,
      tags: certificate.tags,
      verificationCount: certificate.verificationCount,
      contentCreatedAt: certificate.contentCreatedAt,
      certifiedAt: certificate.certifiedAt,
      createdAt: certificate.createdAt,
      creator: certificate.user,
      signature: certificate.signature,
      publicKey: certificate.publicKey,
      signatureAlgorithm: certificate.signatureAlgorithm,
    })
  } catch (error) {
    console.error("Get certificate error:", error)
    return NextResponse.json(
      { error: "Failed to get certificate" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Soft delete (revoke)
    await prisma.certificate.update({
      where: { id: certificate.id },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
        revokedReason: "Revoked by owner",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Certificate revoked",
    })
  } catch (error) {
    console.error("Revoke certificate error:", error)
    return NextResponse.json(
      { error: "Failed to revoke certificate" },
      { status: 500 }
    )
  }
}

