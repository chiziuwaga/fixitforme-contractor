'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Minus, X, Loader2 } from 'lucide-react';
import { AlexCostBreakdown, RexLeadDashboard, LexiOnboarding, UpgradePrompt, SystemMessage } from '@/components/ui/AgentComponents';
import { 
  CostBreakdownChart, 
  LeadDistributionChart, 
  TimelineChart
} from '@/components/ui/Charts';
import { BRAND } from '@/lib/brand';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
}

export interface ChatWindowProps {
  agentType: AgentType;
  isMinimized?: boolean;
  onMinimize: () => void;
  onClose: () => void;
  onSendMessage: (message: string, agentType: AgentType) => void;
  messages: Message[];
  isTyping?: boolean;
}

const AGENT_CONFIG = {
  lexi: {
    name: 'Lexi the Liaison',
    color: 'from-primary to-primary/80',
    bgColor: 'bg-gradient-to-r from-primary to-primary/80',
    avatar: '👩‍💼',
    description: 'Onboarding Guide',
  },
  alex: {
    name: 'Alex the Assessor',
    color: 'from-success to-success/80',
    bgColor: 'bg-gradient-to-r from-success to-success/80',
    avatar: '📊',
    description: 'Bidding Assistant',
  },
  rex: {
    name: 'Rex the Retriever',
    color: 'from-warning to-warning/80',
    bgColor: 'bg-gradient-to-r from-warning to-warning/80',
    avatar: '🔍',
    description: 'Lead Generator',
  },
  system: {
    name: 'System',
    color: 'from-muted to-muted-foreground',
    bgColor: 'bg-gradient-to-r from-muted to-muted-foreground',
    avatar: '⚙️',
    description: 'System Notification',
  },
};

function GenerativeUIRenderer({ message }: { message: Message }) {
  const { ui_assets, actions } = message;

  if (!ui_assets) return null;

  const renderComponent = () => {
    switch (ui_assets.type) {
      case 'cost_breakdown':
        return (
          <AlexCostBreakdown 
            data={ui_assets.data as Parameters<typeof AlexCostBreakdown>[0]['data']} 
            actions={actions || []}
          />
        );
      
      case 'lead_dashboard':
        return (
          <RexLeadDashboard 
            data={ui_assets.data as Parameters<typeof RexLeadDashboard>[0]['data']} 
            actions={actions || []}
          />
        );
      
      case 'onboarding_progress':
        return (
          <LexiOnboarding 
            data={ui_assets.data as Parameters<typeof LexiOnboarding>[0]['data']} 
            actions={actions || []}
          />
        );
      
      case 'upgrade_prompt':
        return (
          <UpgradePrompt 
            data={ui_assets.data as Parameters<typeof UpgradePrompt>[0]['data']}
          />
        );
      
      case 'system_message':
        return (
          <SystemMessage 
            message={ui_assets.data.message as string}
            icon={ui_assets.data.icon as React.ElementType}
          />
        );
      
      case 'cost_breakdown_chart':
        return (
          <CostBreakdownChart 
            {...(ui_assets.data as unknown as React.ComponentProps<typeof CostBreakdownChart>)}
          />
        );

      case 'lead_distribution_chart':
        return (
          <LeadDistributionChart 
            {...(ui_assets.data as unknown as React.ComponentProps<typeof LeadDistributionChart>)}
          />
        );

      case 'timeline_chart':
        return (
          <TimelineChart 
            {...(ui_assets.data as unknown as React.ComponentProps<typeof TimelineChart>)}
          />
        );
      
      default:
        return <div />; // Fallback for unknown types
    }
  };

  return (
    <div className="my-4 space-y-3">
      {renderComponent()}
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {actions.map((action, i) => (
            <Button 
              key={i} 
              variant={action.style === 'primary' ? 'default' : action.style === 'secondary' ? 'secondary' : 'outline'}
              size="sm"
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChatWindow({ 
    agentType, 
    isMinimized, 
    onMinimize, 
    onClose, 
    onSendMessage, 
    messages, 
    isTyping 
}: ChatWindowProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const config = AGENT_CONFIG[agentType];

  const handleLocalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue, agentType);
    setInputValue('');
  };

  useEffect(() => {
    // Scroll to bottom on new message
    if (viewport.current) {
      viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "fixed bottom-6 right-24 w-96 bg-card border border-border rounded-xl shadow-2xl brand-shadow-lg overflow-hidden",
        "z-40",
        isMinimized ? "h-16" : "h-[500px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r bg-muted">
        <div className="flex items-center gap-3">
          <Avatar className={cn("h-8 w-8", config.bgColor)}>
            <AvatarFallback className="text-white text-sm">
              {config.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground text-sm">{config.name}</h3>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMinimize}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMinimized ? 'Expand' : 'Minimize'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Close Chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Messages and Input */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col h-[calc(500px-64px)]"
          >
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={viewport}>
              <div className="space-y-4">
                {messages.map((message) => {
                  const msgConfig = message.agentType ? AGENT_CONFIG[message.agentType] : AGENT_CONFIG.lexi;
                  const isUser = message.role === 'user';
                  const isSystem = message.role === 'system';

                  if (isSystem) {
                    return <SystemMessage key={message.id} message={message.content} />
                  }

                  return (
                    <motion.div 
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 items-start"
                    >
                      {!isUser && (
                        <Avatar className={cn("h-6 w-6 flex-shrink-0 mt-1", msgConfig.bgColor)}>
                          <AvatarFallback className="text-white text-xs">
                            {msgConfig.avatar}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={cn(
                        "rounded-lg p-3 max-w-[85%] brand-transition",
                        isUser 
                          ? "bg-gradient-to-r from-primary to-primary/80 text-white ml-auto" 
                          : "bg-muted text-foreground"
                      )}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <GenerativeUIRenderer message={message} />
                      </div>
                      
                      {isUser && (
                        <Avatar className="h-6 w-6 flex-shrink-0 mt-1 bg-muted">
                          <AvatarFallback className="text-white text-xs">
                            U
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  );
                })}
                
                {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3 items-center"
                  >
                    <Avatar className={cn("h-6 w-6", config.bgColor)}>
                      <AvatarFallback className="text-white text-xs">
                        {config.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{config.name} is typing...</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border p-3">
              <form onSubmit={handleLocalSubmit} className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Message @${agentType}...`}
                  className="flex-1 brand-focus"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!inputValue.trim()}
                  className={cn(
                    "h-10 w-10 p-0 rounded-full brand-transition",
                    config.bgColor,
                    "hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
