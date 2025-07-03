'use client';

import { useState, useCallback, useMemo } from 'react';
import { useChat as useAIChat } from 'ai/react';
import { useUser } from '@/hooks/useUser';
import { useConcurrentExecutionManager } from '@/components/ui/ConcurrentExecutionManager';
import { toast } from 'sonner';

export type AgentType = 'lexi' | 'alex' | 'rex';

export interface ChatState {
  isOpen: boolean;
  isMinimized: boolean;
}

export interface ProcessedMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  agentType?: AgentType;
  ui_assets?: {
    type: string;
    data: Record<string, unknown>;
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
}

export interface ChatLimits {
  chatThreadLimit: number;
  messagesPerChatLimit: number;
  canUsePremiumAgents: boolean;
}

export interface AgentConfig {
  name: string;
  color: string;
  bgColor: string;
  avatar: string;
  description: string;
  isPremium: boolean;
}

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  lexi: {
    name: 'Lexi the Liaison',
    color: 'from-primary to-primary/80',
    bgColor: 'bg-gradient-to-r from-primary to-primary/80',
    avatar: '👩‍💼',
    description: 'Onboarding Guide',
    isPremium: false,
  },
  alex: {
    name: 'Alex the Assessor',
    color: 'from-success to-success/80',
    bgColor: 'bg-gradient-to-r from-success to-success/80',
    avatar: '📊',
    description: 'Bidding Assistant',
    isPremium: true,
  },
  rex: {
    name: 'Rex the Retriever',
    color: 'from-warning to-warning/80',
    bgColor: 'bg-gradient-to-r from-warning to-warning/80',
    avatar: '🔍',
    description: 'Lead Generator',
    isPremium: true,
  },
};

export const useEnhancedChat = () => {
  const [chatStates, setChatStates] = useState<Record<AgentType, ChatState>>({
    lexi: { isOpen: false, isMinimized: false },
    alex: { isOpen: false, isMinimized: false },
    rex: { isOpen: false, isMinimized: false },
  });

  const { subscription } = useUser();
  const { activeSessions, startExecution, canStartNew } = useConcurrentExecutionManager();
  
  // Chat instances for each agent
  const lexiChat = useAIChat({ api: '/api/agents/lexi', id: 'lexi' });
  const alexChat = useAIChat({ api: '/api/agents/alex', id: 'alex' });
  const rexChat = useAIChat({ api: '/api/agents/rex', id: 'rex' });

  // Derived state and limits
  const isScaleTier = subscription?.tier === 'scale';
  const limits: ChatLimits = useMemo(() => ({
    chatThreadLimit: isScaleTier ? 30 : 10,
    messagesPerChatLimit: isScaleTier ? 200 : 50,
    canUsePremiumAgents: isScaleTier,
  }), [isScaleTier]);

  const getChatInstance = useCallback((agentType: AgentType) => {
    switch (agentType) {
      case 'lexi': return lexiChat;
      case 'alex': return alexChat;
      case 'rex': return rexChat;
    }
  }, [lexiChat, alexChat, rexChat]);

  // Business logic: Check if an agent is executing
  const isAgentExecuting = useCallback((agentType: AgentType): boolean => {
    return activeSessions.some(session => 
      session.agent === agentType && session.status === 'running'
    );
  }, [activeSessions]);

  // Business logic: Process messages with UI assets
  const processMessages = useCallback((
    messages: ReturnType<typeof useAIChat>['messages'], 
    agentType: AgentType
  ): ProcessedMessage[] => {
    return messages
      .filter(msg => ['user', 'assistant', 'system'].includes(msg.role))
      .map(msg => {
        let ui_assets: ProcessedMessage['ui_assets'] = undefined;
        let actions: ProcessedMessage['actions'] = [];
        let processedContent = msg.content;

        // Parse JSON responses for UI assets
        if (msg.role === 'assistant') {
          try {
            const jsonMatch = msg.content.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
              const parsed = JSON.parse(jsonMatch[1]);
              ui_assets = parsed.ui_assets || undefined;
              actions = parsed.actions || [];
              processedContent = msg.content.replace(jsonMatch[0], '').trim();
            }
          } catch (error) {
            console.error(`Error parsing assistant message JSON for ${agentType}:`, error);
          }
        }

        return {
          id: msg.id,
          content: processedContent,
          role: msg.role as 'user' | 'assistant' | 'system',
          timestamp: msg.createdAt || new Date(),
          agentType,
          ui_assets,
          actions,
        };
      });
  }, []);

  // Business logic: Check thread limits
  const canOpenNewChat = useCallback((agentType: AgentType): boolean => {
    const openChats = Object.values(chatStates).filter(state => state.isOpen).length;
    return chatStates[agentType].isOpen || openChats < limits.chatThreadLimit;
  }, [chatStates, limits.chatThreadLimit]);

  // Business logic: Check message limits for a specific chat
  const canSendMessage = useCallback((agentType: AgentType): boolean => {
    const chatInstance = getChatInstance(agentType);
    const userMessages = chatInstance.messages.filter(m => m.role === 'user');
    return userMessages.length < limits.messagesPerChatLimit;
  }, [getChatInstance, limits.messagesPerChatLimit]);

  // Business logic: Check premium access
  const canUseAgent = useCallback((agentType: AgentType): boolean => {
    const config = AGENT_CONFIGS[agentType];
    return !config.isPremium || limits.canUsePremiumAgents;
  }, [limits.canUsePremiumAgents]);

  // Business logic: Open chat with all validation
  const openChat = useCallback((agentType: AgentType) => {
    // Check premium access
    if (!canUseAgent(agentType)) {
      toast.warning('Upgrade to Scale', {
        description: `The @${agentType} agent is a premium feature. Upgrade your plan for advanced features.`,
      });
      return;
    }

    // Check thread limits
    if (!canOpenNewChat(agentType)) {
      toast.warning('Chat Thread Limit Reached', {
        description: `You can have a maximum of ${limits.chatThreadLimit} chat threads open. Please close one before opening a new one.`,
      });
      
      // Add system message to Lexi's chat
      const systemMessage = `You've reached your limit of ${limits.chatThreadLimit} open chat threads. Please close an existing chat before starting a new one. ${!isScaleTier ? 'Scale tier users can have 30 open chats - upgrade for higher limits!' : ''}`;
      
      lexiChat.setMessages([
        ...lexiChat.messages,
        {
          id: `thread-limit-msg-${Date.now()}`,
          role: 'system',
          content: systemMessage,
        }
      ]);

      // Open Lexi if not already open
      if (!chatStates.lexi.isOpen) {
        setChatStates(prev => ({
          ...prev,
          lexi: { ...prev.lexi, isOpen: true, isMinimized: false },
        }));
      }
      return;
    }

    setChatStates(prev => ({
      ...prev,
      [agentType]: { ...prev[agentType], isOpen: true, isMinimized: false },
    }));
  }, [canUseAgent, canOpenNewChat, limits, isScaleTier, lexiChat, chatStates]);

  // Business logic: Close chat
  const closeChat = useCallback((agentType: AgentType) => {
    setChatStates(prev => ({
      ...prev,
      [agentType]: { ...prev[agentType], isOpen: false },
    }));
  }, []);

  // Business logic: Minimize/maximize chat
  const toggleMinimize = useCallback((agentType: AgentType) => {
    setChatStates(prev => ({
      ...prev,
      [agentType]: { ...prev[agentType], isMinimized: !prev[agentType].isMinimized },
    }));
  }, []);

  // Business logic: Send message with all validation and execution handling
  const sendMessage = useCallback(async (message: string, targetAgent: AgentType) => {
    const chatInstance = getChatInstance(targetAgent);

    // Check message limits
    if (!canSendMessage(targetAgent)) {
      toast.warning('Chat Message Limit Reached', {
        description: `This chat has reached its limit of ${limits.messagesPerChatLimit} messages. Please start a new chat for a different topic.`,
      });

      const systemMessage = `You've reached the limit of ${limits.messagesPerChatLimit} messages for this conversation. To continue discussing new topics, please start a new chat. ${!isScaleTier ? 'Scale tier users get 200 messages per chat - upgrade for higher limits!' : ''}`;
      
      lexiChat.setMessages([
        ...lexiChat.messages,
        {
          id: `limit-msg-${Date.now()}`,
          role: 'system',
          content: systemMessage,
        }
      ]);

      if (!chatStates.lexi.isOpen) {
        openChat('lexi');
      }
      return;
    }

    const isPremiumAgent = AGENT_CONFIGS[targetAgent].isPremium;

    // Check execution limits for premium agents
    if (isPremiumAgent && !canStartNew) {
      toast.warning('Agent Execution Limit Reached', {
        description: 'You can only run 2 agents simultaneously. Please wait for current operations to complete.',
      });

      const systemMessage = `You've reached your limit of 2 concurrent agent operations. Please wait for Alex or Rex to finish their current tasks before starting new ones.`;
      
      lexiChat.setMessages([
        ...lexiChat.messages,
        {
          id: `execution-limit-msg-${Date.now()}`,
          role: 'system',
          content: systemMessage,
        }
      ]);

      if (!chatStates.lexi.isOpen) {
        openChat('lexi');
      }
      return;
    }

    // Ensure target chat is open
    if (!chatStates[targetAgent].isOpen) {
      openChat(targetAgent);
    }

    // For premium agents, start execution tracking
    let executionId: string | null = null;
    if (isPremiumAgent) {
      executionId = await startExecution(targetAgent as 'alex' | 'rex', 300000); // 5 minute estimate
      if (!executionId) {
        toast.error('Unable to Start Agent', {
          description: `Could not start ${targetAgent} execution. Please try again.`,
        });
        return;
      }
    }

    // Special handling for Rex with execution tracking
    if (targetAgent === 'rex' && executionId) {
      try {
        const response = await fetch('/api/agents/rex_run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'Oakland, CA',
            categories: ['plumbing', 'electrical'],
            execution_id: executionId
          })
        });
        
        if (response.ok) {
          const results = await response.json();
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
        toast.error('Rex Execution Failed', {
          description: 'There was an error during lead generation. Please try again.',
        });
      }
    } else {
      // Normal chat flow for other agents
      chatInstance.append({
        role: 'user',
        content: message,
      });
    }
  }, [
    getChatInstance, 
    canSendMessage, 
    limits, 
    isScaleTier, 
    lexiChat, 
    chatStates, 
    openChat, 
    canStartNew, 
    startExecution
  ]);

  return {
    // State
    chatStates,
    limits,
    isScaleTier,
    activeSessions,
    
    // Chat instances
    lexiChat,
    alexChat,
    rexChat,
    getChatInstance,
    
    // Business logic functions
    openChat,
    closeChat,
    toggleMinimize,
    sendMessage,
    processMessages,
    isAgentExecuting,
    canUseAgent,
    canOpenNewChat,
    canSendMessage,
    
    // Agent configurations
    agentConfigs: AGENT_CONFIGS,
  };
};
