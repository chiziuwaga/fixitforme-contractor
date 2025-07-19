'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Minimize2 } from 'lucide-react';
import { AgentSelector } from './AgentSelector';
import { ThreadList } from './ThreadList';
import { AgentType, ChatThread } from '../UnifiedChatInterface';

interface ChatSidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  activeAgent: AgentType;
  onAgentSwitch: (agent: AgentType) => void;
  isScaleTier: boolean;
  threads: ChatThread[];
  activeThread: string | null;
  onThreadSelect: (threadId: string) => void;
  onNewThread: () => void;
}

export function ChatSidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  activeAgent,
  onAgentSwitch,
  isScaleTier,
  threads,
  activeThread,
  onThreadSelect,
  onNewThread,
}: ChatSidebarProps) {
  return (
    <AnimatePresence>
      {!sidebarCollapsed && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="border-r bg-muted/30 flex flex-col overflow-hidden"
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">AI Agents</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(true)}
                className="h-8 w-8"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
            <AgentSelector 
              activeAgent={activeAgent}
              onAgentSwitch={onAgentSwitch}
              isScaleTier={isScaleTier}
            />
          </div>

          {/* Thread List */}
          <ThreadList 
            threads={threads}
            activeThread={activeThread}
            onThreadSelect={onThreadSelect}
            onNewThread={onNewThread}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
