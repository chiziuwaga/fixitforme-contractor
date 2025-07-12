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
      icon: <Zap className="h-8 w-8 text-blue-500" />,
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
    }, 3000)
    return () => clearInterval(interval)
  }, [features.length])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-950 to-purple-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/95">
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Better on Desktop
              </h1>
              <p className="text-slate-600 leading-relaxed">
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="flex flex-col items-center gap-3">
                {features[currentFeature].icon}
                <h3 className="font-semibold text-slate-900">
                  {features[currentFeature].title}
                </h3>
                <p className="text-sm text-slate-600 text-center">
                  {features[currentFeature].description}
                </p>
              </div>
            </motion.div>
            
            {/* Feature Indicators */}
            <div className="flex justify-center gap-2">
              {features.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentFeature ? "bg-blue-500" : "bg-slate-300"
                  }`}
                />
              ))}
            </div>
            
            {/* Actions */}
            <div className="space-y-3 pt-2">
              <p className="text-sm text-slate-500">
                Switch to desktop or tablet for the full contractor experience
              </p>
              
              <Button
                onClick={onContinueAnyway}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                Continue on Mobile Anyway
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Footer */}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-400">
                Visit{" "}
                <a
                  href="https://fixitforme.ai"
                  className="text-blue-500 hover:underline"
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
