import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { UserProvider } from "@/providers/UserProvider"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"
import { PWAInstaller } from "@/components/mobile/PWAInstaller"
import { MobileAddToHomeScreenTrigger } from "@/components/mobile/MobileAddToHomeScreenTrigger"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://contractor.fixitforme.ai'),
  title: "FixItForMe Contractor",
  description: "AI-Matched Leads • Secure Payments • Join the FixItForMe Contractor Beta",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
  },
  openGraph: {
    title: "Join the FixItForMe Contractor Beta",
    description: "AI-Matched Leads • Secure Payments • Built for Professional Contractors",
    url: "https://contractor.fixitforme.ai",
    siteName: "FixItForMe Contractor",
    images: [
      {
        url: "/social-preview.png",
        width: 1200,
        height: 630,
        alt: "Join the FixItForMe Contractor Beta - AI-Matched Leads & Secure Payments",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join the FixItForMe Contractor Beta",
    description: "AI-Matched Leads • Secure Payments • Built for Professional Contractors",
    images: ["/social-preview.png"],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Allow zooming for accessibility
  userScalable: true, // Allow user scaling for accessibility
  themeColor: '#1A2E1A', // Forest Green
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ErrorBoundary>
          <UserProvider>
            <main>{children}</main>
            <Toaster />
            <PWAInstaller />
            <MobileAddToHomeScreenTrigger />
          </UserProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
