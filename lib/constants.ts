export const PLANS = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    description: 'For trying out Veri',
    price: {
      monthly: 0,
      yearly: 0
    },
    limits: {
      detectionsPerDay: 10,
      certificatesPerMonth: 5,
      apiCallsPerMonth: 0,
      storageBytes: 100 * 1024 * 1024, // 100MB
      teamMembers: 1
    }
  },
  CREATOR: {
    id: 'CREATOR',
    name: 'Creator',
    description: 'For content creators & artists',
    price: {
      monthly: 9.99,
      yearly: 99.99
    },
    limits: {
      detectionsPerDay: 100,
      certificatesPerMonth: 50,
      apiCallsPerMonth: 0,
      storageBytes: 1024 * 1024 * 1024, // 1GB
      teamMembers: 1
    }
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    description: 'For professionals & businesses',
    price: {
      monthly: 29.99,
      yearly: 299.99
    },
    limits: {
      detectionsPerDay: 500,
      certificatesPerMonth: 200,
      apiCallsPerMonth: 10000,
      storageBytes: 5 * 1024 * 1024 * 1024, // 5GB
      teamMembers: 3
    }
  },
  BUSINESS: {
    id: 'BUSINESS',
    name: 'Business',
    description: 'For teams & organizations',
    price: {
      monthly: 99.99,
      yearly: 999.99
    },
    limits: {
      detectionsPerDay: 2000,
      certificatesPerMonth: 1000,
      apiCallsPerMonth: 100000,
      storageBytes: 50 * 1024 * 1024 * 1024, // 50GB
      teamMembers: 10
    }
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    price: {
      monthly: null,
      yearly: null
    },
    limits: {
      detectionsPerDay: Infinity,
      certificatesPerMonth: Infinity,
      apiCallsPerMonth: Infinity,
      storageBytes: Infinity,
      teamMembers: Infinity
    }
  }
} as const

export function getPlanLimits(plan: string) {
  return PLANS[plan as keyof typeof PLANS]?.limits || PLANS.FREE.limits
}
