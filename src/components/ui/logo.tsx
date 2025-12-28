import Link from "next/link"

import { Shield } from "lucide-react"

import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

const sizes = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10"
}

const textSizes = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl"
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Shield className={cn("text-primary", sizes[size])} />
        <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight", textSizes[size])}>
          Veri
        </span>
      )}
    </Link>
  )
}
