/**
 * Message Interaction Panel - Enhanced message engagement
 * 
 * Provides quick actions, reactions, and smart suggestions
 */

import React, { useState } from 'react';
import { 
  Heart, 
  Copy, 
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MessageActionsProps {
  messageId: string;
  content: string;
  agent: 'lexi' | 'alex' | 'rex';
  onReaction?: (messageId: string, reaction: string) => void;
  onFollowUp?: (messageId: string, prompt: string) => void;
  className?: string;
}

export function MessageActions({ 
  messageId, 
  content, 
  agent,
  onReaction,
  onFollowUp,
  className 
}: MessageActionsProps) {
  const [isReacted, setIsReacted] = useState(false);
  
  // Smart follow-up prompts based on agent
  const getFollowUpPrompts = () => {
    switch (agent) {
      case 'lexi':
        return [
          'Can you explain this in more detail?',
          'What are the next steps?',
          'How do I get started with this?'
        ];
      case 'alex':
        return [
          'Can you break down the costs?',
          'What factors affect this price?',
          'Show me alternative options'
        ];
      case 'rex':
        return [
          'Find similar opportunities',
          'What location details matter?',
          'How competitive is this market?'
        ];
      default:
        return ['Tell me more', 'What should I do next?'];
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Message copied to clipboard');
    } catch {
      toast.error('Failed to copy message');
    }
  };

  const handleReaction = (reaction: string) => {
    setIsReacted(true);
    onReaction?.(messageId, reaction);
    toast.success('Feedback recorded');
    
    // Reset after animation
    setTimeout(() => setIsReacted(false), 2000);
  };

  const handleFollowUp = (prompt: string) => {
    onFollowUp?.(messageId, prompt);
  };

  return (
    <TooltipProvider>
      <div className={cn(
        "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
        className
      )}>
        {/* Quick Reactions */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 w-7 p-0 hover:bg-green-50 hover:text-green-600",
                  isReacted && "bg-green-100 text-green-600"
                )}
                onClick={() => handleReaction('helpful')}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mark as helpful</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                onClick={() => handleReaction('not_helpful')}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Needs improvement</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                onClick={() => handleReaction('save')}
              >
                <Heart className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save for later</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-0.5 ml-1 border-l border-border/50 pl-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleCopy}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy message</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => handleFollowUp('Can you expand on this?')}
              >
                <MessageSquare className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ask follow-up question</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Smart Follow-up Suggestions */}
        <div className="flex items-center gap-0.5 ml-1 border-l border-border/50 pl-1">
          {getFollowUpPrompts().slice(0, 2).map((prompt, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs hover:bg-secondary/50"
                  onClick={() => handleFollowUp(prompt)}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {prompt.split(' ').slice(0, 2).join(' ')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{prompt}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default MessageActions;
