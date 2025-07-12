'use client'

import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/hooks/useUser'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Clock, MessageSquare, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ConversationSummary {
  id: string
  agent: 'lexi' | 'alex' | 'rex'
  topic: string
  summary: string
  last_message: string
  created_at: string
  message_count: number
}

interface CachedPrompt {
  text: string
  context: string
  agent: 'lexi' | 'alex' | 'rex'
  usage_count: number
  last_used: string
}

interface ConversationCacheProps {
  currentAgent: 'lexi' | 'alex' | 'rex'
  onPromptSelect: (prompt: string) => void
  className?: string
}

export function ConversationCache({ 
  currentAgent, 
  onPromptSelect, 
  className 
}: ConversationCacheProps) {
  const { user } = useUser()
  const supabase = createClientComponentClient()
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [cachedPrompts, setCachedPrompts] = useState<CachedPrompt[]>([])
  const [loading, setLoading] = useState(true)

  // Generate contextual prompts based on recent conversations
  const generateSmartPrompts = useMemo(() => {
    const recentTopics = conversations
      .filter(c => c.agent === currentAgent)
      .slice(0, 5)
      .map(c => c.topic)

    const agentPrompts = {
      lexi: [
        "Help optimize my profile setup",
        "Show tier upgrade benefits", 
        "Guide through service selection"
      ],
      alex: [
        "Analyze current project costs",
        "Review bidding strategy",
        "Calculate material estimates"
      ],
      rex: [
        "Find leads in my area",
        "Show performance metrics",
        "Optimize lead targeting"
      ]
    }

    // Blend default prompts with context from recent conversations
    const contextualPrompts = recentTopics.map(topic => {
      const truncated = topic.length > 45 ? topic.substring(0, 42) + '...' : topic
      return `Continue: ${truncated}`
    })

    return [...agentPrompts[currentAgent], ...contextualPrompts.slice(0, 2)]
  }, [conversations, currentAgent])

  useEffect(() => {
    const fetchConversationHistory = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Fetch conversation summaries from last 21 days
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - 21)

        const { data: chatData, error: chatError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('contractor_id', user.id)
          .gte('created_at', cutoffDate.toISOString())
          .order('created_at', { ascending: false })
          .limit(100)

        if (chatError) throw chatError

        // Group messages by session and agent to create summaries
        const sessionGroups = chatData.reduce((groups, message) => {
          const key = `${message.session_id}-${message.agent}`
          if (!groups[key]) {
            groups[key] = []
          }
          groups[key].push(message)
          return groups
        }, {} as Record<string, any[]>)

        const summaries: ConversationSummary[] = Object.entries(sessionGroups)
          .map(([key, messages]) => {
            const typedMessages = messages as any[] // Type assertion for the message array
            const [sessionId, agent] = key.split('-')
            const lastMessage = typedMessages[0]
            const firstMessage = typedMessages[typedMessages.length - 1]
            
            // Generate topic from first user message
            const userMessages = typedMessages.filter(m => m.agent === 'user')
            const topic = userMessages.length > 0 
              ? userMessages[userMessages.length - 1].message.substring(0, 60)
              : 'General discussion'

            return {
              id: sessionId,
              agent: agent as 'lexi' | 'alex' | 'rex',
              topic,
              summary: generateSummary(typedMessages),
              last_message: lastMessage.message,
              created_at: firstMessage.created_at,
              message_count: typedMessages.length
            }
          })
          .filter(s => s.message_count >= 3) // Only conversations with substance
          .slice(0, 10)

        setConversations(summaries)

        // Generate cached prompts based on conversation patterns
        const prompts = generateCachedPrompts(summaries, currentAgent)
        setCachedPrompts(prompts)
        
      } catch (error) {
        console.error('Error fetching conversation history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversationHistory()
  }, [user, currentAgent, supabase])

  const generateSummary = (messages: any[]): string => {
    const userMessages = messages.filter(m => m.agent === 'user')
    if (userMessages.length === 0) return 'No user input'
    
    // Simple summary logic - in production, use AI summarization
    const mainTopics = userMessages
      .map(m => m.message.split(' ').slice(0, 8).join(' '))
      .slice(0, 2)
      .join('; ')
    
    return mainTopics.length > 80 ? mainTopics.substring(0, 77) + '...' : mainTopics
  }

  const generateCachedPrompts = (summaries: ConversationSummary[], agent: string): CachedPrompt[] => {
    const agentSummaries = summaries.filter(s => s.agent === agent)
    
    return agentSummaries.slice(0, 3).map(summary => ({
      text: `Resume: ${summary.topic}`,
      context: summary.summary,
      agent: agent as 'lexi' | 'alex' | 'rex',
      usage_count: 1,
      last_used: summary.created_at
    }))
  }

  const handlePromptClick = (prompt: string) => {
    onPromptSelect(prompt)
  }

  if (loading) {
    return (
      <div className={cn("p-3 space-y-2", className)}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 animate-spin" />
          Loading conversation cache...
        </div>
      </div>
    )
  }

  return (
    <div className={cn("p-3 space-y-3", className)}>
      {/* Smart Prompts */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Zap className="w-3 h-3" />
          Smart Suggestions
        </div>
        <div className="grid gap-1">
          {generateSmartPrompts.slice(0, 3).map((prompt, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left text-xs h-7 px-2 bg-primary/5 hover:bg-primary/10"
                onClick={() => handlePromptClick(prompt)}
              >
                <span className="truncate">{prompt}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Conversations */}
      {conversations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <MessageSquare className="w-3 h-3" />
            Recent Conversations
          </div>
          <div className="grid gap-1">
            {conversations.slice(0, 2).map((conv) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left text-xs h-8 px-2"
                  onClick={() => handlePromptClick(`Continue discussing: ${conv.topic}`)}
                >
                  <div className="truncate">
                    <div className="font-medium">{conv.topic}</div>
                    <div className="text-muted-foreground">{conv.message_count} messages</div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ConversationCache
