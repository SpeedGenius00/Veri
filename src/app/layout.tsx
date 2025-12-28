import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "@/components/providers/session-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Veri - Know What's Real",
    template: "%s | Veri",
  },
  description: "Detect AI-generated content and certify your authentic work. Build trust in a world of deepfakes.",
  keywords: [
    "AI detection",
    "deepfake detection", 
    "content authenticity",
    "certificate",
    "verification",
    "AI-generated content",
    "content certification",
    "digital authenticity",
  ],
  authors: [{ name: "Veri" }],
  creator: "Veri",
  publisher: "Veri",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://veri.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Veri - Know What's Real",
    description: "Detect AI-generated content and certify your authentic work.",
    siteName: "Veri",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Veri - Know What's Real",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Veri - Know What's Real",
    description: "Detect AI-generated content and certify your authentic work.",
    images: ["/og-image.png"],
    creator: "@veriapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  )
}