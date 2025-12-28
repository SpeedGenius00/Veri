import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal("")),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        website: true,
        plan: true,
        isVerifiedCreator: true,
        emailNotifications: true,
        marketingEmails: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = updateSchema.parse(body)

    // Check username availability
    if (data.username) {
      const existing = await prisma.user.findUnique({
        where: { username: data.username },
      })
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 409 }
        )
      }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        username: data.username || null,
        bio: data.bio || null,
        website: data.website || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        bio: true,
        website: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

