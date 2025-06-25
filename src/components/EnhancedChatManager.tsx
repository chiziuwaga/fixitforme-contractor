'use client';

import { useState, useCallback } from 'react';
import { useChat } from 'ai/react';
import { ChatWindow, type AgentType, type Message } from './EnhancedChatWindow';
import { Button, Affix, Group, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useUser } from '@/providers/UserProvider';
import { IconLock, IconInfoCircle } from '@tabler/icons-react';
import { BRAND } from '@/lib/brand';
import { AgentWorkingIndicator } from '@/components/ui/AgentWorkingIndicator';
import { useConcurrentExecutionManager } from '@/components/ui/ConcurrentExecutionManager';

interface ChatState {
  isOpen: boolean;
  isMinimized: boolean;
}

type ChatStates = Record<AgentType, ChatState>;

export function EnhancedChatManager() {
  const [chatStates, setChatStates] = useState<ChatStates>({
    lexi: { isOpen: false, isMinimized: false },
    alex: { isOpen: false, isMinimized: false },
    rex: { isOpen: false, isMinimized: false },
  });  
  
  const { subscription } = useUser();
  const { activeSessions, startExecution, canStartNew } = useConcurrentExecutionManager();
  const isScaleTier = subscription?.tier === 'scale';
  const chatThreadLimit = isScaleTier ? 30 : 10;
  const messagesPerChatLimit = isScaleTier ? 200 : 50;

  // Create separate chat instances for each agent
  const lexiChat = useChat({
    api: '/api/agents/lexi',
    id: 'lexi',
  });

  const alexChat = useChat({
    api: '/api/agents/alex',
    id: 'alex',
  });

  const rexChat = useChat({
    api: '/api/agents/rex',
    id: 'rex',
  });  const getChatInstance = (agentType: AgentType) => {
    switch (agentType) {
      case 'lexi': return lexiChat;
      case 'alex': return alexChat;
      case 'rex': return rexChat;
    }
  };

  const openChat = useCallback((agentType: AgentType) => {
    const isPremiumAgent = agentType === 'alex' || agentType === 'rex';
    if (isPremiumAgent && !isScaleTier) {
      notifications.show({
        title: 'Upgrade to Scale',
        message: `The @${agentType} agent is a premium feature. Upgrade your plan for advanced features.`,
        color: 'yellow',
        autoClose: 6000,
      });
      return;
    }

    setChatStates(prev => ({
      ...prev,
      [agentType]: {
        ...prev[agentType],
        isOpen: true,
        isMinimized: false,
      },
    }));
  }, [isScaleTier]);

  const closeChat = useCallback((agentType: AgentType) => {
    setChatStates(prev => ({
      ...prev,
      [agentType]: {
        ...prev[agentType],
        isOpen: false,
      },
    }));
  }, []);

  const minimizeChat = useCallback((agentType: AgentType) => {
    setChatStates(prev => ({
      ...prev,
      [agentType]: {
        ...prev[agentType],
        isMinimized: !prev[agentType].isMinimized,
      },
    }));
  }, []);  const handleSendMessage = async (message: string, targetAgent: AgentType) => {
    const chatInstance = getChatInstance(targetAgent);
    const userMessages = chatInstance.messages.filter((m: { role: string }) => m.role === 'user');
    
    // Check if this specific chat has reached its message limit
    if (userMessages.length >= messagesPerChatLimit) {
        notifications.show({
            title: 'Chat Message Limit Reached',
            message: `This chat has reached its limit of ${messagesPerChatLimit} messages. Please start a new chat for a different topic.`,
            color: 'orange',
            icon: <IconInfoCircle />,
        });

        // Add system message to Lexi's chat
        const systemMessageContent = `You've reached the limit of ${messagesPerChatLimit} messages for this conversation. To continue discussing new topics, please start a new chat. ${!isScaleTier ? 'Scale tier users get 200 messages per chat - upgrade for higher limits!' : ''}`
        
        lexiChat.setMessages([
            ...lexiChat.messages,
            {
                id: `limit-msg-${Date.now()}`,
                role: 'system',
                content: systemMessageContent,
            }
        ]);

        // Open Lexi if not already open to show the system message
        if (!chatStates.lexi.isOpen) {
            openChat('lexi');
        }
        return;
    }

    // Check if user is trying to open too many chat threads
    const openChats = Object.values(chatStates).filter(state => state.isOpen).length;
    if (!chatStates[targetAgent].isOpen && openChats >= chatThreadLimit) {
        notifications.show({
            title: 'Chat Thread Limit Reached',
            message: `You can have a maximum of ${chatThreadLimit} chat threads open. Please close one before opening a new one.`,
            color: 'orange',
            icon: <IconInfoCircle />,
        });

        // Add system message to Lexi's chat
        const systemMessageContent = `You've reached your limit of ${chatThreadLimit} open chat threads. Please close an existing chat before starting a new one. ${!isScaleTier ? 'Scale tier users can have 30 open chats - upgrade for higher limits!' : ''}`
        
        lexiChat.setMessages([
            ...lexiChat.messages,
            {
                id: `thread-limit-msg-${Date.now()}`,
                role: 'system',
                content: systemMessageContent,
            }
        ]);

        // Open Lexi if not already open to show the system message
        if (!chatStates.lexi.isOpen) {
            openChat('lexi');
        }
        return;
    }

    const isPremiumAgent = targetAgent === 'alex' || targetAgent === 'rex';
    if (isPremiumAgent && !isScaleTier) {
      notifications.show({
        title: 'Upgrade to Scale',
        message: `The @${targetAgent} agent is a premium feature. Upgrade your plan for advanced features.`,
        color: 'yellow',
        autoClose: 6000,
      });
      return;
    }

    // For premium agents (Alex & Rex), check concurrent execution limits
    if (isPremiumAgent && !canStartNew) {
      notifications.show({
        title: 'Agent Execution Limit Reached',
        message: `You can only run ${2} agents simultaneously. Please wait for current operations to complete.`,
        color: 'orange',
        icon: <IconInfoCircle />,
      });

      // Add system message to Lexi's chat
      const systemMessageContent = `You've reached your limit of 2 concurrent agent operations. Please wait for Alex or Rex to finish their current tasks before starting new ones.`
      
      lexiChat.setMessages([
        ...lexiChat.messages,
        {
          id: `execution-limit-msg-${Date.now()}`,
          role: 'system',
          content: systemMessageContent,
        }
      ]);

      // Open Lexi if not already open to show the system message
      if (!chatStates.lexi.isOpen) {
        openChat('lexi');
      }
      return;
    }

    // Ensure the target agent's chat is open
    if (!chatStates[targetAgent].isOpen) {
      openChat(targetAgent);
    }    // For premium agents, start execution tracking
    let executionId: string | null = null;
    if (isPremiumAgent) {
      executionId = await startExecution(targetAgent, 300000); // 5 minute estimate
      if (!executionId) {
        notifications.show({
          title: 'Unable to Start Agent',
          message: `Could not start ${targetAgent} execution. Please try again.`,
          color: 'red',
        });
        return;
      }
    }

    // Send message to the appropriate chat instance
    if (targetAgent === 'rex' && executionId) {
      // For Rex, trigger the deep search endpoint with execution tracking
      try {
        const response = await fetch('/api/agents/rex_run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'Oakland, CA', // Could be extracted from message
            categories: ['plumbing', 'electrical'], // Could be extracted from message  
            execution_id: executionId
          })
        });
        
        if (response.ok) {
          const results = await response.json();          // Add results to chat
          chatInstance.setMessages([
            ...chatInstance.messages,
            {
              id: `user-${Date.now()}`,
              role: 'user' as const,
              content: message,
            },
            {
              id: `rex-${Date.now()}`,
              role: 'assistant' as const,
              content: `Found ${results.leads_found} leads in your area! Check your dashboard for the complete results.`,
            }
          ]);
        }
      } catch (error) {
        console.error('Rex execution error:', error);
        notifications.show({
          title: 'Rex Execution Failed',
          message: 'There was an error during lead generation. Please try again.',
          color: 'red',
        });
      }
    } else {
      // For other agents, use normal chat flow
      chatInstance.append({
        role: 'user',
        content: message,
      });
    }
  };
  // Process AI responses and extract UI assets
  const processMessages = (messages: ReturnType<typeof useChat>['messages'], agentType: AgentType): Message[] => {
    return messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system') // Filter valid roles
      .map(msg => {
      let ui_assets: Message['ui_assets'] = undefined;
      let actions: Message['actions'] = [];
      let processedContent = msg.content;

      // Try to parse JSON responses for UI assets
      if (msg.role === 'assistant') {
        try {
          // This regex is designed to find a JSON block and capture it.
          const jsonMatch = msg.content.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch && jsonMatch[1]) {
            const parsed = JSON.parse(jsonMatch[1]);
            ui_assets = parsed.ui_assets || undefined;
            actions = parsed.actions || [];
            // The "human-readable" part is outside the json block
            processedContent = msg.content.replace(jsonMatch[0], '').trim();
          } else {
             // Fallback for non-JSON or malformed responses
            ui_assets = undefined;
            actions = [];
          }
        } catch (error) {
          console.error(`Error parsing assistant message JSON for ${agentType}:`, error);
          ui_assets = undefined;
          actions = [];
        }
      }

      return { 
        ...msg, 
        timestamp: msg.createdAt || new Date(), 
        content: processedContent, 
        ui_assets, 
        actions,
        role: msg.role as 'user' | 'assistant' | 'system' // Type cast to fix compatibility
      };
    });
  };
  // Helper to check if an agent is currently executing
  const isAgentExecuting = (agentType: AgentType): boolean => {
    return activeSessions.some(session => session.agent === agentType && session.status === 'running');
  };

  return (
    <>      {/* Render active execution indicators */}
      {activeSessions
        .filter(session => session.status === 'running')
        .map(session => (
          <AgentWorkingIndicator
            key={session.id}
            state={{
              id: session.id,
              agent: session.agent,
              status: 'analyzing', // Default status for UI
              progress: session.progress,
              current_task: session.current_task,
            }}
            onCancel={() => {
              // Cancel execution logic would go here
              console.log('Cancel execution:', session.id);
            }}
          />
        ))}

      {/* Render the chat windows that are currently open */}
      {(Object.keys(chatStates) as AgentType[]).map(agentType => {
        if (!chatStates[agentType].isOpen) return null;
        const chatInstance = getChatInstance(agentType);
        const processedMessages = processMessages(chatInstance.messages, agentType);
        const isExecuting = isAgentExecuting(agentType);

        return (
          <ChatWindow
            key={agentType}
            agentType={agentType}
            messages={processedMessages}
            onSendMessage={(message, target) => handleSendMessage(message, target || agentType)}
            onClose={() => closeChat(agentType)}
            onMinimize={() => minimizeChat(agentType)}
            isMinimized={chatStates[agentType].isMinimized}
            isTyping={chatInstance.isLoading || isExecuting}
          />
        );
      })}

      {/* Render the floating action buttons to open chats */}
      <Affix position={{ bottom: 20, right: 20 }}>
        <Group>
          <Tooltip label="Chat with Lexi, your onboarding assistant">
            <Button onClick={() => openChat('lexi')} variant="gradient" gradient={{ from: BRAND.colors.primary, to: BRAND.colors.text.accent }}>
              @lexi
            </Button>
          </Tooltip>

          <Tooltip label={isScaleTier ? "Chat with Alex for advanced bidding" : "Upgrade to Scale to use Alex"}>
            <Button
              onClick={() => openChat('alex')}
              variant={isScaleTier ? "gradient" : "default"}
              gradient={isScaleTier ? { from: BRAND.colors.primary, to: BRAND.colors.text.accent } : undefined}
              disabled={!isScaleTier}
              rightSection={!isScaleTier ? <IconLock size={14} /> : undefined}
            >
              @alex
            </Button>
          </Tooltip>

          <Tooltip label={isScaleTier ? "Chat with Rex for lead generation" : "Upgrade to Scale to use Rex"}>
            <Button
              onClick={() => openChat('rex')}
              variant={isScaleTier ? "gradient" : "default"}
              gradient={isScaleTier ? { from: BRAND.colors.primary, to: BRAND.colors.text.accent } : undefined}
              disabled={!isScaleTier}
              rightSection={!isScaleTier ? <IconLock size={14} /> : undefined}
            >
              @rex
            </Button>
          </Tooltip>
        </Group>
      </Affix>
    </>
  );
}
