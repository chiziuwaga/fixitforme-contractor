// ✅ Phase 5C: ResponsiveLexiOnboarding Component
// 🎯 Chat-embedded onboarding experience with database integration

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, FileText, Building, Upload, CheckCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Brand-compliant color system (CRITICAL: No blue/purple violations)
const BRAND_COLORS = {
  lexi: {
    bg: 'bg-primary/10',           // Felix Gold variants ONLY
    text: 'text-primary', 
    border: 'border-primary/20',
    focus: 'focus:border-primary/50 focus:ring-primary/20',
    gradient: 'from-primary/20 to-primary/5'
  },
  success: {
    bg: 'bg-green-500/10',         // Success Green variants  
    text: 'text-green-600',
    border: 'border-green-500/20'
  }
} as const

// 8-Breakpoint responsive system (referenced in device detection)
// const RESPONSIVE_BREAKPOINTS = {
//   'mobile-xs': '320px',  // iPhone SE, older phones
//   'mobile-sm': '375px',  // iPhone 12 Mini, standard mobile
//   'mobile-lg': '414px',  // iPhone 12 Pro Max, large phones
//   'tablet-sm': '768px',  // iPad Mini, small tablets
//   'tablet-lg': '1024px', // iPad Pro, large tablets
//   'desktop-sm': '1280px', // Laptop screens
//   'desktop-lg': '1440px', // Desktop monitors
//   'desktop-xl': '1920px'  // Large displays
// } as const

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string; }>
  completed: boolean
  current: boolean
  chatPrompt?: string
  estimatedTime?: string
}

interface ResponsiveLexiOnboardingProps {
  onStepComplete?: (stepId: string) => void
  onChatPrompt?: (prompt: string) => void
  currentStep?: string
  completedSteps?: string[]
  className?: string
}

export function ResponsiveLexiOnboarding({
  onStepComplete,
  onChatPrompt,
  currentStep = 'welcome',
  completedSteps = [],
  className
}: ResponsiveLexiOnboardingProps) {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Device detection with 8-breakpoint system
  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenSize({ width, height })
      
      if (width < 768) {
        setDeviceType('mobile')
      } else if (width < 1024) {
        setDeviceType('tablet') 
      } else {
        setDeviceType('desktop')
      }
    }

    updateDeviceType()
    window.addEventListener('resize', updateDeviceType)
    return () => window.removeEventListener('resize', updateDeviceType)
  }, [])

  // Onboarding steps with chat-first integration
  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to FixItForMe',
      description: 'Get started with your contractor profile',
      icon: Sparkles,
      completed: completedSteps.includes('welcome'),
      current: currentStep === 'welcome',
      chatPrompt: 'Hi! I\'m Lexi, your personal onboarding guide. Let\'s get your contractor profile set up so you can start winning jobs! What type of contracting work do you specialize in?',
      estimatedTime: '2 min'
    },
    {
      id: 'business-profile',
      title: 'Business Profile',
      description: 'Tell us about your contracting business',
      icon: Building,
      completed: completedSteps.includes('business-profile'),
      current: currentStep === 'business-profile',
      chatPrompt: 'Perfect! Now let\'s set up your business profile. I\'ll help you highlight what makes your contracting business unique. What\'s your business name and how long have you been in business?',
      estimatedTime: '3 min'
    },
    {
      id: 'documents',
      title: 'Documentation',
      description: 'Upload your licenses and certifications',
      icon: FileText,
      completed: completedSteps.includes('documents'),
      current: currentStep === 'documents',
      chatPrompt: 'Great! Now let\'s get your credentials uploaded. Having proper documentation builds trust with homeowners. Do you have your contractor license, insurance, and any specialty certifications ready to upload?',
      estimatedTime: '5 min'
    },
    {
      id: 'portfolio',
      title: 'Portfolio & Gallery',
      description: 'Showcase your best work',
      icon: Upload,
      completed: completedSteps.includes('portfolio'),
      current: currentStep === 'portfolio',
      chatPrompt: 'Excellent! Now let\'s showcase your amazing work. Photos of completed projects are incredibly powerful for winning new jobs. What are some of your best recent projects?',
      estimatedTime: '4 min'
    }
  ]

  const currentStepData = steps.find(step => step.current)
  const completionPercentage = (completedSteps.length / steps.length) * 100

  // Handle step interaction
  const handleStepClick = (step: OnboardingStep) => {
    if (step.chatPrompt && onChatPrompt) {
      onChatPrompt(step.chatPrompt)
    }
    
    if (onStepComplete) {
      onStepComplete(step.id)
    }
  }

  // Mobile-optimized layout
  const renderMobileLayout = () => (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className={cn(
        'p-4 rounded-lg border',
        BRAND_COLORS.lexi.bg,
        BRAND_COLORS.lexi.border
      )}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={cn('font-semibold', BRAND_COLORS.lexi.text)}>
            Onboarding Progress
          </h3>
          <Badge variant="secondary" className={BRAND_COLORS.success.bg}>
            {Math.round(completionPercentage)}% Complete
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div
            className={cn('h-2 rounded-full', 'bg-primary')}
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Current Step Card */}
      {currentStepData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
            BRAND_COLORS.lexi.border,
            'hover:shadow-md active:scale-98'
          )}
          onClick={() => handleStepClick(currentStepData)}
        >
          <div className="flex items-start gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              BRAND_COLORS.lexi.bg
            )}>
              <currentStepData.icon className={cn('w-5 h-5', BRAND_COLORS.lexi.text)} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground mb-1">
                {currentStepData.title}
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                {currentStepData.description}
              </p>
              {currentStepData.estimatedTime && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {currentStepData.estimatedTime}
                  </Badge>
                  <Button 
                    size="sm" 
                    className={cn(
                      'h-7 text-xs',
                      'bg-primary hover:bg-primary/90'
                    )}
                  >
                    Continue with Lexi
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Steps Overview */}
      <div className="space-y-2">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200',
              step.completed ? BRAND_COLORS.success.border : 'border-border/50',
              step.current ? BRAND_COLORS.lexi.border : '',
              'cursor-pointer hover:shadow-sm'
            )}
            onClick={() => handleStepClick(step)}
          >
            <div className={cn(
              'p-1.5 rounded-full',
              step.completed ? BRAND_COLORS.success.bg : BRAND_COLORS.lexi.bg
            )}>
              {step.completed ? (
                <CheckCircle className={cn('w-4 h-4', BRAND_COLORS.success.text)} />
              ) : (
                <step.icon className={cn('w-4 h-4', BRAND_COLORS.lexi.text)} />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-sm font-medium',
                  step.completed ? BRAND_COLORS.success.text : 'text-foreground'
                )}>
                  {step.title}
                </span>
                {step.current && (
                  <Badge variant="secondary" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  // Tablet-optimized layout
  const renderTabletLayout = () => (
    <div className="grid grid-cols-2 gap-6">
      {/* Left: Progress & Current Step */}
      <div className="space-y-4">
        {/* Progress Header */}
        <Card className={cn('border-2', BRAND_COLORS.lexi.border)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className={cn('text-lg font-semibold', BRAND_COLORS.lexi.text)}>
                Getting Started with Lexi
              </h3>
              <Badge className={BRAND_COLORS.success.bg}>
                {Math.round(completionPercentage)}% Complete
              </Badge>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-3 mb-4">
              <motion.div
                className={cn('h-3 rounded-full', 'bg-primary')}
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>

            {/* Current Step Details */}
            {currentStepData && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg', BRAND_COLORS.lexi.bg)}>
                    <currentStepData.icon className={cn('w-6 h-6', BRAND_COLORS.lexi.text)} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {currentStepData.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {currentStepData.description}
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleStepClick(currentStepData)}
                  className={cn(
                    'w-full',
                    'bg-primary hover:bg-primary/90'
                  )}
                >
                  Continue with Lexi
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right: Steps Grid */}
      <div className="grid grid-cols-2 gap-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95',
                step.completed ? BRAND_COLORS.success.border : 'border-border',
                step.current ? BRAND_COLORS.lexi.border : ''
              )}
              onClick={() => handleStepClick(step)}
            >
              <CardContent className="p-4 text-center">
                <div className={cn(
                  'w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center',
                  step.completed ? BRAND_COLORS.success.bg : BRAND_COLORS.lexi.bg
                )}>
                  {step.completed ? (
                    <CheckCircle className={cn('w-6 h-6', BRAND_COLORS.success.text)} />
                  ) : (
                    <step.icon className={cn('w-6 h-6', BRAND_COLORS.lexi.text)} />
                  )}
                </div>
                
                <h4 className="font-semibold text-sm mb-1">
                  {step.title}
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {step.description}
                </p>
                
                {step.estimatedTime && (
                  <Badge variant="outline" className="text-xs">
                    {step.estimatedTime}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )

  // Desktop-optimized layout
  const renderDesktopLayout = () => (
    <div className="grid grid-cols-3 gap-8">
      {/* Left: Progress Overview */}
      <div className="space-y-6">
        <Card className={cn('border-2', BRAND_COLORS.lexi.border)}>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className={cn('text-2xl font-bold mb-2', BRAND_COLORS.lexi.text)}>
                Welcome to FixItForMe
              </h2>
              <p className="text-muted-foreground">
                Let Lexi guide you through setting up your contractor profile
              </p>
            </div>
            
            {/* Circular Progress */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className={BRAND_COLORS.lexi.text}
                  initial={{ strokeDasharray: "0 351.86" }}
                  animate={{ 
                    strokeDasharray: `${(completionPercentage / 100) * 351.86} 351.86`
                  }}
                  transition={{ duration: 1 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn('text-2xl font-bold', BRAND_COLORS.lexi.text)}>
                  {Math.round(completionPercentage)}%
                </span>
              </div>
            </div>
            
            <div className="text-center">
              <Badge className={cn('text-sm px-3 py-1', BRAND_COLORS.success.bg)}>
                {completedSteps.length} of {steps.length} completed
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Center: Current Step Details */}
      <div className="space-y-6">
        {currentStepData && (
          <Card className={cn('border-2', BRAND_COLORS.lexi.border)}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={cn(
                  'p-3 rounded-xl',
                  BRAND_COLORS.lexi.bg
                )}>
                  <currentStepData.icon className={cn('w-8 h-8', BRAND_COLORS.lexi.text)} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {currentStepData.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {currentStepData.description}
                  </p>
                </div>
              </div>
              
              {currentStepData.chatPrompt && (
                <div className={cn(
                  'p-4 rounded-lg border-l-4 mb-6',
                  BRAND_COLORS.lexi.bg,
                  BRAND_COLORS.lexi.border
                )}>
                  <p className="text-sm italic text-muted-foreground">
                    &ldquo;{currentStepData.chatPrompt}&rdquo;
                  </p>
                </div>
              )}
              
              <Button 
                onClick={() => handleStepClick(currentStepData)}
                size="lg"
                className={cn(
                  'w-full',
                  'bg-primary hover:bg-primary/90'
                )}
              >
                Continue with Lexi
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right: All Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
          >
            <Card
              className={cn(
                'cursor-pointer transition-all duration-300 hover:shadow-lg',
                step.completed ? cn('border-2', BRAND_COLORS.success.border) : 'border-border',
                step.current ? cn('border-2', BRAND_COLORS.lexi.border) : ''
              )}
              onClick={() => handleStepClick(step)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    step.completed ? BRAND_COLORS.success.bg : BRAND_COLORS.lexi.bg
                  )}>
                    {step.completed ? (
                      <CheckCircle className={cn('w-5 h-5', BRAND_COLORS.success.text)} />
                    ) : (
                      <step.icon className={cn('w-5 h-5', BRAND_COLORS.lexi.text)} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">
                        {step.title}
                      </h4>
                      {step.current && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                    {step.estimatedTime && (
                      <Badge variant="outline" className="text-xs mt-2">
                        {step.estimatedTime}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )

  // SSR safety check
  if (screenSize.width === 0) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-muted rounded-lg" />
        <div className="h-32 bg-muted rounded-lg" />
        <div className="h-24 bg-muted rounded-lg" />
      </div>
    )
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn('w-full', className)}
    >
      {/* Render layout based on device type */}
      {deviceType === 'mobile' && renderMobileLayout()}
      {deviceType === 'tablet' && renderTabletLayout()}
      {deviceType === 'desktop' && renderDesktopLayout()}
    </motion.div>
  )
}

export default ResponsiveLexiOnboarding
