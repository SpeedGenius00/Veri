import { getServerSession } from "@/lib/auth"
import Link from "next/link"
import { Award, Plus, ExternalLink, MoreHorizontal } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ContentTypeBadge } from "@/components/ui/content-type-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { formatDateTime, truncate } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

async function getCertificates(userId: string) {
  return prisma.certificate.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      certificateId: true,
      title: true,
      description: true,
      contentType: true,
      status: true,
      isPublic: true,
      verificationCount: true,
      certifiedAt: true,
      createdAt: true,
    },
  })
}

export default async function CertificatesPage() {
  const session = await getServerSession()
  
  if (!session?.user?.id) {
    return <div>Please log in to view your certificates.</div>
  }

  const certificates = await getCertificates(session.user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Certificates</h1>
          <p className="text-muted-foreground">
            Manage your content certificates
          </p>
        </div>
        <Link href="/dashboard/certify">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Certificate
          </Button>
        </Link>
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Certify your first piece of content to prove it's authentic."
          action={{
            label: "Create Certificate",
            onClick: () => {
              if (typeof window !== "undefined") {
                window.location.href = "/dashboard/certify"
              }
            },
          }}
        />
      ) : (
        <div className="grid gap-4">
          {certificates.map((cert) => (
            <Card key={cert.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <ContentTypeBadge type={cert.contentType as any} />
                      <Badge variant={cert.status === "ACTIVE" ? "default" : "destructive"}>
                        {cert.status}
                      </Badge>
                      {!cert.isPublic && (
                        <Badge variant="secondary">Private</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold truncate">
                      {cert.title}
                    </h3>
                    {cert.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {truncate(cert.description, 100)}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{cert.verificationCount} verifications</span>
                      <span>•</span>
                      <span>Created {formatDateTime(cert.certifiedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/certificate/${cert.certificateId}`} target="_blank">
                      <Button variant="outline" size="sm" className="gap-1">
                        View
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/verify/${cert.certificateId}`}>
                            Verification Link
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            if (typeof navigator !== "undefined") {
                              navigator.clipboard.writeText(cert.certificateId)
                            }
                          }}
                        >
                          Copy ID
                        </DropdownMenuItem>
                        {cert.status === "ACTIVE" && (
                          <DropdownMenuItem className="text-destructive">
                            Revoke Certificate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

