'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, TextInput, Stack, Text, Group, ActionIcon, ScrollArea, Loader, Badge } from '@mantine/core';
import { IconSend, IconUser, IconRobot, IconAt } from '@tabler/icons-react';
import GenerativeAgentAssets from '@/components/agent-ui/GenerativeAgentAssets';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agent?: 'lexi' | 'alex' | 'rex';
  ui_assets?: any;
}

interface EnhancedChatManagerProps {
  contractorId: string;
  className?: string;
}

export default function EnhancedChatManager({ contractorId, className }: EnhancedChatManagerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to FixItForMe! I\'m here to help you grow your contracting business. Try mentioning @lexi for onboarding, @alex for bidding help, or @rex for lead generation.',
      timestamp: new Date(),
      agent: 'lexi'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<'lexi' | 'alex' | 'rex' | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector('[data-scrollarea-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  };

  const detectAgent = (message: string): 'lexi' | 'alex' | 'rex' | null => {
    if (message.includes('@lexi')) return 'lexi';
    if (message.includes('@alex')) return 'alex';
    if (message.includes('@rex')) return 'rex';
    return null;
  };

  const getAgentEndpoint = (agent: 'lexi' | 'alex' | 'rex') => {
    return `/api/agents/${agent}`;
  };

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'lexi': return 'blue';
      case 'alex': return 'green';
      case 'rex': return 'orange';
      default: return 'gray';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    // Detect which agent to call
    const agent = detectAgent(input);
    setActiveAgent(agent);

    try {
      let endpoint = '/api/chat/general'; // Default endpoint
      if (agent) {
        endpoint = getAgentEndpoint(agent);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          contractor_id: contractorId,
          conversation_history: messages.slice(-5), // Last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || data.response || 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
        agent: agent || undefined,
        ui_assets: data.ui_assets || null
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setActiveAgent(null);
      setInput('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card withBorder radius="md" className={className} h="100%">
      <Stack h="100%" gap="md">
        {/* Header */}
        <Group justify="space-between" align="center" pb="sm" style={{ borderBottom: '1px solid #eee' }}>
          <Text fw={600} size="lg">Chat Assistant</Text>
          <Group gap="xs">
            <Badge size="xs" color="blue" variant="outline">@lexi</Badge>
            <Badge size="xs" color="green" variant="outline">@alex</Badge>
            <Badge size="xs" color="orange" variant="outline">@rex</Badge>
          </Group>
        </Group>

        {/* Messages Area */}
        <ScrollArea flex={1} ref={scrollAreaRef} type="hover">
          <Stack gap="md" pr="sm">
            {messages.map((message) => (
              <div key={message.id}>
                <Group gap="sm" align="flex-start">
                  <div 
                    style={{ 
                      backgroundColor: message.role === 'user' ? '#228be6' : '#495057',
                      borderRadius: '50%',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {message.role === 'user' ? (
                      <IconUser size={16} color="white" />
                    ) : (
                      <IconRobot size={16} color="white" />
                    )}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <Group gap="xs" align="center" mb={4}>
                      <Text size="sm" fw={500}>
                        {message.role === 'user' ? 'You' : 'Assistant'}
                      </Text>
                      {message.agent && (
                        <Badge size="xs" color={getAgentColor(message.agent)} variant="light">
                          {message.agent}
                        </Badge>
                      )}
                      <Text size="xs" c="dimmed">
                        {formatTime(message.timestamp)}
                      </Text>
                    </Group>
                    
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Text>

                    {/* Render UI Assets if present */}
                    {message.ui_assets && (
                      <div style={{ marginTop: '12px' }}>
                        <GenerativeAgentAssets 
                          agent={message.agent || 'lexi'}
                          assetType={message.ui_assets.type}
                          data={message.ui_assets.data}
                          actions={message.ui_assets.actions}
                        />
                      </div>
                    )}
                  </div>
                </Group>
              </div>
            ))}

            {loading && (
              <Group gap="sm" align="center">
                <div 
                  style={{ 
                    backgroundColor: '#495057',
                    borderRadius: '50%',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconRobot size={16} color="white" />
                </div>
                <Group gap="xs" align="center">
                  <Loader size="sm" />
                  <Text size="sm" c="dimmed">
                    {activeAgent ? `${activeAgent} is thinking...` : 'Typing...'}
                  </Text>
                  {activeAgent && (
                    <Badge size="xs" color={getAgentColor(activeAgent)} variant="light">
                      {activeAgent}
                    </Badge>
                  )}
                </Group>
              </Group>
            )}

            <div ref={messagesEndRef} />
          </Stack>
        </ScrollArea>

        {/* Input Area */}
        <Group gap="sm" align="flex-end" pt="sm" style={{ borderTop: '1px solid #eee' }}>
          <TextInput
            flex={1}
            placeholder="Type your message... (try @lexi, @alex, or @rex)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            leftSection={<IconAt size={16} />}
            radius="xl"
          />
          <ActionIcon
            size="lg"
            radius="xl"
            variant="filled"
            color="blue"
            onClick={handleSend}
            loading={loading}
            disabled={!input.trim()}
          >
            <IconSend size={16} />
          </ActionIcon>
        </Group>
      </Stack>
    </Card>
  );
}
