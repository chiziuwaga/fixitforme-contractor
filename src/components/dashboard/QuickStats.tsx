"use client"

import { CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Activity,
  Star,
  Briefcase,
  CheckCircle,
  Percent,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BRAND } from "@/lib/brand"
import { motion } from "framer-motion"
import { useUser } from "@/hooks/useUser"
import type { Metric, DashboardStats } from "@/hooks/useDashboard"

interface QuickStatsProps {
  className?: string
  metrics: Metric[]
  stats: DashboardStats
  loading: boolean
}

interface StatItem {
  title: string
  value: string | number
  change?: {
    value: number
    type: "increase" | "decrease"
    period?: string
  }
  icon: React.ElementType
  color: string // Now a string for Tailwind classes
  description?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const iconMap: { [key: string]: React.ReactNode } = {
  totalRevenue: <DollarSign className="h-6 w-6 text-muted-foreground" />,
  activeJobs: <Briefcase className="h-6 w-6 text-muted-foreground" />,
  jobsCompleted: <CheckCircle className="h-6 w-6 text-muted-foreground" />,
  conversionRate: <Percent className="h-6 w-6 text-muted-foreground" />,
}

const statItems: { key: keyof DashboardStats; label: string }[] = [
  { key: "totalRevenue", label: "Total Revenue" },
  { key: "activeJobs", label: "Active Jobs" },
  { key: "jobsCompleted", label: "Jobs Completed" },
  { key: "conversionRate", label: "Conversion Rate" },
]

const updatedStatItems: {
  key: keyof QuickStatsProps["stats"]
  label: string
  icon: React.ElementType
  prefix?: string
  suffix?: string
}[] = [
  { key: "totalRevenue", label: "Total Revenue", icon: DollarSign, prefix: "$" },
  { key: "activeJobs", label: "Active Jobs", icon: Briefcase },
  { key: "jobsCompleted", label: "Jobs Completed", icon: CheckCircle },
  { key: "conversionRate", label: "Conversion Rate", icon: Percent, suffix: "%" },
]

export function QuickStats({ className, metrics, stats, loading }: QuickStatsProps) {
  const { user, profile } = useUser()

  // Get contractor data from context instead of props
  const contractorId = user?.id
  const tier = profile?.tier || "growth"
  const servicesOffered = profile?.services_offered || []

  // Mock data - in real app this would be fetched using contractorId
  const quickStats: StatItem[] = [
    {
      title: "Monthly Revenue",
      value: tier === "scale" ? "$12,450" : "$6,200",
      change: { value: 12.5, type: "increase", period: "last month" },
      icon: DollarSign,
      color: "text-success-foreground bg-success/10",
      description: "Total earnings this month",
    },
    {
      title: "Active Leads",
      value: tier === "scale" ? 24 : 12,
      change: { value: 8.2, type: "increase", period: "this week" },
      icon: Users,
      color: "text-primary-foreground bg-primary/10",
      description: "Leads in your pipeline",
    },
    {
      title: "Win Rate",
      value: tier === "scale" ? "68%" : "45%",
      change: { value: 3.1, type: "decrease", period: "this month" },
      icon: Target,
      color: "text-info-foreground bg-info/10",
      description: "Bids won vs submitted",
    },
    {
      title: "Jobs Completed",
      value: tier === "scale" ? 18 : 8,
      change: { value: 15.8, type: "increase", period: "this month" },
      icon: Activity,
      color: "text-success-foreground bg-success/10",
      description: "Successfully finished projects",
    },
  ]

  const renderStatCard = (stat: StatItem) => (
    <motion.div key={stat.title} variants={itemVariants}>
      <Card className="h-full hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className={cn("p-2 rounded-full", stat.color)}>
              <stat.icon className="w-4 h-4" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>

            {stat.change && (
              <div className="flex items-center gap-2">
                <Badge
                  variant={stat.change.type === "increase" ? "default" : "secondary"}
                  className={cn(
                    "text-xs flex items-center gap-1",
                    stat.change.type === "increase"
                      ? "bg-success/10 text-success-foreground hover:bg-success/20"
                      : "bg-destructive/10 text-destructive-foreground hover:bg-destructive/20",
                  )}
                >
                  {stat.change.type === "increase" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(stat.change.value)}%
                </Badge>
                {stat.change.period && <span className="text-xs text-muted-foreground">vs {stat.change.period}</span>}
              </div>
            )}

            {stat.description && <p className="text-xs text-muted-foreground">{stat.description}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      <motion.div className="col-span-full" variants={containerVariants} initial="hidden" animate="visible">
        <PerformanceMetrics />
      </motion.div>
      <motion.div className="col-span-full" variants={containerVariants} initial="hidden" animate="visible">
        {metrics.map((metric) => (
          <motion.div key={metric.id} variants={itemVariants}>
            <Card className="bg-ui-card border-ui-border shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <metric.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge
                    variant={metric.trend === "up" ? "default" : "destructive"}
                    className="bg-green-100 text-green-800"
                  >
                    {metric.trend === "up" ? "▲" : "▼"} {metric.change}%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-text-light-secondary">{metric.label}</p>
                  <p className="text-2xl font-bold text-text-light-primary mt-1">{metric.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      {updatedStatItems.map((item) => (
        <Card key={item.key} className="bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
            {item.icon}
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div className="text-2xl font-bold">
                {item.prefix}
                {stats[item.key].toLocaleString()}
                {item.suffix}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {quickStats.map((stat) => renderStatCard(stat))}
    </div>
  )
}

// Additional component for performance metrics
export function PerformanceMetrics({ className }: { className?: string }) {
  return (
    <Card className={cn("col-span-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" style={{ color: BRAND.colors.primary }} />
          Performance Overview
        </CardTitle>
        <CardDescription>Your business metrics at a glance</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Profile Completion</span>
            <span>85%</span>
          </div>
          <Progress value={85} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Customer Satisfaction</span>
            <span>92%</span>
          </div>
          <Progress value={92} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Response Time</span>
            <span>78%</span>
          </div>
          <Progress value={78} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}

export default QuickStats
