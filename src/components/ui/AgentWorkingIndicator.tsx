'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Bot, Brain, Search, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BRAND } from '@/lib/brand';

interface AgentWorkingIndicatorProps {
  agent: 'lexi' | 'alex' | 'rex';
  isWorking: boolean;
  currentTask?: string;
  className?: string;
}

const agentConfig = {
  lexi: {
    name: 'Lexi',
    icon: Bot,
    color: BRAND.colors.primary,
    tasks: [
      'Analyzing your request...',
      'Preparing onboarding materials...',
      'Gathering contractor resources...',
      'Finalizing recommendations...'
    ]
  },
  alex: {
    name: 'Alex',
    icon: Calculator,
    color: BRAND.colors.accent,
    tasks: [
      'Analyzing project requirements...',
      'Calculating material costs...',
      'Researching local pricing...',
      'Preparing bid estimates...'
    ]
  },
  rex: {
    name: 'Rex',
    icon: Search,
    color: BRAND.colors.secondary,
    tasks: [
      'Searching for new leads...',
      'Analyzing market opportunities...',
      'Qualifying prospects...',
      'Preparing lead summaries...'
    ]
  }
};

export function AgentWorkingIndicator({ 
  agent, 
  isWorking, 
  currentTask, 
  className 
}: AgentWorkingIndicatorProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const config = agentConfig[agent];
  const Icon = config.icon;

  useEffect(() => {
    if (!isWorking) return;

    const interval = setInterval(() => {
      setCurrentTaskIndex((prev) => (prev + 1) % config.tasks.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isWorking, config.tasks.length]);

  if (!isWorking) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border",
        "bg-gradient-to-r from-background to-muted/50",
        "border-border/50",
        className
      )}
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="p-2 rounded-full"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Icon 
            className="w-4 h-4" 
            style={{ color: config.color }}
          />
        </motion.div>
        
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
          style={{ backgroundColor: config.color }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">
            {config.name} is working
          </span>
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
        </div>
        
        <motion.p
          key={currentTaskIndex}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="text-xs text-muted-foreground truncate"
        >
          {currentTask || config.tasks[currentTaskIndex]}
        </motion.p>
      </div>

      <div className="flex gap-1">
        {config.tasks.map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              index === currentTaskIndex 
                ? "bg-current" 
                : "bg-muted-foreground/30"
            )}
            style={{ 
              color: index === currentTaskIndex ? config.color : undefined 
            }}
            animate={index === currentTaskIndex ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default AgentWorkingIndicator;
