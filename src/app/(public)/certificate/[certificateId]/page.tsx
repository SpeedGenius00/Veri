import { notFound } from "next/navigation"
import Link from "next/link"
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar,
  Hash,
  Shield,
  ExternalLink
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ContentTypeBadge } from "@/components/ui/content-type-badge"
import { formatDateTime } from "@/lib/utils"

async function getCertificate(certificateId: string) {
  return prisma.certificate.findUnique({
    where: { certificateId },
    include: {
      user: {
        select: {
          name: true,
          username: true,
          image: true,
          isVerifiedCreator: true,
        },
      },
    },
  })
}

export default async function CertificatePage({
  params,
}: {
  params: { certificateId: string }
}) {
  const { certificateId } = params
  const certificate = await getCertificate(certificateId)

  if (!certificate) {
    notFound()
  }

  if (!certificate.isPublic) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md text-center">
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Private Certificate</h2>
              <p className="text-muted-foreground">
                This certificate is private and cannot be viewed publicly.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const isValid = certificate.status === "ACTIVE"

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container max-w-3xl mx-auto space-y-6">
          {/* Status Banner */}
          <Card className={isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
            <CardContent className="py-4">
              <div className="flex items-center justify-center gap-3">
                {isValid ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <span className="font-semibold text-green-800">
                      Verified Authentic Certificate
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-red-600" />
                    <span className="font-semibold text-red-800">
                      Certificate Revoked
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Certificate Card */}
          <Card>
            <CardHeader className="text-center border-b">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{certificate.title}</CardTitle>
              {certificate.description && (
                <p className="text-muted-foreground mt-2">
                  {certificate.description}
                </p>
              )}
              <div className="flex items-center justify-center gap-2 mt-4">
                <ContentTypeBadge type={certificate.contentType as any} size="md" />
                <Badge variant={isValid ? "default" : "destructive"}>
                  {certificate.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Creator */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created by</p>
                  <p className="font-semibold flex items-center gap-2">
                    {certificate.user.name || "Anonymous"}
                    {certificate.user.isVerifiedCreator && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Certified On</span>
                  </div>
                  <p className="font-medium">
                    {formatDateTime(certificate.certifiedAt)}
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">Verifications</span>
                  </div>
                  <p className="font-medium">
                    {certificate.verificationCount} times verified
                  </p>
                </div>
              </div>

              {/* Content Hash */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Hash className="h-4 w-4" />
                  <span className="text-sm">Content Hash (SHA-256)</span>
                </div>
                <code className="text-xs font-mono break-all">
                  {certificate.contentHash}
                </code>
              </div>

              {/* Certificate ID */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Award className="h-4 w-4" />
                  <span className="text-sm">Certificate ID</span>
                </div>
                <code className="text-sm font-mono">
                  {certificate.certificateId}
                </code>
              </div>

              {/* Tags */}
              {certificate.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {certificate.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Revocation Info */}
              {certificate.status === "REVOKED" && certificate.revokedAt && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800">
                    <strong>Revoked on:</strong>{" "}
                    {formatDateTime(certificate.revokedAt)}
                  </p>
                  {certificate.revokedReason && (
                    <p className="text-sm text-red-800 mt-1">
                      <strong>Reason:</strong> {certificate.revokedReason}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Want to certify your own content?
            </p>
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Get Started Free
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

