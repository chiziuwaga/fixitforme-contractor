/**
 * Enhanced Viewport Demo for UnifiedChatInterface
 * 
 * Comprehensive demonstration of chat centricity with proper viewport optimization
 * Shows all viewport sizes from mobile to massive displays
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Eye, 
  Settings,
  Maximize2,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

import UnifiedChatInterface from '@/components/ui/UnifiedChatInterface';
import { type ViewportSize, CHAT_VIEWPORT_CONFIGS } from '@/lib/chat-viewport';

interface ViewportDemoProps {
  className?: string;
}

export default function ViewportDemo({ className }: ViewportDemoProps) {
  const [activeViewport, setActiveViewport] = useState<ViewportSize>('desktop_medium');
  const [activeAgent, setActiveAgent] = useState<'lexi' | 'alex' | 'rex'>('lexi');
  const [showStats, setShowStats] = useState(false);

  // Viewport size mappings for demo containers
  const viewportContainers = {
    mobile: 'w-[375px] h-[700px]',
    tablet_portrait: 'w-[768px] h-[600px]',
    tablet_landscape: 'w-[1024px] h-[500px]',
    desktop_small: 'w-[1200px] h-[700px]',
    desktop_medium: 'w-[1400px] h-[800px]',
    desktop_large: 'w-[1600px] h-[900px]',
    desktop_xl: 'w-[1800px] h-[950px]',
    ultrawide: 'w-[2000px] h-[1000px]',
    superwide: 'w-[2200px] h-[1050px]',
    cinema: 'w-[2400px] h-[1100px]',
    massive: 'w-[2600px] h-[1150px]'
  };

  // Viewport categories for organized display
  const viewportCategories = {
    mobile: ['mobile'],
    tablet: ['tablet_portrait', 'tablet_landscape'],
    desktop: ['desktop_small', 'desktop_medium', 'desktop_large', 'desktop_xl'],
    professional: ['ultrawide', 'superwide', 'cinema', 'massive']
  };

  // Get current viewport configuration
  const currentConfig = CHAT_VIEWPORT_CONFIGS[activeViewport];

  return (
    <div className={cn("p-6 space-y-6", className)}>
      {/* Demo Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Enhanced Unified Chat Interface
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Comprehensive viewport optimization with Vercel AI Chatbot patterns
          </p>
        </motion.div>

        {/* Feature Highlights */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <Badge variant="secondary" className="text-xs">
            🎨 8-Breakpoint Responsive
          </Badge>
          <Badge variant="secondary" className="text-xs">
            ⚡ Performance Optimized
          </Badge>
          <Badge variant="secondary" className="text-xs">
            ⌨️ Keyboard Shortcuts
          </Badge>
          <Badge variant="secondary" className="text-xs">
            📱 Mobile PWA Ready
          </Badge>
          <Badge variant="secondary" className="text-xs">
            🏗️ Preserves Backend Systems
          </Badge>
        </div>
      </div>

      {/* Viewport Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Viewport Optimization Demo
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStats(!showStats)}
              >
                <Settings className="h-4 w-4 mr-2" />
                {showStats ? 'Hide' : 'Show'} Stats
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Viewport Category Selection */}
          <div className="space-y-4">
            {Object.entries(viewportCategories).map(([category, viewports]) => (
              <div key={category} className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  {category} Viewports
                </h3>
                <div className="flex flex-wrap gap-2">
                  {viewports.map((viewport) => (
                    <Button
                      key={viewport}
                      variant={activeViewport === viewport ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveViewport(viewport as ViewportSize)}
                      className="text-xs"
                    >
                      {viewport === 'mobile' && <Smartphone className="h-3 w-3 mr-1" />}
                      {viewport.startsWith('tablet') && <Tablet className="h-3 w-3 mr-1" />}
                      {viewport.startsWith('desktop') && <Monitor className="h-3 w-3 mr-1" />}
                      {(viewport.includes('wide') || viewport === 'cinema' || viewport === 'massive') && <Maximize2 className="h-3 w-3 mr-1" />}
                      {viewport.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Agent Selector */}
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Active Agent</h3>
            <div className="flex gap-2">
              {[
                { key: 'lexi', name: 'Lexi', avatar: '💫', description: 'Onboarding' },
                { key: 'alex', name: 'Alex', avatar: '📊', description: 'Cost Analysis' },
                { key: 'rex', name: 'Rex', avatar: '🔍', description: 'Lead Gen' }
              ].map((agent) => (
                <Button
                  key={agent.key}
                  variant={activeAgent === agent.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveAgent(agent.key as 'lexi' | 'alex' | 'rex')}
                  className="flex items-center gap-2"
                >
                  <span>{agent.avatar}</span>
                  <span>{agent.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {agent.description}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Viewport Stats */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Viewport Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Sidebar Mode</p>
                    <Badge variant="outline">{currentConfig.sidebarMode}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Sidebar Width</p>
                    <Badge variant="outline">{currentConfig.sidebarWidth}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Message Spacing</p>
                    <Badge variant="outline">{currentConfig.messageSpacing}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Messages/Page</p>
                    <Badge variant="outline">{currentConfig.messagesPerPage}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Header Height</p>
                    <Badge variant="outline">{currentConfig.headerHeight}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Avatar Size</p>
                    <Badge variant="outline">{currentConfig.avatarSize}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Typography</p>
                    <Badge variant="outline">{currentConfig.typography}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Thread Grouping</p>
                    <Badge variant="outline">{currentConfig.threadGrouping}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Interface Demo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Live Chat Interface</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="default">{activeViewport.replace('_', ' ')}</Badge>
              <Badge variant="secondary">{activeAgent} active</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Viewport Container */}
            <motion.div
              key={activeViewport}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center overflow-auto"
            >
              <div className={cn(
                "border rounded-lg overflow-hidden shadow-lg bg-background",
                viewportContainers[activeViewport]
              )}>
                <UnifiedChatInterface 
                  defaultAgent={activeAgent}
                  forceViewport={activeViewport}
                  className="h-full w-full"
                />
              </div>
            </motion.div>

            {/* Viewport Label */}
            <div className="absolute top-2 left-2 z-10">
              <Badge variant="secondary" className="backdrop-blur bg-background/80">
                {activeViewport} • {viewportContainers[activeViewport].split(' ')[0]}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Integration Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-600">✅ Preserved Features</h4>
              <ul className="space-y-2 text-sm">
                <li>• useChatProduction backend integration</li>
                <li>• ConcurrentExecutionManager limits</li>
                <li>• AlexCostBreakdown, RexLeadDashboard, LexiOnboarding</li>
                <li>• Database persistence & thread management</li>
                <li>• Subscription tier enforcement</li>
                <li>• Agent execution conflict prevention</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-blue-600">🎨 Enhanced UI Patterns</h4>
              <ul className="space-y-2 text-sm">
                <li>• 8-breakpoint responsive design system</li>
                <li>• Vercel AI Chatbot-inspired three-panel layout</li>
                <li>• Date-grouped conversation threads</li>
                <li>• Advanced keyboard shortcuts (⌘+1,2,3)</li>
                <li>• Viewport-aware message density</li>
                <li>• Performance optimization with virtualization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Status */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Viewport Optimization</span>
              <Badge variant="default">✅ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Backend Integration</span>
              <Badge variant="default">✅ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>UI Asset Rendering</span>
              <Badge variant="default">✅ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Keyboard Shortcuts</span>
              <Badge variant="default">✅ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Performance Optimization</span>
              <Badge variant="default">✅ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Accessibility Features</span>
              <Badge variant="default">✅ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Mobile PWA Integration</span>
              <Badge variant="secondary">🔄 Ready</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Keyboard Shortcuts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h5 className="font-medium">Agent Switching</h5>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Switch to Lexi</span>
                  <Badge variant="outline">⌘ + 1</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Switch to Alex</span>
                  <Badge variant="outline">⌘ + 2</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Switch to Rex</span>
                  <Badge variant="outline">⌘ + 3</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium">Navigation</h5>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Toggle Sidebar</span>
                  <Badge variant="outline">⌘ + B</Badge>
                </div>
                <div className="flex justify-between">
                  <span>New Conversation</span>
                  <Badge variant="outline">⌘ + N</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Search Conversations</span>
                  <Badge variant="outline">⌘ + F</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium">Actions</h5>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Send Message</span>
                  <Badge variant="outline">⌘ + Enter</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Clear Input</span>
                  <Badge variant="outline">Esc</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Show Shortcuts</span>
                  <Badge variant="outline">⌘ + K</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { ViewportDemo };
