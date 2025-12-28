import Link from "next/link"
import { 
  Shield, 
  Search, 
  Award, 
  CheckCircle, 
  ArrowRight,
  Zap,
  Lock,
  Globe,
  Upload,
  FileCheck,
  Share2,
  Users,
  Building,
  Newspaper
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 -z-10" />
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-blue-100/50 to-transparent -z-10 blur-3xl" />
          
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />
                Trusted by 10,000+ creators
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Know What's{" "}
                <span className="gradient-text">Real</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Detect AI-generated content instantly. Certify your authentic work 
                with cryptographic proof. Build trust in a world of deepfakes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/detect">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    Try Detection Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                    Get Certified
                    <Award className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                No credit card required • 10 free detections daily
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y bg-muted/30 py-12">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "2M+", label: "Detections Run" },
                { value: "500K+", label: "Certificates Issued" },
                { value: "98.5%", label: "Accuracy Rate" },
                { value: "150+", label: "Countries" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The Trust Crisis is Real
              </h2>
              <p className="text-lg text-muted-foreground">
                AI-generated content is everywhere. Most people can't tell what's real anymore.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  stat: "85%",
                  title: "Can't Detect AI",
                  description: "of people cannot distinguish AI-generated images from real photos"
                },
                {
                  stat: "$78B",
                  title: "Fraud Losses",
                  description: "lost annually to deepfake-enabled fraud and misinformation"
                },
                {
                  stat: "500%",
                  title: "Yearly Increase",
                  description: "growth in AI-generated content flooding the internet"
                }
              ].map((item) => (
                <Card key={item.title} className="text-center p-6">
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-destructive mb-2">
                      {item.stat}
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How Veri Works
              </h2>
              <p className="text-lg text-muted-foreground">
                Two powerful tools to fight the authenticity crisis
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Detection */}
              <Card className="p-8">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-6">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Detection</h3>
                <p className="text-muted-foreground mb-6">
                  Upload any image, video, audio, or text. Our AI analyzes it and tells you 
                  if it's authentic or AI-generated.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Upload, text: "Upload or paste content" },
                    { icon: Zap, text: "AI analyzes in seconds" },
                    { icon: CheckCircle, text: "Get authenticity verdict" }
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <step.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">{step.text}</span>
                    </div>
                  ))}
                </div>
                <Link href="/detect">
                  <Button className="w-full mt-6">Try Detection</Button>
                </Link>
              </Card>

              {/* Certification */}
              <Card className="p-8">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-6">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Certification</h3>
                <p className="text-muted-foreground mb-6">
                  Prove your content is authentic. Get a cryptographic certificate 
                  that anyone can verify.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Upload, text: "Upload your original work" },
                    { icon: FileCheck, text: "Get cryptographic certificate" },
                    { icon: Share2, text: "Share verification link" }
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <step.icon className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm">{step.text}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup">
                  <Button variant="outline" className="w-full mt-6">Get Certified</Button>
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built for Trust
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to verify and prove authenticity
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Instant Analysis",
                  description: "Get results in seconds, not minutes. Our AI processes content at lightning speed."
                },
                {
                  icon: Lock,
                  title: "Cryptographic Proof",
                  description: "Certificates use RSA-SHA256 signatures that can't be forged or tampered with."
                },
                {
                  icon: Globe,
                  title: "Universal Verification",
                  description: "Anyone can verify a certificate. No account needed. Just paste the link."
                },
                {
                  icon: Search,
                  title: "Multi-Format Support",
                  description: "Analyze images, videos, audio, text, and documents. All in one place."
                },
                {
                  icon: Shield,
                  title: "Privacy First",
                  description: "Your content is analyzed and deleted. We never store or share your files."
                },
                {
                  icon: Award,
                  title: "Blockchain Ready",
                  description: "Optional blockchain anchoring for permanent, immutable proof of authenticity."
                }
              ].map((feature) => (
                <Card key={feature.title} className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Who Uses Veri
              </h2>
              <p className="text-lg text-muted-foreground">
                Trusted by professionals who need to know what's real
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Users,
                  title: "Content Creators",
                  description: "Protect your original work and prove you created it first"
                },
                {
                  icon: Newspaper,
                  title: "Journalists",
                  description: "Verify sources and images before publishing"
                },
                {
                  icon: Building,
                  title: "Businesses",
                  description: "Ensure marketing content and assets are authentic"
                },
                {
                  icon: Shield,
                  title: "Legal Teams",
                  description: "Verify evidence authenticity for legal proceedings"
                }
              ].map((useCase) => (
                <Card key={useCase.title} className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <useCase.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground">{useCase.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Know What's Real?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands who trust Veri to detect AI content and certify their authentic work.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/detect">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    Try Detection Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}