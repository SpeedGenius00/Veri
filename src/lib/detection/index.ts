import crypto from "crypto"
import { analyzeImage, ImageAnalysisResult } from "./image"
import { analyzeText, TextAnalysisResult } from "./text"

export type ContentType = "IMAGE" | "VIDEO" | "AUDIO" | "TEXT" | "DOCUMENT"

export interface DetectionResult {
  contentType: ContentType
  contentHash: string
  authenticityScore: number
  verdict: string
  confidence: number
  analysis: ImageAnalysisResult["analysis"] | TextAnalysisResult["analysis"]
  processingTimeMs: number
}

export function hashContent(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex")
}

export function getContentType(mimeType: string): ContentType {
  if (mimeType.startsWith("image/")) return "IMAGE"
  if (mimeType.startsWith("video/")) return "VIDEO"
  if (mimeType.startsWith("audio/")) return "AUDIO"
  if (mimeType.startsWith("text/")) return "TEXT"
  return "DOCUMENT"
}

export async function detectContent(
  content: Buffer | string,
  contentType: ContentType,
  mimeType?: string,
  filename?: string
): Promise<DetectionResult> {
  const startTime = Date.now()

  let result: DetectionResult

  if (contentType === "TEXT" && typeof content === "string") {
    const textResult = analyzeText(content)
    result = {
      contentType: "TEXT",
      contentHash: hashContent(Buffer.from(content)),
      authenticityScore: textResult.authenticityScore,
      verdict: textResult.verdict,
      confidence: textResult.confidence,
      analysis: textResult.analysis,
      processingTimeMs: Date.now() - startTime,
    }
  } else if (contentType === "IMAGE" && Buffer.isBuffer(content)) {
    const imageResult = await analyzeImage(content, mimeType || "image/jpeg", filename)
    result = {
      contentType: "IMAGE",
      contentHash: hashContent(content),
      authenticityScore: imageResult.authenticityScore,
      verdict: imageResult.verdict,
      confidence: imageResult.confidence,
      analysis: imageResult.analysis,
      processingTimeMs: Date.now() - startTime,
    }
  } else {
    // For unsupported types, return uncertain
    const hash = typeof content === "string" 
      ? hashContent(Buffer.from(content))
      : hashContent(content)
    
    result = {
      contentType,
      contentHash: hash,
      authenticityScore: 50,
      verdict: "UNCERTAIN",
      confidence: 0.3,
      analysis: {
        overallSignals: ["Content type not fully supported yet"],
      } as any,
      processingTimeMs: Date.now() - startTime,
    }
  }

  return result
}

export { analyzeImage, analyzeText }
export type { ImageAnalysisResult, TextAnalysisResult }
