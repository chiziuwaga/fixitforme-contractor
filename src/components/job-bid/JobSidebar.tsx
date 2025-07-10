import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Calendar, Search } from "lucide-react"
import type { JobDetails } from "./types"

export function JobSidebar({ job }: { job: JobDetails }) {
  return (
    <div className="space-y-6">
      {job.source === "felix_referral" && job.homeowner_name && (
        <Card className="shadow-lg border-0 bg-card/90 backdrop-blur-sm">
          <CardHeader className="border-b bg-gradient-to-r from-success/10 to-transparent">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-success">
              <User className="h-5 w-5 text-success" />
              Homeowner Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <div className="text-sm">
              <span className="font-semibold text-muted-foreground">Name:</span>
              <span className="ml-2 text-foreground">{job.homeowner_name}</span>
            </div>
            {job.homeowner_phone && (
              <div className="text-sm">
                <span className="font-semibold text-muted-foreground">Phone:</span>
                <span className="ml-2 text-foreground">{job.homeowner_phone}</span>
              </div>
            )}
            <div className="text-sm">
              <span className="font-semibold text-muted-foreground">Timeline:</span>
              <span className="ml-2 text-foreground">{job.timeline_preference || "Flexible"}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg border-0 bg-card/90 backdrop-blur-sm">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-3">
          <Button variant="outline" className="w-full hover:bg-brand-primary/5 bg-transparent">
            Save for Later
          </Button>
          <Button variant="outline" className="w-full hover:bg-brand-primary/5 bg-transparent">
            Request More Info
          </Button>
          <Button variant="outline" className="w-full hover:bg-brand-primary/5 bg-transparent">
            Schedule Site Visit
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-brand-secondary/10 to-transparent">
        <CardHeader className="border-b border-brand-secondary/20">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-brand-secondary">
            <Search className="h-5 w-5" />
            Similar Jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 text-center">
          <p className="text-brand-secondary/70 text-sm">Rex will find similar opportunities</p>
        </CardContent>
      </Card>
    </div>
  )
}
