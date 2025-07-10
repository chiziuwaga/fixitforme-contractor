"use client"

import { CardDescription, CardTitle } from "@/components/ui/card"
import { PartyPopper } from "lucide-react"

export function OnboardingStep4() {
  return (
    <div className="text-center space-y-4">
      <PartyPopper className="h-16 w-16 mx-auto text-primary" />
      <CardTitle>You're all set!</CardTitle>
      <CardDescription>Your profile is complete. We're ready to start finding you high-quality leads.</CardDescription>
    </div>
  )
}
