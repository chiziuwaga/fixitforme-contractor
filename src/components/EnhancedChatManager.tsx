'use client';

import { useState, useCallback } from 'react';
import { useChat } from 'ai/react';
import { ChatWindow, type AgentType, type Message } from './EnhancedChatWindow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock, Info, MessageCircle, Bot, Search, Calculator } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { BRAND } from '@/lib/brand';
import { AgentWorkingIndicator } from '@/components/ui/AgentWorkingIndicator';
import { useConcurrentExecutionManager } from '@/components/ui/ConcurrentExecutionManager';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
      toast.warning('Upgrade to Scale', {
        description: `The @${agentType} agent is a premium feature. Upgrade your plan for advanced features.`,
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
        toast.warning('Chat Message Limit Reached', {
            description: `This chat has reached its limit of ${messagesPerChatLimit} messages. Please start a new chat for a different topic.`,
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
        toast.warning('Chat Thread Limit Reached', {
            description: `You can have a maximum of ${chatThreadLimit} chat threads open. Please close one before opening a new one.`,
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
      toast.warning('Upgrade to Scale', {
        description: `The @${targetAgent} agent is a premium feature. Upgrade your plan for advanced features.`,
      });
      return;
    }

    // For premium agents (Alex & Rex), check concurrent execution limits
    if (isPremiumAgent && !canStartNew) {
      toast.warning('Agent Execution Limit Reached', {
        description: `You can only run ${2} agents simultaneously. Please wait for current operations to complete.`,
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
        toast.error('Unable to Start Agent', {
          description: `Could not start ${targetAgent} execution. Please try again.`,
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
        toast.error('Rex Execution Failed', {
          description: 'There was an error during lead generation. Please try again.',
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
            agent={session.agent}
            isWorking={session.status === 'running'}
            currentTask={session.current_task}
            className="mb-4"
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
      <div className="fixed bottom-6 right-6 z-50">
        <TooltipProvider>
          <div className="flex flex-col gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Button 
                    onClick={() => openChat('lexi')} 
                    className="h-14 w-14 rounded-full bg-gradient-to-r from-[rgb(var(--primary-orange))] to-[rgb(var(--primary-blue))] hover:from-[rgb(var(--primary-orange))]/90 hover:to-[rgb(var(--primary-blue))]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 brand-transition"
                    size="sm"
                  >
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-neutral-900 text-white">
                <p>Chat with Lexi, your onboarding assistant</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    onClick={() => openChat('alex')}
                    className={cn(
                      "h-14 w-14 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 brand-transition",
                      isScaleTier 
                        ? "bg-gradient-to-r from-[rgb(var(--primary-purple))] to-[rgb(var(--primary-indigo))] hover:from-[rgb(var(--primary-purple))]/90 hover:to-[rgb(var(--primary-indigo))]/90" 
                        : "bg-neutral-400 cursor-not-allowed opacity-60"
                    )}
                    disabled={!isScaleTier}
                    size="sm"
                  >
                    {!isScaleTier ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Calculator className="h-6 w-6" />
                    )}
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-neutral-900 text-white">
                <p>{isScaleTier ? "Chat with Alex for advanced bidding" : "Upgrade to Scale to use Alex"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    onClick={() => openChat('rex')}
                    className={cn(
                      "h-14 w-14 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 brand-transition",
                      isScaleTier 
                        ? "bg-gradient-to-r from-[rgb(var(--primary-teal))] to-[rgb(var(--primary-cyan))] hover:from-[rgb(var(--primary-teal))]/90 hover:to-[rgb(var(--primary-cyan))]/90" 
                        : "bg-neutral-400 cursor-not-allowed opacity-60"
                    )}
                    disabled={!isScaleTier}
                    size="sm"
                  >
                    {!isScaleTier ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Search className="h-6 w-6" />
                    )}
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-neutral-900 text-white">
                <p>{isScaleTier ? "Chat with Rex for lead generation" : "Upgrade to Scale to use Rex"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </>
  );
}

export default EnhancedChatManager;
