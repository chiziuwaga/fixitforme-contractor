/**
 * Enhanced Chat Thread Management Hook  
 * 🎯 Database-backed conversational agents with thread limits
 * 🔄 Based on Indie Dev Dan approach - fully conversational, not scripted
 */

'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

export type AgentType = 'lexi' | 'alex' | 'rex'

export interface ChatThread {
  thread_id: string
  agent_type: AgentType
  message_count: number
  last_activity: string
  first_message: string
  thread_title: string
  can_delete: boolean
}

export interface ThreadLimits {
  growth_tier: {
    max_threads: 10
    max_messages_per_thread: 50
  }
  scale_tier: {
    max_threads: 30  
    max_messages_per_thread: 200
  }
}

export interface ConversationalAgent {
  name: string
  description: string
  personality: string
  isPremium: boolean
  contextAware: boolean // Can draw from same chat thread
}

// ✅ CONVERSATIONAL AGENTS ARCHITECTURE (Indie Dev Dan Style)
export const CONVERSATIONAL_AGENTS: Record<AgentType, ConversationalAgent> = {
  lexi: {
    name: 'Lexi the Liaison',
    description: 'Onboarding guide and system liaison',
    personality: 'Warm, helpful, educational - guides contractors through complex processes',
    isPremium: false,
    contextAware: true // Can reference previous onboarding conversations
  },
  alex: {
    name: 'Alex the Assessor', 
    description: 'Bidding assistant and cost analyzer',
    personality: 'Analytical, precise, data-driven - focuses on profitable project analysis',
    isPremium: true,
    contextAware: true // Can reference previous cost analyses and bidding patterns
  },
  rex: {
    name: 'Rex the Retriever',
    description: 'Lead generation and market researcher', 
    personality: 'Methodical, thorough, strategic - finds and qualifies leads systematically',
    isPremium: true,
    contextAware: true // Can build on previous lead research and market analysis
  }
}

export function useEnhancedChatThreads() {
  const { user, profile } = useUser()
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([])
  const [loading, setLoading] = useState(false)
  const [threadCounts, setThreadCounts] = useState<Record<AgentType, number>>({
    lexi: 0,
    alex: 0, 
    rex: 0
  })

  // Get current tier limits
  const tierLimits = useMemo(() => {
    const isScaleTier = profile?.subscription_tier === 'scale'
    return isScaleTier ? {
      max_threads: 30,
      max_messages_per_thread: 200
    } : {
      max_threads: 10,
      max_messages_per_thread: 50
    }
  }, [profile?.subscription_tier])

  // Load chat threads with metadata
  const loadChatThreads = useCallback(async () => {
    if (!user?.id || !profile?.id) return

    setLoading(true)
    try {
      const supabase = createClient()
      
      // Call the database function to get threads with metadata
      const { data, error } = await supabase.rpc('get_chat_threads_with_metadata', {
        contractor_uuid: profile.id,
        limit_param: 100
      })

      if (error) throw error

      const threads: ChatThread[] = data || []
      setChatThreads(threads)

      // Count threads per agent
      const counts = threads.reduce((acc, thread) => {
        acc[thread.agent_type] = (acc[thread.agent_type] || 0) + 1
        return acc
      }, {} as Record<AgentType, number>)

      setThreadCounts({
        lexi: counts.lexi || 0,
        alex: counts.alex || 0,
        rex: counts.rex || 0
      })

    } catch (error) {
      console.error('Error loading chat threads:', error)
      toast.error('Failed to load chat history')
    } finally {
      setLoading(false)
    }
  }, [user?.id, profile?.id])

  // Delete chat thread
  const deleteThread = useCallback(async (threadId: string) => {
    if (!profile?.id) return false

    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.rpc('delete_chat_thread', {
        thread_conversation_id: threadId,
        contractor_uuid: profile.id
      })

      if (error) throw error

      if (data) {
        // Refresh thread list
        await loadChatThreads()
        toast.success('Chat thread deleted')
        return true
      }

      return false
    } catch (error) {
      console.error('Error deleting thread:', error)
      toast.error('Failed to delete chat thread')
      return false
    }
  }, [profile?.id, loadChatThreads])

  // Archive chat thread (soft delete)
  const archiveThread = useCallback(async (threadId: string) => {
    if (!profile?.id) return false

    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.rpc('archive_chat_thread', {
        thread_conversation_id: threadId,
        contractor_uuid: profile.id
      })

      if (error) throw error

      if (data) {
        // Refresh thread list
        await loadChatThreads()
        toast.success('Chat thread archived')
        return true
      }

      return false
    } catch (error) {
      console.error('Error archiving thread:', error)
      toast.error('Failed to archive chat thread')
      return false
    }
  }, [profile?.id, loadChatThreads])

  // Clean up excess threads when hitting limits
  const cleanupExcessThreads = useCallback(async (agentType: AgentType) => {
    if (!profile?.id) return 0

    const currentCount = threadCounts[agentType]
    if (currentCount < tierLimits.max_threads) return 0

    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.rpc('cleanup_excess_chat_threads', {
        contractor_uuid: profile.id,
        max_threads: tierLimits.max_threads
      })

      if (error) throw error

      const cleanedCount = data || 0
      if (cleanedCount > 0) {
        // Refresh thread list
        await loadChatThreads()
        toast.info(`Cleaned up ${cleanedCount} old chat threads`)
      }

      return cleanedCount
    } catch (error) {
      console.error('Error cleaning up threads:', error)
      return 0
    }
  }, [profile?.id, threadCounts, tierLimits.max_threads, loadChatThreads])

  // Check if can start new thread for agent
  const canStartNewThread = useCallback((agentType: AgentType): boolean => {
    const agent = CONVERSATIONAL_AGENTS[agentType]
    
    // Check premium access
    if (agent.isPremium && profile?.subscription_tier !== 'scale') {
      return false
    }

    // Check thread limits
    const currentCount = threadCounts[agentType]
    return currentCount < tierLimits.max_threads
  }, [profile?.subscription_tier, threadCounts, tierLimits.max_threads])

  // Get thread management status
  const getThreadStatus = useCallback((agentType: AgentType) => {
    const agent = CONVERSATIONAL_AGENTS[agentType]
    const currentCount = threadCounts[agentType]
    const maxThreads = tierLimits.max_threads

    return {
      agent: agent.name,
      personality: agent.personality,
      contextAware: agent.contextAware,
      isPremium: agent.isPremium,
      currentThreads: currentCount,
      maxThreads,
      threadsRemaining: maxThreads - currentCount,
      canStartNew: canStartNewThread(agentType),
      needsCleanup: currentCount >= maxThreads
    }
  }, [threadCounts, tierLimits.max_threads, canStartNewThread])

  // ✅ CONTEXT-AWARE AGENTS: Each agent can draw from same chat thread
  const getAgentContext = useCallback((agentType: AgentType, threadId?: string) => {
    const agent = CONVERSATIONAL_AGENTS[agentType]
    
    if (!agent.contextAware || !threadId) {
      return null
    }

    // Find the specific thread for context
    const thread = chatThreads.find(t => t.thread_id === threadId)
    
    return thread ? {
      threadTitle: thread.thread_title,
      messageCount: thread.message_count,
      lastActivity: thread.last_activity,
      conversationHistory: `Previous ${agent.name} conversation: "${thread.first_message}..." (${thread.message_count} messages)`
    } : null
  }, [chatThreads])

  // Load threads on mount
  useEffect(() => {
    loadChatThreads()
  }, [loadChatThreads])

  return {
    // Thread data
    chatThreads,
    threadCounts,
    tierLimits,
    loading,
    
    // Thread management
    loadChatThreads,
    deleteThread,
    archiveThread,
    cleanupExcessThreads,
    
    // Agent capabilities
    canStartNewThread,
    getThreadStatus,
    getAgentContext,
    
    // Agent configurations
    agents: CONVERSATIONAL_AGENTS
  }
}

// ✅ CONVERSATIONAL AGENTS CONFIRMED
// - NOT stuck in scripts - fully conversational with context awareness
// - Each agent can draw context from the same chat thread
// - Thread deletion management for tier limits
// - Indie Dev Dan approach: intelligent, contextual, adaptive agents
