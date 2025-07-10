"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "./useUser"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

interface OnboardingFormData {
  companyName: string
  contactName: string
  services: string[]
  serviceAreas: string[]
  licenseNumber: string
  experienceYears: number
  bio: string
}

const MOCK_SERVICE_OPTIONS = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "hvac", label: "HVAC" },
  { value: "roofing", label: "Roofing" },
  { value: "painting", label: "Painting" },
  { value: "landscaping", label: "Landscaping" },
]

const MOCK_AREA_OPTIONS = [
  { value: "san_francisco", label: "San Francisco" },
  { value: "san_mateo", label: "San Mateo" },
  { value: "palo_alto", label: "Palo Alto" },
  { value: "oakland", label: "Oakland" },
  { value: "berkeley", label: "Berkeley" },
]

export function useOnboarding() {
  const router = useRouter()
  const { user } = useUser()
  const supabase = createClientComponentClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<OnboardingFormData>({
    companyName: "",
    contactName: "",
    services: [],
    serviceAreas: [],
    licenseNumber: "",
    experienceYears: 5,
    bio: "",
  })

  const totalSteps = 4

  const validateStep = () => {
    switch (step) {
      case 1:
        return formData.companyName.trim() !== "" && formData.contactName.trim() !== ""
      case 2:
        return formData.services.length > 0 && formData.serviceAreas.length > 0
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

  const handleChange = (field: keyof OnboardingFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMultiSelectChange = (field: "services" | "serviceAreas", value: string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
      const { error } = await supabase.from("contractor_profiles").upsert({
        user_id: user.id,
        company_name: formData.companyName,
        contact_name: formData.contactName,
        license_number: formData.licenseNumber,
        experience_years: formData.experienceYears,
        services_offered: formData.services,
        service_areas: formData.serviceAreas,
        bio: formData.bio,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
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
    serviceOptions: MOCK_SERVICE_OPTIONS,
    areaOptions: MOCK_AREA_OPTIONS,
    progress: (step / totalSteps) * 100,
    canContinue: validateStep(),
    nextStep,
    prevStep,
    handleChange,
    handleMultiSelectChange,
  }
}
