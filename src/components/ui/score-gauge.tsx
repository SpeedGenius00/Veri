"use client"

import { cn } from "@/lib/utils"

interface ScoreGaugeProps {
  score: number // 0-100
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

const sizes = {
  sm: { width: 80, stroke: 6, fontSize: "text-lg" },
  md: { width: 120, stroke: 8, fontSize: "text-2xl" },
  lg: { width: 160, stroke: 10, fontSize: "text-3xl" }
}

function getScoreColor(score: number): string {
  if (score >= 85) return "#22c55e" // green
  if (score >= 65) return "#84cc16" // lime
  if (score >= 35) return "#eab308" // yellow
  if (score >= 15) return "#f97316" // orange
  return "#ef4444" // red
}

export function ScoreGauge({ 
  score, 
  size = "md", 
  showLabel = true,
  className 
}: ScoreGaugeProps) {
  const { width, stroke, fontSize } = sizes[size]
  const radius = (width - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color = getScoreColor(score)

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={width}
        height={width}
        viewBox={`0 0 ${width} ${width}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", fontSize)}>{score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      )}
    </div>
  )
}
