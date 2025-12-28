export const APP_NAME = 'Veri'
export const APP_DESCRIPTION = 'Detect AI-generated content. Certify your authentic work.'

export const PLANS = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    limits: {
      detectionsPerDay: 10,
      certificatesPerMonth: 5,
      apiCallsPerMonth: 0,
      storageBytes: 100 * 1024 * 1024
    }
  },
  CREATOR: {
    id: 'CREATOR',
    name: 'Creator',
    price: { monthly: 9.99, yearly: 99.99 },
    limits: {
      detectionsPerDay: 100,
      certificatesPerMonth: 50,
      apiCallsPerMonth: 0,
      storageBytes: 1024 * 1024 * 1024
    }
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    price: { monthly: 29.99, yearly: 299.99 },
    limits: {
      detectionsPerDay: 500,
      certificatesPerMonth: 200,
      apiCallsPerMonth: 10000,
      storageBytes: 5 * 1024 * 1024 * 1024
    }
  },
  BUSINESS: {
    id: 'BUSINESS',
    name: 'Business',
    price: { monthly: 99.99, yearly: 999.99 },
    limits: {
      detectionsPerDay: 2000,
      certificatesPerMonth: 1000,
      apiCallsPerMonth: 100000,
      storageBytes: 50 * 1024 * 1024 * 1024
    }
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: { monthly: null, yearly: null },
    limits: {
      detectionsPerDay: Infinity,
      certificatesPerMonth: Infinity,
      apiCallsPerMonth: Infinity,
      storageBytes: Infinity
    }
  }
} as const

export const VERDICT_CONFIG = {
  AUTHENTIC: {
    label: 'Authentic',
    description: 'High confidence this content is real',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    score: { min: 85, max: 100 }
  },
  LIKELY_AUTHENTIC: {
    label: 'Likely Authentic',
    description: 'This content appears to be real',
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-100',
    score: { min: 65, max: 84 }
  },
  UNCERTAIN: {
    label: 'Uncertain',
    description: 'Unable to determine authenticity',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    score: { min: 35, max: 64 }
  },
  LIKELY_AI_GENERATED: {
    label: 'Likely AI',
    description: 'This content appears to be AI-generated',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200',
    score: { min: 15, max: 34 }
  },
  AI_GENERATED: {
    label: 'AI Generated',
    description: 'High confidence this content is AI-generated',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    score: { min: 0, max: 14 }
  },
  MANIPULATED: {
    label: 'Manipulated',
    description: 'This content has been edited or altered',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200',
    score: { min: 0, max: 100 }
  }
} as const

export const CONTENT_TYPES = {
  IMAGE: {
    label: 'Image',
    icon: 'Image',
    accept: 'image/jpeg,image/png,image/gif,image/webp',
    maxSize: 20 * 1024 * 1024 // 20MB
  },
  VIDEO: {
    label: 'Video',
    icon: 'Video',
    accept: 'video/mp4,video/webm,video/quicktime',
    maxSize: 100 * 1024 * 1024 // 100MB
  },
  AUDIO: {
    label: 'Audio',
    icon: 'Music',
    accept: 'audio/mpeg,audio/wav,audio/ogg,audio/m4a',
    maxSize: 50 * 1024 * 1024 // 50MB
  },
  TEXT: {
    label: 'Text',
    icon: 'FileText',
    accept: 'text/plain',
    maxSize: 1 * 1024 * 1024 // 1MB
  },
  DOCUMENT: {
    label: 'Document',
    icon: 'File',
    accept: 'application/pdf,.doc,.docx',
    maxSize: 10 * 1024 * 1024 // 10MB
  }
} as const

export const ROUTES = {
  HOME: '/',
  PRICING: '/pricing',
  ABOUT: '/about',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  DETECT: '/detect',
  CERTIFY: '/certify',
  CERTIFICATES: '/certificates',
  HISTORY: '/history',
  SETTINGS: '/settings',
  API_KEYS: '/api-keys'
} as const
