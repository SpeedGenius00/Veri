import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { generateId } from "@/lib/utils"

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = schema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success (don't reveal if email exists)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, a reset email has been sent.",
      })
    }

    // Delete existing tokens
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    })

    // Create new token
    const token = generateId("reset")
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    // TODO: Send email with reset link
    // For now, log it
    console.log(`Password reset link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`)

    return NextResponse.json({
      success: true,
      message: "If an account exists, a reset email has been sent.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
