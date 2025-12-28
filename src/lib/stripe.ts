import Stripe from "stripe"

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null

export const stripe = (() => {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      // Return a mock instance during build if key is missing
      // This will fail at runtime if actually used without a key
      stripeInstance = new Stripe("sk_test_placeholder", {
        typescript: true,
      })
    } else {
      stripeInstance = new Stripe(secretKey, {
        typescript: true,
      })
    }
  }
  return stripeInstance
})()

export const STRIPE_PRICES = {
  CREATOR: {
    monthly: process.env.STRIPE_PRICE_CREATOR_MONTHLY,
    yearly: process.env.STRIPE_PRICE_CREATOR_YEARLY,
  },
  PRO: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
  },
  BUSINESS: {
    monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
    yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY,
  },
}

