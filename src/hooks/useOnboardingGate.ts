/**
 * Onboarding Gate Hook
 * Controls system access until contractor onboarding is complete
 * Greys out system except chat and onboarding flow
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseServer';

export interface OnboardingStatus {
  isComplete: boolean;
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  blockedFeatures: string[];
  canAccessChat: boolean;
  canAccessAgents: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  component?: string;
  estimatedMinutes?: number;
}

// Define onboarding steps based on contractor needs
const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to FixItForMe',
    description: 'Get started with your contractor platform',
    isRequired: true,
    isCompleted: false,
    component: 'WelcomeStep',
    estimatedMinutes: 2
  },
  {
    id: 'business_profile',
    title: 'Business Profile Setup',
    description: 'Tell us about your contracting business',
    isRequired: true,
    isCompleted: false,
    component: 'BusinessProfileStep',
    estimatedMinutes: 5
  },
  {
    id: 'services_selection',
    title: 'Services & Specialties',
    description: 'Select the services you provide',
    isRequired: true,
    isCompleted: false,
    component: 'ServicesStep',
    estimatedMinutes: 3
  },
  {
    id: 'location_setup',
    title: 'Service Area & Location',
    description: 'Define your service area and location preferences',
    isRequired: true,
    isCompleted: false,
    component: 'LocationStep',
    estimatedMinutes: 3
  },
  {
    id: 'document_upload',
    title: 'Business Documents',
    description: 'Upload licenses, insurance, and business documents for AI optimization',
    isRequired: true,
    isCompleted: false,
    component: 'DocumentUploadStep',
    estimatedMinutes: 7
  },
  {
    id: 'tier_selection',
    title: 'Choose Your Plan',
    description: 'Select the subscription tier that fits your business',
    isRequired: true,
    isCompleted: false,
    component: 'TierSelectionStep',
    estimatedMinutes: 3
  },
  {
    id: 'agent_introduction',
    title: 'Meet Your AI Agents',
    description: 'Learn how Lexi, Alex, and Rex can help grow your business',
    isRequired: true,
    isCompleted: false,
    component: 'AgentIntroductionStep',
    estimatedMinutes: 4
  },
  {
    id: 'first_conversation',
    title: 'Start Your First Conversation',
    description: 'Have a guided conversation with Lexi to set up your preferences',
    isRequired: true,
    isCompleted: false,
    component: 'FirstConversationStep',
    estimatedMinutes: 5
  }
];

// Features that are blocked until onboarding is complete
const BLOCKED_FEATURES = [
  'dashboard',
  'leads',
  'bidding',
  'materials',
  'settings',
  'reports',
  'payments'
];

export function useOnboardingGate() {
  const [status, setStatus] = useState<OnboardingStatus>({
    isComplete: false,
    currentStep: 0,
    totalSteps: ONBOARDING_STEPS.length,
    completedSteps: [],
    blockedFeatures: BLOCKED_FEATURES,
    canAccessChat: true, // Always allow chat for Lexi guidance
    canAccessAgents: false
  });

  const [steps, setSteps] = useState<OnboardingStep[]>(ONBOARDING_STEPS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load onboarding status from database
  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError('Authentication required');
        return;
      }

      // Check contractor profile for onboarding completion
      const { data: profile, error: profileError } = await supabase
        .from('contractor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
        setError('Failed to load profile');
        return;
      }

      // Check onboarding progress
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('contractor_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (onboardingError && onboardingError.code !== 'PGRST116') {
        console.error('Error loading onboarding:', onboardingError);
        // Continue without onboarding data - will create new record
      }

      // Determine completion status
      const completedSteps = onboardingData?.completed_steps || [];
      const requiredStepsComplete = ONBOARDING_STEPS
        .filter(step => step.isRequired)
        .every(step => completedSteps.includes(step.id));

      const isComplete = requiredStepsComplete && (profile?.onboarding_completed || false);
      
      // Update steps with completion status
      const updatedSteps = ONBOARDING_STEPS.map(step => ({
        ...step,
        isCompleted: completedSteps.includes(step.id)
      }));

      // Find current step (first incomplete required step)
      const currentStepIndex = updatedSteps.findIndex(step => 
        step.isRequired && !step.isCompleted
      );

      setSteps(updatedSteps);
      setStatus({
        isComplete,
        currentStep: isComplete ? ONBOARDING_STEPS.length : Math.max(0, currentStepIndex),
        totalSteps: ONBOARDING_STEPS.length,
        completedSteps,
        blockedFeatures: isComplete ? [] : BLOCKED_FEATURES,
        canAccessChat: true, // Always allow chat
        canAccessAgents: isComplete || completedSteps.includes('agent_introduction')
      });

    } catch (error) {
      console.error('Error loading onboarding status:', error);
      setError('Failed to load onboarding status');
    } finally {
      setIsLoading(false);
    }
  };

  // Mark step as completed
  const completeStep = async (stepId: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updatedCompletedSteps = [...status.completedSteps, stepId];
      
      // Update database
      const { error } = await supabase
        .from('contractor_onboarding')
        .upsert({
          user_id: user.id,
          completed_steps: updatedCompletedSteps,
          last_step_completed: stepId,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating onboarding:', error);
        return;
      }

      // Update local state
      const updatedSteps = steps.map(step => 
        step.id === stepId ? { ...step, isCompleted: true } : step
      );

      const requiredStepsComplete = ONBOARDING_STEPS
        .filter(step => step.isRequired)
        .every(step => updatedCompletedSteps.includes(step.id));

      // If all required steps are complete, mark onboarding as finished
      if (requiredStepsComplete) {
        await completeOnboarding();
      }

      setSteps(updatedSteps);
      setStatus(prev => ({
        ...prev,
        completedSteps: updatedCompletedSteps,
        currentStep: Math.min(prev.currentStep + 1, ONBOARDING_STEPS.length),
        canAccessAgents: updatedCompletedSteps.includes('agent_introduction')
      }));

    } catch (error) {
      console.error('Error completing step:', error);
    }
  };

  // Complete entire onboarding process
  const completeOnboarding = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark onboarding as completed in contractor profile
      const { error: profileError } = await supabase
        .from('contractor_profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error completing onboarding:', profileError);
        return;
      }

      // Update onboarding record
      const { error: onboardingError } = await supabase
        .from('contractor_onboarding')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (onboardingError) {
        console.error('Error updating onboarding record:', onboardingError);
      }

      // Update local state
      setStatus(prev => ({
        ...prev,
        isComplete: true,
        blockedFeatures: [],
        canAccessAgents: true
      }));

      console.log('[Onboarding] Complete! All features unlocked.');

    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  // Check if feature is accessible
  const canAccessFeature = (featureName: string): boolean => {
    if (status.isComplete) return true;
    if (featureName === 'chat') return true; // Always allow chat
    if (featureName === 'onboarding') return true; // Always allow onboarding
    return !status.blockedFeatures.includes(featureName);
  };

  // Get next step to complete
  const getNextStep = (): OnboardingStep | null => {
    return steps.find(step => step.isRequired && !step.isCompleted) || null;
  };

  // Get completion percentage
  const getCompletionPercentage = (): number => {
    const completedRequired = steps.filter(step => step.isRequired && step.isCompleted).length;
    const totalRequired = steps.filter(step => step.isRequired).length;
    return totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0;
  };

  // Reset onboarding (for testing/admin purposes)
  const resetOnboarding = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('contractor_onboarding')
        .update({
          completed_steps: [],
          is_completed: false,
          completed_at: null
        })
        .eq('user_id', user.id);

      await supabase
        .from('contractor_profiles')
        .update({
          onboarding_completed: false,
          onboarding_completed_at: null
        })
        .eq('user_id', user.id);

      await loadOnboardingStatus();
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  return {
    status,
    steps,
    isLoading,
    error,
    completeStep,
    completeOnboarding,
    canAccessFeature,
    getNextStep,
    getCompletionPercentage,
    resetOnboarding,
    refresh: loadOnboardingStatus
  };
}
