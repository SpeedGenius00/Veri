import { cn } from "@/lib/utils"
import { Image, Video, Music, FileText, File } from "lucide-react"

type ContentType = "IMAGE" | "VIDEO" | "AUDIO" | "TEXT" | "DOCUMENT"

interface ContentTypeBadgeProps {
  type: ContentType
  size?: "sm" | "md"
  className?: string
}

const config = {
  IMAGE: { icon: Image, label: "Image", color: "bg-blue-100 text-blue-700" },
  VIDEO: { icon: Video, label: "Video", color: "bg-purple-100 text-purple-700" },
  AUDIO: { icon: Music, label: "Audio", color: "bg-pink-100 text-pink-700" },
  TEXT: { icon: FileText, label: "Text", color: "bg-green-100 text-green-700" },
  DOCUMENT: { icon: File, label: "Document", color: "bg-orange-100 text-orange-700" },
}

const sizes = {
  sm: "text-xs px-1.5 py-0.5",
  md: "text-sm px-2 py-1"
}

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4"
}

export function ContentTypeBadge({ type, size = "sm", className }: ContentTypeBadgeProps) {
  const { icon: Icon, label, color } = config[type]

  return (
    <span className={cn(
      "inline-flex items-center gap-1 font-medium rounded",
      color,
      sizes[size],
      className
    )}>
      <Icon className={iconSizes[size]} />
      {label}
    </span>
  )
}
