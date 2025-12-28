import { cn } from "@/lib/utils"
import { VERDICT_CONFIG } from "@/lib/constants"
import { CheckCircle, HelpCircle, AlertTriangle, XCircle, Edit } from "lucide-react"

type Verdict = keyof typeof VERDICT_CONFIG

interface VerdictBadgeProps {
  verdict: Verdict
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
  className?: string
}

const icons = {
  AUTHENTIC: CheckCircle,
  LIKELY_AUTHENTIC: CheckCircle,
  UNCERTAIN: HelpCircle,
  LIKELY_AI_GENERATED: AlertTriangle,
  AI_GENERATED: XCircle,
  MANIPULATED: Edit,
}

const sizes = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5"
}

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5"
}

export function VerdictBadge({ 
  verdict, 
  size = "md", 
  showIcon = true,
  className 
}: VerdictBadgeProps) {
  const config = VERDICT_CONFIG[verdict]
  const Icon = icons[verdict]

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-medium rounded-full border",
      config.bgColor,
      config.textColor,
      config.borderColor,
      sizes[size],
      className
    )}>
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  )
}
