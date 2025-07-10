"use client"

import { cn } from "@/lib/utils"

import { useDashboard } from "@/hooks/useDashboard"
import { QuickStats } from "@/components/dashboard/QuickStats"
import { LeadFeed } from "@/components/dashboard/LeadFeed"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ListChecks, RefreshCw } from "lucide-react"
import { EnhancedChatManager } from "@/components/EnhancedChatManager"

export default function ContractorDashboardPage() {
  const { stats, leads, loading, refreshData } = useDashboard()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Here&apos;s a summary of your business activity.</p>
        </div>
        <Button onClick={refreshData} disabled={loading} variant="outline">
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          Refresh Data
        </Button>
      </div>

      <QuickStats stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                <span>Recent Leads</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeadFeed leads={leads} loading={loading} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>AI Assistants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Use your AI assistants to analyze leads, calculate bids, and find new opportunities.
              </p>
              {/* The Chat Manager is positioned by default, so it doesn't need to be inside the card */}
            </CardContent>
          </Card>
        </div>
      </div>
      <EnhancedChatManager />
    </div>
  )
}
