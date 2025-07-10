"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useUser } from "./useUser"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Mock data for select options
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

interface ProfileData {
  companyName: string
  contactName: string
  licenseNumber: string
  experienceYears: number
  services: string[]
  serviceAreas: string[]
  bio: string
}

export function useProfile() {
  const { user } = useUser()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<ProfileData>({
    companyName: "",
    contactName: "",
    licenseNumber: "",
    experienceYears: 0,
    services: [],
    serviceAreas: [],
    bio: "",
  })

  // Fetch initial profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      setLoading(true)
      try {
        const { data, error } = await supabase.from("contractor_profiles").select("*").eq("user_id", user.id).single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 means no rows found, which is fine on first load
          throw error
        }

        if (data) {
          setFormData({
            companyName: data.company_name || "",
            contactName: data.contact_name || "",
            licenseNumber: data.license_number || "",
            experienceYears: data.experience_years || 0,
            services: data.services_offered || [],
            serviceAreas: data.service_areas || [],
            bio: data.bio || "",
          })
        }
      } catch (error) {
        toast.error("Failed to load profile data.", {
          description: error instanceof Error ? error.message : "Please try again later.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, supabase])

  const handleChange = (field: keyof ProfileData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMultiSelectChange = (field: "services" | "serviceAreas", value: string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("You must be logged in to save your profile.")
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
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
    }

    toast.promise(promise(), {
      loading: "Saving profile...",
      success: "Profile saved successfully!",
      error: (err) => `Failed to save: ${err.message}`,
      finally: () => setLoading(false),
    })
  }

  return {
    formData,
    loading,
    serviceOptions: MOCK_SERVICE_OPTIONS,
    areaOptions: MOCK_AREA_OPTIONS,
    handleSubmit,
    handleChange,
    handleMultiSelectChange,
  }
}
