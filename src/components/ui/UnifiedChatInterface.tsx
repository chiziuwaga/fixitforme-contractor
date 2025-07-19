/**
 * Unified Chat Interface - Inspired by demo.chat-sdk.dev
 * Central command center for all agent interactions
 * Replaces fragmented chat components with cohesive experience
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';
import { useEnhancedChatThreads } from '@/hooks/useEnhancedChatThreads';

// Import our new modular components
import { ChatSidebar } from './chat/ChatSidebar';
import { ChatHeader } from './chat/ChatHeader';
import { MessagesContainer } from './chat/MessagesContainer';
import { ChatInput } from './chat/ChatInput';
export type AgentType = 'lexi' | 'alex' | 'rex';

export interface Message {
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
  follow_up_prompts?: string[];
}

export interface ChatThread {
  id: string;
  title: string;
  agent: AgentType;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
  isActive: boolean;
}

interface UnifiedChatInterfaceProps {
  className?: string;
  defaultAgent?: AgentType;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const AGENT_CONFIG = {
  lexi: {
    name: 'Lexi the Liaison',
    avatar: '💫',
    color: 'bg-primary',
    textColor: 'text-primary',
    description: 'Onboarding & Support',
    isPremium: false
  },
  alex: {
    name: 'Alex the Assessor', 
    avatar: '📊',
    color: 'bg-green-600',
    textColor: 'text-green-600',
    description: 'Cost Analysis & Bidding',
    isPremium: true
  },
  rex: {
    name: 'Rex the Retriever',
    avatar: '🔍', 
    color: 'bg-secondary',
    textColor: 'text-secondary',
    description: 'Lead Generation & Research',
    isPremium: true
  }
};

export function UnifiedChatInterface({ 
  className,
  defaultAgent = 'lexi',
  isMinimized = false,
  onToggleMinimize
}: UnifiedChatInterfaceProps) {
  const { profile } = useUser();
  const isScaleTier = profile?.subscription_tier === 'scale';
  
  // Core UI State
  const [activeAgent, setActiveAgent] = useState<AgentType>(defaultAgent);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Thread Management with enhanced hook
  const { canStartNewThread } = useEnhancedChatThreads();
  const [threads, setThreads] = useState<ChatThread[]>([]);

  // Load threads on mount and when agent changes
  useEffect(() => {
    if (profile?.id) {
      // Mock thread data for now - replace with actual API call
      setThreads([
        {
          id: '1',
          title: 'Onboarding Questions',
          agent: 'lexi',
          lastMessage: 'How do I set up my profile?',
          timestamp: new Date(),
          messageCount: 5,
          isActive: true
        },
        {
          id: '2', 
          title: 'Scale Tier Benefits',
          agent: 'lexi',
          lastMessage: 'Tell me about premium features',
          timestamp: new Date(Date.now() - 86400000), // yesterday
          messageCount: 3,
          isActive: false
        }
      ]);
    }
  }, [profile?.id, activeAgent]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
      agentType: activeAgent
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // API call to agent endpoint
      const response = await fetch(`/api/agents/${activeAgent}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          threadId: activeThread,
          contractor_id: profile?.id
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        agentType: activeAgent
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Stream response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                assistantMessage.content += data.content;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: assistantMessage.content }
                      : msg
                  )
                );
              }
              if (data.ui_assets) {
                assistantMessage.ui_assets = data.ui_assets;
                assistantMessage.actions = data.actions;
                assistantMessage.follow_up_prompts = data.follow_up_prompts;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, ...assistantMessage }
                      : msg
                  )
                );
              }
            } catch (error) {
              console.error('Error parsing stream data:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
        agentType: activeAgent
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, activeAgent, messages, activeThread, profile?.id]);

  const handleNewThread = useCallback(() => {
    if (!canStartNewThread(activeAgent)) {
      return;
    }
    
    setActiveThread(null);
    setMessages([]);
    
    const welcomeMessage: Message = {
      id: `welcome-${Date.now()}`,
      content: getWelcomeMessage(activeAgent),
      role: 'assistant',
      timestamp: new Date(),
      agentType: activeAgent
    };
    
    setMessages([welcomeMessage]);
  }, [activeAgent, canStartNewThread]);

  const getWelcomeMessage = (agent: AgentType): string => {
    switch (agent) {
      case 'lexi':
        return "Hi! I'm Lexi, your onboarding guide. How can I help you get started or navigate the platform today?";
      case 'alex':
        return "Hello! I'm Alex, your cost analysis specialist. Ready to analyze a project, create estimates, or research materials?";
      case 'rex':
        return "Hey there! I'm Rex, your lead generation expert. Let me help you find and qualify new opportunities in your area.";
      default:
        return "How can I assist you today?";
    }
  };

  const handleAgentSwitch = useCallback((newAgent: AgentType) => {
    const config = AGENT_CONFIG[newAgent];
    
    if (config.isPremium && !isScaleTier) {
      const upgradeMessage: Message = {
        id: `upgrade-${Date.now()}`,
        content: `${config.name} is a Scale tier feature. Upgrade to access advanced ${config.description.toLowerCase()} capabilities!`,
        role: 'system',
        timestamp: new Date(),
        ui_assets: {
          type: 'upgrade_prompt',
          data: {
            agent: newAgent,
            feature: config.description,
            tier: 'scale'
          }
        }
      };
      
      setMessages(prev => [...prev, upgradeMessage]);
      return;
    }

    setActiveAgent(newAgent);
    setActiveThread(null);
    setMessages([]);
    
    const welcomeMessage: Message = {
      id: `welcome-${Date.now()}`,
      content: getWelcomeMessage(newAgent),
      role: 'assistant',
      timestamp: new Date(),
      agentType: newAgent
    };
    
    setMessages([welcomeMessage]);
  }, [isScaleTier]);

  const handleThreadSelect = useCallback((threadId: string) => {
    setActiveThread(threadId);
    setMessages([
      {
        id: 'thread-msg-1',
        content: 'Loading conversation...',
        role: 'assistant',
        timestamp: new Date(),
        agentType: activeAgent
      }
    ]);
  }, [activeAgent]);

  // Minimized view
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "fixed bottom-4 right-4 z-50",
          className
        )}
      >
        <Button
          onClick={onToggleMinimize}
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex h-[700px] bg-background border border-border/20 rounded-lg overflow-hidden shadow-lg",
        className
      )}
    >
      {/* Sidebar */}
      <ChatSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activeAgent={activeAgent}
        onAgentSwitch={handleAgentSwitch}
        isScaleTier={isScaleTier}
        threads={threads}
        activeThread={activeThread}
        onThreadSelect={handleThreadSelect}
        onNewThread={handleNewThread}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatHeader
          activeAgent={activeAgent}
          isLoading={isLoading}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          onToggleMinimize={onToggleMinimize}
        />

        <MessagesContainer
          messages={messages}
          isLoading={isLoading}
        />

        <ChatInput
          input={input}
          setInput={setInput}
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
          activeAgent={activeAgent}
        />
      </div>
    </motion.div>
  );
}
