'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target,
  Activity,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BRAND } from '@/lib/brand';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';

interface QuickStatsProps {
  className?: string;
}

interface StatItem {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period?: string;
  };
  icon: React.ElementType;
  color: string; // Now a string for Tailwind classes
  description?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function QuickStats({ className }: QuickStatsProps) {
  const { user, profile, loading } = useUser();

  // Get contractor data from context instead of props
  const contractorId = user?.id;
  const tier = profile?.tier || 'growth';
  const servicesOffered = profile?.services_offered || [];

  // Mock data - in real app this would be fetched using contractorId
  const stats: StatItem[] = [
    {
      title: 'Monthly Revenue',
      value: tier === 'scale' ? '$12,450' : '$6,200',
      change: { value: 12.5, type: 'increase', period: 'last month' },
      icon: DollarSign,
      color: 'text-success-foreground bg-success/10',
      description: 'Total earnings this month'
    },
    {
      title: 'Active Leads',
      value: tier === 'scale' ? 24 : 12,
      change: { value: 8.2, type: 'increase', period: 'this week' },
      icon: Users,
      color: 'text-primary-foreground bg-primary/10',
      description: 'Leads in your pipeline'
    },
    {
      title: 'Win Rate',
      value: tier === 'scale' ? '68%' : '45%',
      change: { value: 3.1, type: 'decrease', period: 'this month' },
      icon: Target,
      color: 'text-info-foreground bg-info/10',
      description: 'Bids won vs submitted'
    },
    {
      title: 'Jobs Completed',
      value: tier === 'scale' ? 18 : 8,
      change: { value: 15.8, type: 'increase', period: 'this month' },
      icon: Activity,
      color: 'text-success-foreground bg-success/10',
      description: 'Successfully finished projects'
    }
  ];

  // Add loading state
  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-full">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Add service count info
  const serviceInfo = {
    current: servicesOffered.length,
    max: tier === 'scale' ? 15 : 5,
    tier: tier
  };

  const renderStatCard = (stat: StatItem) => (
    <motion.div key={stat.title} variants={itemVariants}>
      <Card className="h-full hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div 
              className={cn("p-2 rounded-full", stat.color)}
            >
              <stat.icon 
                className="w-4 h-4"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-foreground">
              {stat.value}
            </div>
            
            {stat.change && (
              <div className="flex items-center gap-2">
                <Badge 
                  variant={stat.change.type === 'increase' ? 'default' : 'secondary'}
                  className={cn(
                    "text-xs flex items-center gap-1",
                    stat.change.type === 'increase' 
                      ? "bg-success/10 text-success-foreground hover:bg-success/20" 
                      : "bg-destructive/10 text-destructive-foreground hover:bg-destructive/20"
                  )}
                >
                  {stat.change.type === 'increase' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(stat.change.value)}%
                </Badge>
                {stat.change.period && (
                  <span className="text-xs text-muted-foreground">
                    vs {stat.change.period}
                  </span>
                )}
              </div>
            )}
            
            {stat.description && (
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <motion.div 
      className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat) => renderStatCard(stat))}
    </motion.div>
  );
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
        <CardDescription>
          Your business metrics at a glance
        </CardDescription>
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
  );
}

export default QuickStats;
