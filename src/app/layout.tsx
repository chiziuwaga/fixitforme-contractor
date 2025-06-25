import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/providers/UserProvider";
import { SupabaseProvider } from "@/providers/SupabaseProvider";
import { AppSystemWrapper } from "@/components/AppSystemWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FixItForMe - Contractor Dashboard",
  description: "AI-powered lead generation and project management for professional contractors",
  keywords: "contractor, leads, AI, project management, bidding, construction",
  authors: [{ name: "FixItForMe" }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#D4A574" />
      </head>
      <body
        className={`${inter.variable} antialiased font-sans bg-gray-50 min-h-screen`}
        style={{
          fontFamily: 'var(--font-inter), system-ui, sans-serif'
        }}
      >
        <SupabaseProvider>
          <UserProvider>
            <AppSystemWrapper>
              {children}
            </AppSystemWrapper>
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
