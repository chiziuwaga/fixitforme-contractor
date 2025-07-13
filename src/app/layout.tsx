import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { SupabaseProvider } from "@/providers/SupabaseProvider"
import { UserProvider } from "@/providers/UserProvider"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"
import { PWAInstaller } from "@/components/mobile/PWAInstaller"
import { MobileAddToHomeScreenTrigger } from "@/components/mobile/MobileAddToHomeScreenTrigger"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://fixitforme-contractor.vercel.app'),
  title: "FixItForMe Contractor",
  description: "Lead generation and management for contractors.",
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
          <SupabaseProvider>
            <UserProvider>
              <main>{children}</main>
              <Toaster />
              <PWAInstaller />
              <MobileAddToHomeScreenTrigger />
            </UserProvider>
          </SupabaseProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
