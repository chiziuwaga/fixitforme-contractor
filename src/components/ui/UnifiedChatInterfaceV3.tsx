/**
 * UnifiedChatInterface V3 - Simplified Vercel Integration
 * 
 * This version focuses on properly integrating our existing sophisticated backend
 * with the Vercel-inspired UI patterns while maintaining all existing functionality.
 * 
 * Key Integration Points:
 * - useChat hook from useChatProduction for all backend functionality
 * - Existing AgentComponents for sophisticated UI assets
 * - ConcurrentExecutionManager for execution limits
 * - Clean three-panel layout inspired by Vercel AI Chatbot
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { 
  MessageSquare, 
  Send, 
  ChevronLeft,
  Plus,
  Search,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

// Import existing sophisticated hooks and components
import { useChat } from '@/hooks/useChatProduction';
import { AlexCostBreakdown, RexLeadDashboard, LexiOnboarding } from '@/components/ui/AgentComponents';

export type AgentType = 'lexi' | 'alex' | 'rex';

interface UnifiedChatInterfaceV3Props {
  className?: string;
  defaultAgent?: AgentType;
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
    name: 'Rex the Researcher',
    avatar: '🔍', 
    color: 'bg-secondary',
    textColor: 'text-secondary',
    description: 'Lead Research & Analysis',
    isPremium: true
  }
} as const;

export default function UnifiedChatInterfaceV3({ 
  className,
  defaultAgent = 'lexi' 
}: UnifiedChatInterfaceV3Props) {
  // Use our existing sophisticated chat production hook
  const {
    limits,
    isScaleTier,
    conversations,
    activeConversationId,
    getChatInstance,
    openChat,
    processMessages,
    isAgentExecuting,
    canSendMessage,
    canStartAgent,
    startNewConversation,
    archiveConversation
  } = useChat();

  // Local UI state
  const [activeAgent, setActiveAgent] = useState<AgentType>(defaultAgent);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current chat instance
  const currentChat = getChatInstance(activeAgent);
  const processedMessages = processMessages(currentChat.messages, activeAgent);

  // Handle agent switching
  const handleAgentSwitch = useCallback((agentType: AgentType) => {
    if (canStartAgent(agentType)) {
      setActiveAgent(agentType);
      openChat(agentType);
    }
  }, [canStartAgent, openChat]);

  // Handle sending messages
  const handleSendMessage = useCallback(async () => {
    const input = inputRef.current;
    if (!input?.value.trim() || !canSendMessage(activeAgent)) return;

    const message = input.value.trim();
    input.value = '';

    // Use the existing chat instance append method
    currentChat.append({
      role: 'user',
      content: message,
    });
  }, [activeAgent, canSendMessage, currentChat]);

  // Render sophisticated UI assets using existing components
  const renderUIAssets = useCallback((message: { ui_assets?: { type: string; data: Record<string, unknown> } }) => {
    if (!message.ui_assets) return null;

    const { type, data } = message.ui_assets;

    switch (type) {
      case 'alex_cost_breakdown':
        return <AlexCostBreakdown data={data as Parameters<typeof AlexCostBreakdown>[0]['data']} />;
      case 'rex_lead_dashboard':
        return <RexLeadDashboard data={data as Parameters<typeof RexLeadDashboard>[0]['data']} />;
      case 'lexi_onboarding':
        return <LexiOnboarding data={data as Parameters<typeof LexiOnboarding>[0]['data']} />;
      default:
        return (
          <Card className="border-dashed">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                UI Asset: {type}
              </p>
            </CardContent>
          </Card>
        );
    }
  }, []);

  // Filter conversations based on search
  const filteredConversations = Object.values(conversations).filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.metadata?.project_context?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group conversations by date
  const groupedConversations = filteredConversations.reduce((groups, conv) => {
    const date = new Date(conv.created_at).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(conv);
    return groups;
  }, {} as Record<string, typeof filteredConversations>);

  return (
    <div className={cn("flex h-full bg-background border rounded-lg overflow-hidden", className)}>
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Sidebar - Conversation History */}
        {!sidebarCollapsed && (
          <>
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold">Conversations</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarCollapsed(true)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => startNewConversation(activeAgent)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                </div>

                {/* Conversation List */}
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {Object.entries(groupedConversations).map(([date, convs]) => (
                      <div key={date} className="mb-4">
                        <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2">
                          {formatDistanceToNow(new Date(date), { addSuffix: true })}
                        </h3>
                        {convs.map((conv) => (
                          <motion.div
                            key={conv.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card 
                              className={cn(
                                "mb-2 cursor-pointer transition-colors hover:bg-muted/50",
                                activeConversationId === conv.id && "bg-muted"
                              )}
                              onClick={() => {
                                setActiveAgent(conv.agent);
                                openChat(conv.agent);
                              }}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm">
                                        {AGENT_CONFIG[conv.agent].avatar}
                                      </span>
                                      <Badge 
                                        variant="secondary" 
                                        className={cn("text-xs", AGENT_CONFIG[conv.agent].textColor)}
                                      >
                                        {AGENT_CONFIG[conv.agent].name}
                                      </Badge>
                                    </div>
                                    <p className="text-sm font-medium truncate">
                                      {conv.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {conv.messages.length} messages
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      archiveConversation(conv.id);
                                    }}
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>
            <ResizableHandle />
          </>
        )}

        {/* Main Chat Area */}
        <ResizablePanel defaultSize={sidebarCollapsed ? 100 : 75}>
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {sidebarCollapsed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarCollapsed(false)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{AGENT_CONFIG[activeAgent].avatar}</span>
                    <div>
                      <h1 className="font-semibold">{AGENT_CONFIG[activeAgent].name}</h1>
                      <p className="text-sm text-muted-foreground">
                        {AGENT_CONFIG[activeAgent].description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Agent Selector */}
                  <div className="flex items-center gap-1">
                    {Object.entries(AGENT_CONFIG).map(([key, config]) => (
                      <Button
                        key={key}
                        variant={activeAgent === key ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleAgentSwitch(key as AgentType)}
                        disabled={config.isPremium && !isScaleTier}
                      >
                        <span className="mr-2">{config.avatar}</span>
                        {config.name.split(' ')[0]}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {processedMessages.map((message, index) => (
                  <motion.div
                    key={message.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role !== 'user' && (
                      <div className="flex-shrink-0">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                          AGENT_CONFIG[activeAgent].color
                        )}>
                          {AGENT_CONFIG[activeAgent].avatar}
                        </div>
                      </div>
                    )}
                    
                    <div className={cn(
                      "max-w-[70%] space-y-2",
                      message.role === 'user' ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "rounded-lg px-4 py-2",
                        message.role === 'user' 
                          ? "bg-primary text-primary-foreground ml-auto" 
                          : "bg-muted"
                      )}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      {/* Render sophisticated UI assets */}
                      {renderUIAssets(message)}
                    </div>
                  </motion.div>
                ))}
                
                {currentChat.isLoading && (
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                      AGENT_CONFIG[activeAgent].color
                    )}>
                      {AGENT_CONFIG[activeAgent].avatar}
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse flex space-x-1">
                          <div className="rounded-full bg-gray-400 h-2 w-2"></div>
                          <div className="rounded-full bg-gray-400 h-2 w-2"></div>
                          <div className="rounded-full bg-gray-400 h-2 w-2"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {AGENT_CONFIG[activeAgent].name} is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder={`Message ${AGENT_CONFIG[activeAgent].name}...`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={!canSendMessage(activeAgent) || currentChat.isLoading}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!canSendMessage(activeAgent) || currentChat.isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Usage indicator */}
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>
                  {isScaleTier ? 'Scale Plan' : 'Growth Plan'} • 
                  {processedMessages.length}/{limits.messagesPerChatLimit} messages
                </span>
                {isAgentExecuting(activeAgent) && (
                  <Badge variant="secondary" className="animate-pulse">
                    Processing...
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

// Export the configuration for use in other components
export { AGENT_CONFIG as UnifiedChatAgentConfig };
