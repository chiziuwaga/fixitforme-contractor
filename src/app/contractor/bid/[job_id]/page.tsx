"use client"

import { useJobBid } from "@/hooks/useJobBid"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import EnhancedChatManager from "@/components/EnhancedChatManager"
import { JobHeader } from "@/components/job-bid/JobHeader"
import { JobDetailsCard } from "@/components/job-bid/JobDetailsCard"
import { JobSidebar } from "@/components/job-bid/JobSidebar"
import { AgentPrompts } from "@/components/job-bid/AgentPrompts"

export default function JobBidPage() {
  const { job, loading, error, getUrgencyColor, getSourceColor, formatBudget } = useJobBid()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
          <span className="text-muted-foreground">Loading job details...</span>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
            {error ? "An Error Occurred" : "Job Not Found"}
          </h2>
          <p className="text-muted-foreground">{error || "The requested job could not be found."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-secondary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <JobHeader
            job={job}
            getUrgencyColor={getUrgencyColor}
            getSourceColor={getSourceColor}
            formatBudget={formatBudget}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <JobDetailsCard job={job} />
              <AgentPrompts />
            </div>

            <div className="space-y-6">
              <JobSidebar job={job} />
            </div>
          </div>
        </motion.div>
      </div>

      <EnhancedChatManager />
    </div>
  )
}
