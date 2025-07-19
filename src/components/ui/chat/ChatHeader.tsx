'use client';

import { Minimize2, Maximize2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentType, AGENT_CONFIG } from '../UnifiedChatInterface';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  activeAgent: AgentType;
  isLoading: boolean;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  onToggleMinimize?: () => void;
}

export function ChatHeader({ 
    activeAgent, 
    isLoading, 
    sidebarCollapsed, 
    setSidebarCollapsed, 
    onToggleMinimize 
}: ChatHeaderProps) {
  const agentConfig = AGENT_CONFIG[activeAgent];

  return (
    <div className="h-16 border-b flex items-center px-4 md:px-6 flex-shrink-0">
      {sidebarCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(false)}
          className="mr-2"
        >
          <Maximize2 className="h-5 w-5" />
        </Button>
      )}
      
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-lg text-white",
          agentConfig.color
        )}>
          {agentConfig.avatar}
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-base">
            {agentConfig.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Typing...' : 'Online'}
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center space-x-1">
        {onToggleMinimize && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMinimize}
          >
            <Minimize2 className="h-5 w-5" />
          </Button>
        )}
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
