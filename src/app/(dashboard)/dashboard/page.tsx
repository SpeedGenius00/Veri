import { getServerSession } from "@/lib/auth"
import Link from "next/link"
import { 
  Search, 
  Award, 
  ArrowRight,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PLANS } from "@/lib/constants"

async function getDashboardData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      detectionsToday: true,
      certificatesThisMonth: true,
      _count: {
        select: {
          detections: true,
          certificates: true,
        },
      },
    },
  })

  const recentDetections = await prisma.detection.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      contentType: true,
      verdict: true,
      authenticityScore: true,
      createdAt: true,
    },
  })

  const recentCertificates = await prisma.certificate.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      certificateId: true,
      title: true,
      contentType: true,
      verificationCount: true,
      createdAt: true,
    },
  })

  return { user, recentDetections, recentCertificates }
}

export default async function DashboardPage() {
  const session = await getServerSession()
  const { user, recentDetections, recentCertificates } = await getDashboardData(session!.user.id)

  const plan = PLANS[user?.plan as keyof typeof PLANS] || PLANS.FREE
  const detectionsUsed = user?.detectionsToday || 0
  const detectionsLimit = plan.limits.detectionsPerDay
  const certificatesUsed = user?.certificatesThisMonth || 0
  const certificatesLimit = plan.limits.certificatesPerMonth

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {session?.user?.name?.split(" ")[0]}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your account.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Detections Today</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{detectionsUsed}</div>
            <Progress 
              value={(detectionsUsed / detectionsLimit) * 100} 
              className="mt-2 h-1" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              {detectionsLimit - detectionsUsed} remaining today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certificates This Month</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificatesUsed}</div>
            <Progress 
              value={(certificatesUsed / certificatesLimit) * 100} 
              className="mt-2 h-1" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              {certificatesLimit - certificatesUsed} remaining this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Detections</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?._count.detections || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?._count.certificates || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Detect Content
            </CardTitle>
            <CardDescription>
              Upload an image, video, or text to check if it's AI-generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/detect">
              <Button className="w-full gap-2">
                Start Detection
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certify Your Work
            </CardTitle>
            <CardDescription>
              Create a certificate to prove your content is authentic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/certify">
              <Button variant="outline" className="w-full gap-2">
                Create Certificate
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Detections */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Detections</CardTitle>
            <Link href="/dashboard/history">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentDetections.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No detections yet. Start by analyzing some content!
              </p>
            ) : (
              <div className="space-y-3">
                {recentDetections.map((detection) => (
                  <div key={detection.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        detection.verdict === "AUTHENTIC" || detection.verdict === "LIKELY_AUTHENTIC"
                          ? "bg-green-500"
                          : detection.verdict === "UNCERTAIN"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{detection.contentType}</p>
                        <p className="text-xs text-muted-foreground">
                          Score: {detection.authenticityScore}/100
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(detection.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Certificates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Certificates</CardTitle>
            <Link href="/dashboard/certificates">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentCertificates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No certificates yet. Certify your first piece of content!
              </p>
            ) : (
              <div className="space-y-3">
                {recentCertificates.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[150px]">
                          {cert.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cert.verificationCount} verifications
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(cert.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upgrade CTA (if on free plan) */}
      {user?.plan === "FREE" && (
        <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <CardContent className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Zap className="h-10 w-10" />
              <div>
                <h3 className="font-semibold text-lg">Upgrade to Pro</h3>
                <p className="text-blue-100">
                  Get 500 detections/day, API access, and more
                </p>
              </div>
            </div>
            <Link href="/dashboard/billing">
              <Button variant="secondary" className="gap-2">
                Upgrade Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
