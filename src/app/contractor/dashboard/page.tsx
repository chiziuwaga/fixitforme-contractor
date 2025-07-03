'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Clock,
  MapPin,
  Star,
  Loader2,
  Sparkles,
  Bell,
  Settings,
  LogOut,
  Bot,
  MessageCircle,
  Search,
  PlusCircle,
  ArrowUpRight,
  Target,
} from 'lucide-react'
import { EnhancedChatManager } from '@/components/EnhancedChatManager'
import { motion } from 'framer-motion'
import { FADE_IN_UP, STAGGER_CONTAINER, SCALE_IN } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { useDashboard } from '@/hooks/useDashboard'

export default function ContractorDashboard() {
  const {
    leads,
    loading,
    selectedAgent,
    metrics,
    agents,
    user,
    handleAgentSelect,
    refreshDashboard,
    getStatusColor,
    getStatusDot,
  } = useDashboard()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Premium Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src="/logo.png"
                alt="FixItForMe"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.user_metadata?.name || 'Contractor'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your AI-powered contractor hub
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div 
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 xl:grid-cols-3 gap-8"
        >
          {/* Left Column - AI Agent Cards */}
          <motion.div variants={FADE_IN_UP} className="xl:col-span-1 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">AI Agents</h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Sparkles className="h-3 w-3 mr-1" />
                4 Active
              </Badge>
            </div>
            
            <div className="space-y-4">
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  variants={SCALE_IN}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all duration-300 hover:shadow-xl",
                      "bg-white/60 backdrop-blur-xl border-white/20",
                      selectedAgent === agent.id && "ring-2 ring-primary"
                    )}
                    onClick={() => handleAgentSelect(agent.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <agent.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className={cn(
                              "absolute -top-1 -right-1 h-3 w-3 rounded-full",
                              getStatusDot(agent.status)
                            )} />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-semibold">
                              {agent.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              {agent.persona}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getStatusColor(agent.status))}
                        >
                          {agent.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 mb-3">
                        {agent.description}
                      </p>
                      
                      <div className="space-y-2">
                        {agent.metrics.map((metric, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{metric.label}</span>
                            <span className="font-medium text-gray-900">{metric.value}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-muted-foreground">
                          {agent.lastActivity}
                        </span>
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Center Column - Chat Interface */}
          <motion.div variants={FADE_IN_UP} className="xl:col-span-1">
            <div className="sticky top-24">
              <Card className="h-[calc(100vh-12rem)] bg-white/60 backdrop-blur-xl border-white/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <Bot className="h-5 w-5 mr-2 text-primary" />
                      AI Assistant Chat
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-green-600 font-medium">Online</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="h-full pb-4">
                  <EnhancedChatManager />
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Right Column - Metrics & Leads */}
          <motion.div variants={FADE_IN_UP} className="xl:col-span-1 space-y-6">
            {/* Metrics Grid */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance</h2>
              <div className="grid grid-cols-2 gap-4">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.id}
                    variants={SCALE_IN}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <Card className="bg-white/60 backdrop-blur-xl border-white/20 hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <metric.icon className="h-5 w-5 text-primary" />
                          <Badge 
                            variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {metric.change > 0 ? '+' : ''}{metric.change}%
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {metric.value}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {metric.label}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Leads */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Leads</h2>
                <Button size="sm" variant="outline" onClick={refreshDashboard}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Loading leads...</p>
                    </div>
                  ) : leads.length === 0 ? (
                    <Card className="bg-white/60 backdrop-blur-xl border-white/20">
                      <CardContent className="p-6 text-center">
                        <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="font-semibold text-gray-900 mb-2">No leads yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Rex is working on finding quality leads for you.
                        </p>
                        <Button size="sm">
                          <Search className="h-4 w-4 mr-2" />
                          Search Now
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    leads.map((lead, index) => (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                      >
                        <Card className="bg-white/60 backdrop-blur-xl border-white/20 hover:shadow-lg transition-all duration-300 cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                                  {lead.title}
                                </h3>
                                <div className="flex items-center text-xs text-muted-foreground space-x-3">
                                  <div className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {lead.location_city}, {lead.location_state}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 ml-3 mr-1" />
                                    {new Date(lead.posted_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                            
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                              {lead.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className="text-xs">
                                  ${lead.estimated_value.toLocaleString()}
                                </Badge>
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                  <span className="text-xs font-medium">
                                    {lead.quality_score}/10
                                  </span>
                                </div>
                              </div>
                              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                                Bid Now
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
