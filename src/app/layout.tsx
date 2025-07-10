import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { SupabaseProvider } from "@/providers/SupabaseProvider"
import { UserProvider } from "@/providers/UserProvider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FixItForMe Contractor",
  description: "Lead generation and management for contractors.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
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
