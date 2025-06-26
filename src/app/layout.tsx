import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/providers/UserProvider";
import { SupabaseProvider } from "@/providers/SupabaseProvider";
import { AppSystemWrapper } from "@/components/AppSystemWrapper";
import { BRAND } from '@/lib/brand';
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: BRAND.name,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.tagline,
  icons: [{ rel: 'icon', url: '/logo.png' }],
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
        className={`${inter.variable} antialiased font-sans bg-background text-foreground min-h-screen`}
      >
        <SupabaseProvider>
          <UserProvider>
            <AppSystemWrapper>
              {children}
            </AppSystemWrapper>
            <Toaster 
              position="top-right"
              expand={true}
              richColors
              closeButton
            />
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
