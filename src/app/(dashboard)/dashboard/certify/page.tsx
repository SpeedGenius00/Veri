"use client"

import { useState } from "react"
import { Award, Shield } from "lucide-react"
import { CertifyForm } from "@/components/certify/certify-form"
import { CertificateSuccess } from "@/components/certify/certificate-success"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CertifyPage() {
  const [result, setResult] = useState<any>(null)

  const handleSuccess = (data: any) => {
    setResult(data)
  }

  const handleCreateAnother = () => {
    setResult(null)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Certify Your Content</h1>
        <p className="text-muted-foreground">
          Create a cryptographic certificate to prove your content is authentic
        </p>
      </div>

      {result ? (
        <CertificateSuccess 
          result={result} 
          onCreateAnother={handleCreateAnother} 
        />
      ) : (
        <>
          <CertifyForm onSuccess={handleSuccess} />

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle>How Certification Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold text-primary">1</span>
                  </div>
                  <h4 className="font-medium mb-1">Upload</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload your original content file
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold text-primary">2</span>
                  </div>
                  <h4 className="font-medium mb-1">Sign</h4>
                  <p className="text-sm text-muted-foreground">
                    We create a cryptographic signature
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold text-primary">3</span>
                  </div>
                  <h4 className="font-medium mb-1">Share</h4>
                  <p className="text-sm text-muted-foreground">
                    Share the verification link with anyone
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Why Certify?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Prove Authenticity</p>
                    <p className="text-sm text-muted-foreground">
                      Anyone can verify your content is original and unmodified
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Establish Ownership</p>
                    <p className="text-sm text-muted-foreground">
                      Create a timestamped record of when you created the content
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Tamper-Proof</p>
                    <p className="text-sm text-muted-foreground">
                      Cryptographic signatures can't be forged or modified
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

