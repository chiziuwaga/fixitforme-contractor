'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Building,
  Clock,
  DollarSign,
  MapPin,
  Star,
  Loader2,
  TrendingUp,
  Target,
  Zap,
  BarChart3,
  Users,
  Sparkles,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react'
import { EnhancedChatManager } from '@/components/EnhancedChatManager'
import { useUser } from '@/hooks/useUser'
import { motion, AnimatePresence } from 'framer-motion'
import { containerVariants, itemVariants } from '@/lib/animations'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

/**
 * @interface Lead
 * @description Defines the structure for a contractor lead object.
 */
interface Lead {
  id: string
  title: string
  description: string
  estimated_value: number
  location_city: string
  location_state: string
  quality_score: number
  recency_score: number
  source: string
  posted_at: string
  urgency_indicators: string[]
  contact_info: { phone?: string; email?: string }
}

/**
 * LeadCard Component
 * @description Renders a single lead card with premium styling, animations, and enhanced details.
 * @param {Lead} lead - The lead data to display.
 */
const LeadCard = ({ lead }: { lead: Lead }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  const qualityBadgeClass =
    lead.quality_score > 80
      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
      : lead.quality_score > 60
      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/25'
      : 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-lg shadow-gray-500/25'

  const urgencyBadgeClass = lead.urgency_indicators?.length > 0
    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse'
    : ''

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card className="group relative overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/10 focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2 focus-within:ring-offset-background bg-gradient-to-br from-background to-background/50 border border-white/10">
        {/* Background glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Quality indicator stripe */}
        <div className={cn(
          "absolute top-0 left-0 w-full h-1 bg-gradient-to-r",
          lead.quality_score > 80 ? "from-green-500 to-emerald-500" :
          lead.quality_score > 60 ? "from-yellow-500 to-orange-500" :
          "from-gray-500 to-slate-500"
        )} />
        
        <CardContent className="p-6 relative">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h4 className="flex-1 text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {lead.title}
              </h4>
              <div className="flex flex-col items-end space-y-2">
                <Badge className={cn('flex-shrink-0 gap-1 font-medium', qualityBadgeClass)}>
                  <Star className="h-3 w-3 fill-current" />
                  <span>{lead.quality_score}</span>
                </Badge>
                {lead.recency_score > 85 && (
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                    <Zap className="h-3 w-3 mr-1" />
                    Fresh
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {lead.description}
            </p>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <motion.div 
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 transition-colors group-hover:bg-primary/5"
                whileHover={{ scale: 1.05 }}
              >
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground">
                  ${lead.estimated_value.toLocaleString()}
                </span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 transition-colors group-hover:bg-primary/5"
                whileHover={{ scale: 1.05 }}
              >
                <MapPin className="h-4 w-4 text-primary" />
                <span className="truncate text-foreground">
                  {lead.location_city}, {lead.location_state}
                </span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 transition-colors group-hover:bg-primary/5"
                whileHover={{ scale: 1.05 }}
              >
                <Clock className="h-4 w-4 text-accent" />
                <span className="text-foreground">
                  {new Date(lead.posted_at).toLocaleDateString()}
                </span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 transition-colors group-hover:bg-primary/5"
                whileHover={{ scale: 1.05 }}
              >
                <Building className="h-4 w-4 text-accent" />
                <span className="truncate text-foreground font-medium">{lead.source}</span>
              </motion.div>
            </div>

            {lead.urgency_indicators && lead.urgency_indicators.length > 0 && (
              <motion.div 
                className="flex flex-wrap gap-2 pt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {lead.urgency_indicators.map((indicator) => (
                  <Badge key={indicator} className={cn("text-xs font-medium", urgencyBadgeClass)}>
                    🔥 {indicator.toUpperCase()}
                  </Badge>
                ))}
              </motion.div>
            )}

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
                aria-label={`View and bid on ${lead.title}`}
              >
                <Target className="mr-2 h-4 w-4" />
                View & Bid
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/**
 * ContractorDashboard Component
 * @description The main dashboard for contractors, featuring a chat interface and a lead feed.
 */
export default function ContractorDashboard() {
  const { user, loading: userLoading } = useUser()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loadingLeads, setLoadingLeads] = useState(true)

  useEffect(() => {
    if (user && !userLoading) {
      loadDashboardData()
    }
    if (!user && !userLoading) {
      setLoadingLeads(false)
    }
  }, [user, userLoading])

  const loadDashboardData = async () => {
    setLoadingLeads(true)
    try {
      const response = await fetch('/api/leads')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch leads')
      }
      const data = await response.json()
      setLeads(data.leads)
    } catch (error: unknown) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Error Loading Leads', {
        description:
          error instanceof Error
            ? error.message
            : 'Could not retrieve the lead feed. Please try again later.',
      })
    } finally {
      setLoadingLeads(false)
    }
  }

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Loading user profile...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="mt-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please log in to view your contractor dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Enhanced Professional Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 items-center">
          <div className="mr-6 flex items-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Image
                src="/logo.png"
                alt="FixItForMe Logo"
                width={40}
                height={40}
                className="mr-3 drop-shadow-lg"
                priority
              />
            </motion.div>
            <div className="hidden font-bold sm:inline-block">
              <span className="text-xl text-primary">FixItForMe</span>
              <span className="text-muted-foreground ml-3 text-sm font-normal">
                Contractor Dashboard
              </span>
            </div>
          </div>
          
          {/* Stats Summary */}
          <div className="hidden md:flex flex-1 items-center justify-center space-x-8">
            <div className="text-center">
              <div className="text-sm font-semibold text-primary">{leads.length}</div>
              <div className="text-xs text-muted-foreground">New Leads</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-primary">
                ${leads.reduce((sum, lead) => sum + lead.estimated_value, 0).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-accent">
                {Math.round(leads.reduce((sum, lead) => sum + lead.quality_score, 0) / leads.length) || 0}
              </div>
              <div className="text-xs text-muted-foreground">Avg Quality</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Quick Metrics Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border-b border-border/40 bg-muted/30 px-4 py-3"
      >
        <div className="container flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Today:</span>
              <span className="font-semibold text-primary">+3 new leads</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">This week:</span>
              <span className="font-semibold text-primary">$45,200 potential</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">AI agents are actively finding leads for you</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex h-[calc(100vh-theme(spacing.20))] flex-col lg:flex-row"
      >
      {/* Main Chat Interface */}
      <motion.div
        variants={itemVariants}
        className="h-1/2 flex-1 border-b border-border lg:h-full lg:basis-2/3 lg:border-b-0 lg:border-r"
      >
        <EnhancedChatManager />
      </motion.div>

      {/* Lead Feed Sidebar */}
      <motion.div
        variants={itemVariants}
        className="flex h-1/2 flex-col bg-gradient-to-b from-muted/50 to-muted/80 lg:h-full lg:basis-1/3 backdrop-blur-sm"
      >
        <div className="p-6 border-b border-border/40">
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between"
          >
            <div>
              <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Lead Feed
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                AI-curated opportunities for your expertise
              </p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {leads.length} Active
            </Badge>
          </motion.div>
          
          {/* Lead feed filters/controls */}
          <motion.div 
            className="flex items-center space-x-2 mt-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button variant="outline" size="sm" className="text-xs">
              All Leads
            </Button>
            <Button variant="ghost" size="sm" className="text-xs">
              High Value
            </Button>
            <Button variant="ghost" size="sm" className="text-xs">
              Urgent
            </Button>
          </motion.div>
        </div>
        
        <ScrollArea className="h-full flex-1 px-6 pb-6">
          {loadingLeads && (
            <motion.div 
              className="flex flex-col items-center justify-center py-12 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="relative">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <motion.div
                  className="absolute inset-0 h-8 w-8 rounded-full border-2 border-primary/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-primary">Finding new leads...</p>
                <p className="text-xs text-muted-foreground">Our AI agents are scanning the market</p>
              </div>
              <span className="sr-only">Loading new leads...</span>
            </motion.div>
          )}

          {!loadingLeads && leads.length === 0 && (
            <motion.div 
              variants={itemVariants}
              className="py-12"
            >
              <Card className="text-center bg-gradient-to-br from-background/50 to-muted/50 border-dashed border-2 border-muted-foreground/30">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Target className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">No leads right now</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Our AI agents are continuously scanning for opportunities that match your profile.
                      </p>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Sparkles className="mr-2 h-3 w-3" />
                        Refresh Feed
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div 
            className="space-y-4 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, staggerChildren: 0.1 }}
          >
            {!loadingLeads &&
              leads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <LeadCard lead={lead} />
                </motion.div>
              ))}
          </motion.div>
        </ScrollArea>
      </motion.div>
    </motion.div>
    </div>
  )
}