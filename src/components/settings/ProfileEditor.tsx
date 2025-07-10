"use client"

import { useProfile } from "@/hooks/useProfile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { MultiSelect } from "@/components/ui/multi-select"
import { LAYOUTS, SPACING } from "@/lib/design-system"

export default function ProfileEditor() {
  const { formData, loading, serviceOptions, areaOptions, handleSubmit, handleChange, handleMultiSelectChange } =
    useProfile()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Company Profile</CardTitle>
        <CardDescription>This information will be visible to homeowners on your public profile.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className={SPACING.component.md}>
          <div className={LAYOUTS.grid[2]}>
            <div className={SPACING.component.xs}>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="e.g., Acme Construction"
                disabled={loading}
              />
            </div>
            <div className={SPACING.component.xs}>
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => handleChange("contactName", e.target.value)}
                placeholder="e.g., John Doe"
                disabled={loading}
              />
            </div>
            <div className={SPACING.component.xs}>
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => handleChange("licenseNumber", e.target.value)}
                placeholder="e.g., CSLB #123456"
                disabled={loading}
              />
            </div>
            <div className={SPACING.component.xs}>
              <Label htmlFor="experienceYears">Years of Experience</Label>
              <Input
                id="experienceYears"
                type="number"
                value={formData.experienceYears}
                onChange={(e) => handleChange("experienceYears", Number.parseInt(e.target.value, 10))}
                disabled={loading}
              />
            </div>
          </div>

          <div className={SPACING.component.xs}>
            <Label>Services Offered</Label>
            <MultiSelect
              options={serviceOptions}
              value={formData.services}
              onValueChange={(value) => handleMultiSelectChange("services", value)}
              placeholder="Select the services you provide..."
              disabled={loading}
            />
          </div>

          <div className={SPACING.component.xs}>
            <Label>Service Areas</Label>
            <MultiSelect
              options={areaOptions}
              value={formData.serviceAreas}
              onValueChange={(value) => handleMultiSelectChange("serviceAreas", value)}
              placeholder="Select the cities or regions you serve..."
              disabled={loading}
            />
          </div>

          <div className={SPACING.component.xs}>
            <Label htmlFor="bio">Short Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              rows={4}
              placeholder="Tell potential customers about your company's expertise and values."
              disabled={loading}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
