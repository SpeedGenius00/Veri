"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Award,
  User,
  Calendar,
  Hash,
  ExternalLink,
  AlertTriangle
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ContentTypeBadge } from "@/components/ui/content-type-badge"
import { formatDateTime } from "@/lib/utils"

interface VerificationResult {
  isValid: boolean
  certificateId: string
  status: string
  revokedAt?: string
  revokedReason?: string
  message?: string
  certificate?: {
    title: string
    description: string
    contentType: string
    contentHash: string
    contentSize: number
    tags: string[]
    contentCreatedAt: string
    certifiedAt: string
  }
  creator?: {
    name: string
    username: string
    image: string
    isVerified: boolean
  }
  verification?: {
    signatureValid: boolean
    certificateActive: boolean
    verificationCount: number
    lastVerifiedAt: string
  }
}

export default function VerifyPage({
  params,
}: {
  params: { certificateId: string }
}) {
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const certificateId = params.certificateId

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await fetch(`/api/verify/${certificateId}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Verification failed")
          return
        }

        setResult(data)
      } catch (e) {
        setError("Failed to verify certificate")
      } finally {
        setIsLoading(false)
      }
    }

    verify()
  }, [certificateId])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container max-w-2xl mx-auto">
          {isLoading && (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Verifying Certificate...</h2>
                  <p className="text-muted-foreground">
                    Checking cryptographic signature
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="border-red-200">
              <CardContent className="py-12">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Verification Failed</h2>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Link href="/">
                    <Button variant="outline">Go Home</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="space-y-6">
              {/* Result Banner */}
              <Card className={result.isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                <CardContent className="py-6">
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                      result.isValid ? "bg-green-100" : "bg-red-100"
                    }`}>
                      {result.isValid ? (
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-600" />
                      )}
                    </div>
                    <h2 className={`text-2xl font-bold mb-2 ${
                      result.isValid ? "text-green-800" : "text-red-800"
                    }`}>
                      {result.isValid ? "Certificate Verified" : "Verification Failed"}
                    </h2>
                    <p className={result.isValid ? "text-green-700" : "text-red-700"}>
                      {result.isValid 
                        ? "This certificate is valid and the content is authentic."
                        : result.message || "This certificate could not be verified."
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Certificate Details */}
              {result.certificate && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{result.certificate.title}</CardTitle>
                      <ContentTypeBadge type={result.certificate.contentType as any} />
                    </div>
                    {result.certificate.description && (
                      <p className="text-muted-foreground">
                        {result.certificate.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Creator */}
                    {result.creator && (
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Created by</p>
                          <p className="font-medium flex items-center gap-1">
                            {result.creator.name}
                            {result.creator.isVerified && (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Certified on</p>
                        <p className="font-medium">
                          {formatDateTime(result.certificate.certifiedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Content Hash */}
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Content Hash</span>
                      </div>
                      <code className="text-xs font-mono break-all">
                        {result.certificate.contentHash}
                      </code>
                    </div>

                    {/* Verification Stats */}
                    {result.verification && (
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Verified {result.verification.verificationCount} times
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Signature: {result.verification.signatureValid ? "Valid ✓" : "Invalid ✗"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {result.certificate.tags && result.certificate.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {result.certificate.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Revocation Details */}
              {result.status === "REVOKED" && (
                <Card className="border-red-200">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Certificate Revoked</p>
                        {result.revokedAt && (
                          <p className="text-sm text-red-700">
                            Revoked on: {formatDateTime(result.revokedAt)}
                          </p>
                        )}
                        {result.revokedReason && (
                          <p className="text-sm text-red-700">
                            Reason: {result.revokedReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* View Certificate Link */}
              {result.isValid && (
                <div className="text-center">
                  <Link href={`/certificate/${result.certificateId}`}>
                    <Button variant="outline" className="gap-2">
                      View Full Certificate
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}

              {/* CTA */}
              <Card className="bg-muted/50">
                <CardContent className="py-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    Want to certify your own content?
                  </p>
                  <Link href="/signup">
                    <Button className="gap-2">
                      Get Started Free
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

