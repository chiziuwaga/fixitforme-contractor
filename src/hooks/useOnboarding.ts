"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/useUser"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

export interface OnboardingFormData {
  companyName: string
  contactName: string
  services: string[]
  serviceAreas: string[]
  customServiceArea?: {
    locationName: string
    city: string
    state: string
    radius: number
  }
  licenseNumber: string
  experienceYears: number
  bio: string
}

interface ServiceOption {
  value: string;
  label: string;
  felix_id?: number;
}

interface AreaOption {
  value: string;
  label: string;
  region?: string;
  radius?: number;
  area_id?: number | null;
}

export function useOnboarding() {
  const router = useRouter()
  const { user } = useUser()
  const supabase = createClientComponentClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([])
  const [areaOptions, setAreaOptions] = useState<AreaOption[]>([])
  const [formData, setFormData] = useState<OnboardingFormData>({
    companyName: "",
    contactName: "",
    services: [],
    serviceAreas: [],
    customServiceArea: undefined,
    licenseNumber: "",
    experienceYears: 5,
    bio: "",
  })

  const totalSteps = 4

  // Load Felix framework service options on mount
  useEffect(() => {
    const loadServiceOptions = async () => {
      try {
        // Load Felix framework service categories from database
        const { data: felixCategories, error: felixError } = await supabase
          .from('felix_categories')
          .select('id, category_name')
          .order('category_name')

        if (!felixError && felixCategories) {
          const services = felixCategories.map(cat => ({
            value: cat.category_name.toLowerCase().replace(/\s+/g, '_'),
            label: cat.category_name,
            felix_id: cat.id
          }))
          setServiceOptions(services)
        } else {
          // Fallback to basic service options if Felix categories aren't available
          setServiceOptions([
            { value: "plumbing", label: "Plumbing" },
            { value: "electrical", label: "Electrical" },
            { value: "hvac", label: "HVAC" },
            { value: "roofing", label: "Roofing" },
            { value: "painting", label: "Painting" },
            { value: "flooring", label: "Flooring" },
            { value: "drywall", label: "Drywall" },
            { value: "kitchen_remodeling", label: "Kitchen Remodeling" },
          ])
        }

        // Load dynamic service areas from database
        const { data: serviceAreas, error: areasError } = await supabase
          .from('common_service_areas')
          .select('id, area_name, area_type, state_code, typical_radius_miles')
          .eq('active', true)
          .order('area_name')

        if (!areasError && serviceAreas) {
          const areas = serviceAreas.map(area => ({
            value: area.area_name.toLowerCase().replace(/\s+/g, '_'),
            label: `${area.area_name}, ${area.state_code}`,
            region: area.area_type,
            radius: area.typical_radius_miles,
            area_id: area.id
          }))
          
          // Add "Other - Enter Custom Location" option
          areas.push({
            value: "custom_location",
            label: "Other - Enter Custom Location",
            region: "custom",
            radius: 25,
            area_id: null
          })
          
          setAreaOptions(areas)
        } else {
          // Fallback to basic options if database fails
          setAreaOptions([
            { value: "san_francisco_bay", label: "San Francisco Bay Area, CA", region: "metro_area" },
            { value: "los_angeles", label: "Los Angeles Metro, CA", region: "metro_area" },
            { value: "new_york", label: "New York City Metro, NY", region: "metro_area" },
            { value: "chicago", label: "Chicago Metro, IL", region: "metro_area" },
            { value: "custom_location", label: "Other - Enter Custom Location", region: "custom" },
          ])
        }
      } catch (error) {
        console.error('Error loading service options:', error)
        // Use fallback options on error
        setServiceOptions([
          { value: "plumbing", label: "Plumbing" },
          { value: "electrical", label: "Electrical" },
          { value: "hvac", label: "HVAC" },
          { value: "roofing", label: "Roofing" },
        ])
        setAreaOptions([
          { value: "san_francisco", label: "San Francisco" },
          { value: "oakland", label: "Oakland" },
        ])
      }
    }

    loadServiceOptions()
  }, [supabase])

  const validateStep = () => {
    switch (step) {
      case 1:
        return formData.companyName.trim() !== "" && formData.contactName.trim() !== ""
      case 2:
        const hasServices = formData.services.length > 0
        const hasServiceAreas = formData.serviceAreas.length > 0
        const customAreaValid = formData.serviceAreas.includes("custom_location") 
          ? formData.customServiceArea?.locationName?.trim() && 
            formData.customServiceArea?.city?.trim() && 
            formData.customServiceArea?.state?.trim()
          : true
        return hasServices && hasServiceAreas && customAreaValid
      case 3:
        return formData.licenseNumber.trim() !== "" && formData.experienceYears > 0
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep()) {
      if (step < totalSteps) {
        setStep((s) => s + 1)
      } else {
        finishOnboarding()
      }
    } else {
      toast.error("Please fill out all required fields before continuing.")
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep((s) => s - 1)
    }
  }

  const handleChange = (field: keyof OnboardingFormData, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMultiSelectChange = (field: keyof OnboardingFormData, value: string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCustomServiceAreaChange = (customData: Partial<OnboardingFormData['customServiceArea']>) => {
    setFormData((prev) => ({
      ...prev,
      customServiceArea: {
        locationName: prev.customServiceArea?.locationName || "",
        city: prev.customServiceArea?.city || "",
        state: prev.customServiceArea?.state || "",
        radius: prev.customServiceArea?.radius || 25,
        ...customData
      }
    }))
  }

  const finishOnboarding = async () => {
    if (!user) {
      toast.error("You must be logged in to complete onboarding.")
      return
    }
    if (!validateStep()) {
      toast.error("Please ensure all fields are filled correctly.")
      return
    }

    setLoading(true)
    const promise = async () => {
      // Prepare service areas data
      const serviceAreasData = formData.serviceAreas.includes("custom_location")
        ? [...formData.serviceAreas.filter(area => area !== "custom_location")]
        : formData.serviceAreas

      // Add custom service area if provided
      if (formData.customServiceArea && formData.serviceAreas.includes("custom_location")) {
        serviceAreasData.push(`custom:${formData.customServiceArea.locationName}`)
      }

      const { error } = await supabase.from("contractor_profiles").upsert({
        user_id: user.id,
        company_name: formData.companyName,
        contact_name: formData.contactName,
        license_number: formData.licenseNumber,
        experience_years: formData.experienceYears,
        services_offered: formData.services,
        service_areas: serviceAreasData,
        bio: formData.bio,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      // If custom service area provided, save it to contractor_service_regions
      if (formData.customServiceArea && formData.serviceAreas.includes("custom_location")) {
        const { data: contractorProfile } = await supabase
          .from("contractor_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single()

        if (contractorProfile) {
          await supabase.from("contractor_service_regions").insert({
            contractor_id: contractorProfile.id,
            region_name: formData.customServiceArea.locationName,
            center_coordinates: `POINT(0 0)`, // Would need geocoding in production
            service_radius_miles: formData.customServiceArea.radius || 25,
            region_type: 'custom',
            state_code: formData.customServiceArea.state.toUpperCase(),
          })
        }
      }
    }

    toast.promise(promise(), {
      loading: "Finalizing your profile...",
      success: () => {
        setTimeout(() => router.push("/contractor/dashboard"), 1000)
        return "Welcome aboard! Redirecting to your dashboard..."
      },
      error: (err) => `Failed to save: ${err.message}`,
      finally: () => setLoading(false),
    })
  }

  return {
    step,
    totalSteps,
    loading,
    formData,
    serviceOptions,
    areaOptions,
    progress: (step / totalSteps) * 100,
    canContinue: validateStep(),
    nextStep,
    prevStep,
    handleChange,
    handleMultiSelectChange,
    handleCustomServiceAreaChange,
    finishOnboarding,
  }
}
