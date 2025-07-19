"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import EnhancedChatManager from "@/components/EnhancedChatManager"
import { MessageCircle, Sparkles } from "lucide-react"

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-muted/40 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header with Lexi intro */}
        <Card className="mb-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 relative">
              <Avatar className="h-16 w-16 border-4 border-primary/20">
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

            <CardTitle className="text-xl flex items-center justify-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat with Lexi to Get Started
            </CardTitle>
            
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Hi! I&apos;m Lexi, your AI liaison. I&apos;ll guide you through setting up your contractor profile 
              in a friendly conversation. Ask me anything, upload documents, or share your website - 
              I&apos;ll handle the rest!
            </p>
          </CardHeader>
        </Card>

        {/* Chat Interface */}
        <div className="h-[calc(100vh-240px)]">
          <EnhancedChatManager />
        </div>
      </motion.div>
    </div>
  )
}
