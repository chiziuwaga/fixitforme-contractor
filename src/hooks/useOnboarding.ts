'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export interface OnboardingForm {
  companyName: string
  contactName: string
  email: string
  businessType: string
  services: string[]
}

export interface OnboardingStep {
  id: string
  label: string
  completed: boolean
}

export function useOnboarding() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<OnboardingForm>({
    companyName: '',
    contactName: '',
    email: '',
    businessType: '',
    services: [],
  })
  const [submitted, setSubmitted] = useState(false)
  const [windowWidth, setWindowWidth] = useState(800)
  const [windowHeight, setWindowHeight] = useState(600)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps = [
    'Contact Info',
    'Business Details', 
    'Services Selection',
    'Review & Submit'
  ]

  // Handle window resize for confetti
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateDimensions = () => {
        setWindowWidth(window.innerWidth)
        setWindowHeight(window.innerHeight)
      }
      
      updateDimensions()
      window.addEventListener('resize', updateDimensions)
      
      return () => window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  // Form validation
  const validateCurrentStep = (): boolean => {
    switch (step) {
      case 0: // Contact Info
        return !!(form.companyName && form.contactName && form.email)
      case 1: // Business Details
        return !!form.businessType
      case 2: // Services Selection
        return form.services.length > 0
      case 3: // Review
        return true
      default:
        return false
    }
  }

  // Form submission
  const submitOnboarding = async (): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // TODO: Replace with actual API call
      const response = await fetch('/api/contractor/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (response.ok) {
        setSubmitted(true)
        toast.success('Onboarding completed! Welcome to FixItForMe!')
        return true
      } else {
        toast.error('Failed to complete onboarding. Please try again.')
        return false
      }
    } catch (error) {
      console.error('Onboarding submission error:', error)
      toast.error('An error occurred. Please try again.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Navigation handlers
  const handleNext = async () => {
    if (!validateCurrentStep()) {
      toast.error('Please complete all required fields.')
      return
    }

    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      await submitOnboarding()
    }
  }

  const handlePrev = () => {
    setStep(Math.max(step - 1, 0))
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setStep(stepIndex)
    }
  }

  // Form update handlers
  const updateForm = (updates: Partial<OnboardingForm>) => {
    setForm(prev => ({ ...prev, ...updates }))
  }

  const toggleService = (service: string) => {
    const newServices = form.services.includes(service)
      ? form.services.filter(s => s !== service)
      : [...form.services, service]
    
    updateForm({ services: newServices })
  }

  // Progress calculation
  const getProgress = (): number => {
    return ((step + 1) / steps.length) * 100
  }

  // Get step status
  const getStepStatus = (stepIndex: number): 'current' | 'completed' | 'upcoming' => {
    if (stepIndex < step) return 'completed'
    if (stepIndex === step) return 'current'
    return 'upcoming'
  }

  // Available services list
  const availableServices = [
    'Plumbing',
    'Electrical', 
    'Carpentry',
    'Painting',
    'Roofing',
    'HVAC',
    'Flooring',
    'Landscaping',
  ]

  return {
    // State
    step,
    form,
    submitted,
    windowWidth,
    windowHeight,
    isSubmitting,
    steps,
    availableServices,
    
    // Actions
    handleNext,
    handlePrev,
    goToStep,
    updateForm,
    toggleService,
    
    // Utilities
    validateCurrentStep,
    getProgress,
    getStepStatus,
  }
}
