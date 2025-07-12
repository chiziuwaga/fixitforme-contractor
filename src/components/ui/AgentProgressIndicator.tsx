"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Search, BarChart3, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResearchStep {
  id: string
  name: string
  status: 'pending' | 'active' | 'complete' | 'error'
  description: string
  details?: string[]
  duration?: string
  results_count?: number
}

interface AgentProgressState {
  agent: 'alex' | 'rex' | 'lexi'
  stage: string
  progress: number
  current_action: string
  estimated_time: string
  research_rationale?: string
  steps: ResearchStep[]
  insights?: string[]
  quality_metrics?: {
    relevance_score: number
    data_points: number
    confidence_level: number
  }
}

interface AgentProgressIndicatorProps {
  state: AgentProgressState
  className?: string
}

export function AgentProgressIndicator({ state, className }: AgentProgressIndicatorProps) {
  const agentConfig = {
    alex: {
      color: 'green',
      icon: BarChart3,
      title: 'Material Research & Cost Analysis',
      description: 'Analyzing current market pricing and availability'
    },
    rex: {
      color: 'blue', 
      icon: Search,
      title: 'Lead Generation & Market Intelligence',
      description: 'Scanning multiple platforms for qualified opportunities'
    },
    lexi: {
      color: 'purple',
      icon: CheckCircle,
      title: 'Profile Analysis & Onboarding',
      description: 'Optimizing contractor setup and recommendations'
    }
  }

  const config = agentConfig[state.agent]
  const IconComponent = config.icon

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            state.agent === 'alex' && "bg-green-500/10 text-green-600",
            state.agent === 'rex' && "bg-secondary/10 text-secondary", 
            state.agent === 'lexi' && "bg-primary/10 text-primary"
          )}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{config.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {Math.round(state.progress)}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{state.current_action}</span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {state.estimated_time}
            </span>
          </div>
          <Progress 
            value={state.progress} 
            className={cn(
              "h-2",
              state.agent === 'alex' && "[&>div]:bg-green-500",
              state.agent === 'rex' && "[&>div]:bg-secondary",
              state.agent === 'lexi' && "[&>div]:bg-primary"
            )}
          />
        </div>

        {/* Research Rationale */}
        {state.research_rationale && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-muted/50 rounded-lg border border-dashed"
          >
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Research Strategy
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {state.research_rationale}
            </p>
          </motion.div>
        )}

        {/* Quality Metrics */}
        {state.quality_metrics && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(state.quality_metrics.relevance_score * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Relevance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {state.quality_metrics.data_points}
              </div>
              <div className="text-xs text-muted-foreground">Data Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(state.quality_metrics.confidence_level * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Confidence</div>
            </div>
          </div>
        )}

        {/* Research Steps */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Progress Steps</h4>
          <div className="space-y-2">
            {state.steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-all",
                  step.status === 'complete' && "bg-green-50 border-green-200",
                  step.status === 'active' && "bg-primary/5 border-primary/20",
                  step.status === 'error' && "bg-red-50 border-red-200",
                  step.status === 'pending' && "bg-muted/30 border-border"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {step.status === 'complete' && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                  {step.status === 'active' && (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  )}
                  {step.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  {step.status === 'pending' && (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-sm">{step.name}</h5>
                    {step.results_count !== undefined && (
                      <Badge variant="outline" className="ml-2">
                        {step.results_count} results
                      </Badge>
                    )}
                    {step.duration && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {step.duration}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                  
                  {/* Step Details */}
                  {step.details && step.status === 'active' && (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-1"
                      >
                        {step.details.map((detail, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                            <div className="w-1 h-1 bg-current rounded-full" />
                            {detail}
                          </div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Insights */}
        {state.insights && state.insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h4 className="font-medium text-sm">Key Insights</h4>
            <div className="space-y-1">
              {state.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <div className="w-1.5 h-1.5 bg-current rounded-full mt-2 flex-shrink-0" />
                  {insight}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

// Viewport-responsive version for mobile optimization
export function CompactAgentProgressIndicator({ state, className }: AgentProgressIndicatorProps) {
  const config = {
    alex: { color: 'green', icon: BarChart3 },
    rex: { color: 'blue', icon: Search },
    lexi: { color: 'purple', icon: CheckCircle }
  }[state.agent]

  const IconComponent = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("w-full p-4 bg-card rounded-lg border", className)}
    >
      {/* Compact Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          "p-1.5 rounded",
          state.agent === 'alex' && "bg-green-500/10 text-green-600",
          state.agent === 'rex' && "bg-secondary/10 text-secondary",
          state.agent === 'lexi' && "bg-primary/10 text-primary"
        )}>
          <IconComponent className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{state.current_action}</div>
          <div className="text-xs text-muted-foreground">{state.estimated_time}</div>
        </div>
        <Badge variant="secondary" className="text-xs">
          {Math.round(state.progress)}%
        </Badge>
      </div>

      {/* Compact Progress */}
      <Progress 
        value={state.progress} 
        className={cn(
          "h-1.5 mb-3",
          state.agent === 'alex' && "[&>div]:bg-green-500",
          state.agent === 'rex' && "[&>div]:bg-secondary", 
          state.agent === 'lexi' && "[&>div]:bg-primary"
        )}
      />

      {/* Active Step Only */}
      {state.steps.find(s => s.status === 'active') && (
        <div className="text-xs text-muted-foreground">
          {state.steps.find(s => s.status === 'active')?.description}
        </div>
      )}
    </motion.div>
  )
}
