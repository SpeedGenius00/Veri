"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, Image, FileText, Link as LinkIcon, X, File } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { formatBytes } from "@/lib/utils"

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  onTextSubmit: (text: string) => void
  onUrlSubmit: (url: string) => void
  isLoading?: boolean
  accept?: string
  maxSize?: number
}

export function UploadZone({
  onFileSelect,
  onTextSubmit,
  onUrlSubmit,
  isLoading = false,
  maxSize = 20 * 1024 * 1024, // 20MB default
}: UploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState("")
  const [urlInput, setUrlInput] = useState("")
  const [activeTab, setActiveTab] = useState("file")
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null)
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === "file-too-large") {
        setError(`File too large. Maximum size is ${formatBytes(maxSize)}`)
      } else if (rejection.errors[0]?.code === "file-invalid-type") {
        setError("Invalid file type. Please upload an image, video, audio, or document.")
      } else {
        setError("Invalid file")
      }
      return
    }

    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0])
    }
  }, [maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    multiple: false,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
      "video/*": [".mp4", ".webm", ".mov"],
      "audio/*": [".mp3", ".wav", ".m4a", ".ogg"],
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    disabled: isLoading,
  })

  const handleFileSubmit = () => {
    if (selectedFile) {
      onFileSelect(selectedFile)
    }
  }

  const handleTextSubmit = () => {
    if (textInput.trim().length >= 50) {
      onTextSubmit(textInput.trim())
    } else {
      setError("Please enter at least 50 characters for accurate detection")
    }
  }

  const handleUrlSubmit = () => {
    try {
      new URL(urlInput)
      onUrlSubmit(urlInput)
    } catch {
      setError("Please enter a valid URL")
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setError(null)
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return Image
    if (file.type.startsWith("video/")) return File
    if (file.type.startsWith("audio/")) return File
    return FileText
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="file" disabled={isLoading}>
          <Upload className="h-4 w-4 mr-2" />
          File
        </TabsTrigger>
        <TabsTrigger value="text" disabled={isLoading}>
          <FileText className="h-4 w-4 mr-2" />
          Text
        </TabsTrigger>
        <TabsTrigger value="url" disabled={isLoading}>
          <LinkIcon className="h-4 w-4 mr-2" />
          URL
        </TabsTrigger>
      </TabsList>

      <TabsContent value="file" className="mt-4">
        {selectedFile ? (
          <div className="border-2 border-dashed rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = getFileIcon(selectedFile)
                  return <Icon className="h-10 w-10 text-primary" />
                })()}
                <div>
                  <p className="font-medium truncate max-w-[200px] sm:max-w-[300px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatBytes(selectedFile.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button
              className="w-full mt-4"
              onClick={handleFileSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Analyzing..." : "Analyze Content"}
            </Button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-1">
              {isDragActive ? "Drop your file here" : "Drag & drop your file here"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports images, videos, audio, and documents up to {formatBytes(maxSize)}
            </p>
          </div>
        )}
        {error && activeTab === "file" && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </TabsContent>

      <TabsContent value="text" className="mt-4">
        <div className="space-y-4">
          <Textarea
            placeholder="Paste or type the text you want to analyze...

For best results, provide at least 200 characters. The more text you provide, the more accurate the detection will be."
            value={textInput}
            onChange={(e) => {
              setTextInput(e.target.value)
              setError(null)
            }}
            className="min-h-[200px] resize-none"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {textInput.length} characters
              {textInput.length < 50 && textInput.length > 0 && (
                <span className="text-destructive"> (minimum 50)</span>
              )}
            </p>
            <Button
              onClick={handleTextSubmit}
              disabled={isLoading || textInput.length < 50}
            >
              {isLoading ? "Analyzing..." : "Analyze Text"}
            </Button>
          </div>
          {error && activeTab === "text" && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="url" className="mt-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value)
                setError(null)
              }}
              disabled={isLoading}
            />
            <Button
              onClick={handleUrlSubmit}
              disabled={isLoading || !urlInput}
            >
              {isLoading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter a direct URL to an image, video, or audio file
          </p>
          {error && activeTab === "url" && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
