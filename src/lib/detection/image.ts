import crypto from "crypto"

export interface ImageAnalysisResult {
  authenticityScore: number
  verdict: string
  confidence: number
  analysis: {
    metadataAnalysis: {
      hasExif: boolean
      software: string | null
      aiSignatures: string[]
      suspiciousFlags: string[]
    }
    sizeAnalysis: {
      width: number
      height: number
      aspectRatio: number
      isCommonAiSize: boolean
    }
    formatAnalysis: {
      format: string
      hasTransparency: boolean
    }
    overallSignals: string[]
  }
}

// Common AI generation sizes
const AI_SIZES = [
  [512, 512], [768, 768], [1024, 1024], [1536, 1536], [2048, 2048],
  [512, 768], [768, 512], [768, 1024], [1024, 768],
  [1024, 1536], [1536, 1024], [896, 1152], [1152, 896],
]

// Known AI software signatures
const AI_SOFTWARE = [
  "dall-e", "midjourney", "stable diffusion", "automatic1111",
  "comfyui", "leonardo", "firefly", "runway", "pika",
  "bing image creator", "ideogram", "playground ai",
  "nightcafe", "artbreeder", "craiyon", "wombo"
]

export async function analyzeImage(
  buffer: Buffer,
  mimeType: string,
  filename?: string
): Promise<ImageAnalysisResult> {
  const signals: string[] = []
  let aiScore = 0 // Higher = more likely AI

  // Basic analysis without sharp (for simplicity in this version)
  // In production, use sharp or similar for proper image analysis
  
  const fileSize = buffer.length
  const hash = crypto.createHash("sha256").update(buffer).digest("hex")

  // Analyze filename for AI indicators
  const lowerFilename = (filename || "").toLowerCase()
  const filenameAiIndicators = [
    "dalle", "midjourney", "stable", "diffusion", "generated",
    "ai_", "ai-", "_ai", "-ai", "synthetic"
  ]
  
  for (const indicator of filenameAiIndicators) {
    if (lowerFilename.includes(indicator)) {
      signals.push(`Filename contains AI indicator: "${indicator}"`)
      aiScore += 25
    }
  }

  // Check for common AI file patterns
  if (lowerFilename.match(/^[a-f0-9]{8,}\.png$/)) {
    signals.push("Filename is a hash (common in AI generators)")
    aiScore += 10
  }

  // PNG without proper naming often from AI
  if (mimeType === "image/png" && !lowerFilename.includes("screenshot")) {
    signals.push("PNG format (commonly used by AI generators)")
    aiScore += 5
  }

  // Very large or very small files can be indicators
  if (fileSize < 50000) { // < 50KB
    signals.push("Very small file size")
    aiScore += 5
  }

  // Calculate final scores
  const aiProbability = Math.min(aiScore / 100, 1)
  const authenticityScore = Math.round((1 - aiProbability) * 100)

  // Determine verdict
  let verdict: string
  if (authenticityScore >= 85) {
    verdict = "AUTHENTIC"
  } else if (authenticityScore >= 65) {
    verdict = "LIKELY_AUTHENTIC"
  } else if (authenticityScore >= 35) {
    verdict = "UNCERTAIN"
  } else if (authenticityScore >= 15) {
    verdict = "LIKELY_AI_GENERATED"
  } else {
    verdict = "AI_GENERATED"
  }

  // Confidence based on signal strength
  const confidence = signals.length > 0 
    ? Math.min(0.5 + (signals.length * 0.1), 0.95)
    : 0.5

  return {
    authenticityScore,
    verdict,
    confidence,
    analysis: {
      metadataAnalysis: {
        hasExif: false, // Would need EXIF parsing
        software: null,
        aiSignatures: [],
        suspiciousFlags: signals.filter(s => s.includes("AI") || s.includes("generated")),
      },
      sizeAnalysis: {
        width: 0,
        height: 0,
        aspectRatio: 1,
        isCommonAiSize: false,
      },
      formatAnalysis: {
        format: mimeType,
        hasTransparency: mimeType === "image/png",
      },
      overallSignals: signals,
    },
  }
}
