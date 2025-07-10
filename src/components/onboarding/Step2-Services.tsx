"use client"

import { Label } from "@/components/ui/label"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { MultiSelect } from "@/components/ui/multi-select"
import { SPACING } from "@/lib/design-system"
import type { OnboardingStepProps } from "./types"

export function OnboardingStep2({
  formData,
  handleMultiSelectChange,
  serviceOptions,
  areaOptions,
}: OnboardingStepProps) {
  return (
    <div className={SPACING.component.md}>
      <CardTitle>Your Services</CardTitle>
      <CardDescription>What do you do and where do you do it? This helps us find the perfect leads.</CardDescription>
      <div className={`${SPACING.component.sm} pt-4`}>
        <div className={SPACING.component.xs}>
          <Label>Services Offered</Label>
          <MultiSelect
            options={serviceOptions}
            value={formData.services}
            onValueChange={(value) => handleMultiSelectChange("services", value)}
            placeholder="Select services..."
          />
        </div>
        <div className={SPACING.component.xs}>
          <Label>Service Areas</Label>
          <MultiSelect
            options={areaOptions}
            value={formData.serviceAreas}
            onValueChange={(value) => handleMultiSelectChange("serviceAreas", value)}
            placeholder="Select areas..."
          />
        </div>
      </div>
    </div>
  )
}
