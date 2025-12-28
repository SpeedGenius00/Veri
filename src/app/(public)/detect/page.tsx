"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, Shield, ArrowRight } from "lucide-react"
import { UploadZone } from "@/components/detect/upload-zone"
import { DetectionResult } from "@/components/detect/detection-result"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { toast } from "sonner"

export default function PublicDetectPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [detectionsUsed, setDetectionsUsed] = useState(0)

  const handleFileUpload = async (file: File) => {
    if (detectionsUsed >= 3) {
      toast.error("You've used your 3 free detections. Sign up for more!")
      return
    }

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
      setDetectionsUsed(prev => prev + 1)
      toast.success("Analysis complete!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Detection failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTextSubmit = async (text: string) => {
    if (detectionsUsed >= 3) {
      toast.error("You've used your 3 free detections. Sign up for more!")
      return
    }

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
      setDetectionsUsed(prev => prev + 1)
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
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">AI Content Detection</h1>
            <p className="text-muted-foreground">
              Check if content is AI-generated or authentic. Free to try!
            </p>
          </div>

          {/* Usage indicator */}
          <div className="text-center">
            <span className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm">
              <Shield className="h-4 w-4 text-primary" />
              {3 - detectionsUsed} free detections remaining
              {detectionsUsed >= 3 && (
                <Link href="/signup">
                  <Button size="sm" className="ml-2">
                    Sign up for more
                  </Button>
                </Link>
              )}
            </span>
          </div>

          {!result && !isLoading && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Content</CardTitle>
                <CardDescription>
                  Upload an image or paste text to analyze
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
                  <p className="text-sm text-muted-foreground">
                    This usually takes a few seconds.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <>
              <DetectionResult result={result} onReset={handleReset} />
              
              {/* CTA to sign up */}
              <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <CardContent className="flex items-center justify-between py-6">
                  <div>
                    <h3 className="font-semibold text-lg">Want more detections?</h3>
                    <p className="text-blue-100">
                      Sign up for 10 free detections daily, plus certification features
                    </p>
                  </div>
                  <Link href="/signup">
                    <Button variant="secondary" className="gap-2">
                      Sign Up Free
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
