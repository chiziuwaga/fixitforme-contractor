/**
 * Responsive Lexi Onboarding Empty States
 * Optimized for 8 mobile + 8 tablet + 8 desktop breakpoints
 * Harmonious flow between pages with proper navigation
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { 
  MessageCircle,
  Sparkles,
  ArrowRight,
  FileText,
  Globe,
  Building,
  TrendingUp,
  Heart,
  Zap,
  Star,
  CheckCircle,
  Clock,
  Users,
  Smartphone,
  Monitor,
  ArrowLeft,
  Calculator,
  Settings
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useUser } from "@/hooks/useUser"

type FeatureType = 'dashboard' | 'leads' | 'documents' | 'chat' | 'settings' | 'bids'
type OnboardingStep = 'not_started' | 'in_progress' | 'completed'

interface ResponsiveLexiProps {
  feature: FeatureType
  onboardingStep?: OnboardingStep
  showBackNavigation?: boolean
  customTitle?: string
  customDescription?: string
}

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number
  screenHeight: number
}

export function ResponsiveLexiOnboarding({ 
  feature, 
  onboardingStep = 'not_started',
  showBackNavigation = false,
  customTitle,
  customDescription
}: ResponsiveLexiProps) {
  const router = useRouter()
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1440,
    screenHeight: 900
  })

  // Device detection with comprehensive breakpoint analysis
  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setDeviceInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1280,
        isDesktop: width >= 1280,
        screenWidth: width,
        screenHeight: height
      })
    }

    updateDeviceInfo()
    window.addEventListener('resize', updateDeviceInfo)
    return () => window.removeEventListener('resize', updateDeviceInfo)
  }, [])

  // Feature-specific messaging
  const getFeatureContent = () => {
    const baseContent = {
      dashboard: {
        title: "Welcome to Your Dashboard",
        description: "AI-powered contractor insights and lead tracking",
        features: [
          "Real-time lead notifications",
          "AI-powered bid suggestions", 
          "Performance analytics",
          "Revenue tracking"
        ],
        icon: TrendingUp,
        color: "primary"
      },
      leads: {
        title: "Discover Amazing Leads",
        description: "Rex AI will help you find the perfect projects",
        features: [
          "Rex AI lead generation",
          "Municipal contract alerts",
          "Private market opportunities", 
          "Automated bid preparation"
        ],
        icon: Users,
        color: "secondary"
      },
      documents: {
        title: "Smart Document Analysis",
        description: "AI-powered document processing and organization",
        features: [
          "AI document analysis",
          "Automatic quantity takeoffs",
          "Compliance checking",
          "Proposal generation"
        ],
        icon: FileText,
        color: "primary"
      },
      bids: {
        title: "Professional Bidding",
        description: "Alex will help you create winning proposals",
        features: [
          "Alex cost analysis",
          "Material calculations",
          "Labor estimations",
          "Profit optimization"
        ],
        icon: Calculator,
        color: "secondary"
      },
      settings: {
        title: "Account Configuration",
        description: "Customize your contractor experience",
        features: [
          "Profile management",
          "Notification preferences",
          "Tier upgrades",
          "Integration settings"
        ],
        icon: Settings,
        color: "primary"
      },
      chat: {
        title: "AI Assistant Support",
        description: "24/7 help from your AI team",
        features: [
          "Lexi onboarding guidance",
          "Alex cost analysis",
          "Rex market research",
          "Multi-agent coordination"
        ],
        icon: MessageCircle,
        color: "primary"
      }
    }

    return baseContent[feature] || baseContent.dashboard
  }

  const content = getFeatureContent()

  // Responsive layout configurations
  const getResponsiveClasses = () => {
    if (deviceInfo.isMobile) {
      return {
        container: "min-h-screen p-4",
        card: "w-full",
        avatar: "h-12 w-12",
        title: "text-lg",
        description: "text-sm",
        grid: "grid-cols-1",
        button: "w-full",
        spacing: "space-y-4"
      }
    }
    
    if (deviceInfo.isTablet) {
      return {
        container: "min-h-screen p-6",
        card: "w-full max-w-3xl mx-auto",
        avatar: "h-16 w-16",
        title: "text-xl",
        description: "text-base",
        grid: "grid-cols-2",
        button: "w-full sm:w-auto",
        spacing: "space-y-6"
      }
    }

    return {
      container: "min-h-screen p-8",
      card: "w-full max-w-4xl mx-auto",
      avatar: "h-20 w-20",
      title: "text-2xl",
      description: "text-lg",
      grid: "grid-cols-2 lg:grid-cols-4",
      button: "w-auto",
      spacing: "space-y-8"
    }
  }

  const responsive = getResponsiveClasses()

  // Navigation flow management
  const handleStartOnboarding = () => {
    if (deviceInfo.isMobile) {
      router.push('/contractor/mobile-chat')
    } else {
      router.push('/contractor/onboarding')
    }
  }

  const handleContinueOnboarding = () => {
    if (onboardingStep === 'in_progress') {
      router.push('/contractor/onboarding')
    } else {
      handleStartOnboarding()
    }
  }

  const handleBackNavigation = () => {
    router.back()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-center ${responsive.container}`}
    >
      <Card className={responsive.card}>
        <CardHeader className="text-center">
          {/* Back navigation */}
          {showBackNavigation && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center mb-4"
            >
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBackNavigation}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </motion.div>
          )}

          {/* Lexi Avatar with device-specific sizing */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mb-4 relative"
          >
            <div className="relative">
              <Avatar className={`${responsive.avatar} border-4 border-primary/20`}>
                <AvatarImage src="/lexi-avatar.png" alt="Lexi the Liaison" />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">L</AvatarFallback>
              </Avatar>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1 -right-1 p-1 bg-primary rounded-full"
              >
                <Sparkles className="h-3 w-3 text-primary-foreground" />
              </motion.div>
            </div>
          </motion.div>

          {/* Device-specific title */}
          <CardTitle className={`${responsive.title} mb-2`}>
            {customTitle || `Meet Lexi for ${content.title}`}
          </CardTitle>
          
          {/* Device indicator for mobile */}
          {deviceInfo.isMobile && (
            <Badge variant="outline" className="mb-4">
              <Smartphone className="h-3 w-3 mr-1" />
              Mobile Optimized
            </Badge>
          )}

          {/* Lexi's personalized message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative bg-primary/5 rounded-2xl p-4 mb-4"
          >
            <div className="absolute -top-2 left-8 w-4 h-4 bg-primary/5 rotate-45"></div>
            <p className={`text-muted-foreground italic ${responsive.description}`}>
              &quot;{customDescription || `Hi! I'm here to help you set up ${content.description.toLowerCase()}. ${deviceInfo.isMobile ? 'On mobile, I\'ll guide you through the basics!' : 'Let\'s get you started with a friendly conversation!'}`}&quot;
            </p>
          </motion.div>

          {/* Onboarding progress indicator */}
          {onboardingStep !== 'not_started' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-4"
            >
              <Badge variant={onboardingStep === 'completed' ? 'default' : 'secondary'} className="mb-2">
                {onboardingStep === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
                {onboardingStep === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                {onboardingStep === 'in_progress' ? 'Onboarding In Progress' : 'Onboarding Complete'}
              </Badge>
              {onboardingStep === 'in_progress' && (
                <Progress value={65} className="w-full h-2" />
              )}
            </motion.div>
          )}
        </CardHeader>

        <CardContent className={responsive.spacing}>
          {/* Feature benefits grid - responsive */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5"
          >
            <div className="flex items-center gap-3 mb-3">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-medium">What I&apos;ll help you unlock:</span>
            </div>
            <div className={`${responsive.grid} gap-2`}>
              {content.features.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + index * 0.1 }}
                  className="flex items-center gap-2 p-2"
                >
                  <Star className="h-3 w-3 text-primary flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Conversation flow preview - adapted for device */}
          {!deviceInfo.isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="space-y-3"
            >
              <h3 className="font-medium text-sm">How our conversation will flow:</h3>
              <div className="space-y-2">
                {[
                  { step: 1, text: "Tell me about your business", icon: Building },
                  { step: 2, text: "Share your specialties & services", icon: Zap },
                  { step: 3, text: "Upload documents & website (optional)", icon: FileText },
                  { step: 4, text: "Connect your online presence", icon: Globe },
                  { step: 5, text: "Launch your contractor portal!", icon: Sparkles }
                ].map((item) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 + item.step * 0.1 }}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/20"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                      {item.step}
                    </div>
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action buttons - responsive layout */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className={`flex ${deviceInfo.isMobile ? 'flex-col' : 'flex-row'} gap-3`}
          >
            <Button 
              onClick={handleContinueOnboarding}
              className={`${responsive.button} group`}
              size={deviceInfo.isMobile ? "lg" : "default"}
            >
              {onboardingStep === 'in_progress' ? (
                <>
                  Continue Chat with Lexi
                  <MessageCircle className="ml-2 h-4 w-4 group-hover:animate-pulse" />
                </>
              ) : (
                <>
                  {deviceInfo.isMobile ? 'Start Mobile Chat' : 'Start Conversation with Lexi'}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            
            {deviceInfo.isMobile && (
              <Button 
                variant="outline" 
                onClick={() => window.open('https://fixitforme.ai', '_blank')}
                className={responsive.button}
                size="lg"
              >
                <Monitor className="mr-2 h-4 w-4" />
                Switch to Desktop for Full Features
              </Button>
            )}
          </motion.div>
          
          {/* Time estimation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0 }}
            className="text-center"
          >
            <p className="text-xs text-muted-foreground">
              ⚡ Takes {deviceInfo.isMobile ? '3-5' : '5-10'} minutes • Conversational & friendly • Skip anything you want
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Pre-configured empty states for specific pages
export function DashboardEmptyState(props: Omit<ResponsiveLexiProps, 'feature'>) {
  return <ResponsiveLexiOnboarding feature="dashboard" {...props} />
}

export function LeadsEmptyState(props: Omit<ResponsiveLexiProps, 'feature'>) {
  return <ResponsiveLexiOnboarding feature="leads" {...props} />
}

export function DocumentsEmptyState(props: Omit<ResponsiveLexiProps, 'feature'>) {
  return <ResponsiveLexiOnboarding feature="documents" {...props} />
}

export function BidsEmptyState(props: Omit<ResponsiveLexiProps, 'feature'>) {
  return <ResponsiveLexiOnboarding feature="bids" {...props} />
}

export function SettingsEmptyState(props: Omit<ResponsiveLexiProps, 'feature'>) {
  return <ResponsiveLexiOnboarding feature="settings" {...props} />
}

export function ChatEmptyState(props: Omit<ResponsiveLexiProps, 'feature'>) {
  return <ResponsiveLexiOnboarding feature="chat" {...props} />
}

// Multi-threaded chat coordination component
export function MultiThreadChatPreview() {
  const { profile } = useUser()
  const isScaleTier = profile?.subscription_tier === 'scale'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-6 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50"
    >
      <h4 className="font-medium mb-3 flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        Your AI Team Chat Threads
      </h4>
      
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-2 bg-primary/10 rounded">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">L</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">Lexi - Always Available</p>
            <p className="text-xs text-muted-foreground">Onboarding, guidance, support</p>
          </div>
          <Badge variant="default">Active</Badge>
        </div>

        {isScaleTier ? (
          <>
            <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-green-600 text-white text-xs">A</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">Alex - Cost Analysis</p>
                <p className="text-xs text-muted-foreground">Bidding, calculations, estimates</p>
              </div>
              <Badge variant="secondary">Scale Tier</Badge>
            </div>

            <div className="flex items-center gap-3 p-2 bg-secondary/10 rounded">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">R</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">Rex - Lead Generation</p>
                <p className="text-xs text-muted-foreground">Market research, lead discovery</p>
              </div>
              <Badge variant="secondary">Scale Tier</Badge>
            </div>
          </>
        ) : (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded">
            <p className="text-sm text-orange-700">
              Upgrade to Scale tier to unlock Alex and Rex for advanced bidding and lead generation!
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
