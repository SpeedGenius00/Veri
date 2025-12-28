"use client"

import { useEffect, useState } from "react"
import { 
  CreditCard, 
  Check, 
  Zap, 
  Loader2,
  ExternalLink,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PLANS } from "@/lib/constants"
import { toast } from "sonner"

interface UsageData {
  plan: string
  planName: string
  usage: {
    detections: { today: number; dailyLimit: number; thisMonth: number }
    certificates: { thisMonth: number; monthlyLimit: number }
    apiCalls: { thisMonth: number; monthlyLimit: number }
  }
  limits: {
    detectionsPerDay: number
    certificatesPerMonth: number
    apiCallsPerMonth: number
  }
}

export default function BillingPage() {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch("/api/user/usage")
        const data = await response.json()
        setUsage(data)
      } catch (error) {
        toast.error("Failed to load usage data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsage()
  }, [])

  const handleUpgrade = async (planId: string) => {
    setIsUpgrading(planId)

    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          planId,
          successUrl: `${window.location.origin}/dashboard/billing?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/billing?canceled=true`,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to create checkout session")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start upgrade")
    } finally {
      setIsUpgrading(null)
    }
  }

  const handleManageBilling = async () => {
    try {
      const response = await fetch("/api/subscription/portal", {
        method: "POST",
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to open billing portal")
      }
    } catch (error) {
      toast.error("Failed to open billing portal")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const currentPlan = usage?.plan || "FREE"
  const plans = Object.entries(PLANS).filter(([id]) => id !== "ENTERPRISE")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan & Usage */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                You are currently on the {usage?.planName} plan
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-1">
              {usage?.planName}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Detections Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Daily Detections</span>
              <span className="text-sm text-muted-foreground">
                {usage?.usage.detections.today} / {usage?.limits.detectionsPerDay}
              </span>
            </div>
            <Progress 
              value={(usage?.usage.detections.today || 0) / (usage?.limits.detectionsPerDay || 1) * 100} 
            />
          </div>

          {/* Certificates Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Monthly Certificates</span>
              <span className="text-sm text-muted-foreground">
                {usage?.usage.certificates.thisMonth} / {usage?.limits.certificatesPerMonth}
              </span>
            </div>
            <Progress 
              value={(usage?.usage.certificates.thisMonth || 0) / (usage?.limits.certificatesPerMonth || 1) * 100} 
            />
          </div>

          {/* API Calls Usage */}
          {(usage?.limits.apiCallsPerMonth || 0) > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Monthly API Calls</span>
                <span className="text-sm text-muted-foreground">
                  {usage?.usage.apiCalls.thisMonth} / {usage?.limits.apiCallsPerMonth}
                </span>
              </div>
              <Progress 
                value={(usage?.usage.apiCalls.thisMonth || 0) / (usage?.limits.apiCallsPerMonth || 1) * 100} 
              />
            </div>
          )}
        </CardContent>
        {currentPlan !== "FREE" && (
          <CardFooter>
            <Button variant="outline" onClick={handleManageBilling}>
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Billing
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map(([id, plan]) => {
            const isCurrentPlan = id === currentPlan
            const price = plan.price.monthly

            return (
              <Card 
                key={id} 
                className={isCurrentPlan ? "border-primary" : ""}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {isCurrentPlan && (
                      <Badge>Current</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {price === 0 ? (
                      <span className="text-2xl font-bold">Free</span>
                    ) : (
                      <>
                        <span className="text-2xl font-bold">${price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {plan.limits.detectionsPerDay} detections/day
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {plan.limits.certificatesPerMonth} certificates/month
                    </li>
                    {plan.limits.apiCallsPerMonth > 0 && (
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        {plan.limits.apiCallsPerMonth.toLocaleString()} API calls/month
                      </li>
                    )}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : price === 0 ? (
                    <Button variant="outline" className="w-full" disabled>
                      Free Tier
                    </Button>
                  ) : (
                    <Button 
                      className="w-full gap-2"
                      onClick={() => handleUpgrade(id)}
                      disabled={isUpgrading === id}
                    >
                      {isUpgrading === id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      Upgrade
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Enterprise CTA */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardContent className="flex items-center justify-between py-6">
          <div>
            <h3 className="font-semibold text-lg">Need more?</h3>
            <p className="text-purple-100">
              Contact us for enterprise plans with custom limits and dedicated support
            </p>
          </div>
          <Button variant="secondary">
            Contact Sales
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Note about Stripe */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Payments are securely processed by Stripe. You can cancel your subscription at any time.
        </AlertDescription>
      </Alert>
    </div>
  )
}

