import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const where: any = { userId: session.user.id }
    
    if (status) {
      where.status = status
    }
    
    if (search) {
      where.title = { contains: search, mode: "insensitive" }
    }

    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          certificateId: true,
          title: true,
          description: true,
          contentType: true,
          contentHash: true,
          status: true,
          isPublic: true,
          verificationCount: true,
          certifiedAt: true,
          createdAt: true,
        },
      }),
      prisma.certificate.count({ where }),
    ])

    return NextResponse.json({
      certificates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get certificates error:", error)
    return NextResponse.json(
      { error: "Failed to get certificates" },
      { status: 500 }
    )
  }
}

