"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { SPACING } from "@/lib/design-system"
import type { OnboardingStepProps } from "./types"
import { Textarea } from "@/components/ui/textarea"

export function OnboardingStep3({ formData, handleChange }: OnboardingStepProps) {
  return (
    <div className={SPACING.component.md}>
      <CardTitle>Your Credentials</CardTitle>
      <CardDescription>Finally, let's get your professional details.</CardDescription>
      <div className={`${SPACING.component.sm} pt-4`}>
        <div className={SPACING.component.xs}>
          <Label htmlFor="licenseNumber">License Number</Label>
          <Input
            id="licenseNumber"
            value={formData.licenseNumber}
            onChange={(e) => handleChange("licenseNumber", e.target.value)}
            placeholder="e.g., 123456789"
          />
        </div>
        <div className={SPACING.component.xs}>
          <Label htmlFor="experienceYears">Years of Experience</Label>
          <Input
            id="experienceYears"
            type="number"
            value={formData.experienceYears}
            onChange={(e) => handleChange("experienceYears", Number.parseInt(e.target.value, 10))}
            placeholder="e.g., 10"
          />
        </div>
        <div className={SPACING.component.xs}>
          <Label htmlFor="bio">Short Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Tell us a little about your company and expertise..."
          />
        </div>
      </div>
    </div>
  )
}
