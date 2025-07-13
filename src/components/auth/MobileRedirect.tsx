"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Monitor, Tablet, Smartphone, ArrowRight, Zap, Shield, Users } from "lucide-react"
import Image from "next/image"

interface MobileRedirectProps {
  onContinueAnyway: () => void
}

export function MobileRedirect({ onContinueAnyway }: MobileRedirectProps) {
  const [currentFeature, setCurrentFeature] = useState(0)
  
  const features = [
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "AI-Powered Tools",
      description: "Access Alex's cost analysis and Rex's lead generation on a bigger screen"
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: "Secure Workspace",
      description: "Manage documents, bids, and client communications with professional precision"
    },
    {
      icon: <Users className="h-8 w-8 text-orange-500" />,
      title: "Complete Dashboard",
      description: "View analytics, manage leads, and track performance all in one place"
    }
  ]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 6000) // Increased to 6 seconds for better readability
    return () => clearInterval(interval)
  }, [features.length])
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <Image
                src="/logo.png"
                alt="FixItForMe Logo"
                width={80}
                height={80}
                className="rounded-full shadow-lg"
              />
            </motion.div>
            
            {/* Main Message */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-foreground">
                Better on Desktop
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                FixItForMe Contractor works best on desktop and tablet for the complete experience
              </p>
            </div>
            
            {/* Device Icons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-6 py-4"
            >
              <div className="flex flex-col items-center gap-2">
                <Monitor className="h-8 w-8 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Desktop</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Tablet className="h-8 w-8 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Tablet</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Smartphone className="h-8 w-8 text-slate-400" />
                <span className="text-xs text-slate-500 font-medium">Mobile</span>
              </div>
            </motion.div>
            
            {/* Rotating Features */}
            <motion.div
              key={currentFeature}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="p-4 bg-muted/30 rounded-lg border border-border"
            >
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {features[currentFeature].icon}
                </motion.div>
                <motion.h3 
                  className="font-semibold text-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {features[currentFeature].title}
                </motion.h3>
                <motion.p 
                  className="text-sm text-muted-foreground text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {features[currentFeature].description}
                </motion.p>
              </div>
            </motion.div>
            
            {/* Feature Indicators */}
            <div className="flex justify-center gap-2">
              {features.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    index === currentFeature ? "bg-primary scale-110" : "bg-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
            
            {/* Actions */}
            <div className="space-y-3 pt-2">
              <p className="text-sm text-muted-foreground font-medium">
                Get the best experience on desktop, or continue with mobile access
              </p>
              
              <div className="space-y-2">
                <Button
                  onClick={onContinueAnyway}
                  className="w-full flex items-center gap-2 font-semibold"
                >
                  Login on Mobile
                  <ArrowRight className="h-4 w-4" />
                </Button>
                
                <p className="text-xs text-muted-foreground font-medium">
                  ✓ Access leads & notifications ✓ Chat with AI agents ✓ View earnings
                </p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Visit{" "}
                <a
                  href="https://fixitforme.ai"
                  className="text-primary hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  fixitforme.ai
                </a>{" "}
                on your computer
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
