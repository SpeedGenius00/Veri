import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headerList = await headers()
  const signature = headerList.get("stripe-signature")!

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any
        const userId = session.metadata?.userId
        const planId = session.metadata?.planId

        if (userId && planId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: planId as any,
              stripeSubscriptionId: session.subscription,
              stripePriceId: session.metadata?.priceId,
            },
          })

          await prisma.notification.create({
            data: {
              userId,
              type: "SUBSCRIPTION_CREATED",
              title: "Subscription Activated",
              message: `Your ${planId} subscription is now active. Enjoy your new features!`,
            },
          })
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any
        const customerId = subscription.customer

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          })
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any
        const customerId = subscription.customer

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: "FREE",
              stripeSubscriptionId: null,
              stripePriceId: null,
              stripeCurrentPeriodEnd: null,
            },
          })

          await prisma.notification.create({
            data: {
              userId: user.id,
              type: "SUBSCRIPTION_CANCELLED",
              title: "Subscription Cancelled",
              message: "Your subscription has been cancelled. You are now on the Free plan.",
            },
          })
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any
        const customerId = invoice.customer

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: "PAYMENT_FAILED",
              title: "Payment Failed",
              message: "We couldn't process your payment. Please update your payment method.",
            },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

