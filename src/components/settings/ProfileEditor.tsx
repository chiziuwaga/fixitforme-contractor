"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { useProfile } from "@/hooks/useProfile"
import { User, Phone, Mail, MapPin, Briefcase, Camera, Save, Loader2 } from "lucide-react"
import { TYPOGRAPHY, SPACING } from "@/lib/design-system"
import { cn } from "@/lib/utils"

export default function ProfileEditor() {
  const { profile, loading, updateProfile, uploadAvatar } = useProfile()
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    business_name: profile?.businessName || profile?.companyName || "",
    phone: profile?.phone || "",
    email: profile?.email || "",
    address: profile?.address || "",
    city: profile?.city || "",
    state: profile?.state || "",
    zip_code: profile?.zipCode || "",
    license_number: profile?.licenseNumber || "",
    insurance_number: profile?.insuranceNumber || "",
    bio: profile?.bio || "",
    years_experience: profile?.experienceYears || 0,
    specialties: (profile?.specialties || []) as string[],
    service_radius: profile?.serviceRadius || 25,
    availability_notifications: profile?.availabilityNotifications || true,
    marketing_emails: profile?.marketingEmails || false,
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSpecialtyAdd = (specialty: string) => {
    if (specialty && !formData.specialties.includes(specialty)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }))
    }
  }

  const handleSpecialtyRemove = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((s: string) => s !== specialty)
    }))
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 50MB limit
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB")
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file")
      return
    }

    setIsUploading(true)
    try {
      await uploadAvatar(file)
      toast.success("Profile photo updated successfully")
    } catch (error) {
      toast.error("Failed to upload profile photo")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateProfile(formData)
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading profile...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", SPACING.component.lg)}>
      {/* Profile Photo & Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className={TYPOGRAPHY.heading.h2}>Profile Information</CardTitle>
          <CardDescription>
            Update your professional profile and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className={SPACING.component.lg}>
          {/* Avatar Upload */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatarUrl} alt={profile?.businessName || profile?.companyName} />
              <AvatarFallback className="text-lg">
                {(profile?.businessName || profile?.companyName)?.charAt(0) || <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" disabled={isUploading} asChild>
                  <span>
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    <span className="ml-2">
                      {isUploading ? "Uploading..." : "Change Photo"}
                    </span>
                  </span>
                </Button>
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                JPG, PNG up to 50MB
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="business_name" className="flex items-center">
                <Briefcase className="h-4 w-4 mr-2" />
                Business Name *
              </Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => handleInputChange("business_name", e.target.value)}
                placeholder="Your Business Name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="(555) 123-4567"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="years_experience">Years of Experience</Label>
              <Input
                id="years_experience"
                type="number"
                min="0"
                max="50"
                value={formData.years_experience}
                onChange={(e) => handleInputChange("years_experience", parseInt(e.target.value) || 0)}
                placeholder="5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className={cn(TYPOGRAPHY.heading.h3, "flex items-center")}>
            <MapPin className="h-5 w-5 mr-2" />
            Service Address
          </CardTitle>
          <CardDescription>
            Your primary business location for service area calculations
          </CardDescription>
        </CardHeader>
        <CardContent className={SPACING.component.md}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="123 Main Street"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Your City"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AL">Alabama</SelectItem>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  {/* Add more states as needed */}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip_code">ZIP Code</Label>
              <Input
                id="zip_code"
                value={formData.zip_code}
                onChange={(e) => handleInputChange("zip_code", e.target.value)}
                placeholder="12345"
                maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_radius">Service Radius (miles)</Label>
              <Input
                id="service_radius"
                type="number"
                min="1"
                max="100"
                value={formData.service_radius}
                onChange={(e) => handleInputChange("service_radius", parseInt(e.target.value) || 25)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className={TYPOGRAPHY.heading.h3}>Professional Details</CardTitle>
          <CardDescription>
            License information and business specialties
          </CardDescription>
        </CardHeader>
        <CardContent className={SPACING.component.md}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                value={formData.license_number}
                onChange={(e) => handleInputChange("license_number", e.target.value)}
                placeholder="LIC123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance_number">Insurance Policy Number</Label>
              <Input
                id="insurance_number"
                value={formData.insurance_number}
                onChange={(e) => handleInputChange("insurance_number", e.target.value)}
                placeholder="INS789012"
              />
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell potential clients about your experience, specialties, and what sets you apart..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Specialties */}
          <div className="space-y-3 mt-6">
            <Label>Service Specialties</Label>
            <div className="flex flex-wrap gap-2">
              {formData.specialties.map((specialty: string) => (
                <Badge key={specialty} variant="secondary" className="cursor-pointer">
                  {specialty}
                  <button
                    onClick={() => handleSpecialtyRemove(specialty)}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a specialty (e.g., Kitchen Remodeling)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSpecialtyAdd(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement
                  handleSpecialtyAdd(input.value)
                  input.value = ''
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className={TYPOGRAPHY.heading.h3}>Notification Preferences</CardTitle>
          <CardDescription>
            Control how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className={SPACING.component.md}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="availability_notifications">Job Availability Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new jobs match your criteria
                </p>
              </div>
              <Switch
                id="availability_notifications"
                checked={formData.availability_notifications}
                onCheckedChange={(checked) => handleInputChange("availability_notifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing_emails">Marketing Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive tips, insights, and platform updates
                </p>
              </div>
              <Switch
                id="marketing_emails"
                checked={formData.marketing_emails}
                onCheckedChange={(checked) => handleInputChange("marketing_emails", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="ml-2">
            {isSaving ? "Saving..." : "Save Changes"}
          </span>
        </Button>
      </div>
    </div>
  )
}
