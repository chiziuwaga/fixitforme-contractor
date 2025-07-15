'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Check, 
  ChevronRight, 
  Monitor, 
  Smartphone, 
  Tablet,
  Navigation,
  Settings,
  User,
  Building,
  MapPin,
  FileText,
  Star,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useEnhancedOnboardingChat } from '@/hooks/useEnhancedOnboardingChat';

// ============================================================================
// RESPONSIVE BREAKPOINT SYSTEM (8 BREAKPOINTS PER DEVICE)
// ============================================================================

// Breakpoints configuration for responsive design reference
// Note: Actual responsive behavior is handled by Tailwind CSS classes

// ============================================================================
// DEVICE DETECTION HOOK
// ============================================================================

const useDeviceDetection = () => {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [breakpoint, setBreakpoint] = useState<string>('xs');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Determine device type
      if (width <= 896) {
        setDevice('mobile');
        // Determine mobile breakpoint
        if (width <= 320) setBreakpoint('xs');
        else if (width <= 375) setBreakpoint('sm');
        else if (width <= 414) setBreakpoint('md');
        else if (width <= 480) setBreakpoint('lg');
        else if (width <= 568) setBreakpoint('xl');
        else if (width <= 667) setBreakpoint('2xl');
        else if (width <= 736) setBreakpoint('3xl');
        else setBreakpoint('max');
      } else if (width <= 1440) {
        setDevice('tablet');
        // Determine tablet breakpoint
        if (width <= 744) setBreakpoint('xs');
        else if (width <= 820) setBreakpoint('sm');
        else if (width <= 834) setBreakpoint('md');
        else if (width <= 1024) setBreakpoint('lg');
        else if (width <= 1112) setBreakpoint('xl');
        else if (width <= 1194) setBreakpoint('2xl');
        else if (width <= 1366) setBreakpoint('3xl');
        else setBreakpoint('max');
      } else {
        setDevice('desktop');
        // Determine desktop breakpoint
        if (width <= 1441) setBreakpoint('xs');
        else if (width <= 1536) setBreakpoint('sm');
        else if (width <= 1728) setBreakpoint('md');
        else if (width <= 1920) setBreakpoint('lg');
        else if (width <= 2560) setBreakpoint('xl');
        else if (width <= 3440) setBreakpoint('2xl');
        else if (width <= 3840) setBreakpoint('3xl');
        else setBreakpoint('max');
      }

      // Determine orientation
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    updateDevice();
    window.addEventListener('resize', updateDevice);
    return () => window.removeEventListener('resize', updateDevice);
  }, []);

  return { device, breakpoint, orientation };
};

// ============================================================================
// RESPONSIVE LAYOUT GENERATOR
// ============================================================================

const generateResponsiveClasses = (
  device: 'mobile' | 'tablet' | 'desktop',
  breakpoint: string,
  orientation: 'portrait' | 'landscape'
) => {
  const baseClasses = 'w-full min-h-screen bg-background';
  
  // Mobile-first responsive classes
  const mobileClasses = {
    xs: 'p-2 text-sm',
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-4 text-base',
    xl: 'p-5 text-base',
    '2xl': 'p-5 text-lg',
    '3xl': 'p-6 text-lg',
    max: 'p-6 text-lg'
  };

  const tabletClasses = {
    xs: 'p-6 text-base grid-cols-1',
    sm: 'p-8 text-base grid-cols-2',
    md: 'p-8 text-lg grid-cols-2',
    lg: 'p-10 text-lg grid-cols-3',
    xl: 'p-12 text-xl grid-cols-3',
    '2xl': 'p-14 text-xl grid-cols-4',
    '3xl': 'p-16 text-2xl grid-cols-4',
    max: 'p-18 text-2xl grid-cols-5'
  };

  const desktopClasses = {
    xs: 'p-8 text-lg grid-cols-3',
    sm: 'p-10 text-lg grid-cols-4',
    md: 'p-12 text-xl grid-cols-4',
    lg: 'p-16 text-xl grid-cols-5',
    xl: 'p-20 text-2xl grid-cols-6',
    '2xl': 'p-24 text-2xl grid-cols-8',
    '3xl': 'p-28 text-3xl grid-cols-10',
    max: 'p-32 text-4xl grid-cols-12'
  };

  const deviceClasses = device === 'mobile' ? mobileClasses :
                       device === 'tablet' ? tabletClasses :
                       desktopClasses;

  const orientationClasses = orientation === 'landscape' ? 'flex-row' : 'flex-col';
  
  return cn(
    baseClasses,
    deviceClasses[breakpoint as keyof typeof deviceClasses],
    orientationClasses
  );
};

// ============================================================================
// STEP COMPONENTS WITH RESPONSIVE DESIGN
// ============================================================================

interface StepProps {
  step: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  isCompleted: boolean;
  device: 'mobile' | 'tablet' | 'desktop';
  breakpoint: string;
  onClick: () => void;
}

const OnboardingStep: React.FC<StepProps> = ({
  title,
  description,
  icon: Icon,
  isActive,
  isCompleted,
  device,
  breakpoint,
  onClick
}) => {
  const cardSizes = {
    mobile: { xs: 'h-16', sm: 'h-18', md: 'h-20', lg: 'h-22', xl: 'h-24', '2xl': 'h-26', '3xl': 'h-28', max: 'h-30' },
    tablet: { xs: 'h-20', sm: 'h-24', md: 'h-28', lg: 'h-32', xl: 'h-36', '2xl': 'h-40', '3xl': 'h-44', max: 'h-48' },
    desktop: { xs: 'h-24', sm: 'h-28', md: 'h-32', lg: 'h-36', xl: 'h-40', '2xl': 'h-48', '3xl': 'h-56', max: 'h-64' }
  };

  const iconSizes = {
    mobile: { xs: 'h-4 w-4', sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-5 w-5', xl: 'h-6 w-6', '2xl': 'h-6 w-6', '3xl': 'h-7 w-7', max: 'h-8 w-8' },
    tablet: { xs: 'h-5 w-5', sm: 'h-6 w-6', md: 'h-7 w-7', lg: 'h-8 w-8', xl: 'h-9 w-9', '2xl': 'h-10 w-10', '3xl': 'h-11 w-11', max: 'h-12 w-12' },
    desktop: { xs: 'h-6 w-6', sm: 'h-7 w-7', md: 'h-8 w-8', lg: 'h-9 w-9', xl: 'h-10 w-10', '2xl': 'h-12 w-12', '3xl': 'h-14 w-14', max: 'h-16 w-16' }
  };

  const cardHeight = cardSizes[device][breakpoint as keyof typeof cardSizes[typeof device]];
  const iconSize = iconSizes[device][breakpoint as keyof typeof iconSizes[typeof device]];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: device === 'mobile' ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={cn(
          'cursor-pointer transition-all duration-200 border-2',
          cardHeight,
          isActive && 'border-primary bg-primary/5',
          isCompleted && 'border-green-500 bg-green-50',
          !isActive && !isCompleted && 'border-muted hover:border-primary/50'
        )}
        onClick={onClick}
      >
        <CardContent className="flex items-center gap-3 p-3 h-full">
          <div className={cn(
            'rounded-full p-2 flex items-center justify-center',
            isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-white' : 'bg-muted'
          )}>
            {isCompleted ? <Check className={iconSize} /> : <Icon className={iconSize} />}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'font-semibold truncate',
              device === 'mobile' ? 'text-sm' : device === 'tablet' ? 'text-base' : 'text-lg'
            )}>
              {title}
            </h3>
            {device !== 'mobile' && (
              <p className="text-muted-foreground text-sm truncate">
                {description}
              </p>
            )}
          </div>

          {isActive && (
            <ChevronRight className={cn(
              'text-primary',
              device === 'mobile' ? 'h-4 w-4' : 'h-5 w-5'
            )} />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ============================================================================
// MAIN RESPONSIVE ONBOARDING COMPONENT
// ============================================================================

interface ResponsiveOnboardingDashboardProps {
  className?: string;
}

export const ResponsiveOnboardingDashboard: React.FC<ResponsiveOnboardingDashboardProps> = ({
  className
}) => {
  const { device, breakpoint, orientation } = useDeviceDetection();
  const {
    activeConversation,
    loading,
    currentStep,
    completionPercentage,
    updateOnboardingStep,
    generateNuancedWelcome,
    responsiveConfig
  } = useEnhancedOnboardingChat();

  const [showChat, setShowChat] = useState(false);

  // Onboarding steps configuration
  const steps = useMemo(() => [
    {
      id: 'welcome',
      title: 'Welcome',
      description: 'Get started with FixItForMe',
      icon: Star,
    },
    {
      id: 'company_info',
      title: 'Company Info',
      description: 'Tell us about your business',
      icon: Building,
    },
    {
      id: 'service_selection',
      title: 'Services',
      description: 'Select your specialties',
      icon: Settings,
    },
    {
      id: 'service_areas',
      title: 'Service Areas',
      description: 'Define your territories',
      icon: MapPin,
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Upload licenses & insurance',
      icon: FileText,
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your experience',
      icon: User,
    }
  ], []);

  const handleStepClick = useCallback((stepId: string) => {
    updateOnboardingStep(stepId as 'welcome' | 'company_info' | 'service_selection' | 'service_areas' | 'documents' | 'preferences');
  }, [updateOnboardingStep]);

  const toggleChat = useCallback(() => {
    setShowChat(prev => !prev);
    if (!showChat && !activeConversation?.messages?.length) {
      generateNuancedWelcome();
    }
  }, [showChat, activeConversation, generateNuancedWelcome]);

  // Responsive layout classes
  const layoutClasses = generateResponsiveClasses(device, breakpoint, orientation);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Initializing your onboarding experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(layoutClasses, className)}>
      {/* Header with Device Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className={cn(
              'font-bold text-foreground',
              device === 'mobile' ? 'text-xl' : device === 'tablet' ? 'text-2xl' : 'text-3xl'
            )}>
              Welcome to FixItForMe! 🎉
            </h1>
            <p className="text-muted-foreground">
              Let&apos;s get your contractor profile set up in just a few steps
            </p>
          </div>

          {/* Device & Breakpoint Indicator */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              {device === 'mobile' && <Smartphone className="h-3 w-3" />}
              {device === 'tablet' && <Tablet className="h-3 w-3" />}
              {device === 'desktop' && <Monitor className="h-3 w-3" />}
              {device} {breakpoint}
            </Badge>
            
            {responsiveConfig && (
              <Badge variant="secondary">
                {responsiveConfig.navigation}
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Setup Progress</span>
            <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className={cn(
        'grid gap-4',
        device === 'mobile' ? 'grid-cols-1' :
        device === 'tablet' ? 'grid-cols-2' :
        'grid-cols-3'
      )}>
        {/* Onboarding Steps */}
        <div className={cn(
          'space-y-3',
          device === 'desktop' ? 'col-span-2' : 'col-span-1'
        )}>
          <h2 className={cn(
            'font-semibold mb-4',
            device === 'mobile' ? 'text-lg' : 'text-xl'
          )}>
            Setup Steps
          </h2>
          
          {steps.map((step, index) => (
            <OnboardingStep
              key={step.id}
              step={step.id}
              title={step.title}
              description={step.description}
              icon={step.icon}
              isActive={currentStep === step.id}
              isCompleted={steps.slice(0, index).every(() => {
                const stepIndex = steps.findIndex(step => step.id === currentStep);
                return index < stepIndex || (currentStep === 'complete');
              })}
              device={device}
              breakpoint={breakpoint}
              onClick={() => handleStepClick(step.id)}
            />
          ))}
        </div>

        {/* Chat Interface */}
        <div className={cn(
          'space-y-4',
          device === 'mobile' && 'order-first'
        )}>
          <div className="flex items-center justify-between">
            <h2 className={cn(
              'font-semibold',
              device === 'mobile' ? 'text-lg' : 'text-xl'
            )}>
              Chat with Lexi
            </h2>
            <Button
              onClick={toggleChat}
              variant={showChat ? "default" : "outline"}
              size={device === 'mobile' ? 'sm' : 'default'}
              className="gap-2"
            >
              <MessageCircle className={cn(
                device === 'mobile' ? 'h-3 w-3' : 'h-4 w-4'
              )} />
              {showChat ? 'Hide Chat' : 'Start Chat'}
            </Button>
          </div>

          <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={cn(
                  'overflow-hidden',
                  device === 'mobile' ? 'h-64' : device === 'tablet' ? 'h-80' : 'h-96'
                )}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/lexi-avatar.png" />
                        <AvatarFallback className="bg-primary text-white text-xs">L</AvatarFallback>
                      </Avatar>
                      Lexi the Liaison
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Onboarding Guide
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <div className="h-full flex items-center justify-center text-center p-4">
                      <div className="space-y-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                          <MessageCircle className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Chat interface will be integrated here with your onboarding conversation
                        </p>
                        <Button 
                          onClick={generateNuancedWelcome}
                          variant="outline" 
                          size="sm"
                        >
                          Start Conversation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Navigation */}
      {device === 'mobile' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-background border-t p-4"
        >
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm">
              <Navigation className="h-4 w-4 mr-2" />
              Menu
            </Button>
            
            <Badge variant="default" className="text-xs">
              {device} • {orientation}
            </Badge>
            
            <Button 
              onClick={toggleChat}
              variant={showChat ? "default" : "outline"}
              size="sm"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
