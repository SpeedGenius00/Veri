import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PLANS } from "@/lib/constants"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true,
        detectionsToday: true,
        detectionsThisMonth: true,
        certificatesThisMonth: true,
        apiCallsThisMonth: true,
        lastDailyReset: true,
        lastMonthlyReset: true,
        stripeCurrentPeriodEnd: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const plan = PLANS[user.plan as keyof typeof PLANS] || PLANS.FREE

    // Check if daily reset is needed
    const now = new Date()
    const lastDailyReset = new Date(user.lastDailyReset)
    const needsDailyReset = now.toDateString() !== lastDailyReset.toDateString()
    
    // Check if monthly reset is needed
    const lastMonthlyReset = new Date(user.lastMonthlyReset)
    const needsMonthlyReset = now.getMonth() !== lastMonthlyReset.getMonth() ||
                              now.getFullYear() !== lastMonthlyReset.getFullYear()

    const detectionsToday = needsDailyReset ? 0 : user.detectionsToday
    const detectionsThisMonth = needsMonthlyReset ? 0 : user.detectionsThisMonth
    const certificatesThisMonth = needsMonthlyReset ? 0 : user.certificatesThisMonth
    const apiCallsThisMonth = needsMonthlyReset ? 0 : user.apiCallsThisMonth

    return NextResponse.json({
      plan: user.plan,
      planName: plan.name,
      billing: {
        currentPeriodEnd: user.stripeCurrentPeriodEnd,
      },
      usage: {
        detections: {
          today: detectionsToday,
          dailyLimit: plan.limits.detectionsPerDay,
          thisMonth: detectionsThisMonth,
        },
        certificates: {
          thisMonth: certificatesThisMonth,
          monthlyLimit: plan.limits.certificatesPerMonth,
        },
        apiCalls: {
          thisMonth: apiCallsThisMonth,
          monthlyLimit: plan.limits.apiCallsPerMonth,
        },
      },
      limits: plan.limits,
    })
  } catch (error) {
    console.error("Get usage error:", error)
    return NextResponse.json({ error: "Failed to get usage" }, { status: 500 })
  }
}

