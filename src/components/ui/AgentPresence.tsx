/**
 * Enhanced Agent Presence - Rich typing indicators and agent status
 * 
 * Provides immersive agent presence feedback with personality
 */

import React, { useEffect, useState } from 'react';
import { Brain, Cpu, Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentPresenceProps {
  agent: 'lexi' | 'alex' | 'rex';
  isTyping: boolean;
  activity?: 'thinking' | 'researching' | 'analyzing' | 'calculating';
  className?: string;
}

export function AgentPresence({ 
  agent, 
  isTyping, 
  activity = 'thinking',
  className 
}: AgentPresenceProps) {
  const [dots, setDots] = useState('');
  
  // Animated typing dots
  useEffect(() => {
    if (!isTyping) {
      setDots('');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isTyping]);

  // Agent-specific configurations
  const getAgentConfig = () => {
    switch (agent) {
      case 'lexi':
        return {
          name: 'Lexi',
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/20',
          icon: Sparkles,
          activities: {
            thinking: 'crafting guidance',
            researching: 'reviewing options', 
            analyzing: 'understanding needs',
            calculating: 'planning steps'
          }
        };
      case 'alex':
        return {
          name: 'Alex',
          color: 'text-green-600',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          icon: Cpu,
          activities: {
            thinking: 'analyzing costs',
            researching: 'finding materials',
            analyzing: 'comparing prices', 
            calculating: 'running numbers'
          }
        };
      case 'rex':
        return {
          name: 'Rex',
          color: 'text-secondary',
          bgColor: 'bg-secondary/10',
          borderColor: 'border-secondary/20',
          icon: Search,
          activities: {
            thinking: 'scanning leads',
            researching: 'checking sources',
            analyzing: 'evaluating prospects',
            calculating: 'ranking opportunities'
          }
        };
      default:
        return {
          name: 'Agent',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/10',
          borderColor: 'border-muted/20',
          icon: Brain,
          activities: {
            thinking: 'processing',
            researching: 'searching',
            analyzing: 'analyzing',
            calculating: 'calculating'
          }
        };
    }
  };

  const config = getAgentConfig();
  const Icon = config.icon;

  if (!isTyping) {
    return null;
  }

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border",
      config.bgColor,
      config.borderColor,
      "animate-in slide-in-from-bottom-2 duration-300",
      className
    )}>
      {/* Agent Avatar with Pulse */}
      <div className={cn(
        "relative flex items-center justify-center w-8 h-8 rounded-full",
        config.bgColor,
        "ring-2 ring-offset-1",
        config.borderColor.replace('border-', 'ring-')
      )}>
        <Icon className={cn("h-4 w-4", config.color)} />
        
        {/* Pulse Animation */}
        <div className={cn(
          "absolute inset-0 rounded-full animate-ping",
          config.bgColor,
          "opacity-20"
        )} />
      </div>

      {/* Status Text */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("font-medium text-sm", config.color)}>
            {config.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {config.activities[activity]}{dots}
          </span>
        </div>
        
        {/* Activity Progress Bar */}
        <div className="mt-1 w-16 h-1 bg-border rounded-full overflow-hidden">
          <div className={cn(
            "h-full rounded-full animate-pulse",
            config.color.replace('text-', 'bg-'),
            "w-1/2 animate-[slide_1s_ease-in-out_infinite_alternate]"
          )} />
        </div>
      </div>

      {/* Thinking Indicator */}
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 h-1.5 rounded-full typing-dot",
              config.color.replace('text-', 'bg-'),
              "animate-pulse"
            )}
            data-delay={i * 0.2}
          />
        ))}
      </div>
    </div>
  );
}

// Enhanced typing indicator for message area
export function TypingBubble({ 
  agent, 
  className 
}: { 
  agent: 'lexi' | 'alex' | 'rex';
  className?: string;
}) {
  const config = getAgentConfig(agent);

  return (
    <div className={cn(
      "flex items-center gap-2 p-3 rounded-2xl max-w-20",
      config.bgColor,
      "animate-in slide-in-from-left-2 duration-300",
      className
    )}>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full typing-dot",
              config.color.replace('text-', 'bg-'),
              "animate-bounce"
            )}
            data-delay={i * 0.15}
          />
        ))}
      </div>
    </div>
  );
}

// Helper function for consistent agent configs
function getAgentConfig(agent: 'lexi' | 'alex' | 'rex') {
  switch (agent) {
    case 'lexi':
      return {
        color: 'text-primary',
        bgColor: 'bg-primary/5',
      };
    case 'alex':
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-500/5',
      };
    case 'rex':
      return {
        color: 'text-secondary',
        bgColor: 'bg-secondary/5',
      };
  }
}

export default AgentPresence;
