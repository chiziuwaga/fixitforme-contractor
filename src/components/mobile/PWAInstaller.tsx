"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Download, Smartphone } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration)
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error)
        })
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(standalone)

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show install prompt after user has been on site for 30 seconds
      setTimeout(() => {
        if (!standalone) {
          setShowInstallPrompt(true)
        }
      }, 30000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    console.log('[PWA] User choice:', outcome)
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Don't show again for this session (client-side only)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pwa-install-dismissed', 'true')
    }
  }

  // Don't show if already installed or dismissed (client-side check)
  const isDismissed = typeof window !== 'undefined' && sessionStorage.getItem('pwa-install-dismissed')
  if (isStandalone || isDismissed) {
    return null
  }

  return (
    <AnimatePresence>
      {showInstallPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 z-50 lg:left-auto lg:right-4 lg:w-80"
        >
          <Card className="border-primary/20 bg-card/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <Smartphone className="h-5 w-5 text-primary-foreground" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-foreground">
                    Install FixItForMe Mobile
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isIOS 
                      ? "Add to Home Screen for quick access to leads and Lexi chat"
                      : "Install our mobile app for instant lead notifications and offline access"
                    }
                  </p>
                  
                  <div className="flex gap-2 mt-3">
                    {isIOS ? (
                      <Button size="sm" variant="outline" className="text-xs" onClick={handleDismiss}>
                        Add to Home Screen
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className="text-xs" 
                        onClick={handleInstallClick}
                        disabled={!deferredPrompt}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Install
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-xs"
                      onClick={handleDismiss}
                    >
                      Maybe Later
                    </Button>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground"
                  onClick={handleDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
