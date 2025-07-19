/**
 * Contextual Help System - Smart assistance and tips
 * 
 * Provides contextual help, keyboard shortcuts, and usage tips
 */

import React, { useState } from 'react';
import { 
  HelpCircle, 
  Keyboard, 
  Lightbulb, 
  Book,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export function HelpSystem() {
  const [isOpen, setIsOpen] = useState(false);

  const keyboardShortcuts = [
    {
      category: 'Navigation',
      shortcuts: [
        { keys: ['Ctrl', 'K'], description: 'Quick search conversations' },
        { keys: ['Ctrl', 'N'], description: 'Start new conversation' },
        { keys: ['Ctrl', '1'], description: 'Switch to Lexi (guidance)' },
        { keys: ['Ctrl', '2'], description: 'Switch to Alex (pricing)' },
        { keys: ['Ctrl', '3'], description: 'Switch to Rex (opportunities)' },
        { keys: ['Esc'], description: 'Close current dialog' }
      ]
    },
    {
      category: 'Chat Actions',
      shortcuts: [
        { keys: ['Enter'], description: 'Send message' },
        { keys: ['Shift', 'Enter'], description: 'New line in message' },
        { keys: ['↑'], description: 'Edit last message' },
        { keys: ['Ctrl', 'C'], description: 'Copy message (when hovering)' },
        { keys: ['Ctrl', 'R'], description: 'Regenerate response' }
      ]
    },
    {
      category: 'Productivity',
      shortcuts: [
        { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
        { keys: ['Ctrl', 'F'], description: 'Search in current conversation' },
        { keys: ['Ctrl', 'S'], description: 'Save/bookmark conversation' },
        { keys: ['Ctrl', 'D'], description: 'Delete conversation' }
      ]
    }
  ];

  const usageTips = [
    {
      title: 'Ask Specific Questions',
      description: 'Be specific about your needs. Instead of "Help me", try "Help me estimate materials for a 500 sq ft deck".',
      icon: Lightbulb,
      example: '💡 Good: "Show me pricing for oak hardwood flooring for 800 sq ft"\n❌ Vague: "What about flooring?"'
    },
    {
      title: 'Use the Right Agent',
      description: 'Each agent specializes in different areas. Choose the right one for better results.',
      icon: Zap,
      example: '💫 Lexi: Project guidance and decisions\n📊 Alex: Costs and material estimates\n🔍 Rex: Finding contractors and opportunities'
    },
    {
      title: 'Reference Previous Context',
      description: 'Agents remember your conversation history. Reference earlier messages for continuity.',
      icon: Book,
      example: '✅ "Based on the deck project we discussed, what about railings?"\n❌ "What about railings?" (no context)'
    },
    {
      title: 'Ask Follow-up Questions',
      description: 'Dig deeper into responses. Use the quick action buttons or ask follow-up questions.',
      icon: ChevronRight,
      example: '🔄 "Can you break that down by cost categories?"\n🔍 "What factors affect that price?"\n📋 "What are the next steps?"'
    }
  ];

  const agentGuide = [
    {
      name: 'Lexi',
      emoji: '💫',
      role: 'Project Guidance Specialist',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      strengths: [
        'Project planning and guidance',
        'Decision-making support',
        'Timeline and milestone planning',
        'Problem-solving strategies',
        'Resource recommendations'
      ],
      bestFor: [
        'When you need guidance on project decisions',
        'Planning project phases and timelines',
        'Getting recommendations for next steps',
        'Solving project challenges'
      ],
      example: '"Help me plan the phases for my kitchen renovation"'
    },
    {
      name: 'Alex',
      emoji: '📊',
      role: 'Cost & Materials Expert',
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
      strengths: [
        'Material cost estimation',
        'Labor cost analysis',
        'Budget planning and optimization',
        'Price comparison and alternatives',
        'ROI calculations'
      ],
      bestFor: [
        'Getting accurate cost estimates',
        'Comparing material options and prices',
        'Budget planning and optimization',
        'Understanding cost factors'
      ],
      example: '"Compare costs between granite and quartz countertops for 50 sq ft"'
    },
    {
      name: 'Rex',
      emoji: '🔍',
      role: 'Opportunity & Lead Finder',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      strengths: [
        'Contractor and supplier discovery',
        'Market opportunity analysis',
        'Lead generation and qualification',
        'Location-based recommendations',
        'Competitive analysis'
      ],
      bestFor: [
        'Finding qualified contractors',
        'Discovering business opportunities',
        'Market research and analysis',
        'Location-specific recommendations'
      ],
      example: '"Find top-rated plumbers in downtown Seattle for commercial projects"'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="h-4 w-4" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Getting Started
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="shortcuts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="shortcuts" className="flex items-center gap-2">
              <Keyboard className="h-3 w-3" />
              Shortcuts
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Zap className="h-3 w-3" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <Lightbulb className="h-3 w-3" />
              Tips
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex items-center gap-2">
              <Book className="h-3 w-3" />
              Guide
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shortcuts" className="space-y-4 mt-4">
            <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
            {keyboardShortcuts.map((category) => (
              <div key={category.category} className="space-y-3">
                <h4 className="font-medium text-muted-foreground">{category.category}</h4>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd className="px-2 py-1 bg-background border rounded text-xs font-mono">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="agents" className="space-y-4 mt-4">
            <h3 className="text-lg font-semibold">Meet Your AI Agents</h3>
            <div className="space-y-4">
              {agentGuide.map((agent) => (
                <div key={agent.name} className={cn("p-4 rounded-lg border", agent.bgColor)}>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{agent.emoji}</div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className={cn("font-semibold", agent.color)}>
                          {agent.name} - {agent.role}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {agent.example}
                        </p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <h5 className="text-xs font-medium text-muted-foreground mb-2">STRENGTHS</h5>
                          <ul className="space-y-1 text-sm">
                            {agent.strengths.map((strength, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-current opacity-50" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-muted-foreground mb-2">BEST FOR</h5>
                          <ul className="space-y-1 text-sm">
                            {agent.bestFor.map((use, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-current opacity-50" />
                                {use}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-4 mt-4">
            <h3 className="text-lg font-semibold">Usage Tips</h3>
            <div className="space-y-4">
              {usageTips.map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <div key={index} className="p-4 rounded-lg border bg-muted/20">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <h4 className="font-medium">{tip.title}</h4>
                        <p className="text-sm text-muted-foreground">{tip.description}</p>
                        <div className="p-3 rounded-md bg-muted/50 border-l-2 border-primary">
                          <pre className="text-xs whitespace-pre-wrap font-mono">{tip.example}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="guide" className="space-y-4 mt-4">
            <h3 className="text-lg font-semibold">Quick Start Guide</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-primary/5">
                <h4 className="font-medium mb-2">1. Choose the Right Agent</h4>
                <p className="text-sm text-muted-foreground">
                  Start by selecting the agent that best matches your current need. Each agent has specialized knowledge and capabilities.
                </p>
              </div>
              
              <div className="p-4 rounded-lg border bg-green-500/5">
                <h4 className="font-medium mb-2">2. Be Specific</h4>
                <p className="text-sm text-muted-foreground">
                  Provide context, measurements, locations, and specific requirements. The more details you provide, the better the assistance.
                </p>
              </div>
              
              <div className="p-4 rounded-lg border bg-secondary/5">
                <h4 className="font-medium mb-2">3. Use Follow-ups</h4>
                <p className="text-sm text-muted-foreground">
                  Don&apos;t hesitate to ask follow-up questions. The agents maintain conversation context and can dive deeper into topics.
                </p>
              </div>
              
              <div className="p-4 rounded-lg border bg-muted/20">
                <h4 className="font-medium mb-2">4. Save Important Conversations</h4>
                <p className="text-sm text-muted-foreground">
                  Bookmark conversations you want to reference later. Use the search function to quickly find past discussions.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default HelpSystem;
