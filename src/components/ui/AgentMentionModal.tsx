/**
 * Agent Mention Modal Component
 * Provides @ mention functionality for direct agent routing
 * Integrates with Lexi orchestration system
 */

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Search, MessageSquare, Calculator, Target, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// Agent definitions
const AGENTS = [
  {
    id: 'lexi',
    name: 'Lexi the Liaison',
    role: 'Onboarding Guide & Orchestrator',
    description: 'Friendly onboarding specialist and intelligent agent coordinator',
    icon: User,
    color: 'bg-primary',
    textColor: 'text-primary',
    specialties: ['Onboarding', 'System Navigation', 'Agent Routing', 'General Support'],
    tier: 'all'
  },
  {
    id: 'alex',
    name: 'Alex the Assessor',
    role: 'Bidding & Cost Analysis Specialist',
    description: 'Precise quantity surveyor with real-time material research capabilities',
    icon: Calculator,
    color: 'bg-green-500',
    textColor: 'text-green-600',
    specialties: ['Cost Analysis', 'Material Research', 'Strategic Bidding', 'Risk Assessment'],
    tier: 'scale'
  },
  {
    id: 'rex',
    name: 'Rex the Retriever',
    role: 'Lead Generation Specialist',
    description: 'Silent lead hunter with multi-platform web scraping expertise',
    icon: Target,
    color: 'bg-secondary',
    textColor: 'text-secondary',
    specialties: ['Lead Generation', 'Market Research', 'Opportunity Discovery', 'Competition Analysis'],
    tier: 'scale'
  }
];

interface AgentMentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentSelect: (agentId: string) => void;
  userTier: 'growth' | 'scale';
  searchQuery?: string;
}

export function AgentMentionModal({
  isOpen,
  onClose,
  onAgentSelect,
  userTier,
  searchQuery = ''
}: AgentMentionModalProps) {
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter agents based on search and tier
  const filteredAgents = AGENTS.filter(agent => {
    const matchesSearch = searchTerm === '' || 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTier = agent.tier === 'all' || userTier === 'scale';
    
    return matchesSearch && matchesTier;
  });

  // Reset selection when agents change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredAgents.length]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredAgents.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredAgents.length) % filteredAgents.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredAgents[selectedIndex]) {
            handleAgentSelect(filteredAgents[selectedIndex].id);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredAgents]);

  const handleAgentSelect = (agentId: string) => {
    onAgentSelect(agentId);
    onClose();
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        {/* Header with search */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <MessageSquare className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Mention an Agent
            </h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search agents by name or specialty..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Agent list */}
        <div className="max-h-96 overflow-y-auto">
          {filteredAgents.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No agents found matching your search.
            </div>
          ) : (
            <div className="p-2">
              {filteredAgents.map((agent, index) => {
                const Icon = agent.icon;
                const isSelected = index === selectedIndex;
                const isAvailable = agent.tier === 'all' || userTier === 'scale';

                return (
                  <div
                    key={agent.id}
                    onClick={() => isAvailable && handleAgentSelect(agent.id)}
                    className={cn(
                      'relative p-4 rounded-lg cursor-pointer transition-all duration-200 mb-2',
                      isSelected && isAvailable && 'bg-primary/5 border-2 border-primary/20',
                      !isSelected && isAvailable && 'bg-white border border-gray-200 hover:bg-gray-50',
                      !isAvailable && 'bg-gray-50 border border-gray-200 cursor-not-allowed opacity-60'
                    )}
                  >
                    {/* Tier indicator for locked agents */}
                    {!isAvailable && (
                      <div className="absolute top-2 right-2 bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-medium">
                        Scale Tier
                      </div>
                    )}

                    <div className="flex items-start space-x-4">
                      {/* Agent Icon */}
                      <div className={cn(
                        'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
                        agent.color
                      )}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>

                      {/* Agent Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={cn(
                            'text-lg font-semibold',
                            isAvailable ? 'text-gray-900' : 'text-gray-500'
                          )}>
                            @{agent.id}
                          </h4>
                          <span className={cn(
                            'text-sm font-medium',
                            agent.textColor
                          )}>
                            {agent.name}
                          </span>
                        </div>
                        
                        <p className={cn(
                          'text-sm font-medium mb-2',
                          isAvailable ? 'text-gray-600' : 'text-gray-400'
                        )}>
                          {agent.role}
                        </p>
                        
                        <p className={cn(
                          'text-sm mb-3',
                          isAvailable ? 'text-gray-500' : 'text-gray-400'
                        )}>
                          {agent.description}
                        </p>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-1">
                          {agent.specialties.map((specialty) => (
                            <span
                              key={specialty}
                              className={cn(
                                'inline-block px-2 py-1 text-xs rounded-full',
                                isAvailable 
                                  ? 'bg-gray-100 text-gray-600' 
                                  : 'bg-gray-100 text-gray-400'
                              )}
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>

                        {/* Upgrade prompt for locked agents */}
                        {!isAvailable && (
                          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-md">
                            <p className="text-xs text-orange-600 font-medium">
                              Upgrade to Scale tier to access {agent.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {isSelected && isAvailable && (
                      <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <span className="font-medium">Tip:</span> Use ↑↓ to navigate, Enter to select
            </div>
            
            {userTier === 'growth' && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                Upgrade for Full Access
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for @ mention functionality
export function useAgentMention() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');

  const openModal = (query = '') => {
    setMentionQuery(query);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMentionQuery('');
  };

  return {
    isModalOpen,
    openModal,
    closeModal,
    mentionQuery
  };
}
