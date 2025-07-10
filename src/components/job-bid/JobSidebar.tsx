"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "react-i18next"
import type { Job } from "../../models/Job"
import { format } from "date-fns"

interface JobSidebarProps {
  job: Job
  onBidNow: () => void
}

export const JobSidebar: React.FC<JobSidebarProps> = ({ job, onBidNow }) => {
  const { t } = useTranslation()

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return format(date, "MMM dd, yyyy")
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid Date"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Sidebar</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Sidebar content will be here.</p>
        {/* <Typography variant="h6" component="div" gutterBottom>
          {t("jobDetails")}
        </Typography>

        <Typography variant="subtitle1" color="text.secondary">
          {t("client")}: {job.clientName}
        </Typography>

        <Typography variant="subtitle1" color="text.secondary">
          {t("location")}: {job.location}
        </Typography>

        <Typography variant="subtitle1" color="text.secondary">
          {t("jobType")}: {job.jobType}
        </Typography>

        <Typography variant="subtitle1" color="text.secondary">
          {t("postedDate")}: {formatDate(job.postedDate)}
        </Typography>

        <Typography variant="subtitle1" color="text.secondary">
          {t("budget")}: ${job.budget}
        </Typography>

        <div style={{ marginTop: "16px" }}>
          <button style={{ width: "100%", backgroundColor: "#1976d2", color: "white", padding: "8px", borderRadius: "4px" }} onClick={onBidNow}>
            {t("bidNow")}
          </button>
        </div> */}
      </CardContent>
    </Card>
  )
}
