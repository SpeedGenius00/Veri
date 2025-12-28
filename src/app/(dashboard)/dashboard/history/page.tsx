import { getServerSession } from "@/lib/auth"
import Link from "next/link"
import { History, Search, ExternalLink } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VerdictBadge } from "@/components/ui/verdict-badge"
import { ContentTypeBadge } from "@/components/ui/content-type-badge"
import { formatDateTime, truncate } from "@/lib/utils"

async function getDetectionHistory(userId: string) {
  return prisma.detection.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      contentType: true,
      originalFilename: true,
      textContent: true,
      authenticityScore: true,
      verdict: true,
      confidence: true,
      processingTimeMs: true,
      createdAt: true,
    },
  })
}

export default async function HistoryPage() {
  const session = await getServerSession()
  const detections = await getDetectionHistory(session!.user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Detection History</h1>
          <p className="text-muted-foreground">
            View all your past content detections
          </p>
        </div>
        <Link href="/dashboard/detect">
          <Button className="gap-2">
            <Search className="h-4 w-4" />
            New Detection
          </Button>
        </Link>
      </div>

      {detections.length === 0 ? (
        <Card>
          <CardContent className="pt-12">
            <div className="flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <History className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No detections yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mb-4">
                Start by analyzing some content to see your detection history here.
              </p>
              <Link href="/dashboard/detect">
                <Button>
                  Start Detection
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Detections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {detections.map((detection) => (
                <div
                  key={detection.id}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <ContentTypeBadge type={detection.contentType as any} />
                        <VerdictBadge verdict={detection.verdict as any} size="sm" />
                      </div>
                      <p className="font-medium truncate">
                        {detection.originalFilename || 
                         (detection.textContent && truncate(detection.textContent, 50)) ||
                         "Untitled content"}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>Score: {detection.authenticityScore}/100</span>
                        <span>•</span>
                        <span>{detection.confidence ? `${Math.round(detection.confidence * 100)}%` : 'N/A'} confidence</span>
                        <span>•</span>
                        <span>{detection.processingTimeMs}ms</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(detection.createdAt)}
                      </p>
                    </div>
                    <Link href={`/dashboard/detect/${detection.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        View
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
