import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/providers/UserProvider";
import { SupabaseProvider } from "@/providers/SupabaseProvider";
import { AppSystemWrapper } from "@/components/AppSystemWrapper";
import { BRAND } from '@/lib/brand';
import { MantineProvider } from "@mantine/core";
import { theme } from "../theme";

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
        <meta name="theme-color" content={BRAND.colors.primary} />
      </head>
      <body
        className={`${inter.variable} antialiased font-sans bg-gray-50 min-h-screen`}
      >
        <MantineProvider theme={theme}>
          <SupabaseProvider>
            <UserProvider>
              <AppSystemWrapper>
                {children}
              </AppSystemWrapper>
            </UserProvider>
          </SupabaseProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
