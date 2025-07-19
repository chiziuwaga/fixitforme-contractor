/**
 * Enhanced Conversation Search with Smart Filtering
 * 
 * Adds intelligent search across conversation content, not just titles
 */

import React, { useState, useMemo } from 'react';
import { Search, Calendar, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ChatMessage {
  content: string;
  role: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  agent: string;
  updated_at: string;
  messages: ChatMessage[];
  metadata?: {
    project_context?: {
      title?: string;
    };
  };
}

interface ConversationSearchProps {
  conversations: Conversation[];
  onFilteredResults: (filtered: Conversation[]) => void;
  className?: string;
}

export function ConversationSearch({ 
  conversations, 
  onFilteredResults, 
  className 
}: ConversationSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Smart search across title, content, and metadata
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.title.toLowerCase().includes(query) ||
        conv.messages.some((msg: ChatMessage) => 
          msg.content.toLowerCase().includes(query)
        ) ||
        conv.metadata?.project_context?.title?.toLowerCase().includes(query)
      );
    }

    // Agent filter
    if (selectedAgent !== 'all') {
      filtered = filtered.filter(conv => conv.agent === selectedAgent);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(conv => 
        new Date(conv.updated_at) >= filterDate
      );
    }

    return filtered;
  }, [conversations, searchQuery, selectedAgent, dateFilter]);

  // Update parent with filtered results
  React.useEffect(() => {
    onFilteredResults(filteredConversations);
  }, [filteredConversations, onFilteredResults]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Enhanced Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search conversations, messages, and projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Smart Filters */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <User className="h-3 w-3" />
              {selectedAgent === 'all' ? 'All Agents' : selectedAgent}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSelectedAgent('all')}>
              All Agents
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedAgent('lexi')}>
              💫 Lexi
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedAgent('alex')}>
              📊 Alex
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedAgent('rex')}>
              🔍 Rex
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              {dateFilter === 'all' ? 'All Time' : 
               dateFilter === 'today' ? 'Today' :
               dateFilter === 'week' ? 'This Week' : 'This Month'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setDateFilter('all')}>
              All Time
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDateFilter('today')}>
              Today
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDateFilter('week')}>
              This Week
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDateFilter('month')}>
              This Month
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Results Count */}
        <Badge variant="secondary" className="ml-auto">
          {filteredConversations.length} result{filteredConversations.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Active Filters Display */}
      {(searchQuery || selectedAgent !== 'all' || dateFilter !== 'all') && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Filters:</span>
          {searchQuery && (
            <Badge variant="outline" className="text-xs">
              &ldquo;{searchQuery}&rdquo;
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-3 w-3 p-0"
                onClick={() => setSearchQuery('')}
              >
                ×
              </Button>
            </Badge>
          )}
          {selectedAgent !== 'all' && (
            <Badge variant="outline" className="text-xs">
              Agent: {selectedAgent}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-3 w-3 p-0"
                onClick={() => setSelectedAgent('all')}
              >
                ×
              </Button>
            </Badge>
          )}
          {dateFilter !== 'all' && (
            <Badge variant="outline" className="text-xs">
              Time: {dateFilter}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-3 w-3 p-0"
                onClick={() => setDateFilter('all')}
              >
                ×
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export default ConversationSearch;
