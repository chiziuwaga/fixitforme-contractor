'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { 
  DollarSign, 
  Target, 
  TrendingUp, 
  Award, 
  Bot, 
  Heart, 
  Shield 
} from 'lucide-react'
import { useUser } from './useUser'

export interface Lead {
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

export interface Metric {
  id: string
  label: string
  value: string | number
  change: number
  trend: 'up' | 'down' | 'neutral'
  icon: typeof TrendingUp
}

export interface AgentCard {
  id: string
  name: string
  persona: string
  description: string
  status: 'active' | 'idle' | 'busy'
  icon: typeof Bot
  lastActivity: string
  metrics: { label: string; value: string }[]
}

export function useDashboard() {
  const { user } = useUser()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [agents, setAgents] = useState<AgentCard[]>([])

  // Initialize dashboard data
  useEffect(() => {
    const dashboardMetrics: Metric[] = [
      {
        id: 'revenue',
        label: 'Monthly Revenue',
        value: '$32,400',
        change: 12.5,
        trend: 'up',
        icon: DollarSign,
      },
      {
        id: 'leads',
        label: 'Active Leads',
        value: 47,
        change: 8.2,
        trend: 'up',
        icon: Target,
      },
      {
        id: 'conversion',
        label: 'Conversion Rate',
        value: '34.2%',
        change: -2.1,
        trend: 'down',
        icon: TrendingUp,
      },
      {
        id: 'projects',
        label: 'Projects Won',
        value: 16,
        change: 25.0,
        trend: 'up',
        icon: Award,
      },
    ]

    const aiAgents: AgentCard[] = [
      {
        id: 'lexi',
        name: 'Lexi the Liaison',
        persona: 'Onboarding Guide',
        description: 'Helps contractors get started and optimize their profiles',
        status: 'active',
        icon: Heart,
        lastActivity: '2 minutes ago',
        metrics: [
          { label: 'Contractors Onboarded', value: '127' },
          { label: 'Success Rate', value: '94%' },
        ],
      },
      {
        id: 'alex',
        name: 'Alex the Assessor',
        persona: 'Bidding Assistant',
        description: 'Provides detailed cost analysis and bidding intelligence',
        status: 'busy',
        icon: Bot,
        lastActivity: '5 minutes ago',
        metrics: [
          { label: 'Bids Analyzed', value: '342' },
          { label: 'Win Rate', value: '68%' },
        ],
      },
      {
        id: 'rex',
        name: 'Rex the Retriever',
        persona: 'Lead Generator',
        description: 'Scours the web for quality construction leads',
        status: 'active',
        icon: Target,
        lastActivity: '1 minute ago',
        metrics: [
          { label: 'Leads Found', value: '1,247' },
          { label: 'Quality Score', value: '8.4/10' },
        ],
      },
      {
        id: 'felix',
        name: 'Felix the Fixer',
        persona: 'Problem Diagnostician',
        description: 'Helps homeowners understand their problems (via referrals)',
        status: 'idle',
        icon: Shield,
        lastActivity: '1 hour ago',
        metrics: [
          { label: 'Referrals Generated', value: '89' },
          { label: 'Problem Resolution', value: '96%' },
        ],
      },
    ]

    setMetrics(dashboardMetrics)
    setAgents(aiAgents)
    fetchLeads()
  }, [])

  // Fetch leads from API
  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads || [])
      } else {
        toast.error('Failed to fetch leads')
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
      toast.error('Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }

  // Agent status utilities
  const getStatusColor = (status: 'active' | 'idle' | 'busy') => {
    switch (status) {
      case 'active': return 'text-green-500'
      case 'busy': return 'text-amber-500'
      case 'idle': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusDot = (status: 'active' | 'idle' | 'busy') => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'busy': return 'bg-amber-500'
      case 'idle': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  // Agent selection handler
  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId === selectedAgent ? null : agentId)
  }

  // Refresh data handler
  const refreshDashboard = () => {
    setLoading(true)
    fetchLeads()
  }

  return {
    // State
    leads,
    loading,
    selectedAgent,
    metrics,
    agents,
    user,
    
    // Actions
    handleAgentSelect,
    refreshDashboard,
    
    // Utilities
    getStatusColor,
    getStatusDot,
  }
}
