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
} from 'lucide-react'
import { EnhancedChatManager } from '@/components/EnhancedChatManager'
import { useUser } from '@/hooks/useUser'
import { motion } from 'framer-motion'
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
 * @description Renders a single lead card with details and actions.
 * @param {Lead} lead - The lead data to display.
 * @note This component is defined in the same file for simplicity, but in a larger application,
 * it should be extracted into its own file: `components/lead-card.tsx`.
 */
const LeadCard = ({ lead }: { lead: Lead }) => {
  const qualityBadgeClass =
    lead.quality_score > 80
      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
      : 'bg-accent hover:bg-accent/90 text-accent-foreground'

  return (
    <motion.div variants={itemVariants}>
      <Card className="group transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h4 className="flex-1 text-base font-semibold text-foreground line-clamp-2">
                {lead.title}
              </h4>
              <Badge className={cn('flex-shrink-0 gap-1', qualityBadgeClass)}>
                <Star className="h-3 w-3" />
                <span>{lead.quality_score}</span>
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {lead.description}
            </p>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">
                  Est. ${lead.estimated_value.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="truncate text-foreground">
                  {lead.location_city}, {lead.location_state}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">
                  {new Date(lead.posted_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="truncate text-foreground">{lead.source}</span>
              </div>
            </div>

            {lead.urgency_indicators && lead.urgency_indicators.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {lead.urgency_indicators.map((indicator) => (
                  <Badge key={indicator} variant="destructive" className="text-xs">
                    {indicator.toUpperCase()}
                  </Badge>
                ))}
              </div>
            )}

            <Button className="w-full" aria-label={`View and bid on ${lead.title}`}>
              View & Bid
            </Button>
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
    <div className="min-h-screen bg-background">
      {/* Professional Header with FixItForMe Logo */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Image
              src="/logo.png"
              alt="FixItForMe Logo"
              width={32}
              height={32}
              className="mr-3"
              priority
            />
            <div className="hidden font-bold sm:inline-block">
              <span className="text-primary">FixItForMe</span>
              <span className="text-muted-foreground ml-2 text-sm font-normal">
                Contractor Dashboard
              </span>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Future: Search or additional nav items */}
            </div>
          </div>
        </div>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex h-[calc(100vh-theme(spacing.14))] flex-col lg:flex-row"
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
        className="flex h-1/2 flex-col bg-muted lg:h-full lg:basis-1/3"
      >
        <div className="p-6">
          <motion.h3
            variants={itemVariants}
            className="text-xl font-semibold text-primary"
          >
            Your Lead Feed
          </motion.h3>
        </div>
        <ScrollArea className="h-full flex-1 px-6 pb-6">
          {loadingLeads && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="sr-only">Loading new leads...</span>
            </div>
          )}

          {!loadingLeads && leads.length === 0 && (
            <motion.div variants={itemVariants}>
              <Card className="text-center">
                <CardContent className="p-6">
                  <p className="text-muted-foreground">
                    No new leads matching your profile right now. Check back soon!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="space-y-4">
            {!loadingLeads &&
              leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
    </div>
  )
}