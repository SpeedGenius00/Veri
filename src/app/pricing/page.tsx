import Link from "next/link"
import { Check, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PLANS } from "@/lib/constants"

const features = [
  { name: "Image detection", free: true, creator: true, pro: true, business: true },
  { name: "Text detection", free: true, creator: true, pro: true, business: true },
  { name: "Video detection", free: false, creator: true, pro: true, business: true },
  { name: "Audio detection", free: false, creator: true, pro: true, business: true },
  { name: "Basic certificates", free: true, creator: true, pro: true, business: true },
  { name: "Custom branding", free: false, creator: true, pro: true, business: true },
  { name: "API access", free: false, creator: false, pro: true, business: true },
  { name: "Webhooks", free: false, creator: false, pro: true, business: true },
  { name: "Team members", free: false, creator: false, pro: false, business: true },
  { name: "Priority support", free: false, creator: false, pro: true, business: true },
  { name: "SLA guarantee", free: false, creator: false, pro: false, business: true },
]

export default function PricingPage() {
  const plans = [
    { ...PLANS.FREE, popular: false },
    { ...PLANS.CREATOR, popular: false },
    { ...PLANS.PRO, popular: true },
    { ...PLANS.BUSINESS, popular: false },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need more. No hidden fees.
            </p>
          </div>
        </section>

        {/* Plans */}
        <section className="py-12">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={plan.popular ? "border-primary shadow-lg relative" : ""}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      {plan.price.monthly === 0 ? (
                        <span className="text-3xl font-bold">Free</span>
                      ) : (
                        <>
                          <span className="text-3xl font-bold">
                            ${plan.price.monthly}
                          </span>
                          <span className="text-muted-foreground">/month</span>
                        </>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {plan.limits.detectionsPerDay} detections/day
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {plan.limits.certificatesPerMonth} certificates/month
                      </li>
                      {plan.limits.apiCallsPerMonth > 0 && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          {plan.limits.apiCallsPerMonth.toLocaleString()} API calls/month
                        </li>
                      )}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href={plan.id === "FREE" ? "/signup" : "/signup"} className="w-full">
                      <Button 
                        className="w-full" 
                        variant={plan.popular ? "default" : "outline"}
                      >
                        {plan.id === "FREE" ? "Get Started" : "Start Free Trial"}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-12 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl font-bold text-center mb-8">
              Feature Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4">Feature</th>
                    <th className="text-center py-4 px-4">Free</th>
                    <th className="text-center py-4 px-4">Creator</th>
                    <th className="text-center py-4 px-4">Pro</th>
                    <th className="text-center py-4 px-4">Business</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature) => (
                    <tr key={feature.name} className="border-b">
                      <td className="py-4 px-4">{feature.name}</td>
                      <td className="text-center py-4 px-4">
                        {feature.free ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        {feature.creator ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        {feature.pro ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        {feature.business ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12">
          <div className="container max-w-3xl">
            <h2 className="text-2xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You'll continue 
                  to have access until the end of your billing period.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards through Stripe. Enterprise customers 
                  can also pay by invoice.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                <p className="text-muted-foreground">
                  Yes, all paid plans come with a 14-day free trial. No credit card 
                  required to start.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What happens if I exceed my limits?</h3>
                <p className="text-muted-foreground">
                  You'll receive a notification when approaching your limits. Once 
                  reached, you can upgrade or wait until the next billing cycle.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of creators and businesses using Veri
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="gap-2">
                <Zap className="h-4 w-4" />
                Start Free Today
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

