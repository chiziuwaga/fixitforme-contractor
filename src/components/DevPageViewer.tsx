"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Eye } from "lucide-react"

const pages = [
  { name: "Login Page", path: "/login", description: "The entry point for contractors." },
  { name: "Onboarding Flow", path: "/contractor/onboarding", description: "First-time user setup process." },
  { name: "Contractor Dashboard", path: "/contractor/dashboard", description: "Main hub for authenticated users." },
  { name: "Settings Page", path: "/contractor/settings", description: "User profile and subscription management." },
]

export function DevPageViewer() {
  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Eye className="h-8 w-8 text-primary" />
            <CardTitle className="font-serif text-3xl">UI/UX Page Viewer</CardTitle>
          </div>
          <CardDescription>
            Use this hub to navigate and review the styled pages without needing to log in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pages.map((page) => (
              <div
                key={page.path}
                className="border rounded-lg p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-lg">{page.name}</h3>
                  <p className="text-sm text-muted-foreground">{page.description}</p>
                </div>
                <Button asChild variant="outline">
                  <Link href={page.path}>
                    View Page <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
