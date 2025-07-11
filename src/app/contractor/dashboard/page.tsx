"use client"

import EnhancedChatManager from "@/components/EnhancedChatManager"
import { useUser } from "@/hooks/useUser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Users, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const { user, profile } = useUser()

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-screen flex flex-col"
    >
      {/* Header - Minimal */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            FixItForMe Contractor
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back{profile?.company_name ? `, ${profile.company_name}` : ''}! Chat with your AI assistants.
          </p>
        </div>
        
        {/* Tier Badge */}
        <Badge variant={profile?.subscription_tier === 'scale' ? 'default' : 'secondary'}>
          {profile?.subscription_tier?.toUpperCase() || 'GROWTH'} TIER
        </Badge>
      </div>

      {/* Main Content - Chat Centric Layout */}
      <div className="flex-1 flex gap-4 p-6 overflow-hidden">
        {/* Chat Area - 70% of screen */}
        <div className="flex-1 min-w-0">
          <EnhancedChatManager />
        </div>

        {/* Sidebar - 30% for context */}
        <div className="w-80 space-y-4 flex-shrink-0">
          {/* Quick Agent Access */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Your AI Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-sm">
                  👋
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Lexi the Liaison</p>
                  <p className="text-xs text-muted-foreground">Onboarding & Support</p>
                </div>
              </div>
              
              {profile?.subscription_tier === 'scale' && (
                <>
                  <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm">
                      📊
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Alex the Assessor</p>
                      <p className="text-xs text-muted-foreground">Bidding Assistant</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
                      🔍
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Rex the Retriever</p>
                      <p className="text-xs text-muted-foreground">Lead Generator</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats - Minimal */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Chats</span>
                <span className="font-semibold">3</span>
              </div>
              {profile?.subscription_tier === 'scale' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Rex Searches</span>
                    <span className="font-semibold">0/10</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div 
                      className="bg-brand-primary h-1.5 rounded-full transition-all duration-300 w-0"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Chat Instructions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>• Type <code className="bg-muted px-1 rounded">@lexi</code> for guidance</p>
                {profile?.subscription_tier === 'scale' && (
                  <>
                    <p>• Type <code className="bg-muted px-1 rounded">@alex</code> for cost analysis</p>
                    <p>• Type <code className="bg-muted px-1 rounded">@rex</code> for lead generation</p>
                  </>
                )}
                <p>• Chat history is preserved per conversation</p>
                <p>• UI components appear automatically</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
