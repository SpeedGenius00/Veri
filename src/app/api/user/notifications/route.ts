import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const notificationsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  detectionComplete: z.boolean().optional(),
  certificateVerified: z.boolean().optional(),
  usageAlerts: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
})

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = notificationsSchema.parse(body)

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailNotifications: data.emailNotifications,
        marketingEmails: data.marketingEmails,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("Update notifications error:", error)
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}

