import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, DollarSign } from "lucide-react"
import type { JobBidComponentProps } from "./types"

export function JobHeader({ job, getUrgencyColor, getSourceColor, formatBudget }: JobBidComponentProps) {
  return (
    <Card className="border-2 border-primary/10 shadow-xl bg-card/80 backdrop-blur-sm">
      <CardHeader className="border-b border-brand-primary/10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className={getSourceColor(job.source)} variant="outline">
                {job.source === "felix_referral"
                  ? "Felix Referral"
                  : job.source === "rex_discovery"
                    ? "Rex Discovery"
                    : "Direct Inquiry"}
              </Badge>
              <Badge className={getUrgencyColor(job.urgency)} variant="outline">
                {job.urgency} priority
              </Badge>
            </div>

            <CardTitle className="text-3xl font-bold text-foreground leading-tight">{job.title}</CardTitle>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-brand-primary" />
                <span className="font-semibold">{formatBudget(job.budget_min, job.budget_max)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-primary" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-primary" />
                <span>{new Date(job.posted_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            className="bg-gradient-to-r from-brand-primary to-brand-primary/80 hover:from-brand-primary/90 hover:to-brand-primary/70 shadow-lg min-w-[140px]"
          >
            Submit Bid
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}
