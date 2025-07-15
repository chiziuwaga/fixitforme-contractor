/**
 * Enhanced Chat Hook with Database Integration
 * 🔄 Phase 5C: Database-backed chat persistence and UI asset management
 */

import { useState, useCallback, useEffect } from 'react'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase'
import type { AgentType, Message } from '@/components/EnhancedChatWindow'

export interface EnhancedChatState {
  messages: Message[]
  isTyping: boolean
  conversationId: string | null
  isInitialized: boolean
  loading: boolean
  error: string | null
}

export function useEnhancedChat(agentType: AgentType) {
  const { user, profile } = useUser()
  const [state, setState] = useState<EnhancedChatState>({
    messages: [],
    isTyping: false,
    conversationId: null,
    isInitialized: false,
    loading: false,
    error: null
  })

  // 🔄 NEW: Initialize chat conversation with database
  const initializeChat = useCallback(async () => {
    if (!user?.id || !profile?.id || state.isInitialized) return

    setState(prev => ({ ...prev, loading: true }))
    
    try {
      const supabase = createClient()
      
      // Check for existing conversation
      const { data: existingConversation, error: searchError } = await supabase
        .from('chat_conversations')
        .select('id, title, last_message_at')
        .eq('contractor_id', profile.id)
        .eq('agent_type', agentType)
        .eq('conversation_type', 'general')
        .order('last_message_at', { ascending: false })
        .limit(1)
        .single()

      let conversationId: string

      if (searchError || !existingConversation) {
        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from('chat_conversations')
          .insert({
            contractor_id: profile.id,
            agent_type: agentType,
            conversation_type: 'general',
            title: `Chat with ${agentType.charAt(0).toUpperCase() + agentType.slice(1)}`,
            metadata: {
              initialized_at: new Date().toISOString(),
              user_agent: navigator.userAgent
            }
          })
          .select('id')
          .single()

        if (createError) throw createError
        conversationId = newConversation.id
      } else {
        conversationId = existingConversation.id
      }

      // Load existing messages
      const { data: chatHistory, error: historyError } = await supabase.rpc(
        'get_enhanced_chat_history',
        {
          conversation_uuid: conversationId,
          limit_param: 50
        }
      )

      if (historyError) throw historyError

      const messages: Message[] = Array.isArray(chatHistory) ? chatHistory.map((msg: Record<string, unknown>) => ({
        id: msg.id as string,
        content: msg.content as string,
        role: msg.role as 'user' | 'assistant' | 'system',
        timestamp: new Date(msg.timestamp as string),
        agentType: msg.agentType as AgentType,
        ui_assets: msg.ui_assets as Message['ui_assets'],
        follow_up_prompts: msg.follow_up_prompts as string[]
      })) : []

      setState(prev => ({
        ...prev,
        conversationId,
        messages,
        isInitialized: true,
        loading: false
      }))

    } catch (err) {
      console.error('Failed to initialize enhanced chat:', err)
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Chat initialization failed',
        loading: false
      }))
    }
  }, [user?.id, profile?.id, agentType, state.isInitialized])

  // 🔄 NEW: Send message with database persistence
  const sendMessage = useCallback(async (content: string, ui_assets?: Message['ui_assets'], follow_up_prompts?: string[]) => {
    if (!state.conversationId || !user?.id) return

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date(),
      agentType: agentType
    }

    // Optimistic update
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, tempMessage],
      isTyping: true
    }))

    try {
      const supabase = createClient()
      
      // Save user message
      await supabase.rpc('save_chat_message_with_assets', {
        conversation_uuid: state.conversationId,
        message_content: content,
        message_role: 'user',
        agent_type_param: agentType,
        ui_asset_type: null,
        ui_asset_data: {},
        followup_prompts: []
      })

      // Update typing indicator
      await supabase.rpc('update_typing_indicator', {
        conversation_uuid: state.conversationId,
        agent_type_param: agentType,
        is_typing_param: true
      })

      // TODO: Call agent API endpoint here
      // const agentResponse = await callAgentAPI(agentType, content)
      
      // Mock agent response for now
      const mockAgentResponse = {
        content: `Hi! I'm ${agentType.charAt(0).toUpperCase() + agentType.slice(1)} and I received your message: "${content}". How can I help you today?`,
        ui_assets,
        follow_up_prompts: follow_up_prompts || [`Tell me more about ${agentType}`, 'What can you help me with?']
      }

      // Save agent response
      await supabase.rpc('save_chat_message_with_assets', {
        conversation_uuid: state.conversationId,
        message_content: mockAgentResponse.content,
        message_role: 'assistant',
        agent_type_param: agentType,
        ui_asset_type: mockAgentResponse.ui_assets?.type || null,
        ui_asset_data: mockAgentResponse.ui_assets?.data || {},
        followup_prompts: mockAgentResponse.follow_up_prompts || []
      })

      // Stop typing indicator
      await supabase.rpc('update_typing_indicator', {
        conversation_uuid: state.conversationId,
        agent_type_param: agentType,
        is_typing_param: false
      })

      // Reload messages
      const { data: updatedHistory } = await supabase.rpc('get_enhanced_chat_history', {
        conversation_uuid: state.conversationId,
        limit_param: 50
      })

      const updatedMessages: Message[] = Array.isArray(updatedHistory) ? updatedHistory.map((msg: Record<string, unknown>) => ({
        id: msg.id as string,
        content: msg.content as string,
        role: msg.role as 'user' | 'assistant' | 'system',
        timestamp: new Date(msg.timestamp as string),
        agentType: msg.agentType as AgentType,
        ui_assets: msg.ui_assets as Message['ui_assets'],
        follow_up_prompts: msg.follow_up_prompts as string[]
      })) : []

      setState(prev => ({
        ...prev,
        messages: updatedMessages,
        isTyping: false
      }))

    } catch (err) {
      console.error('Failed to send message:', err)
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to send message',
        isTyping: false
      }))
    }
  }, [state.conversationId, user?.id, agentType])

  // Initialize on mount
  useEffect(() => {
    initializeChat()
  }, [initializeChat])

  return {
    ...state,
    sendMessage,
    initializeChat
  }
}
