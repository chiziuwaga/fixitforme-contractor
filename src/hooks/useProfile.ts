"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useUser } from "./useUser"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Real database integration for Felix's 40-problem framework
// Service options now loaded from felix_categories table
interface ServiceOption {
  value: string;
  label: string;
  felix_id?: number;
}

interface AreaOption {
  value: string;
  label: string;
  region?: string;
}

interface ProfileData {
  companyName: string
  contactName: string
  licenseNumber: string
  experienceYears: number
  services: string[]
  serviceAreas: string[]
  bio: string
  // Extended fields for comprehensive profile
  businessName?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  insuranceNumber?: string
  specialties?: string[]
  serviceRadius?: number
  availabilityNotifications?: boolean
  marketingEmails?: boolean
  avatarUrl?: string
}

export function useProfile() {
  const { user } = useUser()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([])
  const [areaOptions, setAreaOptions] = useState<AreaOption[]>([])
  const [formData, setFormData] = useState<ProfileData>({
    companyName: "",
    contactName: "",
    licenseNumber: "",
    experienceYears: 0,
    services: [],
    serviceAreas: [],
    bio: "",
    // Extended fields
    businessName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    insuranceNumber: "",
    specialties: [],
    serviceRadius: 25,
    availabilityNotifications: true,
    marketingEmails: false,
    avatarUrl: "",
  })

  // Fetch initial profile data and Felix framework service options
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setLoading(true)
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

        // Load common service areas (this could be from a service_areas table in the future)
        setAreaOptions([
          { value: "san_francisco", label: "San Francisco", region: "bay_area" },
          { value: "san_mateo", label: "San Mateo", region: "bay_area" },
          { value: "palo_alto", label: "Palo Alto", region: "bay_area" },
          { value: "oakland", label: "Oakland", region: "bay_area" },
          { value: "berkeley", label: "Berkeley", region: "bay_area" },
          { value: "fremont", label: "Fremont", region: "bay_area" },
          { value: "san_jose", label: "San Jose", region: "bay_area" },
        ])

        // Load contractor profile
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

    fetchData()
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

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user) {
      throw new Error("You must be logged in to update your profile.")
    }

    const { error } = await supabase.from("contractor_profiles").upsert({
      user_id: user.id,
      company_name: updates.companyName || updates.businessName,
      contact_name: updates.contactName,
      license_number: updates.licenseNumber,
      insurance_number: updates.insuranceNumber,
      experience_years: updates.experienceYears,
      services_offered: updates.services,
      service_areas: updates.serviceAreas,
      bio: updates.bio,
      phone: updates.phone,
      email: updates.email,
      address: updates.address,
      city: updates.city,
      state: updates.state,
      zip_code: updates.zipCode,
      specialties: updates.specialties,
      service_radius: updates.serviceRadius,
      availability_notifications: updates.availabilityNotifications,
      marketing_emails: updates.marketingEmails,
      avatar_url: updates.avatarUrl,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    // Update local state
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const uploadAvatar = async (file: File) => {
    if (!user) {
      throw new Error("You must be logged in to upload files.")
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}_${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('contractor_files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('contractor_files')
      .getPublicUrl(filePath)

    // Update profile with new avatar URL
    await updateProfile({ avatarUrl: publicUrl })

    return publicUrl
  }

  return {
    profile: formData,
    formData,
    loading,
    serviceOptions,
    areaOptions,
    handleSubmit,
    handleChange,
    handleMultiSelectChange,
    updateProfile,
    uploadAvatar,
  }
}
