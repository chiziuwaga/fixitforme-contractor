'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, DollarSign, Star, Eye, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface Lead {
  id: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  location: string;
  posted_at: string;
  urgency: 'low' | 'medium' | 'high';
  felix_category: string;
  source: 'felix_referral' | 'rex_discovery' | 'direct_inquiry';
  quality_score: number;
  viewed: boolean;
}

interface LeadFeedProps {
  contractorId: string;
}

export default function LeadFeed({ contractorId }: LeadFeedProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with actual Supabase queries
    const mockLeads: Lead[] = [
      {
        id: '1',
        title: 'Kitchen Cabinet Installation',
        description: 'Need professional installation of new kitchen cabinets and countertops',
        budget_min: 2500,
        budget_max: 4000,
        location: 'Oakland, CA',
        posted_at: '2024-01-20T10:00:00Z',
        urgency: 'medium',
        felix_category: 'Kitchen Remodel',
        source: 'felix_referral',
        quality_score: 8.5,
        viewed: false
      },
      {
        id: '2',
        title: 'Bathroom Tile Repair',
        description: 'Several tiles need replacement in master bathroom shower',
        budget_min: 800,
        budget_max: 1200,
        location: 'Berkeley, CA',
        posted_at: '2024-01-20T08:30:00Z',
        urgency: 'high',
        felix_category: 'Bathroom Repair',
        source: 'rex_discovery',
        quality_score: 7.2,
        viewed: true
      },
      {
        id: '3',
        title: 'Fence Installation',
        description: 'Need new privacy fence installed around backyard perimeter',
        budget_min: 1500,
        budget_max: 2500,
        location: 'San Leandro, CA',
        posted_at: '2024-01-19T16:00:00Z',
        urgency: 'low',
        felix_category: 'Outdoor Work',
        source: 'direct_inquiry',
        quality_score: 6.8,
        viewed: false
      }
    ];

    setTimeout(() => {
      setLeads(mockLeads);
      setLoading(false);
    }, 800);
  }, [contractorId]);

  const formatBudget = (min: number, max: number) => {
    if (min === max) return `$${min.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just posted';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning-foreground border-warning/20';
      case 'low': return 'bg-success/10 text-success-foreground border-success/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'felix_referral': return 'bg-info/10 text-info-foreground border-info/20';
      case 'rex_discovery': return 'bg-secondary/10 text-secondary-foreground border-secondary/20';
      case 'direct_inquiry': return 'bg-accent/10 text-accent-foreground border-accent/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse border rounded-lg p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-3"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Leads</span>
          <Badge variant="outline">{leads.length} active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leads.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                !lead.viewed ? 'bg-info/5 border-info/20' : 'bg-card'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                    {lead.title}
                    {!lead.viewed && (
                      <span className="w-2 h-2 bg-info rounded-full"></span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {lead.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 ml-4">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">{lead.quality_score}/10</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge 
                  className={getSourceColor(lead.source)}
                  variant="outline"
                >
                  {lead.source === 'felix_referral' ? 'Felix' : 
                   lead.source === 'rex_discovery' ? 'Rex' : 'Direct'}
                </Badge>
                <Badge 
                  className={getUrgencyColor(lead.urgency)}
                  variant="outline"
                >
                  {lead.urgency} priority
                </Badge>
                <Badge variant="outline">
                  {lead.felix_category}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-medium">{formatBudget(lead.budget_min, lead.budget_max)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{lead.location}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{formatTimeAgo(lead.posted_at)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90"
                >
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Ask Alex
                </Button>
                {!lead.viewed && (
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4 mr-1" />
                    Mark Read
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Button variant="outline" className="w-full">
            View All Leads
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
