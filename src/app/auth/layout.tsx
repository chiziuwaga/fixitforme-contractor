import type { Metadata } from "next"

// Comprehensive SEO metadata for Contractor Login page
export const metadata: Metadata = {
  title: "Contractor Login | FixItForMe – AI-Powered Home-Service Leads",
  description: "Log in to FixItForMe's contractor portal for AI-matched job leads, smart bidding tools, and secure payments that grow your business.",
  keywords: [
    // Tier 1 - High Traffic
    "contractor login", "contractor portal", "find construction jobs", "home service leads", 
    "contractor app", "construction job board", "handyman jobs", "plumbing jobs online", 
    "HVAC job leads", "electrician leads",
    
    // Tier 2 - Medium Traffic
    "AI contractor platform", "home service lead generation", "smart bidding tools", 
    "contractor scheduling software", "job management for contractors", "secure contractor payments",
    "contractor analytics dashboard", "mobile contractor app", "verified homeowner projects",
    "contractor reputation builder", "construction CRM", "service-area leads",
    "predictable contractor revenue", "contractor beta program", "AI matching contractors",
    
    // Tier 3 - Brand-Specific
    "FixItForMe contractor login", "FixItForMe portal", "Felix AI for contractors",
    "FixItForMe bidding tools", "FixItForMe payment dashboard", "FixItForMe contractor beta"
  ].join(", "),
  
  authors: [{ name: "FixItForMe" }],
  creator: "FixItForMe",
  publisher: "FixItForMe",
  
  openGraph: {
    title: "Join the FixItForMe Contractor Beta",
    description: "AI-Matched Leads • Secure Payments • Built for Professional Contractors",
    url: "https://contractor.fixitforme.ai/auth",
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
    creator: "@FixItForMe",
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
  
  verification: {
    google: "your-google-verification-code",
  },
  
  icons: {
    icon: [
      { url: "/logo.png", sizes: "16x16", type: "image/png" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/logo.png",
  },
  
  manifest: "/manifest.json",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "FixItForMe Contractor Login",
            "url": "https://contractor.fixitforme.ai/auth",
            "description": "AI-powered contractor portal with qualified leads, secure payments and business analytics.",
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://fixitforme.ai" },
                { "@type": "ListItem", "position": 2, "name": "Contractor Login" }
              ]
            },
            "potentialAction": {
              "@type": "LoginAction",
              "target": "https://contractor.fixitforme.ai/auth"
            },
            "publisher": {
              "@type": "Organization",
              "name": "FixItForMe",
              "logo": { "@type": "ImageObject", "url": "https://contractor.fixitforme.ai/logo.png" }
            }
          }),
        }}
      />
      {children}
    </>
  )
}
