/**
 * Quick Actions Panel - Smart conversation shortcuts
 * 
 * Provides contextual quick actions for enhanced productivity
 */

import React, { useState } from 'react';
import { 
  Search, 
  Bookmark, 
  Clock, 
  Zap,
  Filter,
  Star,
  MessageCircle,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  onNewConversation?: (agent: 'lexi' | 'alex' | 'rex') => void;
  onQuickSearch?: () => void;
  onShowBookmarks?: () => void;
  onShowRecent?: () => void;
  recentCount?: number;
  bookmarkCount?: number;
  className?: string;
}

export function QuickActions({ 
  onNewConversation,
  onQuickSearch,
  onShowBookmarks,
  onShowRecent,
  recentCount = 0,
  bookmarkCount = 0,
  className 
}: QuickActionsProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);

  // Smart conversation starters
  const conversationStarters = [
    {
      agent: 'lexi' as const,
      title: 'Get Guidance',
      description: 'Ask for help with decisions or guidance',
      icon: Lightbulb,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      prompt: "I need guidance on..."
    },
    {
      agent: 'alex' as const,
      title: 'Estimate Costs',
      description: 'Get pricing and cost estimates',
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
      prompt: "Help me estimate costs for..."
    },
    {
      agent: 'rex' as const,
      title: 'Find Opportunities',
      description: 'Search for leads and opportunities',
      icon: Search,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      prompt: "Help me find opportunities for..."
    }
  ];

  const handleActionClick = (action: string, callback?: () => void) => {
    setActiveAction(action);
    callback?.();
    
    // Reset active state after animation
    setTimeout(() => setActiveAction(null), 200);
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)}>
        {/* Quick Start Conversations */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Zap className="h-3 w-3" />
            Quick Start
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {conversationStarters.map((starter) => {
              const Icon = starter.icon;
              return (
                <Tooltip key={starter.agent}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex flex-col items-center gap-2 h-auto p-3 text-center",
                        starter.bgColor,
                        "hover:scale-105 transition-all duration-200",
                        activeAction === starter.agent && "scale-95"
                      )}
                      onClick={() => handleActionClick(starter.agent, () => 
                        onNewConversation?.(starter.agent)
                      )}
                    >
                      <Icon className={cn("h-4 w-4", starter.color)} />
                      <div className="space-y-1">
                        <div className="text-xs font-medium">{starter.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {starter.description}
                        </div>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Start: &ldquo;{starter.prompt}&rdquo;</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Action Shortcuts */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Filter className="h-3 w-3" />
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex items-center gap-2 hover:scale-105 transition-all duration-200",
                    activeAction === 'search' && "scale-95"
                  )}
                  onClick={() => handleActionClick('search', onQuickSearch)}
                >
                  <Search className="h-3 w-3" />
                  Search All
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Search across all conversations</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex items-center gap-2 hover:scale-105 transition-all duration-200",
                    activeAction === 'bookmarks' && "scale-95"
                  )}
                  onClick={() => handleActionClick('bookmarks', onShowBookmarks)}
                >
                  <Bookmark className="h-3 w-3" />
                  Bookmarks
                  {bookmarkCount > 0 && (
                    <Badge variant="secondary" className="h-4 text-xs px-1">
                      {bookmarkCount}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View saved conversations</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex items-center gap-2 hover:scale-105 transition-all duration-200",
                    activeAction === 'recent' && "scale-95"
                  )}
                  onClick={() => handleActionClick('recent', onShowRecent)}
                >
                  <Clock className="h-3 w-3" />
                  Recent
                  {recentCount > 0 && (
                    <Badge variant="secondary" className="h-4 text-xs px-1">
                      {recentCount}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Recently accessed conversations</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Productivity Tips */}
        <div className="p-3 rounded-lg bg-muted/30 border border-dashed">
          <div className="flex items-start gap-2">
            <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-1 text-xs">
              <div className="font-medium text-foreground">Pro Tip</div>
              <div className="text-muted-foreground">
                Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+K</kbd> for quick search, 
                or <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+N</kbd> for new conversation
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default QuickActions;
