"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  ChevronUp, 
  ChevronDown, 
  Smartphone, 
  Share, 
  Plus,
  Menu,
  Home,
  X
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

interface PlatformGuide {
  platform: 'ios' | 'android' | 'other'
  title: string
  browser: string
  steps: {
    step: number
    instruction: string
    icon?: React.ReactNode
    detail?: string
  }[]
}

const PLATFORM_GUIDES: PlatformGuide[] = [
  {
    platform: 'ios',
    title: 'Add to iPhone/iPad Home Screen',
    browser: 'Safari',
    steps: [
      {
        step: 1,
        instruction: 'Open this page in Safari',
        detail: 'Make sure you\'re using Safari browser, not Chrome or other browsers',
        icon: <Smartphone className="h-4 w-4" />
      },
      {
        step: 2,
        instruction: 'Tap the Share button',
        detail: 'Look for the square with arrow pointing up at the bottom of screen',
        icon: <Share className="h-4 w-4" />
      },
      {
        step: 3,
        instruction: 'Scroll down and tap "Add to Home Screen"',
        detail: 'You may need to scroll down in the share menu to find this option',
        icon: <Plus className="h-4 w-4" />
      },
      {
        step: 4,
        instruction: 'Tap "Add" to confirm',
        detail: 'The FixItForMe icon will appear on your home screen',
        icon: <Home className="h-4 w-4" />
      }
    ]
  },
  {
    platform: 'android',
    title: 'Add to Android Home Screen',
    browser: 'Chrome',
    steps: [
      {
        step: 1,
        instruction: 'Open this page in Chrome',
        detail: 'Make sure you\'re using Google Chrome browser',
        icon: <Smartphone className="h-4 w-4" />
      },
      {
        step: 2,
        instruction: 'Tap the Menu (⋮) button',
        detail: 'Three dots in the top-right corner of Chrome',
        icon: <Menu className="h-4 w-4" />
      },
      {
        step: 3,
        instruction: 'Select "Add to Home screen" or "Install app"',
        detail: 'Some Android versions show "Install app" instead',
        icon: <Plus className="h-4 w-4" />
      },
      {
        step: 4,
        instruction: 'Tap "Add" or "Install" to confirm',
        detail: 'The FixItForMe app will appear on your home screen',
        icon: <Home className="h-4 w-4" />
      }
    ]
  },
  {
    platform: 'other',
    title: 'Add to Home Screen',
    browser: 'Other Browser',
    steps: [
      {
        step: 1,
        instruction: 'Look for browser menu',
        detail: 'Usually three dots (⋮) or lines (☰) in corner',
        icon: <Menu className="h-4 w-4" />
      },
      {
        step: 2,
        instruction: 'Find "Add to Home Screen" option',
        detail: 'May be labeled differently depending on browser',
        icon: <Plus className="h-4 w-4" />
      },
      {
        step: 3,
        instruction: 'Bookmark if unavailable',
        detail: 'Some browsers don\'t support home screen installation',
        icon: <Home className="h-4 w-4" />
      }
    ]
  }
]

export function MobileAddToHomeScreenGuide() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentGuide, setCurrentGuide] = useState<PlatformGuide>(PLATFORM_GUIDES[0])
  const [isVisible, setIsVisible] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase()
    let detectedGuide = PLATFORM_GUIDES[2] // default to 'other'
    
    if (/iphone|ipad|ipod/.test(userAgent) && /safari/.test(userAgent) && !/chrome/.test(userAgent)) {
      detectedGuide = PLATFORM_GUIDES[0] // iOS Safari
    } else if (/android/.test(userAgent) && /chrome/.test(userAgent)) {
      detectedGuide = PLATFORM_GUIDES[1] // Android Chrome
    }
    
    setCurrentGuide(detectedGuide)

    // Show guide after user has been on page for 15 seconds
    const timer = setTimeout(() => {
      // Only show if not already installed as PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isDismissed = sessionStorage.getItem('addToHomeScreen-dismissed')
      
      if (!isStandalone && !isDismissed) {
        setIsVisible(true)
      }
    }, 15000)

    return () => clearTimeout(timer)
  }, [isClient])

  const handleDismiss = () => {
    setIsVisible(false)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('addToHomeScreen-dismissed', 'true')
    }
  }

  const handlePlatformChange = (platform: 'ios' | 'android' | 'other') => {
    const guide = PLATFORM_GUIDES.find(g => g.platform === platform)
    if (guide) setCurrentGuide(guide)
  }

  // Only show on mobile devices
  if (!isClient || !isMobile || !isVisible) {
    return null
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]"
        >
          <Card className="border-primary/20 bg-card/95 backdrop-blur-sm shadow-lg">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-2 cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <Smartphone className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <span>Add to Home Screen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDismiss()
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Install FixItForMe as an app for quick contractor access
                  </p>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  {/* Platform Selector */}
                  <div className="flex gap-1 mb-4 p-1 bg-muted rounded-lg">
                    {PLATFORM_GUIDES.map((guide) => (
                      <Button
                        key={guide.platform}
                        variant={currentGuide.platform === guide.platform ? "default" : "ghost"}
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handlePlatformChange(guide.platform)}
                      >
                        {guide.platform === 'ios' ? '📱 iOS' : 
                         guide.platform === 'android' ? '🤖 Android' : '🌐 Other'}
                      </Button>
                    ))}
                  </div>

                  {/* Instructions */}
                  <div className="space-y-3">
                    <div className="text-center">
                      <h4 className="font-medium text-sm text-foreground mb-1">
                        {currentGuide.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Using {currentGuide.browser}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {currentGuide.steps.map((step) => (
                        <motion.div
                          key={step.step}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: step.step * 0.1 }}
                          className="flex gap-3 p-2 rounded-md bg-muted/30"
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {step.step}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {step.icon}
                              <p className="text-xs font-medium text-foreground">
                                {step.instruction}
                              </p>
                            </div>
                            {step.detail && (
                              <p className="text-xs text-muted-foreground">
                                {step.detail}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Benefits */}
                    <div className="mt-4 p-3 bg-primary/5 rounded-md border border-primary/10">
                      <p className="text-xs font-medium text-primary mb-1">
                        📋 Quick Access Benefits:
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Instant lead notifications</li>
                        <li>• Chat with Lexi anywhere</li>
                        <li>• Offline dashboard access</li>
                        <li>• Fast payment tracking</li>
                      </ul>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={handleDismiss}
                      >
                        Maybe Later
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={handleDismiss}
                      >
                        Got It!
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
