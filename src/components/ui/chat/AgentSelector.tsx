'use client';

import { motion } from 'framer-motion';
import { AgentType, AGENT_CONFIG } from '../UnifiedChatInterface';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AgentSelectorProps {
  activeAgent: AgentType;
  onAgentSwitch: (agent: AgentType) => void;
  isScaleTier: boolean;
}

export function AgentSelector({ activeAgent, onAgentSwitch, isScaleTier }: AgentSelectorProps) {
  return (
    <div className="space-y-2">
      {(Object.keys(AGENT_CONFIG) as AgentType[]).map((agent) => {
        const config = AGENT_CONFIG[agent];
        const isActive = activeAgent === agent;
        const isDisabled = config.isPremium && !isScaleTier;

        return (
          <Button
            key={agent}
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start text-left h-auto p-3",
              isActive && `${config.color} text-white hover:${config.color}/90`,
              isDisabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !isDisabled && onAgentSwitch(agent)}
            disabled={isDisabled}
            title={isDisabled ? `${config.name} requires Scale tier` : `Switch to ${config.name}`}
          >
            <span className="mr-3 text-lg">{config.avatar}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{config.name}</p>
              <p className={cn("text-xs truncate", isActive ? "text-white/80" : "text-muted-foreground")}>
                {config.description}
              </p>
            </div>
            {config.isPremium && (
              <Badge variant={isActive ? "outline" : "secondary"} className="ml-2 text-xs bg-white/20 text-white">
                Scale
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}
