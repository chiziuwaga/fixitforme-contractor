"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { SPACING } from "@/lib/design-system"
import type { OnboardingStepProps } from "./types"

export function OnboardingStep1({ formData, handleChange }: OnboardingStepProps) {
  return (
    <div className={SPACING.component.md}>
      <CardTitle>Welcome to FixItForMe!</CardTitle>
      <CardDescription>Let's start with the basics. Tell us about your company.</CardDescription>
      <div className={`${SPACING.component.sm} pt-4`}>
        <div className={SPACING.component.xs}>
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            placeholder="e.g., Acme Construction"
            autoFocus
          />
        </div>
        <div className={SPACING.component.xs}>
          <Label htmlFor="contactName">Your Full Name</Label>
          <Input
            id="contactName"
            value={formData.contactName}
            onChange={(e) => handleChange("contactName", e.target.value)}
            placeholder="e.g., John Doe"
          />
        </div>
      </div>
    </div>
  )
}
