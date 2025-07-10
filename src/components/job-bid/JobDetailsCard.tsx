import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, MessageSquare } from "lucide-react"
import type { JobDetails } from "./types"

export function JobDetailsCard({ job }: { job: JobDetails }) {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-card/90 backdrop-blur-sm">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Job Description
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-muted-foreground leading-relaxed">{job.description}</p>
        </CardContent>
      </Card>

      {job.requirements && job.requirements.length > 0 && (
        <Card className="shadow-lg border-0 bg-card/90 backdrop-blur-sm">
          <CardHeader className="border-b bg-gradient-to-r from-secondary/5 to-transparent">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-secondary" />
              Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-2">
              {job.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-brand-primary font-bold mt-1">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
