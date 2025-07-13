import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { SupabaseProvider } from "@/providers/SupabaseProvider"
import { UserProvider } from "@/providers/UserProvider"
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <SupabaseProvider>
          <UserProvider>
            <main>{children}</main>
            <Toaster />
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
