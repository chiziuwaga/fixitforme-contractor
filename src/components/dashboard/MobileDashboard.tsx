"use client"

import { useUser } from "@/hooks/useUser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  MessageCircle, 
  Users, 
  TrendingUp, 
  Monitor, 
  Bell,
  DollarSign,
  FileText,
  ExternalLink
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { MobileNavigation } from "./MobileNavigation"
import { MobileLexiChat } from "../mobile/MobileLexiChat"

export function MobileDashboard() {
  const { profile } = useUser()

  const quickStats = [
    { label: "New Leads", value: "3", icon: Users, color: "text-blue-600" },
    { label: "Active Bids", value: "7", icon: FileText, color: "text-orange-600" },
    { label: "This Month", value: "$12,450", icon: DollarSign, color: "text-green-600" },
  ]

  const quickActions = [
    { label: "View New Leads", href: "/contractor/leads", icon: Users },
    { label: "Chat with Lexi", href: "/contractor/mobile-chat", icon: MessageCircle },
    { label: "Check Payments", href: "/contractor/payments", icon: DollarSign },
    { label: "Upload Documents", href: "/contractor/settings?tab=documents", icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="bg-card border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MobileNavigation />
            <div>
              <h1 className="text-lg font-bold text-foreground">FixItForMe</h1>
              <p className="text-xs text-muted-foreground">
                {profile?.company_name || 'Contractor Portal'}
              </p>
            </div>
          </div>
          <Badge variant={profile?.subscription_tier === 'scale' ? 'default' : 'secondary'}>
            {profile?.subscription_tier?.toUpperCase() || 'GROWTH'}
          </Badge>
        </div>
      </div>

      {/* Desktop Upgrade Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Monitor className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Switch to Desktop for Full Experience
              </p>
              <p className="text-xs text-muted-foreground">
                Advanced bidding, analytics, and document management
              </p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="https://fixitforme.ai" target="_blank">
                Learn More
                <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-3 text-center">
                  <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12"
                  asChild
                >
                  <Link href={action.href}>
                    <action.icon className="h-4 w-4 mr-3" />
                    {action.label}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-2 bg-muted/50 rounded">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New lead: Kitchen Remodel</p>
                <p className="text-xs text-muted-foreground">2 hours ago • $8,500 budget</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 bg-muted/50 rounded">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Bid accepted: Bathroom Repair</p>
                <p className="text-xs text-muted-foreground">1 day ago • $2,300</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 bg-muted/50 rounded">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Payment received</p>
                <p className="text-xs text-muted-foreground">3 days ago • $1,850</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Limitations Notice */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <Monitor className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">Mobile View - Limited Features</p>
              <p className="text-xs text-muted-foreground">
                For advanced bidding, document analysis, and full AI assistant capabilities, 
                please use desktop or tablet.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="https://fixitforme.ai" target="_blank">
                  Learn About Full Platform
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
