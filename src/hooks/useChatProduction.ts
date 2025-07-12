'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useChat as useAIChat } from 'ai/react';
import { useConcurrentExecutionManager } from '@/components/ui/ConcurrentExecutionManager';
import { toast } from 'sonner';

export type AgentType = 'lexi' | 'alex' | 'rex';

interface DailyUsageTracking {
  date: string;
  rex: number;
  alex: number;
  lexi: number;
}

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
  // NEW: Enhanced rate limiting for Growth vs Scale tiers
  rexLeadLimit: number;
  alexMaterialLimit: number;
  dailyAgentUsage: {
    rex: number;
    alex: number;
    lexi: number;
  };
  maxDailyUsage: {
    rex: number;
    alex: number;
    lexi: number;
  };
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

interface ConversationData {
  id: string;
  agent: AgentType;
  title: string;
  messages: ProcessedMessage[];
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  metadata?: {
    project_context?: any;
    lead_context?: any;
    material_context?: any;
  };
}

// Mock user profile for now - replace with actual useUser when available
const useMockUser = () => {
  return {
    profile: {
      subscription_tier: 'scale' as 'growth' | 'scale',
      id: 'mock-user-id'
    }
  };
};

export const useChat = () => {
  const [chatStates, setChatStates] = useState<Record<AgentType, ChatState>>({
    lexi: { isOpen: false, isMinimized: false },
    alex: { isOpen: false, isMinimized: false },
    rex: { isOpen: false, isMinimized: false },
  });

  // Use mock user for now - replace with actual useUser when available
  const { profile } = useMockUser();
  const { activeSessions, startExecution, canStartNew } = useConcurrentExecutionManager();
  
  // Chat instances for each agent
  const lexiChat = useAIChat({ api: '/api/agents/lexi', id: 'lexi' });
  const alexChat = useAIChat({ api: '/api/agents/alex', id: 'alex' });
  const rexChat = useAIChat({ api: '/api/agents/rex', id: 'rex' });

  // Enhanced rate limiting based on subscription tier
  const isScaleTier = profile?.subscription_tier === 'scale';
  
  // Daily usage tracking (stored in localStorage for now)
  const [dailyUsage, setDailyUsage] = useState(() => {
    try {
      const stored = localStorage.getItem('agent-daily-usage');
      const today = new Date().toDateString();
      const usage = stored ? JSON.parse(stored) : {};
      
      // Reset if it's a new day
      if (usage.date !== today) {
        return {
          date: today,
          rex: 0,
          alex: 0,
          lexi: 0
        };
      }
      return usage;
    } catch {
      return {
        date: new Date().toDateString(),
        rex: 0,
        alex: 0,
        lexi: 0
      };
    }
  });

  // ENHANCED: Tier-aware limits with intelligent rate limiting
  const limits: ChatLimits = useMemo(() => ({
    chatThreadLimit: isScaleTier ? 30 : 10,
    messagesPerChatLimit: isScaleTier ? 200 : 50,
    canUsePremiumAgents: isScaleTier,
    
    // NEW: Intelligent rate limiting for UI viability
    rexLeadLimit: 5, // 5 hyper-relevant leads max for optimal UI display
    alexMaterialLimit: 15, // 15 materials max for effective cost analysis
    
    // Daily usage limits based on tier
    dailyAgentUsage: dailyUsage,
    maxDailyUsage: {
      rex: isScaleTier ? 50 : 10, // Scale: 50 searches/day, Growth: 10/day
      alex: isScaleTier ? 30 : 5,  // Scale: 30 analyses/day, Growth: 5/day
      lexi: isScaleTier ? 100 : 50 // Lexi is more permissive for onboarding
    }
  }), [isScaleTier, dailyUsage]);

  // Update daily usage tracking
  const incrementUsage = useCallback((agent: AgentType) => {
    const today = new Date().toDateString();
    setDailyUsage((prev: DailyUsageTracking) => {
      const updated = {
        ...prev,
        date: today,
        [agent]: (prev.date === today ? prev[agent] : 0) + 1
      };
      localStorage.setItem('agent-daily-usage', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getChatInstance = useCallback((agentType: AgentType) => {
    switch (agentType) {
      case 'lexi': return lexiChat;
      case 'alex': return alexChat;
      case 'rex': return rexChat;
    }
  }, [lexiChat, alexChat, rexChat]);

  // ENHANCED: Check if an agent is executing
  const isAgentExecuting = useCallback((agentType: AgentType): boolean => {
    return activeSessions.some(session => 
      session.agent === agentType && session.status === 'running'
    );
  }, [activeSessions]);

  // ENHANCED: Check daily usage limits
  const canUseAgentToday = useCallback((agentType: AgentType): boolean => {
    const usage = limits.dailyAgentUsage[agentType];
    const maxUsage = limits.maxDailyUsage[agentType];
    return usage < maxUsage;
  }, [limits]);

  // ENHANCED: Comprehensive agent availability checking
  const canStartAgent = useCallback((agentType: AgentType): boolean => {
    const config = AGENT_CONFIGS[agentType];
    
    // Check basic premium access
    if (config.isPremium && !limits.canUsePremiumAgents) {
      toast.warning('Premium Feature', {
        description: `${config.name} requires a Scale subscription. Upgrade for advanced agent capabilities.`,
      });
      return false;
    }
    
    // Check daily usage limits
    if (!canUseAgentToday(agentType)) {
      const remaining = limits.maxDailyUsage[agentType] - limits.dailyAgentUsage[agentType];
      toast.warning('Daily Limit Reached', {
        description: `You've reached your daily limit for ${config.name}. ${isScaleTier ? 'Limit resets tomorrow.' : 'Upgrade to Scale for higher limits.'}`,
      });
      return false;
    }
    
    // Check if agent is already running
    if (isAgentExecuting(agentType)) {
      toast.info('Agent Busy', {
        description: `${config.name} is currently processing. Please wait for completion.`,
      });
      return false;
    }
    
    // Check execution limits
    if (config.isPremium && !canStartNew) {
      toast.warning('Execution Limit', {
        description: 'Maximum concurrent executions reached. Please wait for completion.',
      });
      return false;
    }
    
    // ENHANCED: Check for execution conflicts (Rex + Alex simultaneously)
    if (agentType === 'rex' && isAgentExecuting('alex')) {
      toast.warning('Agent Conflict', {
        description: 'Rex cannot run while Alex is analyzing. Please wait for Alex to complete.',
      });
      return false;
    }
    
    if (agentType === 'alex' && isAgentExecuting('rex')) {
      toast.warning('Agent Conflict', {
        description: 'Alex cannot start while Rex is searching. Please wait for Rex to complete.',
      });
      return false;
    }
    
    return true;
  }, [limits, isAgentExecuting, canStartNew, canUseAgentToday, isScaleTier]);

  // ENHANCED: Process messages with UI assets and rate limiting context
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
              
              // ENHANCED: Apply rate limiting to UI assets
              if (ui_assets && agentType === 'rex' && ui_assets.data && Array.isArray(ui_assets.data.leads)) {
                // Limit Rex to 5 hyper-relevant leads
                ui_assets.data.leads = ui_assets.data.leads.slice(0, limits.rexLeadLimit);
              }
              
              if (ui_assets && agentType === 'alex' && ui_assets.data && Array.isArray(ui_assets.data.materials)) {
                // Limit Alex to 15 materials for optimal UI
                ui_assets.data.materials = ui_assets.data.materials.slice(0, limits.alexMaterialLimit);
              }
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
  }, [limits]);

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

  // ENHANCED: Open chat with comprehensive validation
  const openChat = useCallback((agentType: AgentType) => {
    // Check all constraints
    if (!canStartAgent(agentType)) {
      return; // canStartAgent already shows appropriate toast
    }

    // Check thread limits
    if (!canOpenNewChat(agentType)) {
      toast.warning('Chat Thread Limit Reached', {
        description: `You can have a maximum of ${limits.chatThreadLimit} chat threads open. Please close one before opening a new one.`,
      });
      return;
    }

    // Increment usage tracking
    incrementUsage(agentType);

    setChatStates(prev => ({
      ...prev,
      [agentType]: { ...prev[agentType], isOpen: true, isMinimized: false },
    }));

    // Show usage reminder for premium agents
    const config = AGENT_CONFIGS[agentType];
    if (config.isPremium) {
      const remaining = limits.maxDailyUsage[agentType] - limits.dailyAgentUsage[agentType] - 1;
      if (remaining <= 2) {
        toast.info('Usage Notice', {
          description: `${remaining} ${config.name} uses remaining today.`,
        });
      }
    }
  }, [canStartAgent, canOpenNewChat, limits, incrementUsage]);

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

  // Simplified conversation management (localStorage-based)
  const [conversations, setConversations] = useState<Record<string, ConversationData>>({});
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Load conversations from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('chat-conversations');
      if (stored) {
        const parsedConversations = JSON.parse(stored);
        setConversations(parsedConversations);
        
        // Set most recent conversation as active
        const sortedIds = Object.keys(parsedConversations).sort((a, b) => 
          new Date(parsedConversations[b].updated_at).getTime() - 
          new Date(parsedConversations[a].updated_at).getTime()
        );
        if (sortedIds[0]) {
          setActiveConversationId(sortedIds[0]);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, []);

  // Save conversations to localStorage
  const saveConversations = useCallback((newConversations: Record<string, ConversationData>) => {
    try {
      localStorage.setItem('chat-conversations', JSON.stringify(newConversations));
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  }, []);

  const generateConversationTitle = useCallback((firstMessage: string, agent: AgentType): string => {
    const agentPrefixes = {
      lexi: 'Onboarding',
      alex: 'Project Analysis', 
      rex: 'Lead Search'
    };

    const truncated = firstMessage.length > 40 
      ? firstMessage.substring(0, 40) + '...' 
      : firstMessage;
    
    return `${agentPrefixes[agent]}: ${truncated}`;
  }, []);

  const startNewConversation = useCallback((agent: AgentType, context?: any) => {
    const conversationId = `${agent}-${Date.now()}`;
    const newConversation: ConversationData = {
      id: conversationId,
      agent,
      title: `New ${agent.charAt(0).toUpperCase() + agent.slice(1)} Chat`,
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_archived: false,
      metadata: context ? { [`${agent}_context`]: context } : undefined
    };

    const updatedConversations = {
      [conversationId]: newConversation,
      ...conversations
    };
    
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
    setActiveConversationId(conversationId);
    
    return conversationId;
  }, [conversations, saveConversations]);

  const deleteConversation = useCallback((conversationId: string) => {
    const updatedConversations = { ...conversations };
    delete updatedConversations[conversationId];
    
    setConversations(updatedConversations);
    saveConversations(updatedConversations);

    // Switch to another conversation if this was active
    if (activeConversationId === conversationId) {
      const remainingIds = Object.keys(updatedConversations);
      setActiveConversationId(remainingIds[0] || null);
    }

    toast.success('Conversation deleted');
  }, [conversations, activeConversationId, saveConversations]);

  const archiveConversation = useCallback((conversationId: string) => {
    const updatedConversations = {
      ...conversations,
      [conversationId]: {
        ...conversations[conversationId],
        is_archived: true,
        updated_at: new Date().toISOString()
      }
    };

    setConversations(updatedConversations);
    saveConversations(updatedConversations);

    // Switch to another conversation if this was active
    if (activeConversationId === conversationId) {
      const activeIds = Object.keys(updatedConversations).filter(
        id => id !== conversationId && !updatedConversations[id].is_archived
      );
      setActiveConversationId(activeIds[0] || null);
    }

    toast.success('Conversation archived');
  }, [conversations, activeConversationId, saveConversations]);

  return {
    // State
    chatStates,
    limits,
    isScaleTier,
    activeSessions,
    conversations,
    activeConversationId,
    
    // Chat instances
    lexiChat,
    alexChat,
    rexChat,
    getChatInstance,
    
    // Business logic functions
    openChat,
    closeChat,
    toggleMinimize,
    processMessages,
    isAgentExecuting,
    canUseAgent,
    canOpenNewChat,
    canSendMessage,
    canStartAgent,
    canUseAgentToday,
    startNewConversation,
    deleteConversation,
    archiveConversation,
    
    // Agent configurations
    agentConfigs: AGENT_CONFIGS,
  };
};

// Export for backward compatibility
export const useEnhancedChat = useChat;
