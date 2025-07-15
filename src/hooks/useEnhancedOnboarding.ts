/**
 * Enhanced Onboarding Hook with Database Integration
 * Integrates interactive document upload, website analysis, and persistent storage
 * 🔄 PHASE 5A: Database integration replacing localStorage patterns
 */

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

// 🔄 NEW: Device detection helper
const detectDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

export interface OnboardingProgress {
  currentStep: number
  totalSteps: number
  completedSteps: string[]
  isComplete: boolean
  canAccess: {
    dashboard: boolean
    leads: boolean
    documents: boolean
    chat: boolean
  }
  progress: number // 0-100
  conversationId?: string // 🔄 NEW: Link to chat conversation
  analyticsSessionId?: string // 🔄 NEW: Track analytics session
}

export interface OnboardingData {
  businessProfile?: BusinessProfile
  uploadedDocuments?: UploadedDocuments
  websiteAnalysis?: WebsiteAnalysis
  setupPreferences?: {
    notificationSettings: Record<string, boolean>
    subscriptionTier: 'growth' | 'scale'
  }
  // 🔄 NEW: Database integration fields
  dbOnboardingId?: string
  conversationId?: string
  deviceType?: 'mobile' | 'tablet' | 'desktop'
  completed?: boolean
}

export interface BusinessProfile {
  companyName?: string
  contactPhone?: string
  contactEmail?: string
  businessAddress?: string
  servicesOffered?: string[]
  yearsInBusiness?: number
  licenseNumber?: string
}

export interface UploadedDocuments {
  license?: boolean
  insurance?: boolean
  portfolio?: boolean
  certifications?: boolean
  documentIds?: string[]
}

export interface WebsiteAnalysis {
  url?: string
  analyzed?: boolean
  analysisId?: string
  data?: Record<string, unknown>
}

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome & Overview',
    description: 'Introduction to FixItForMe platform',
    required: true,
    component: 'WelcomeStep'
  },
  {
    id: 'business_profile',
    title: 'Business Profile',
    description: 'Company information and contact details',
    required: true,
    component: 'BusinessProfileStep'
  },
  {
    id: 'document_upload',
    title: 'Document Upload',
    description: 'Upload licenses, insurance, and portfolio',
    required: true,
    component: 'DocumentUploadStep'
  },
  {
    id: 'website_analysis',
    title: 'Website Analysis',
    description: 'AI analysis of your existing website',
    required: false,
    component: 'WebsiteAnalysisStep'
  },
  {
    id: 'final_setup',
    title: 'Final Setup',
    description: 'Review and activate your contractor portal',
    required: true,
    component: 'FinalSetupStep'
  }
]

export function useEnhancedOnboarding() {
  const { profile, user } = useUser()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // 🔄 NEW: Initialize enhanced onboarding with database integration
  const initializeOnboarding = useCallback(async () => {
    if (!user?.id || isInitialized) return

    setLoading(true)
    try {
      const supabase = createClient()
      const deviceType = detectDeviceType()

      // Call database function to initialize enhanced onboarding
      const { error: initError } = await supabase.rpc(
        'initialize_enhanced_onboarding',
        {
          user_uuid: user.id,
          device_type_param: deviceType,
          initial_data_param: {
            browser_info: navigator.userAgent,
            screen_resolution: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            timestamp: new Date().toISOString()
          }
        }
      )

      if (initError) throw initError

      // Load existing onboarding data
      const { data: onboardingRecord, error: onboardingError } = await supabase
        .from('contractor_onboarding')
        .select('*')
        .eq('contractor_id', profile?.id)
        .single()

      if (!onboardingError && onboardingRecord) {
        setOnboardingData(prev => ({
          ...prev,
          dbOnboardingId: onboardingRecord.id,
          conversationId: onboardingRecord.chat_conversation_id,
          deviceType
        }))

        // Set current step based on database
        const stepMap: Record<string, number> = {
          'welcome': 1,
          'company_info': 2,
          'service_selection': 3,
          'service_areas': 4,
          'documents': 5,
          'preferences': 6,
          'complete': 7
        }
        setCurrentStep(stepMap[onboardingRecord.current_step] || 1)
      }

      setIsInitialized(true)
    } catch (err) {
      console.error('Failed to initialize enhanced onboarding:', err)
      setError(err instanceof Error ? err.message : 'Initialization failed')
    } finally {
      setLoading(false)
    }
  }, [user?.id, profile?.id, isInitialized])

  // Initialize on mount
  useEffect(() => {
    initializeOnboarding()
  }, [initializeOnboarding])

  // 🔄 NEW: Update onboarding step with database persistence
  const updateOnboardingStep = useCallback(async (stepName: string, stepData: Record<string, unknown> = {}) => {
    if (!user?.id) return false

    try {
      const supabase = createClient()
      
      // Track step with analytics
      const { error: analyticsError } = await supabase.rpc(
        'track_onboarding_step',
        {
          user_uuid: user.id,
          step_name: stepName,
          device_type_param: onboardingData.deviceType || 'desktop',
          interaction_data_param: {
            step_data: stepData,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
          }
        }
      )

      if (analyticsError) throw analyticsError

      // Update progress in database
      const { error: progressError } = await supabase.rpc(
        'update_onboarding_progress',
        {
          user_uuid: user.id,
          new_step: stepName,
          step_data_json: stepData
        }
      )

      if (progressError) throw progressError

      return true
    } catch (err) {
      console.error('Failed to update onboarding step:', err)
      setError(err instanceof Error ? err.message : 'Failed to save progress')
      return false
    }
  }, [user?.id, onboardingData.deviceType])

  // Calculate progress based on completed requirements and database state
  const calculateProgress = useCallback((): OnboardingProgress => {
    const completedSteps: string[] = []
    
    // Step 1: Welcome (auto-complete when they start)
    if (currentStep > 1) completedSteps.push('welcome')
    
    // Step 2: Business Profile
    if (onboardingData.businessProfile?.companyName && 
        onboardingData.businessProfile?.contactPhone) {
      completedSteps.push('business_profile')
    }
    
    // Step 3: Document Upload (at least required docs)
    if (onboardingData.uploadedDocuments?.license && 
        onboardingData.uploadedDocuments?.insurance) {
      completedSteps.push('document_upload')
    }
    
    // Step 4: Website Analysis (optional)
    if (onboardingData.websiteAnalysis?.analyzed) {
      completedSteps.push('website_analysis')
    }
    
    // Step 5: Final Setup
    if (profile?.onboarded) {
      completedSteps.push('final_setup')
    }

    const requiredSteps = ONBOARDING_STEPS.filter(step => step.required)
    const completedRequired = completedSteps.filter(stepId => 
      requiredSteps.some(step => step.id === stepId)
    )
    
    const isComplete = completedRequired.length >= requiredSteps.length
    const progress = (completedSteps.length / ONBOARDING_STEPS.length) * 100

    return {
      currentStep,
      totalSteps: ONBOARDING_STEPS.length,
      completedSteps,
      isComplete,
      canAccess: {
        dashboard: isComplete,
        leads: isComplete,
        documents: completedSteps.includes('business_profile'),
        chat: true // Always allow chat for onboarding help
      },
      progress,
      conversationId: onboardingData.conversationId,
      analyticsSessionId: onboardingData.dbOnboardingId
    }
  }, [currentStep, onboardingData, profile?.onboarded])

  // Navigate to specific step
  const navigateToStep = useCallback((stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= ONBOARDING_STEPS.length) {
      setCurrentStep(stepNumber)
    }
  }, [])

  // Go to next step
  const nextStep = useCallback(async () => {
    const currentStepData = ONBOARDING_STEPS.find(step => 
      ONBOARDING_STEPS.indexOf(step) + 1 === currentStep
    )
    
    if (currentStepData) {
      const stepName = currentStepData.id
      const success = await updateOnboardingStep(stepName, onboardingData as Record<string, unknown>)
      
      if (success && currentStep < ONBOARDING_STEPS.length) {
        setCurrentStep(currentStep + 1)
      }
    }
  }, [currentStep, updateOnboardingStep, onboardingData])

  // Go to previous step
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  // Update business profile
  const updateBusinessProfile = useCallback((profileData: Partial<BusinessProfile>) => {
    setOnboardingData(prev => ({
      ...prev,
      businessProfile: { ...prev.businessProfile, ...profileData }
    }))
  }, [])

  // Add uploaded document
  const addUploadedDocument = useCallback((docType: string, documentData: boolean | string[]) => {
    setOnboardingData(prev => ({
      ...prev,
      uploadedDocuments: {
        ...prev.uploadedDocuments,
        [docType]: documentData
      }
    }))
  }, [])

  // Update website analysis
  const updateWebsiteAnalysis = useCallback((analysisData: Partial<WebsiteAnalysis>) => {
    setOnboardingData(prev => ({
      ...prev,
      websiteAnalysis: { ...prev.websiteAnalysis, ...analysisData }
    }))
  }, [])

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    if (!user?.id) return false

    setLoading(true)
    try {
      // Mark as complete in database
      const success = await updateOnboardingStep('complete', {
        completion_timestamp: new Date().toISOString(),
        final_data: onboardingData
      })

      if (success) {
        // Update local state
        setOnboardingData(prev => ({ ...prev, completed: true }))
        
        // Redirect to dashboard
        router.push('/contractor/dashboard')
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to complete onboarding:', err)
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding')
      return false
    } finally {
      setLoading(false)
    }
  }, [user?.id, updateOnboardingStep, onboardingData, router])

  // Reset onboarding (for testing/admin)
  const resetOnboarding = useCallback(() => {
    setCurrentStep(1)
    setOnboardingData({})
    setError(null)
  }, [])

  // Get current step info
  const getCurrentStep = useCallback(() => {
    return ONBOARDING_STEPS[currentStep - 1]
  }, [currentStep])

  // Check if user can access a specific feature
  const canAccessFeature = useCallback((feature: keyof OnboardingProgress['canAccess']) => {
    const progress = calculateProgress()
    return progress.canAccess[feature]
  }, [calculateProgress])

  return {
    // State
    currentStep,
    onboardingData,
    loading,
    error,
    isInitialized,
    
    // Progress calculation
    progress: calculateProgress(),
    
    // Navigation
    navigateToStep,
    nextStep,
    previousStep,
    getCurrentStep,
    
    // Data updates
    updateBusinessProfile,
    addUploadedDocument,
    updateWebsiteAnalysis,
    
    // Completion
    completeOnboarding,
    resetOnboarding,
    
    // Database integration
    updateOnboardingStep,
    initializeOnboarding,
    
    // Access control
    canAccessFeature,
    
    // Steps configuration
    steps: ONBOARDING_STEPS
  }
}
