"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Home, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AddToHomeScreenGuide } from "./AddToHomeScreenGuide"

export function MobileAddToHomeScreenTrigger() {
  const [isClient, setIsClient] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    // Only run on client side to avoid SSR issues
    setIsClient(true)
    
    if (typeof window === 'undefined') return

    // Check if mobile device
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(isMobileDevice)
      
      // Only show on mobile devices
      if (!isMobileDevice) {
        setShouldShow(false)
        return
      }

      // Check if already installed as PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isIOSStandalone = 'standalone' in navigator && (navigator as typeof navigator & { standalone?: boolean }).standalone === true
      
      if (isStandalone || isIOSStandalone) {
        setShouldShow(false)
        return
      }

      // Check if user has dismissed this session
      const isDismissed = sessionStorage.getItem('home-screen-guide-dismissed')
      if (isDismissed) {
        setShouldShow(false)
        return
      }

      // Show after 15 seconds on mobile
      const timer = setTimeout(() => {
        setShouldShow(true)
      }, 15000)

      return () => clearTimeout(timer)
    }

    checkMobile()
    
    // Listen for window resize
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleDismiss = () => {
    setShouldShow(false)
    // Remember dismissal for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('home-screen-guide-dismissed', 'true')
    }
  }

  const handleOpenGuide = () => {
    setShowGuide(true)
    setIsMinimized(false)
  }

  const handleCloseGuide = () => {
    setShowGuide(false)
  }

  const handleMinimize = () => {
    setIsMinimized(true)
  }

  // Don't render on server, desktop, or if shouldn't show
  if (!isClient || !isMobile || !shouldShow) return null

  return (
    <>
      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!showGuide && (
          <motion.div
            initial={{ opacity: 0, scale: 0, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0, x: 100 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-20 right-4 z-40"
          >
            {isMinimized ? (
              // Minimized state - small icon only
              <Button
                onClick={handleOpenGuide}
                size="sm"
                className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 relative"
              >
                <Home className="h-5 w-5" />
                {/* Pulse animation to draw attention */}
                <div className="absolute -inset-1 rounded-full bg-primary/30 animate-ping"></div>
              </Button>
            ) : (
              // Full card state
              <motion.div
                initial={{ width: 48, height: 48 }}
                animate={{ width: "auto", height: "auto" }}
                className="bg-card border shadow-lg rounded-lg p-3 max-w-[280px]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Home className="h-4 w-4 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground">
                      Add to Home Screen
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Install FixItForMe Mobile for instant access to leads and notifications
                    </p>
                    
                    <div className="flex gap-1 mt-2">
                      <Button
                        size="sm"
                        onClick={handleOpenGuide}
                        className="text-xs h-7 px-3"
                      >
                        Show Me How
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleMinimize}
                        className="text-xs h-7 px-2"
                      >
                        Later
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="h-6 w-6 p-0 flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add to Home Screen Guide Modal */}
      <AddToHomeScreenGuide 
        isOpen={showGuide} 
        onClose={handleCloseGuide}
      />
    </>
  )
}
