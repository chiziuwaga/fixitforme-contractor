/**
 * Demo Component for UnifiedChatInterfaceV3
 * 
 * This demo showcases the sophisticated integration between:
 * - Vercel AI Chatbot-inspired UI patterns
 * - Our existing sophisticated backend systems
 * - Enhanced agent coordination and execution management
 * - Sophisticated UI asset rendering for AlexCostBreakdown, RexLeadDashboard, LexiOnboarding
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Smartphone, Tablet, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

import UnifiedChatInterfaceV3, { UnifiedChatAgentConfig } from '@/components/ui/UnifiedChatInterfaceV3';

interface ChatDemoProps {
  className?: string;
}

export default function UnifiedChatDemo({ className }: ChatDemoProps) {
  const [activeView, setActiveView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeAgent, setActiveAgent] = useState<'lexi' | 'alex' | 'rex'>('lexi');

  const containerSizes = {
    desktop: 'w-full h-[800px]',
    tablet: 'w-[768px] h-[600px] mx-auto',
    mobile: 'w-[375px] h-[700px] mx-auto'
  };

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Demo Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Unified Chat Interface V3
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Sophisticated backend integration with Vercel AI Chatbot patterns
          </p>
        </motion.div>

        {/* Feature Highlights */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <Badge variant="secondary" className="text-xs">
            🏗️ Preserves Existing Backend
          </Badge>
          <Badge variant="secondary" className="text-xs">
            🎨 Vercel-Inspired UI
          </Badge>
          <Badge variant="secondary" className="text-xs">
            📊 Sophisticated UI Assets
          </Badge>
          <Badge variant="secondary" className="text-xs">
            ⚡ Concurrent Execution
          </Badge>
          <Badge variant="secondary" className="text-xs">
            💎 Scale/Growth Tiers
          </Badge>
        </div>
      </div>

      {/* Agent Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Available Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(UnifiedChatAgentConfig).map(([key, config]) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveAgent(key as 'lexi' | 'alex' | 'rex')}
                className={`cursor-pointer p-4 rounded-lg border transition-colors ${
                  activeAgent === key ? 'bg-muted border-primary' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{config.avatar}</span>
                  <div>
                    <h3 className="font-semibold">{config.name}</h3>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </div>
                </div>
                {config.isPremium && (
                  <Badge variant="outline" className="text-xs">
                    Scale Tier
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Viewport Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Preview Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'desktop' | 'tablet' | 'mobile')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="desktop" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Desktop
              </TabsTrigger>
              <TabsTrigger value="tablet" className="flex items-center gap-2">
                <Tablet className="h-4 w-4" />
                Tablet
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Chat Interface Demo */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex justify-center"
      >
        <div className={`${containerSizes[activeView]} border rounded-lg overflow-hidden shadow-lg`}>
          <UnifiedChatInterfaceV3 
            defaultAgent={activeAgent}
            className="h-full"
          />
        </div>
      </motion.div>

      {/* Technical Integration Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-600">✅ Preserved Features</h4>
              <ul className="space-y-2 text-sm">
                <li>• EnhancedChatManager coordination</li>
                <li>• useChatProduction database persistence</li>
                <li>• ConcurrentExecutionManager limits</li>
                <li>• AlexCostBreakdown, RexLeadDashboard, LexiOnboarding components</li>
                <li>• Subscription tier management</li>
                <li>• Agent execution conflict prevention</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-blue-600">🎨 New UI Patterns</h4>
              <ul className="space-y-2 text-sm">
                <li>• Three-panel Vercel-inspired layout</li>
                <li>• Date-grouped conversation threads</li>
                <li>• Collapsible sidebar with search</li>
                <li>• Smooth agent switching</li>
                <li>• Enhanced message rendering</li>
                <li>• Responsive design patterns</li>
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
              <span>Backend Integration</span>
              <Badge variant="default">✅ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>UI Asset Rendering</span>
              <Badge variant="default">✅ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Agent Coordination</span>
              <Badge variant="default">✅ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Conversation Management</span>
              <Badge variant="default">✅ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>TypeScript Compliance</span>
              <Badge variant="default">✅ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Build Success</span>
              <Badge variant="default">✅ Complete</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { UnifiedChatDemo };
