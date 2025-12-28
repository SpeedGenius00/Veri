import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import crypto from "crypto"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { PLANS } from "@/lib/constants"

const createSchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const keys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        usageCount: true,
        lastUsedAt: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ keys })
  } catch (error) {
    console.error("Get API keys error:", error)
    return NextResponse.json({ error: "Failed to get API keys" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has API access
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    })

    const plan = PLANS[user?.plan as keyof typeof PLANS] || PLANS.FREE
    if (plan.limits.apiCallsPerMonth === 0) {
      return NextResponse.json(
        { error: "API access requires a Pro plan or higher" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { name, permissions } = createSchema.parse(body)

    // Generate API key
    const rawKey = `veri_${crypto.randomBytes(32).toString("hex")}`
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex")
    const keyPrefix = rawKey.slice(0, 12)

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        name,
        keyHash,
        keyPrefix,
        permissions: permissions || ["detect", "verify"],
      },
    })

    return NextResponse.json({
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey, // Only returned once!
      keyPrefix,
      permissions: apiKey.permissions,
      message: "Save this key securely. It won't be shown again.",
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("Create API key error:", error)
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 })
  }
}

