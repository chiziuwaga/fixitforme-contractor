/**
 * Onboarding Layout Component
 * Controls system access and visual states during onboarding
 * Greys out all features except chat and onboarding until complete
 */

import React, { ReactNode } from 'react';
import { useOnboardingGate } from '@/hooks/useOnboardingGate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Lock, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  MessageSquare,
  Shield,
  AlertTriangle,
  Users,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingLayoutProps {
  children: ReactNode;
  className?: string;
}

// Feature access overlay component
function FeatureBlockedOverlay({ 
  featureName, 
  onUpgrade 
}: { 
  featureName: string; 
  onUpgrade?: () => void;
}) {
  return (
    <div className="absolute inset-0 bg-gray-50/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-xl">Complete Onboarding First</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            {featureName} will be available once you complete the onboarding process with Lexi.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={onUpgrade}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Continue Onboarding
            </Button>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <MessageSquare className="h-4 w-4" />
              <span>Chat with Lexi is always available</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Onboarding progress sidebar
function OnboardingProgress({ 
  status, 
  steps, 
  onStepClick 
}: { 
  status: any; 
  steps: any[]; 
  onStepClick: (stepId: string) => void;
}) {
  const completionPercentage = (status.completedSteps.length / status.totalSteps) * 100;

  return (
    <Card className="w-80 h-fit">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <span>Getting Started</span>
        </CardTitle>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{status.completedSteps.length}/{status.totalSteps}</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <div className="text-xs text-gray-500">
            {Math.round(completionPercentage)}% Complete
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="space-y-1">
          {steps.map((step, index) => {
            const isCompleted = step.isCompleted;
            const isCurrent = index === status.currentStep;
            const isAccessible = index <= status.currentStep;

            return (
              <div
                key={step.id}
                onClick={() => isAccessible && onStepClick(step.id)}
                className={cn(
                  'p-4 border-l-4 cursor-pointer transition-all',
                  isCompleted && 'bg-green-50 border-green-500',
                  isCurrent && !isCompleted && 'bg-primary/10 border-primary',
                  !isCompleted && !isCurrent && 'bg-gray-50 border-gray-200',
                  !isAccessible && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5',
                    isCompleted && 'bg-green-500 text-white',
                    isCurrent && !isCompleted && 'bg-primary text-white',
                    !isCompleted && !isCurrent && 'bg-gray-300 text-gray-600'
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      'text-sm font-medium',
                      isCompleted && 'text-green-900',
                      isCurrent && !isCompleted && 'text-primary',
                      !isCompleted && !isCurrent && 'text-gray-700'
                    )}>
                      {step.title}
                    </h4>
                    
                    <p className={cn(
                      'text-xs mt-1',
                      isCompleted && 'text-green-700',
                      isCurrent && !isCompleted && 'text-primary/80',
                      !isCompleted && !isCurrent && 'text-gray-500'
                    )}>
                      {step.description}
                    </p>
                    
                    {step.estimatedMinutes && !isCompleted && (
                      <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{step.estimatedMinutes} min</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Main onboarding layout
export function OnboardingLayout({ children, className }: OnboardingLayoutProps) {
  const { 
    status, 
    steps, 
    isLoading, 
    canAccessFeature, 
    getNextStep,
    getCompletionPercentage 
  } = useOnboardingGate();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your onboarding status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If onboarding is complete, render normally
  if (status.isComplete) {
    return (
      <div className={cn('min-h-screen bg-gray-50', className)}>
        {children}
      </div>
    );
  }

  // Onboarding mode - show progress and controlled access
  const nextStep = getNextStep();
  const completionPercentage = getCompletionPercentage();

  const handleStepClick = (stepId: string) => {
    // Navigate to specific onboarding step
    console.log('Navigate to step:', stepId);
  };

  const handleContinueOnboarding = () => {
    // Navigate to current/next onboarding step
    console.log('Continue onboarding to step:', nextStep?.id);
  };

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Onboarding header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="text-xl font-bold text-gray-900">FixItForMe</div>
              <div className="hidden md:block">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <Users className="h-3 w-3 mr-1" />
                  Getting Started
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-sm text-gray-600">
                {status.completedSteps.length} of {status.totalSteps} steps complete
              </div>
              
              <Progress value={completionPercentage} className="w-24 h-2" />
              
              {nextStep && (
                <Button 
                  onClick={handleContinueOnboarding}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Continue Setup
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content with sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Onboarding progress sidebar */}
          <div className="flex-shrink-0">
            <OnboardingProgress 
              status={status}
              steps={steps}
              onStepClick={handleStepClick}
            />
          </div>

          {/* Main content area */}
          <div className="flex-1 relative">
            {/* Welcome message for new users */}
            {status.currentStep === 0 && (
              <Card className="mb-8 border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-2">
                        Welcome to FixItForMe! 👋
                      </h3>
                      <p className="text-primary/80 mb-4">
                        Let's get your contractor business set up for success. This quick setup will 
                        help our AI agents provide you with personalized leads and cost analysis.
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-primary/70">
                        <Clock className="h-4 w-4" />
                        <span>Estimated time: {steps.reduce((acc, step) => acc + (step.estimatedMinutes || 0), 0)} minutes</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Content with access control */}
            <div className="relative">
              {children}
              
              {/* Feature access control overlay */}
              {!canAccessFeature('dashboard') && (
                <FeatureBlockedOverlay 
                  featureName="Dashboard Features"
                  onUpgrade={handleContinueOnboarding}
                />
              )}
            </div>

            {/* Next steps callout */}
            {nextStep && (
              <Card className="mt-8 border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                        <ArrowRight className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-orange-900">Next Step: {nextStep.title}</h4>
                        <p className="text-sm text-orange-700">{nextStep.description}</p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleContinueOnboarding}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Chat is always accessible */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg">
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

// Feature wrapper component for access control
interface FeatureWrapperProps {
  children: ReactNode;
  featureName: string;
  className?: string;
  fallbackComponent?: ReactNode;
}

export function FeatureWrapper({ 
  children, 
  featureName, 
  className,
  fallbackComponent 
}: FeatureWrapperProps) {
  const { canAccessFeature } = useOnboardingGate();

  if (!canAccessFeature(featureName)) {
    return (
      <div className={cn('relative', className)}>
        {fallbackComponent || (
          <div className="opacity-30 pointer-events-none">
            {children}
          </div>
        )}
        <FeatureBlockedOverlay featureName={featureName} />
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

// Badge component for compatibility
function Badge({ children, variant, className }: { 
  children: ReactNode; 
  variant?: string; 
  className?: string;
}) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variant === 'outline' && 'border border-gray-200 text-gray-600',
      className
    )}>
      {children}
    </span>
  );
}
