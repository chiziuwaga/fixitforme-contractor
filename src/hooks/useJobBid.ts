"use client"

import { useState } from "react"
import { toast } from "sonner"

export function useJobBid(jobId: string) {
  const [bidAmount, setBidAmount] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const submitBid = async () => {
    setIsLoading(true)
    console.log("Submitting bid for job:", jobId, { bidAmount, coverLetter })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast.success("Your bid has been submitted successfully!")
    setIsLoading(false)
  }

  return {
    bidAmount,
    setBidAmount,
    coverLetter,
    setCoverLetter,
    isLoading,
    submitBid,
  }
}
