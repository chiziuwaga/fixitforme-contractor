"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, Send } from "lucide-react"

interface JobDetails {
  id: string
  title: string
  description: string
  budget_min: number
  budget_max: number
  location: string
  posted_at: string
  urgency: "low" | "medium" | "high"
  felix_category: string
  source: "felix_referral" | "rex_discovery" | "direct_inquiry"
  homeowner_name?: string
  homeowner_phone?: string
  requirements: string[]
  timeline_preference: string
}

interface JobSidebarProps {
  job: JobDetails
  bidAmount: string
  setBidAmount: (value: string) => void
  coverLetter: string
  setCoverLetter: (value: string) => void
  isLoading: boolean
  submitBid: () => void
  getUrgencyColor: (urgency: string) => string
  getSourceColor: (source: string) => string
  formatBudget: (min: number, max: number) => string
}

export const JobSidebar: React.FC<JobSidebarProps> = ({ 
  job, 
  bidAmount, 
  setBidAmount, 
  coverLetter, 
  setCoverLetter, 
  isLoading, 
  submitBid,
  formatBudget 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Submit Your Bid
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bid-amount">Your Bid Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <Input
              id="bid-amount"
              type="number"
              placeholder="0.00"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="pl-6"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Client budget: {formatBudget(job.budget_min, job.budget_max)}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cover-letter">Cover Letter</Label>
          <Textarea
            id="cover-letter"
            placeholder="Introduce yourself and explain why you're the right fit for this project..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={6}
          />
        </div>

        <Button 
          onClick={submitBid}
          disabled={isLoading || !bidAmount || !coverLetter}
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Bid
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
