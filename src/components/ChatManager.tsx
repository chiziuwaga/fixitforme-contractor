'use client'

import { useState, useCallback } from 'react'
import { useChat } from 'ai/react'
import { ChatWindow, type AgentType, type Message } from './ChatWindow'
import { Button, Group, Affix } from '@mantine/core'
import { IconRobot, IconUser, IconSearch } from '@tabler/icons-react'

interface ChatState {
  isOpen: boolean
  isMinimized: boolean
}

type ChatStates = Record<AgentType, ChatState>

export function ChatManager() {
  const [chatStates, setChatStates] = useState<ChatStates>({
    lexi: { isOpen: false, isMinimized: false },
    alex: { isOpen: false, isMinimized: false },
    rex: { isOpen: false, isMinimized: false },
  })

  // Create separate chat instances for each agent
  const lexiChat = useChat({
    api: '/api/agents/lexi',
    id: 'lexi',
  })

  const alexChat = useChat({
    api: '/api/agents/alex',
    id: 'alex',
  })

  const rexChat = useChat({
    api: '/api/agents/rex',
    id: 'rex',
  })
  const getChatInstance = useCallback((agentType: AgentType) => {
    switch (agentType) {
      case 'lexi': return lexiChat
      case 'alex': return alexChat
      case 'rex': return rexChat
    }
  }, [lexiChat, alexChat, rexChat])

  // Enhanced message parsing for @ mentions and orchestrated agent calling
  const parseMessage = useCallback((content: string) => {
    // Check for explicit @ mentions
    const mentionMatch = content.match(/@(lexi|alex|rex)\b/i)
    if (mentionMatch) {
      return {
        targetAgent: mentionMatch[1].toLowerCase() as AgentType,
        isExplicitMention: true,
        content: content.replace(mentionMatch[0], '').trim()
      }
    }

    // Orchestrated agent selection based on content analysis
    const lowerContent = content.toLowerCase()
    
    // Lexi keywords (onboarding, setup, getting started)
    if (lowerContent.includes('onboard') || lowerContent.includes('getting started') || 
        lowerContent.includes('setup') || lowerContent.includes('profile') ||
        lowerContent.includes('new') || lowerContent.includes('help me start')) {
      return { targetAgent: 'lexi' as AgentType, isExplicitMention: false, content }
    }
    
    // Alex keywords (bidding, pricing, cost, estimate)
    if (lowerContent.includes('bid') || lowerContent.includes('price') || 
        lowerContent.includes('cost') || lowerContent.includes('estimate') ||
        lowerContent.includes('quote') || lowerContent.includes('material')) {
      return { targetAgent: 'alex' as AgentType, isExplicitMention: false, content }
    }
    
    // Rex keywords (leads, search, generate, opportunities)
    if (lowerContent.includes('lead') || lowerContent.includes('search') || 
        lowerContent.includes('generate') || lowerContent.includes('opportunities') ||
        lowerContent.includes('find work') || lowerContent.includes('jobs')) {
      return { targetAgent: 'rex' as AgentType, isExplicitMention: false, content }
    }    // Default to most recently opened chat or Lexi for general queries
    const openChats = Object.entries(chatStates).filter(([, state]) => state.isOpen)
    if (openChats.length > 0) {
      return { targetAgent: openChats[openChats.length - 1][0] as AgentType, isExplicitMention: false, content }
    }    
    return { targetAgent: 'lexi' as AgentType, isExplicitMention: false, content }
  }, [chatStates])

  const openChat = useCallback((agentType: AgentType) => {
    setChatStates(prev => ({
      ...prev,
      [agentType]: {
        ...prev[agentType],
        isOpen: true,
        isMinimized: false,
      },
    }))
  }, [])

  const closeChat = useCallback((agentType: AgentType) => {
    setChatStates(prev => ({
      ...prev,
      [agentType]: {
        ...prev[agentType],
        isOpen: false,
      },
    }))
  }, [])

  const minimizeChat = useCallback((agentType: AgentType) => {
    setChatStates(prev => ({
      ...prev,
      [agentType]: {
        ...prev[agentType],
        isMinimized: !prev[agentType].isMinimized,
      },
    }))
  }, [])
  const sendMessage = useCallback(async (content: string) => {
    // Parse message for @ mentions or orchestrated routing
    const { targetAgent, isExplicitMention, content: processedContent } = parseMessage(content)
    
    // Open the target agent's chat if not already open
    if (!chatStates[targetAgent].isOpen) {
      openChat(targetAgent)
    }

    // Get the appropriate chat instance
    const chatInstance = getChatInstance(targetAgent)
    
    // Add contextual prefix for orchestrated calls
    const finalContent = isExplicitMention 
      ? processedContent 
      : `[Auto-routed to ${targetAgent.charAt(0).toUpperCase() + targetAgent.slice(1)}] ${processedContent}`

    chatInstance.append({
      id: Date.now().toString(),
      content: finalContent,
      role: 'user',
    })
  }, [chatStates, openChat, parseMessage, getChatInstance])
  const openChatWindows = Object.entries(chatStates)
    .filter(([, state]) => state.isOpen)
    .map(([agentType]) => agentType as AgentType)

  return (
    <>
      {/* Chat Launch Buttons */}
      <Affix position={{ bottom: 20, left: 20 }}>
        <Group gap="md">
          <Button
            leftSection={<IconUser size={16} />}
            variant="filled"
            color="#D4A574"
            onClick={() => openChat('lexi')}
            disabled={chatStates.lexi.isOpen}
          >
            @lexi (Onboarding)
          </Button>
          <Button
            leftSection={<IconRobot size={16} />}
            variant="filled"
            color="#1A2E1A"
            onClick={() => openChat('alex')}
            disabled={chatStates.alex.isOpen}
          >
            @alex (Bidding)
          </Button>
          <Button
            leftSection={<IconSearch size={16} />}
            variant="filled"
            color="gray"
            onClick={() => openChat('rex')}
            disabled={chatStates.rex.isOpen}
          >
            @rex (Leads)
          </Button>
        </Group>
      </Affix>

      {/* Global Message Input for @ Mentions */}
      <Affix position={{ bottom: 20, right: 20 }}>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg max-w-md">
          <p className="text-xs text-gray-500 mb-2">
            Type @lexi, @alex, or @rex to call specific agents, or just type naturally for auto-routing
          </p>
          <input
            type="text"
            placeholder="Ask anything or @mention an agent..."
            className="w-full p-2 border border-gray-300 rounded text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                sendMessage(e.currentTarget.value.trim())
                e.currentTarget.value = ''
              }
            }}
          />
        </div>
      </Affix>

      {/* Render Open Chat Windows */}
      {openChatWindows.map((agentType, index) => {
        const chatInstance = getChatInstance(agentType)
          // Convert useChat messages to our Message format
        const messages: Message[] = chatInstance.messages
          .filter(msg => msg.role === 'user' || msg.role === 'assistant')
          .map(msg => ({
            id: msg.id,
            content: msg.content,
            role: msg.role as 'user' | 'assistant',
            timestamp: new Date(), // useChat doesn't provide timestamps
            agentType,
          }))

        return (
          <div
            key={agentType}
            style={{
              position: 'fixed',
              bottom: 20,
              right: 20 + (index * 420), // Offset multiple windows
              zIndex: 1000 + index,
            }}
          >
            <ChatWindow
              agentType={agentType}
              isMinimized={chatStates[agentType].isMinimized}
              onMinimize={() => minimizeChat(agentType)}
              onClose={() => closeChat(agentType)}
              onSendMessage={sendMessage}
              messages={messages}
              isTyping={chatInstance.isLoading}
            />
          </div>
        )
      })}
    </>
  )
}
