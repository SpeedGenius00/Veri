"use client"

import { useState } from "react"
import { Loader2, Shield } from "lucide-react"
import { UploadZone } from "@/components/detect/upload-zone"
import { DetectionResult } from "@/components/detect/detection-result"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function DetectPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileUpload = async (file: File) => {
    setIsLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/detect", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Detection failed")
      }

      setResult(data)
      toast.success("Analysis complete!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Detection failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTextSubmit = async (text: string) => {
    setIsLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("text", text)

      const response = await fetch("/api/detect", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Detection failed")
      }

      setResult(data)
      toast.success("Analysis complete!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Detection failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlSubmit = async (url: string) => {
    toast.error("URL detection coming soon!")
  }

  const handleReset = () => {
    setResult(null)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Detect AI Content</h1>
        <p className="text-muted-foreground">
          Upload an image, video, or text to check if it's AI-generated
        </p>
      </div>

      {!result && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Upload Content
            </CardTitle>
            <CardDescription>
              Our AI will analyze the content and determine if it's authentic or AI-generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadZone
              onFileSelect={handleFileUpload}
              onTextSubmit={handleTextSubmit}
              onUrlSubmit={handleUrlSubmit}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2">Analyzing Content...</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Our AI is examining the content for signs of AI generation. 
                This usually takes a few seconds.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <DetectionResult result={result} onReset={handleReset} />
      )}

      {/* How It Works */}
      {!result && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>How Detection Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="font-bold text-primary">1</span>
                </div>
                <h4 className="font-medium mb-1">Upload</h4>
                <p className="text-sm text-muted-foreground">
                  Upload an image, paste text, or enter a URL
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="font-bold text-primary">2</span>
                </div>
                <h4 className="font-medium mb-1">Analyze</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI examines multiple signals and patterns
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="font-bold text-primary">3</span>
                </div>
                <h4 className="font-medium mb-1">Result</h4>
                <p className="text-sm text-muted-foreground">
                  Get a verdict with confidence score and detailed breakdown
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
