'use client'

import { useState, useRef, useEffect } from 'react'
import { Paper, Text, ScrollArea, TextInput, Avatar, Group, Stack, Badge, ActionIcon, Tooltip } from '@mantine/core'
import { IconSend, IconMinus, IconMaximize } from '@tabler/icons-react'

export type AgentType = 'lexi' | 'alex' | 'rex'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  agentType?: AgentType
}

export interface ChatWindowProps {
  agentType: AgentType
  isMinimized?: boolean
  onMinimize: () => void
  onClose: () => void
  onSendMessage: (message: string, agentType: AgentType) => void
  messages: Message[]
  isTyping?: boolean
}

const AGENT_CONFIG = {
  lexi: {
    name: 'Lexi the Liaison',
    color: '#D4A574', // Felix Gold
    avatar: '👩‍💼',
    description: 'Onboarding Guide',
  },
  alex: {
    name: 'Alex the Assessor',
    color: '#1A2E1A', // Forest Green
    avatar: '📊',
    description: 'Bidding Assistant',
  },
  rex: {
    name: 'Rex the Retriever',
    color: '#6B7280',
    avatar: '🔍',
    description: 'Lead Generator',
  },
}

export function ChatWindow({
  agentType,
  isMinimized = false,
  onMinimize,
  onClose,
  onSendMessage,
  messages,
  isTyping = false,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const agent = AGENT_CONFIG[agentType]

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim(), agentType)
      setInputValue('')
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  if (isMinimized) {
    return (
      <Paper
        p="sm"
        shadow="md"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 250,
          cursor: 'pointer',
          borderTop: `3px solid ${agent.color}`,
        }}
        onClick={onMinimize}
      >
        <Group justify="space-between">
          <Group gap="xs">
            <Text size="lg">{agent.avatar}</Text>
            <div>
              <Text size="sm" fw={500}>
                {agent.name}
              </Text>
              <Text size="xs" c="dimmed">
                {agent.description}
              </Text>
            </div>
          </Group>
          <ActionIcon variant="subtle" size="sm" onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}>
            <IconMinus size={14} />
          </ActionIcon>
        </Group>
      </Paper>
    )
  }

  return (
    <Paper
      shadow="lg"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 400,
        height: 600,
        display: 'flex',
        flexDirection: 'column',
        borderTop: `4px solid ${agent.color}`,
      }}
    >
      {/* Header */}
      <Group
        p="md"
        justify="space-between"
        style={{
          borderBottom: '1px solid #e9ecef',
          backgroundColor: '#f8f9fa',
        }}
      >
        <Group gap="sm">
          <Avatar size="sm" style={{ backgroundColor: agent.color }}>
            {agent.avatar}
          </Avatar>
          <div>
            <Text size="sm" fw={600}>
              {agent.name}
            </Text>
            <Badge size="xs" color="gray" variant="light">
              {agent.description}
            </Badge>
          </div>
        </Group>
        <Group gap="xs">
          <Tooltip label="Minimize">
            <ActionIcon variant="subtle" size="sm" onClick={onMinimize}>
              <IconMinus size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Close">
            <ActionIcon variant="subtle" size="sm" onClick={onClose}>
              <IconMaximize size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Messages */}
      <ScrollArea
        flex={1}
        p="md"
        viewportRef={scrollAreaRef}
        style={{ backgroundColor: '#ffffff' }}
      >
        <Stack gap="md">
          {messages
            .filter((msg) => !msg.agentType || msg.agentType === agentType)
            .map((message) => (
              <Group
                key={message.id}
                align="flex-start"
                gap="sm"
                justify={message.role === 'user' ? 'flex-end' : 'flex-start'}
              >
                {message.role === 'assistant' && (
                  <Avatar size="sm" style={{ backgroundColor: agent.color }}>
                    {agent.avatar}
                  </Avatar>
                )}
                <Paper
                  p="sm"
                  maw="80%"
                  style={{
                    backgroundColor:
                      message.role === 'user' ? agent.color : '#f1f3f4',
                    color: message.role === 'user' ? 'white' : 'black',
                  }}
                >
                  <Text size="sm">{message.content}</Text>
                  <Text
                    size="xs"
                    c={message.role === 'user' ? 'rgba(255,255,255,0.7)' : 'dimmed'}
                    mt={4}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </Paper>
                {message.role === 'user' && (
                  <Avatar size="sm" color="blue">
                    👤
                  </Avatar>
                )}
              </Group>
            ))}

          {/* Typing indicator */}
          {isTyping && (
            <Group align="flex-start" gap="sm">
              <Avatar size="sm" style={{ backgroundColor: agent.color }}>
                {agent.avatar}
              </Avatar>
              <Paper p="sm" style={{ backgroundColor: '#f1f3f4' }}>
                <Text size="sm" c="dimmed">
                  {agent.name.split(' ')[0]} is typing...
                </Text>
              </Paper>
            </Group>
          )}
        </Stack>
      </ScrollArea>

      {/* Input */}
      <Group
        p="md"
        gap="sm"
        style={{
          borderTop: '1px solid #e9ecef',
          backgroundColor: '#f8f9fa',
        }}
      >
        <TextInput
          flex={1}
          placeholder={`Ask ${agent.name.split(' ')[0]}...`}
          value={inputValue}
          onChange={(event) => setInputValue(event.currentTarget.value)}
          onKeyDown={handleKeyPress}
          style={{ flexGrow: 1 }}
        />
        <ActionIcon
          color={agent.color}
          size="lg"
          onClick={handleSend}
          disabled={!inputValue.trim()}
        >
          <IconSend size={18} />
        </ActionIcon>
      </Group>
    </Paper>
  )
}
