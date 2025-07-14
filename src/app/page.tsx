import { redirect } from "next/navigation"
import { headers } from "next/headers"

// This page handles the initial routing logic - redirect to login
export default async function Page() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  
  // Check if this is a service worker request or bot
  const isServiceWorker = userAgent.includes('ServiceWorker') || userAgent.includes('bot');
  
  if (isServiceWorker) {
    // For service worker requests, return a simple redirect response
    return (
      <html>
        <head>
          <meta httpEquiv="refresh" content="0;url=/login" />
          <title>FixItForMe Contractor</title>
        </head>
        <body>
          <script>window.location.href = &apos;/login&apos;;</script>
          <noscript>
            <p>Redirecting to <a href="/login">FixItForMe Contractor Login</a></p>
          </noscript>
        </body>
      </html>
    );
  }
  
  // For normal browser requests, use Next.js redirect
  redirect("/login");
}

