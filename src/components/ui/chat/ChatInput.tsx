'use client';

import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AgentType, AGENT_CONFIG } from '../UnifiedChatInterface';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  activeAgent: AgentType;
}

export function ChatInput({ input, setInput, handleSendMessage, isLoading, activeAgent }: ChatInputProps) {
  const agentConfig = AGENT_CONFIG[activeAgent];

  return (
    <div className="border-t bg-background p-4">
        <form onSubmit={handleSendMessage}>
            <div className="relative">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Message ${agentConfig.name}...`}
                    className="pr-12"
                    disabled={isLoading}
                />
                <Button
                    type="submit"
                    size="icon"
                    className={cn("absolute top-1/2 right-1.5 -translate-y-1/2 h-8 w-8", agentConfig.color)}
                    disabled={isLoading || !input.trim()}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </form>
    </div>
  );
}
