"use client"

import { CardDescription, CardTitle } from "@/components/ui/card"
import { SPACING } from "@/lib/design-system"
import type { OnboardingStepProps } from "./types"
import { Badge } from "@/components/ui/badge"

const DetailItem = ({ label, value }: { label: string; value: string | number | string[] }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    {Array.isArray(value) ? (
      <div className="flex flex-wrap gap-2 mt-1">
        {value.map((item) => (
          <Badge key={item} variant="secondary">
            {item}
          </Badge>
        ))}
      </div>
    ) : (
      <p className="text-base text-foreground">{value}</p>
    )}
  </div>
)

export function OnboardingStep4({ formData }: OnboardingStepProps) {
  return (
    <div className={SPACING.component.md}>
      <CardTitle>Confirm Your Details</CardTitle>
      <CardDescription>Please review your information before we create your profile.</CardDescription>
      <div className={`${SPACING.component.lg} pt-4`}>
        <DetailItem label="Company Name" value={formData.companyName} />
        <DetailItem label="Contact Name" value={formData.contactName} />
        <DetailItem label="License Number" value={formData.licenseNumber} />
        <DetailItem label="Years of Experience" value={`${formData.experienceYears} years`} />
        <DetailItem label="Services Offered" value={formData.services} />
        <DetailItem label="Service Areas" value={formData.serviceAreas} />
        <DetailItem label="Bio" value={formData.bio} />
      </div>
    </div>
  )
}
