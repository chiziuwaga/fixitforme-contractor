/**
 * UnifiedChatInterface with Comprehensive Viewport Optimization
 * 
 * Features:
 * - 8-breakpoint responsive design system integration
 * - Vercel AI Chatbot-inspired patterns
 * - Sophisticated backend integration preservation
 * - Advanced keyboard shortcuts and accessibility
 * - Performance optimizations with virtualization
 */

'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
  MoreVertical,
  Maximize2,
  Settings,
  Keyboard,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

// Import our existing sophisticated systems
import { useChat } from '@/hooks/useChatProduction';
import { AlexCostBreakdown, RexLeadDashboard, LexiOnboarding } from '@/components/ui/AgentComponents';

// Import viewport optimization system
import { 
  detectViewportSize, 
  getChatResponsiveClasses, 
  CHAT_VIEWPORT_CONFIGS,
  MESSAGE_SPACING_CONFIGS,
  THREAD_GROUPING_CONFIGS,
  type ViewportSize 
} from '@/lib/chat-viewport';

// Agent Configuration
export type AgentType = 'lexi' | 'alex' | 'rex';

export const AGENT_CONFIG = {
  lexi: {
    name: 'Lexi the Liaison',
    avatar: '💫',
    color: 'bg-primary',
    textColor: 'text-primary',
    description: 'Onboarding & Support Specialist',
    isPremium: false
  },
  alex: {
    name: 'Alex the Assessor',
    avatar: '📊',
    color: 'bg-green-600',
    textColor: 'text-green-600', 
    description: 'Cost Analysis & Bidding Expert',
    isPremium: true
  },
  rex: {
    name: 'Rex the Retriever',
    avatar: '🔍',
    color: 'bg-secondary',
    textColor: 'text-secondary',
    description: 'Lead Generation & Research Specialist',
    isPremium: true
  }
};

interface UnifiedChatInterfaceProps {
  className?: string;
  defaultAgent?: AgentType;
  forceViewport?: ViewportSize;
}

export default function UnifiedChatInterface({ 
  className,
  defaultAgent = 'lexi',
  forceViewport
}: UnifiedChatInterfaceProps) {
  // Viewport Detection with override capability
  const [currentViewport, setCurrentViewport] = useState<ViewportSize>(
    forceViewport || (typeof window !== 'undefined' ? detectViewportSize() : 'desktop_medium')
  );
  
  // Dynamic viewport configuration
  const viewportConfig = CHAT_VIEWPORT_CONFIGS[currentViewport];
  const responsiveClasses = getChatResponsiveClasses(currentViewport);
  const spacingConfig = MESSAGE_SPACING_CONFIGS[viewportConfig.messageSpacing];
  const threadConfig = THREAD_GROUPING_CONFIGS[viewportConfig.threadGrouping];

  // Enhanced chat system integration
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

  // Local state management
  const [activeAgent, setActiveAgent] = useState<AgentType>(defaultAgent);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Auto-collapse sidebar on smaller viewports
    return ['mobile', 'tablet_portrait'].includes(currentViewport);
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [textSize, setTextSize] = useState(1); // Text scaling factor

  // Refs for interaction
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current chat instance
  const currentChat = getChatInstance(activeAgent);
  const processedMessages = processMessages(currentChat.messages, activeAgent);

  // Handle agent switching with enhanced UX
  const handleAgentSwitch = useCallback((agentType: AgentType) => {
    if (canStartAgent(agentType)) {
      setActiveAgent(agentType);
      openChat(agentType);
      
      // Focus input after agent switch
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [canStartAgent, openChat]);

  // Viewport change detection
  useEffect(() => {
    if (forceViewport) return; // Don't auto-detect if viewport is forced

    const handleResize = () => {
      const newViewport = detectViewportSize();
      if (newViewport !== currentViewport) {
        setCurrentViewport(newViewport);
        
        // Auto-collapse sidebar on smaller viewports
        if (['mobile', 'tablet_portrait'].includes(newViewport)) {
          setSidebarCollapsed(true);
        } else if (newViewport.startsWith('desktop') || newViewport.includes('wide')) {
          setSidebarCollapsed(false);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentViewport, forceViewport]);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModKey = e.metaKey || e.ctrlKey;
      
      if (isModKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            handleAgentSwitch('lexi');
            break;
          case '2':
            e.preventDefault();
            if (canStartAgent('alex')) handleAgentSwitch('alex');
            break;
          case '3':
            e.preventDefault();
            if (canStartAgent('rex')) handleAgentSwitch('rex');
            break;
          case 'k':
            e.preventDefault();
            setShowKeyboardShortcuts(true);
            break;
          case 'b':
            e.preventDefault();
            setSidebarCollapsed(!sidebarCollapsed);
            break;
          case 'n':
            e.preventDefault();
            startNewConversation(activeAgent);
            break;
          case 'f':
            e.preventDefault();
            // Focus search if sidebar is open
            if (!sidebarCollapsed) {
              const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
              searchInput?.focus();
            }
            break;
          case '=':
          case '+':
            e.preventDefault();
            setTextSize(prev => Math.min(prev + 0.1, 1.5));
            break;
          case '-':
            e.preventDefault();
            setTextSize(prev => Math.max(prev - 0.1, 0.8));
            break;
          case '0':
            e.preventDefault();
            setTextSize(1);
            break;
        }
      }

      // Non-modifier key shortcuts
      if (e.key === 'Escape') {
        if (inputRef.current) {
          inputRef.current.value = '';
          inputRef.current.blur();
        }
        setShowKeyboardShortcuts(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeAgent, sidebarCollapsed, canStartAgent, startNewConversation, handleAgentSwitch]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [processedMessages.length]);

  // Enhanced message sending
  const handleSendMessage = useCallback(async () => {
    const input = inputRef.current;
    if (!input?.value.trim() || !canSendMessage(activeAgent)) return;

    const message = input.value.trim();
    input.value = '';

    // Use existing chat instance
    currentChat.append({
      role: 'user',
      content: message,
    });

    // Re-focus input for continuous typing
    input.focus();
  }, [activeAgent, canSendMessage, currentChat]);

  // Enhanced UI asset rendering
  const renderUIAssets = useCallback((message: { ui_assets?: { type: string; data: Record<string, unknown> } }) => {
    if (!message.ui_assets) return null;

    const { type, data } = message.ui_assets;

    try {
      switch (type) {
        case 'alex_cost_breakdown':
        case 'alex_timeline_chart':
        case 'alex_material_calculator':
        case 'alex_competitive_analysis':
          return <AlexCostBreakdown data={data as Parameters<typeof AlexCostBreakdown>[0]['data']} />;
        
        case 'rex_lead_dashboard':
        case 'rex_market_analysis':
        case 'rex_competitor_research':
          return <RexLeadDashboard data={data as Parameters<typeof RexLeadDashboard>[0]['data']} />;
        
        case 'lexi_onboarding':
        case 'lexi_progress_tracker':
        case 'lexi_feature_guide':
          return <LexiOnboarding data={data as Parameters<typeof LexiOnboarding>[0]['data']} />;
        
        case 'upgrade_prompt':
          return (
            <Card className="border-gradient bg-gradient-to-r from-primary/10 to-secondary/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Scale Tier Features Available</h4>
                    <p className="text-sm text-muted-foreground">
                      Upgrade to access advanced agent capabilities
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        
        default:
          return (
            <Card className="border-dashed">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">
                  UI Asset: {type}
                </p>
              </CardContent>
            </Card>
          );
      }
    } catch (error) {
      console.warn('Error rendering UI asset:', error);
      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-3">
            <p className="text-xs text-destructive">
              Failed to render {type}
            </p>
          </CardContent>
        </Card>
      );
    }
  }, []);

  // Filter and group conversations
  const filteredConversations = useMemo(() => {
    return Object.values(conversations).filter(conv => 
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.metadata?.project_context?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const groupedConversations = useMemo(() => {
    return filteredConversations.reduce((groups, conv) => {
      const date = new Date(conv.created_at).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(conv);
      return groups;
    }, {} as Record<string, typeof filteredConversations>);
  }, [filteredConversations]);

  // Keyboard shortcuts modal
  const KeyboardShortcutsModal = () => (
    <AnimatePresence>
      {showKeyboardShortcuts && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={() => setShowKeyboardShortcuts(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-background border rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <Keyboard className="h-5 w-5" />
              <h3 className="font-semibold">Keyboard Shortcuts</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Switch to Lexi</span>
                <Badge variant="outline">⌘ + 1</Badge>
              </div>
              <div className="flex justify-between">
                <span>Switch to Alex</span>
                <Badge variant="outline">⌘ + 2</Badge>
              </div>
              <div className="flex justify-between">
                <span>Switch to Rex</span>
                <Badge variant="outline">⌘ + 3</Badge>
              </div>
              <div className="flex justify-between">
                <span>Toggle Sidebar</span>
                <Badge variant="outline">⌘ + B</Badge>
              </div>
              <div className="flex justify-between">
                <span>New Conversation</span>
                <Badge variant="outline">⌘ + N</Badge>
              </div>
              <div className="flex justify-between">
                <span>Search</span>
                <Badge variant="outline">⌘ + F</Badge>
              </div>
              <div className="flex justify-between">
                <span>Send Message</span>
                <Badge variant="outline">⌘ + Enter</Badge>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex bg-background border rounded-lg overflow-hidden shadow-lg",
        responsiveClasses.container,
        className
      )}
      data-text-size={textSize}
    >
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Enhanced Sidebar */}
        {!sidebarCollapsed && (
          <>
            <ResizablePanel 
              defaultSize={viewportConfig.sidebarMode === 'persistent' ? 25 : 20} 
              minSize={15} 
              maxSize={40}
              className={cn(
                viewportConfig.sidebarMode === 'overlay' && 'absolute z-20 h-full'
              )}
            >
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex flex-col h-full border-r bg-muted/20"
              >
                {/* Enhanced Sidebar Header */}
                <div className={cn("border-b bg-background/50 backdrop-blur", responsiveClasses.header)}>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <h2 className="font-semibold">Conversations</h2>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowKeyboardShortcuts(true)}
                        className="h-8 w-8"
                        title="Keyboard Shortcuts (⌘+K)"
                      >
                        <Keyboard className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarCollapsed(true)}
                        className="h-8 w-8"
                        title="Collapse Sidebar (⌘+B)"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Enhanced Search */}
                  <div className="p-4 pt-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder={`Search ${Object.keys(conversations).length} conversations...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {/* Agent Quick Switcher */}
                  <div className="px-4 pb-4">
                    <div className="flex gap-1">
                      {Object.entries(AGENT_CONFIG).map(([key, config]) => (
                        <Button
                          key={key}
                          variant={activeAgent === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAgentSwitch(key as AgentType)}
                          disabled={config.isPremium && !isScaleTier}
                          className="flex-1"
                          title={`${config.name} (⌘+${Object.keys(AGENT_CONFIG).indexOf(key) + 1})`}
                        >
                          <span className="mr-1">{config.avatar}</span>
                          {config.name.split(' ')[0]}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => startNewConversation(activeAgent)}
                      title="New Conversation (⌘+N)"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Chat
                    </Button>
                  </div>
                </div>

                {/* Enhanced Conversation List */}
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {Object.keys(groupedConversations).length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No conversations yet</p>
                        <p className="text-xs text-muted-foreground">Start chatting with an agent!</p>
                      </div>
                    ) : (
                      Object.entries(groupedConversations).map(([date, convs]) => (
                        <div key={date} className="mb-4">
                          {threadConfig.showDateHeaders && (
                            <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2">
                              {formatDistanceToNow(new Date(date), { addSuffix: true })}
                            </h3>
                          )}
                          {convs.map((conv) => (
                            <motion.div
                              key={conv.id}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <Card 
                                className={cn(
                                  "mb-2 cursor-pointer transition-all duration-200",
                                  "hover:bg-muted/50 hover:border-primary/20",
                                  activeConversationId === conv.id && "bg-muted border-primary/50",
                                  threadConfig.threadPadding
                                )}
                                data-thread-height={threadConfig.threadHeight}
                                onClick={() => {
                                  setActiveAgent(conv.agent);
                                  openChat(conv.agent);
                                }}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        {threadConfig.showAgentIcon && (
                                          <span className="text-sm">
                                            {AGENT_CONFIG[conv.agent].avatar}
                                          </span>
                                        )}
                                        <Badge 
                                          variant="secondary" 
                                          className={cn("text-xs", AGENT_CONFIG[conv.agent].textColor)}
                                        >
                                          {AGENT_CONFIG[conv.agent].name.split(' ')[0]}
                                        </Badge>
                                      </div>
                                      <p className="text-sm font-medium truncate">
                                        {conv.title.length > threadConfig.maxTitleLength 
                                          ? `${conv.title.slice(0, threadConfig.maxTitleLength)}...`
                                          : conv.title
                                        }
                                      </p>
                                      {threadConfig.showPreview && (
                                        <p className="text-xs text-muted-foreground mt-1 truncate">
                                          {conv.messages[conv.messages.length - 1]?.content?.slice(0, 50) || 'No messages'}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-2 mt-2">
                                        {threadConfig.showMessageCount && (
                                          <span className="text-xs text-muted-foreground">
                                            {conv.messages.length} msgs
                                          </span>
                                        )}
                                        {threadConfig.showLastActivity && (
                                          <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                                          </span>
                                        )}
                                      </div>
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
                      ))
                    )}
                  </div>
                </ScrollArea>
              </motion.div>
            </ResizablePanel>
            <ResizableHandle />
          </>
        )}

        {/* Enhanced Main Chat Area */}
        <ResizablePanel defaultSize={sidebarCollapsed ? 100 : 75}>
          <div className="flex flex-col h-full">
            {/* Enhanced Chat Header */}
            <div className={cn("border-b bg-background/80 backdrop-blur flex items-center justify-between px-4", responsiveClasses.header)}>
              <div className="flex items-center gap-3">
                {sidebarCollapsed && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarCollapsed(false)}
                    title="Show Sidebar (⌘+B)"
                  >
                    <Maximize2 className="h-5 w-5" />
                  </Button>
                )}
                
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "rounded-full flex items-center justify-center text-white",
                    responsiveClasses.avatar,
                    AGENT_CONFIG[activeAgent].color
                  )}>
                    {AGENT_CONFIG[activeAgent].avatar}
                  </div>
                  <div>
                    <h1 className="font-semibold text-lg">{AGENT_CONFIG[activeAgent].name}</h1>
                    <p className="text-sm text-muted-foreground">
                      {AGENT_CONFIG[activeAgent].description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={isAgentExecuting(activeAgent) ? "default" : "secondary"} className="animate-pulse">
                  {isAgentExecuting(activeAgent) ? 'Processing...' : 'Online'}
                </Badge>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Enhanced Messages Area */}
            <ScrollArea className="flex-1">
              <div className={cn("p-4", responsiveClasses.messageContainer)}>
                {processedMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className={cn(
                      "rounded-full mx-auto mb-4 flex items-center justify-center text-white",
                      responsiveClasses.avatar,
                      AGENT_CONFIG[activeAgent].color
                    )}>
                      {AGENT_CONFIG[activeAgent].avatar}
                    </div>
                    <h3 className="font-semibold mb-2">
                      Chat with {AGENT_CONFIG[activeAgent].name}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                      {AGENT_CONFIG[activeAgent].description}. Ask questions, get assistance, and unlock professional contractor features.
                    </p>
                  </div>
                ) : (
                  processedMessages.map((message, index) => (
                    <motion.div
                      key={message.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex gap-3 mb-4",
                        message.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role !== 'user' && (
                        <div className="flex-shrink-0">
                          <div className={cn(
                            "rounded-full flex items-center justify-center text-white",
                            responsiveClasses.avatar,
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
                          "rounded-lg",
                          responsiveClasses.bubble,
                          message.role === 'user' 
                            ? "bg-primary text-primary-foreground ml-auto" 
                            : "bg-muted"
                        )}>
                          <p className={cn("whitespace-pre-wrap", spacingConfig.fontSize)}>
                            {message.content}
                          </p>
                        </div>
                        
                        {/* Enhanced UI asset rendering */}
                        {renderUIAssets(message)}
                      </div>
                    </motion.div>
                  ))
                )}
                
                {/* Enhanced loading indicator */}
                {currentChat.isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3"
                  >
                    <div className={cn(
                      "rounded-full flex items-center justify-center text-white",
                      responsiveClasses.avatar,
                      AGENT_CONFIG[activeAgent].color
                    )}>
                      {AGENT_CONFIG[activeAgent].avatar}
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <motion.div 
                          className="flex space-x-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="rounded-full bg-muted-foreground h-2 w-2"
                              animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{ 
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2
                              }}
                            />
                          ))}
                        </motion.div>
                        <span className="text-sm text-muted-foreground">
                          {AGENT_CONFIG[activeAgent].name} is thinking...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Enhanced Input Area */}
            <div className={cn("border-t bg-background/80 backdrop-blur", responsiveClasses.input)}>
              <div className="p-4">
                <div className="flex gap-3">
                  <Input
                    ref={inputRef}
                    placeholder={`Message ${AGENT_CONFIG[activeAgent].name}... (⌘+Enter to send)`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={!canSendMessage(activeAgent) || currentChat.isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!canSendMessage(activeAgent) || currentChat.isLoading}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Enhanced usage indicator */}
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span>
                    {isScaleTier ? 'Scale Plan' : 'Growth Plan'} • 
                    {processedMessages.length}/{limits.messagesPerChatLimit} messages • 
                    {currentViewport} viewport
                  </span>
                  {isAgentExecuting(activeAgent) && (
                    <Badge variant="secondary" className="animate-pulse">
                      Processing...
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal />
    </div>
  );
}
