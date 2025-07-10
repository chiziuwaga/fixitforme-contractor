"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, MapPin, Clock, DollarSign } from "lucide-react"
import type { Lead } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"

interface LeadFeedProps {
  leads: Lead[]
  loading: boolean
}

const formatTimeAgo = (dateString: string) => {
  const now = new Date()
  const posted = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - posted.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d ago`
}

const getUrgencyBadgeClass = (urgency: Lead["urgency"]) => {
  switch (urgency) {
    case "high":
      return "bg-destructive/10 text-destructive border-destructive/20"
    case "medium":
      return "bg-yellow-400/10 text-yellow-500 border-yellow-400/20"
    case "low":
      return "bg-primary/10 text-primary border-primary/20"
  }
}

export function LeadFeed({ leads, loading }: LeadFeedProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <Card className="flex items-center justify-center py-12 text-center">
        <div>
          <h3 className="text-lg font-medium">No new leads right now.</h3>
          <p className="text-muted-foreground mt-1">Check back later or ask @rex to find more opportunities.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {leads.map((lead) => (
        <Card key={lead.id} className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-lg">{lead.title}</CardTitle>
              <Badge variant="outline" className={cn("capitalize flex-shrink-0", getUrgencyBadgeClass(lead.urgency))}>
                {lead.urgency} Urgency
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground pt-1">
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                <span>
                  ${lead.budget_min.toLocaleString()} - ${lead.budget_max.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{lead.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{formatTimeAgo(lead.posted_at)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm line-clamp-2 max-w-prose">{lead.description}</p>
            <Link href={`/contractor/bid/${lead.id}`} passHref>
              <Button asChild>
                <a>
                  View Details <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
