export interface JobDetails {
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

export interface JobBidComponentProps {
  job: JobDetails
  getUrgencyColor: (urgency: string) => string
  getSourceColor: (source: string) => string
  formatBudget: (min: number, max: number) => string
}
