"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  X, 
  Smartphone, 
  Share, 
  Plus,
  Monitor,
  Download,
  Home,
  MoreVertical,
  ChevronRight
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AddToHomeScreenGuideProps {
  isOpen: boolean
  onClose: () => void
}

type Platform = 'ios' | 'android' | 'other'

interface PlatformInfo {
  name: string
  icon: React.ReactNode
  color: string
  steps: Array<{
    step: number
    icon: React.ReactNode
    title: string
    description: string
    visual?: string
  }>
}

const platformGuides: Record<Platform, PlatformInfo> = {
  ios: {
    name: "iOS Safari",
    icon: "🍎",
    color: "text-blue-600",
    steps: [
      {
        step: 1,
        icon: <Share className="h-4 w-4" />,
        title: "Tap the Share button",
        description: "Look for the share icon at the bottom of Safari",
        visual: "📱 Tap the square with arrow pointing up"
      },
      {
        step: 2,
        icon: <Plus className="h-4 w-4" />,
        title: "Find 'Add to Home Screen'",
        description: "Scroll down in the share menu and tap 'Add to Home Screen'",
        visual: "🏠➕ Usually in the second row of options"
      },
      {
        step: 3,
        icon: <Home className="h-4 w-4" />,
        title: "Confirm and Add",
        description: "Edit the name if needed, then tap 'Add' in the top right",
        visual: "✅ FixItForMe Mobile will appear on your home screen"
      }
    ]
  },
  android: {
    name: "Android Chrome",
    icon: "🤖",
    color: "text-green-600",
    steps: [
      {
        step: 1,
        icon: <MoreVertical className="h-4 w-4" />,
        title: "Open Chrome menu",
        description: "Tap the three dots in the top right corner",
        visual: "⋮ Three vertical dots menu"
      },
      {
        step: 2,
        icon: <Download className="h-4 w-4" />,
        title: "Select 'Add to Home screen'",
        description: "Look for 'Add to Home screen' or 'Install app' option",
        visual: "📲 May show 'Install FixItForMe Mobile'"
      },
      {
        step: 3,
        icon: <Home className="h-4 w-4" />,
        title: "Confirm Installation",
        description: "Tap 'Add' or 'Install' to place the app on your home screen",
        visual: "🚀 App icon will appear with native app functionality"
      }
    ]
  },
  other: {
    name: "Other Browsers",
    icon: "🌐",
    color: "text-gray-600",
    steps: [
      {
        step: 1,
        icon: <Monitor className="h-4 w-4" />,
        title: "Use Chrome or Safari",
        description: "For best results, open FixItForMe in Chrome (Android) or Safari (iOS)",
        visual: "🔄 Switch to recommended browser"
      },
      {
        step: 2,
        icon: <Share className="h-4 w-4" />,
        title: "Look for share/menu options",
        description: "Most browsers have add to home screen in share or menu",
        visual: "📋 Check browser menu or share options"
      },
      {
        step: 3,
        icon: <Home className="h-4 w-4" />,
        title: "Bookmark as alternative",
        description: "If unavailable, bookmark the site for quick access",
        visual: "⭐ Save bookmark for easy access"
      }
    ]
  }
}

export function AddToHomeScreenGuide({ isOpen, onClose }: AddToHomeScreenGuideProps) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('other')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Only run on client side to avoid SSR issues
    setIsClient(true)
    
    if (typeof window === 'undefined') return

    // Detect platform
    const userAgent = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    const isAndroid = /Android/.test(userAgent)
    const isChrome = /Chrome/.test(userAgent)
    const isSafari = /Safari/.test(userAgent) && !isChrome

    if (isIOS && isSafari) {
      setCurrentPlatform('ios')
    } else if (isAndroid && isChrome) {
      setCurrentPlatform('android')
    } else {
      setCurrentPlatform('other')
    }
  }, [])

  // Don't render on server or if not client-ready
  if (!isClient) return null

  const currentGuide = platformGuides[currentPlatform]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
          >
            <Card className="rounded-t-2xl rounded-b-none border-t shadow-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                      <Home className="h-5 w-5" />
                    </div>
                    <div>
                      <span>Add to Home Screen</span>
                      <p className="text-sm font-normal text-muted-foreground">
                        Quick access to FixItForMe Mobile
                      </p>
                    </div>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Platform Selector */}
                <div className="flex gap-2 mt-4">
                  {Object.entries(platformGuides).map(([platform, guide]) => (
                    <Button
                      key={platform}
                      variant={currentPlatform === platform ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPlatform(platform as Platform)}
                      className="flex items-center gap-2"
                    >
                      <span>{guide.icon}</span>
                      <span className="text-xs">{guide.name}</span>
                    </Button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="max-h-[60vh] overflow-y-auto">
                {/* Platform-Specific Instructions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">
                        Instructions for {currentGuide.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Follow these steps to install FixItForMe Mobile
                      </p>
                    </div>
                  </div>

                  {/* Step-by-step guide */}
                  {currentGuide.steps.map((step, index) => (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4 p-3 border rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                          {step.step}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {step.icon}
                          <h3 className="font-semibold text-sm">{step.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {step.description}
                        </p>
                        {step.visual && (
                          <div className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                            {step.visual}
                          </div>
                        )}
                      </div>

                      <ChevronRight className="h-4 w-4 text-muted-foreground self-center" />
                    </motion.div>
                  ))}

                  {/* Benefits Section */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      🚀 Why Add to Home Screen?
                    </h3>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• ⚡ Instant access - no browser needed</li>
                      <li>• 📱 Native app-like experience</li>
                      <li>• 🔔 Push notifications for new leads</li>
                      <li>• 💾 Offline functionality</li>
                      <li>• 🎨 Clean interface without browser bars</li>
                    </ul>
                  </div>

                  {/* Troubleshooting */}
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="font-medium text-sm text-orange-800 mb-1">
                      Don&apos;t see the option?
                    </h4>
                    <p className="text-xs text-orange-700">
                      {currentPlatform === 'ios' && 
                        "Make sure you&apos;re using Safari browser. Other browsers on iOS don&apos;t support this feature."
                      }
                      {currentPlatform === 'android' && 
                        "Try using Chrome browser for the best experience. Some browsers may not show the install option."
                      }
                      {currentPlatform === 'other' && 
                        "Switch to Chrome (Android) or Safari (iOS) for add to home screen functionality."
                      }
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-6">
                    <Button 
                      className="flex-1" 
                      onClick={onClose}
                    >
                      Got it! 👍
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={onClose}
                      className="px-4"
                    >
                      Maybe Later
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
