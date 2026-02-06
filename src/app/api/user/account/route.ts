import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Cancel active Stripe subscription if one exists
    if (user.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(user.stripeSubscriptionId)
      } catch (error) {
        console.error("Failed to cancel Stripe subscription:", error)
        // Continue with deletion even if Stripe cancellation fails
      }
    }

    // Delete the user — cascading deletes handle related records
    // (accounts, sessions, certificates, apiKeys, webhooks, notifications)
    // Detections have onDelete: SetNull, so they'll keep the record but remove userId
    await prisma.user.delete({
      where: { id: session.user.id },
    })

    return NextResponse.json({ message: "Account deleted successfully" })
  } catch (error) {
    console.error("Delete account error:", error)
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    )
  }
}
