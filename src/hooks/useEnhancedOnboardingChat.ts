'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useUser } from '@/hooks/useUser';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ChatConversation {
  id: string;
  contractor_id: string;
  agent_type: 'lexi' | 'alex' | 'rex';
  conversation_type: 'general' | 'onboarding' | 'bidding' | 'lead_generation';
  title: string;
  is_archived: boolean;
  is_pinned: boolean;
  onboarding_context: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  ui_assets?: {
    type: string;
    data: Record<string, any>;
    render_hints?: {
      component: string;
      priority: 'high' | 'medium' | 'low';
      interactive: boolean;
    };
  };
  actions?: Array<{
    type: string;
    label: string;
    style: 'primary' | 'secondary' | 'outline';
  }>;
  onboarding_step?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface OnboardingState {
  id: string;
  contractor_id: string;
  current_step: 'welcome' | 'company_info' | 'service_selection' | 'service_areas' | 'documents' | 'preferences' | 'complete';
  step_data: Record<string, any>;
  chat_conversation_id?: string;
  completion_percentage: number;
  welcome_message_shown: boolean;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WelcomeMessage {
  id: string;
  trigger_condition: string;
  message_template: string;
  ui_components: Record<string, any>;
  priority: number;
  is_active: boolean;
}

export interface UIPreferences {
  id: string;
  contractor_id: string;
  preferred_device: 'mobile' | 'tablet' | 'desktop';
  chat_position: 'left' | 'right' | 'bottom';
  chat_size: 'compact' | 'normal' | 'expanded';
  navigation_style: 'top' | 'bottom' | 'sidebar';
  theme_preference: 'light' | 'dark' | 'auto';
  accessibility_preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// ENHANCED ONBOARDING CHAT HOOK
// ============================================================================

export function useEnhancedOnboardingChat() {
  const { user, profile } = useUser();
  const supabase = createClientComponentClient();
  const router = useRouter();

  // State management
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [uiPreferences, setUIPreferences] = useState<UIPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // INITIALIZATION & DATA LOADING
  // ============================================================================

  const initializeOnboardingChat = useCallback(async () => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      
      // Call database function to initialize onboarding chat
      const { data: conversationId, error: initError } = await supabase
        .rpc('initialize_onboarding_chat', { user_uuid: user.id });

      if (initError) throw initError;

      // Load onboarding state
      const { data: onboarding, error: onboardingError } = await supabase
        .from('contractor_onboarding')
        .select('*')
        .eq('contractor_id', profile.id)
        .single();

      if (onboardingError && onboardingError.code !== 'PGRST116') {
        throw onboardingError;
      }

      if (onboarding) {
        setOnboardingState(onboarding);
        
        // Load the onboarding conversation
        if (onboarding.chat_conversation_id) {
          await loadConversation(onboarding.chat_conversation_id);
        }
      }

      // Load UI preferences
      await loadUIPreferences();

    } catch (err) {
      console.error('Error initializing onboarding chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize onboarding');
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      // Load conversation with messages
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;

      // Load messages
      const { data: messages, error: msgError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;

      const conversationWithMessages = {
        ...conversation,
        messages: messages || []
      };

      setActiveConversation(conversationWithMessages);
      setConversations(prev => {
        const existing = prev.find(c => c.id === conversationId);
        if (existing) {
          return prev.map(c => c.id === conversationId ? conversationWithMessages : c);
        }
        return [...prev, conversationWithMessages];
      });

    } catch (err) {
      console.error('Error loading conversation:', err);
      toast.error('Failed to load conversation');
    }
  }, [supabase]);

  const loadUIPreferences = useCallback(async () => {
    if (!profile) return;

    try {
      const { data: preferences, error } = await supabase
        .from('contractor_ui_preferences')
        .select('*')
        .eq('contractor_id', profile.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (preferences) {
        setUIPreferences(preferences);
      } else {
        // Create default preferences
        const defaultPrefs = {
          contractor_id: profile.id,
          preferred_device: 'mobile' as const,
          chat_position: 'right' as const,
          chat_size: 'normal' as const,
          navigation_style: 'bottom' as const,
          theme_preference: 'auto' as const,
          accessibility_preferences: {}
        };

        const { data: newPrefs, error: createError } = await supabase
          .from('contractor_ui_preferences')
          .insert(defaultPrefs)
          .select()
          .single();

        if (createError) throw createError;
        setUIPreferences(newPrefs);
      }
    } catch (err) {
      console.error('Error loading UI preferences:', err);
    }
  }, [profile, supabase]);

  // ============================================================================
  // WELCOME MESSAGE LOGIC
  // ============================================================================

  const getWelcomeMessage = useCallback(async (): Promise<WelcomeMessage | null> => {
    if (!profile || !onboardingState) return null;

    try {
      let condition = 'first_visit';
      
      if (onboardingState.is_completed) {
        condition = 'profile_complete';
      } else if (onboardingState.completion_percentage > 0) {
        condition = 'profile_incomplete';
      } else if (onboardingState.welcome_message_shown) {
        condition = 'return_user_with_activity';
      }

      const { data: welcomeMsg, error } = await supabase
        .from('welcome_messages')
        .select('*')
        .eq('trigger_condition', condition)
        .eq('is_active', true)
        .order('priority', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return welcomeMsg || null;
    } catch (err) {
      console.error('Error getting welcome message:', err);
      return null;
    }
  }, [profile, onboardingState, supabase]);

  const generateNuancedWelcome = useCallback(async () => {
    const welcomeMessage = await getWelcomeMessage();
    if (!welcomeMessage || !activeConversation) return;

    try {
      // Create nuanced welcome message based on context
      let personalizedMessage = welcomeMessage.message_template;
      
      // Add personalization based on profile data
      if (profile?.company_name) {
        personalizedMessage += ` I see you're with ${profile.company_name} - that's fantastic!`;
      }

      // Add context based on onboarding progress
      if (onboardingState && onboardingState.completion_percentage > 0) {
        personalizedMessage += ` You're ${onboardingState.completion_percentage}% complete with your setup.`;
      }

      // Create message with UI assets
      const messageData = {
        conversation_id: activeConversation.id,
        role: 'assistant' as const,
        content: personalizedMessage,
        ui_assets: welcomeMessage.ui_components,
        onboarding_step: onboardingState?.current_step,
        metadata: {
          message_type: 'welcome',
          trigger_condition: welcomeMessage.trigger_condition,
          personalized: true
        }
      };

      const { data: newMessage, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // Update conversation messages
      setActiveConversation(prev => prev ? {
        ...prev,
        messages: [...(prev.messages || []), newMessage]
      } : null);

      // Mark welcome message as shown
      if (onboardingState && !onboardingState.welcome_message_shown) {
        await supabase
          .from('contractor_onboarding')
          .update({ welcome_message_shown: true })
          .eq('id', onboardingState.id);
      }

    } catch (err) {
      console.error('Error generating welcome message:', err);
      toast.error('Failed to generate welcome message');
    }
  }, [activeConversation, onboardingState, profile, supabase, getWelcomeMessage]);

  // ============================================================================
  // ONBOARDING PROGRESSION
  // ============================================================================

  const updateOnboardingStep = useCallback(async (
    newStep: OnboardingState['current_step'],
    stepData: Record<string, any> = {}
  ) => {
    if (!user) return false;

    try {
      const { data: success, error } = await supabase
        .rpc('update_onboarding_progress', {
          user_uuid: user.id,
          new_step: newStep,
          step_data_json: stepData
        });

      if (error) throw error;

      if (success) {
        // Refresh onboarding state
        const { data: updatedOnboarding } = await supabase
          .from('contractor_onboarding')
          .select('*')
          .eq('contractor_id', profile?.id)
          .single();

        if (updatedOnboarding) {
          setOnboardingState(updatedOnboarding);
        }

        // Generate completion message if onboarding is complete
        if (newStep === 'complete') {
          await generateCompletionMessage();
        }

        toast.success(`Progress updated: ${newStep.replace('_', ' ')}`);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error updating onboarding step:', err);
      toast.error('Failed to update progress');
      return false;
    }
  }, [user, profile, supabase]);

  const generateCompletionMessage = useCallback(async () => {
    if (!activeConversation || !profile) return;

    const completionMessage = `🎉 Congratulations! Your FixItForMe profile is complete! 

You're now ready to:
• Receive high-quality leads from Rex
• Get bidding assistance from Alex  
• Access all platform features

I'll be here whenever you need guidance. Welcome to the FixItForMe family, ${profile.company_name || 'contractor'}! 🚀`;

    try {
      const messageData = {
        conversation_id: activeConversation.id,
        role: 'assistant' as const,
        content: completionMessage,
        ui_assets: {
          type: 'onboarding_complete',
          data: {
            next_actions: ['find_leads', 'explore_dashboard', 'update_profile'],
            achievements: ['profile_complete', 'welcome_bonus'],
            tier_info: profile.subscription_tier
          }
        },
        onboarding_step: 'complete',
        metadata: {
          message_type: 'completion',
          milestone: true
        }
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData);

      if (error) throw error;

      // Refresh conversation
      await loadConversation(activeConversation.id);

    } catch (err) {
      console.error('Error generating completion message:', err);
    }
  }, [activeConversation, profile, supabase, loadConversation]);

  // ============================================================================
  // MESSAGE HANDLING
  // ============================================================================

  const sendMessage = useCallback(async (content: string, ui_assets?: any, actions?: any[]) => {
    if (!activeConversation) return;

    try {
      // Add user message
      const userMessageData = {
        conversation_id: activeConversation.id,
        role: 'user' as const,
        content,
        metadata: { timestamp: new Date().toISOString() }
      };

      const { data: userMessage, error: userError } = await supabase
        .from('chat_messages')
        .insert(userMessageData)
        .select()
        .single();

      if (userError) throw userError;

      // Update conversation messages
      setActiveConversation(prev => prev ? {
        ...prev,
        messages: [...(prev.messages || []), userMessage]
      } : null);

      return userMessage;
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
      return null;
    }
  }, [activeConversation, supabase]);

  const addAgentMessage = useCallback(async (
    content: string,
    agent_type: 'lexi' | 'alex' | 'rex' = 'lexi',
    ui_assets?: any,
    actions?: any[]
  ) => {
    if (!activeConversation) return;

    try {
      const agentMessageData = {
        conversation_id: activeConversation.id,
        role: 'assistant' as const,
        content,
        ui_assets,
        actions,
        onboarding_step: onboardingState?.current_step,
        metadata: { 
          agent_type,
          timestamp: new Date().toISOString()
        }
      };

      const { data: agentMessage, error } = await supabase
        .from('chat_messages')
        .insert(agentMessageData)
        .select()
        .single();

      if (error) throw error;

      // Update conversation messages
      setActiveConversation(prev => prev ? {
        ...prev,
        messages: [...(prev.messages || []), agentMessage]
      } : null);

      // Track agent interaction
      await supabase
        .from('agent_interactions')
        .insert({
          contractor_id: profile?.id,
          agent_type,
          conversation_id: activeConversation.id,
          interaction_type: 'chat_message',
          context_data: { onboarding_step: onboardingState?.current_step }
        });

      return agentMessage;
    } catch (err) {
      console.error('Error adding agent message:', err);
      toast.error('Failed to add agent message');
      return null;
    }
  }, [activeConversation, onboardingState, profile, supabase]);

  // ============================================================================
  // RESPONSIVE STATE HELPERS
  // ============================================================================

  const updateUIPreferences = useCallback(async (updates: Partial<UIPreferences>) => {
    if (!uiPreferences) return;

    try {
      const { data: updated, error } = await supabase
        .from('contractor_ui_preferences')
        .update(updates)
        .eq('id', uiPreferences.id)
        .select()
        .single();

      if (error) throw error;
      setUIPreferences(updated);
    } catch (err) {
      console.error('Error updating UI preferences:', err);
      toast.error('Failed to update preferences');
    }
  }, [uiPreferences, supabase]);

  const getResponsiveConfig = useMemo(() => {
    if (!uiPreferences) return null;

    return {
      device: uiPreferences.preferred_device,
      chatPosition: uiPreferences.chat_position,
      chatSize: uiPreferences.chat_size,
      navigation: uiPreferences.navigation_style,
      theme: uiPreferences.theme_preference,
      accessibility: uiPreferences.accessibility_preferences
    };
  }, [uiPreferences]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (user && profile) {
      initializeOnboardingChat();
    }
  }, [user, profile, initializeOnboardingChat]);

  useEffect(() => {
    if (activeConversation && onboardingState && !onboardingState.welcome_message_shown) {
      generateNuancedWelcome();
    }
  }, [activeConversation, onboardingState, generateNuancedWelcome]);

  // ============================================================================
  // RETURN INTERFACE
  // ============================================================================

  return {
    // State
    conversations,
    activeConversation,
    onboardingState,
    uiPreferences,
    loading,
    error,

    // Configuration
    responsiveConfig: getResponsiveConfig,

    // Actions
    initializeOnboardingChat,
    loadConversation,
    updateOnboardingStep,
    sendMessage,
    addAgentMessage,
    updateUIPreferences,
    generateNuancedWelcome,
    generateCompletionMessage,

    // Computed values
    isOnboardingComplete: onboardingState?.is_completed || false,
    currentStep: onboardingState?.current_step || 'welcome',
    completionPercentage: onboardingState?.completion_percentage || 0
  };
}
