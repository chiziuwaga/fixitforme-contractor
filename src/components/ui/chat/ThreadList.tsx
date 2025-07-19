'use client';

import { Button } from '@/components/ui/button';
import { Plus, Clock } from 'lucide-react';
import { ChatThread } from '../UnifiedChatInterface';
import { cn } from '@/lib/utils';

interface ThreadListProps {
  threads: ChatThread[];
  activeThread: string | null;
  onThreadSelect: (threadId: string) => void;
  onNewThread: () => void;
}

export function ThreadList({ threads, activeThread, onThreadSelect, onNewThread }: ThreadListProps) {
  // Vercel-style date grouping
  const groupThreadsByDate = (threadList: ChatThread[]) => {
    const groups: Record<string, ChatThread[]> = {
      Today: [],
      Yesterday: [],
      'Last 7 Days': [],
      'Last 30 Days': [],
      Older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    threadList.forEach((thread) => {
      const threadDate = new Date(thread.timestamp);
      if (threadDate >= today) groups.Today.push(thread);
      else if (threadDate >= yesterday) groups.Yesterday.push(thread);
      else if (threadDate >= last7Days) groups['Last 7 Days'].push(thread);
      else if (threadDate >= last30Days) groups['Last 30 Days'].push(thread);
      else groups.Older.push(thread);
    });

    return groups;
  };

  const groupedThreads = groupThreadsByDate(threads);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-2 md:p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-muted-foreground px-2">
            Conversations
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewThread}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {Object.entries(groupedThreads).map(([groupName, groupThreads]) => (
            groupThreads.length > 0 && (
              <div key={groupName}>
                <h5 className="px-2 py-1 text-xs text-muted-foreground/80 font-medium">{groupName}</h5>
                <div className="space-y-1">
                  {groupThreads.map((thread) => (
                    <Button
                      key={thread.id}
                      variant={activeThread === thread.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-left h-auto p-2.5"
                      onClick={() => onThreadSelect(thread.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {thread.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {thread.lastMessage}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
