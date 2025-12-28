"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  Share2,
  Award,
  QrCode
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { generateQRCode } from "@/lib/qrcode"

interface CertificateSuccessProps {
  result: {
    certificateId: string
    contentHash: string
    certifiedAt: string
    verifyUrl: string
    certificateUrl: string
  }
  onCreateAnother: () => void
}

export function CertificateSuccess({ result, onCreateAnother }: CertificateSuccessProps) {
  const [qrCode, setQrCode] = useState<string | null>(null)

  useEffect(() => {
    generateQRCode(result.verifyUrl)
      .then(setQrCode)
      .catch(console.error)
  }, [result.verifyUrl])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const shareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Veri Certificate",
          text: "Verify my authentic content",
          url: result.verifyUrl,
        })
      } catch (e) {
        copyToClipboard(result.verifyUrl, "Link")
      }
    } else {
      copyToClipboard(result.verifyUrl, "Link")
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Certificate Created!
            </h2>
            <p className="text-green-700">
              Your content has been certified and can now be verified by anyone.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificate Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Certificate ID
            </label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono truncate">
                {result.certificateId}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(result.certificateId, "Certificate ID")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Content Hash (SHA-256)
            </label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 bg-muted px-3 py-2 rounded text-xs font-mono truncate">
                {result.contentHash}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(result.contentHash, "Content hash")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Certified At
            </label>
            <p className="mt-1">
              {new Date(result.certifiedAt).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Share Options */}
      <Card>
        <CardHeader>
          <CardTitle>Share & Verify</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              {qrCode ? (
                <img 
                  src={qrCode} 
                  alt="Verification QR Code" 
                  className="w-48 h-48 border rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                  <QrCode className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                Scan to verify
              </p>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Verification Link
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={result.verifyUrl}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(result.verifyUrl, "Link")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={shareUrl} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Certificate
                </Button>
                <Link href={result.certificateUrl} target="_blank">
                  <Button variant="outline" className="w-full gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View Certificate
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          variant="outline" 
          onClick={onCreateAnother}
          className="flex-1"
        >
          Create Another Certificate
        </Button>
        <Link href="/dashboard/certificates" className="flex-1">
          <Button variant="outline" className="w-full">
            View All Certificates
          </Button>
        </Link>
      </div>
    </div>
  )
}

