import type React from "react"
import type { Metadata } from "next"
import { Inter, Roboto_Slab, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { SupabaseProvider } from "@/providers/SupabaseProvider"
import { UserProvider } from "@/providers/UserProvider"

// Font configurations with proper display and subsets
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
})

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-slab",
  weight: ["300", "400", "500", "600", "700", "800"],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: ["300", "400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "FixItForMe - Professional Home Repairs Made Simple",
  description:
    "Connect with trusted contractors for all your home repair needs. Professional, reliable, and efficient service guaranteed.",
  keywords: ["home repair", "contractors", "professional services", "home improvement"],
  authors: [{ name: "21st Century Program", url: "https://21st.app" }],
  creator: "21st Century Program",
  publisher: "21st Century Program",
  robots: "index, follow",
  openGraph: {
    title: "FixItForMe - Professional Home Repairs",
    description: "Connect with trusted contractors for all your home repair needs.",
    url: "https://fixitforme.app",
    siteName: "FixItForMe",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FixItForMe - Professional Home Repairs",
    description: "Connect with trusted contractors for all your home repair needs.",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: "#D4A574",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoSlab.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Preload critical fonts */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/roboto-slab-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Performance and SEO meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SupabaseProvider>
          <UserProvider>
            <main className="relative flex min-h-screen flex-col">{children}</main>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "var(--color-background)",
                  color: "var(--color-text-primary)",
                  border: "1px solid var(--color-green-200)",
                },
              }}
            />
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
