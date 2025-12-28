"use client"

import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  HelpCircle,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  Share2,
  Download,
  RotateCcw
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VerdictBadge } from "@/components/ui/verdict-badge"
import { ScoreGauge } from "@/components/ui/score-gauge"
import { ContentTypeBadge } from "@/components/ui/content-type-badge"
import { cn } from "@/lib/utils"
import { formatBytes } from "@/lib/utils"

interface DetectionResultProps {
  result: {
    id: string
    contentType: string
    originalFilename?: string
    contentSize?: number
    authenticityScore: number
    verdict: string
    confidence: number
    analysis: any
    processingTimeMs: number
    createdAt: string
  }
  onReset: () => void
}

const verdictInfo = {
  AUTHENTIC: {
    icon: CheckCircle,
    title: "Authentic",
    description: "This content appears to be authentic human-created content.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  LIKELY_AUTHENTIC: {
    icon: CheckCircle,
    title: "Likely Authentic",
    description: "This content is probably authentic, but some signals are uncertain.",
    color: "text-green-500",
    bg: "bg-green-50",
  },
  UNCERTAIN: {
    icon: HelpCircle,
    title: "Uncertain",
    description: "We couldn't determine if this content is AI-generated or authentic.",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  LIKELY_AI_GENERATED: {
    icon: AlertTriangle,
    title: "Likely AI Generated",
    description: "This content shows signs of being AI-generated.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  AI_GENERATED: {
    icon: XCircle,
    title: "AI Generated",
    description: "This content is very likely AI-generated.",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  MANIPULATED: {
    icon: AlertTriangle,
    title: "Manipulated",
    description: "This content appears to have been edited or manipulated.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
}

export function DetectionResult({ result, onReset }: DetectionResultProps) {
  const [showDetails, setShowDetails] = useState(false)
  const info = verdictInfo[result.verdict as keyof typeof verdictInfo] || verdictInfo.UNCERTAIN
  const Icon = info.icon

  const signals = result.analysis?.overallSignals || []
  const hasSignals = signals.length > 0

  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <Card className={cn("border-2", info.bg)}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Score Gauge */}
            <div className="flex flex-col items-center">
              <ScoreGauge score={result.authenticityScore} size="lg" />
              <p className="text-sm text-muted-foreground mt-2">
                Authenticity Score
              </p>
            </div>

            {/* Verdict Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Icon className={cn("h-6 w-6", info.color)} />
                <h2 className={cn("text-2xl font-bold", info.color)}>
                  {info.title}
                </h2>
              </div>
              <p className="text-muted-foreground mb-4">
                {info.description}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <VerdictBadge verdict={result.verdict as any} size="lg" />
                <ContentTypeBadge type={result.contentType as any} size="md" />
                <span className="text-sm text-muted-foreground">
                  {Math.round(result.confidence * 100)}% confidence
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Analysis Details</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{result.authenticityScore}</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{Math.round(result.confidence * 100)}%</p>
              <p className="text-xs text-muted-foreground">Confidence</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{result.processingTimeMs}ms</p>
              <p className="text-xs text-muted-foreground">Processing Time</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{signals.length}</p>
              <p className="text-xs text-muted-foreground">Signals Found</p>
            </div>
          </div>

          {/* Signals List */}
          {hasSignals && showDetails && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Detection Signals</h4>
              <ul className="space-y-2">
                {signals.map((signal: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Analysis */}
          {showDetails && result.analysis && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Raw Analysis Data</h4>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-[300px]">
                {JSON.stringify(result.analysis, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={onReset} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Analyze Another
        </Button>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Result
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>

      {/* File Info */}
      {result.originalFilename && (
        <div className="text-center text-sm text-muted-foreground">
          <FileText className="h-4 w-4 inline mr-1" />
          {result.originalFilename}
          {result.contentSize && ` (${formatBytes(result.contentSize)})`}
          <span className="mx-2">•</span>
          <Clock className="h-4 w-4 inline mr-1" />
          {new Date(result.createdAt).toLocaleString()}
        </div>
      )}
    </div>
  )
}
