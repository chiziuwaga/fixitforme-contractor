'use client';

import { useLeads } from '@/hooks/useLeads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, DollarSign, Star, Eye, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

// This is the new, re-skinned LeadFeed component.
// It is now a purely presentational component.
// All logic has been moved to the `useLeads` hook.

interface LeadFeedProps {
  contractorId: string;
}

export default function LeadFeed({ contractorId }: LeadFeedProps) {
  const { leads, loading, error, markAsViewed } = useLeads(contractorId);

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
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'felix_referral': return 'bg-blue-500';
      case 'rex_discovery': return 'bg-purple-500';
      case 'direct_inquiry': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div>Loading leads...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      {leads.map((lead, index) => (
        <motion.div
          key={lead.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className={`border-l-4 ${lead.viewed ? 'border-gray-300' : 'border-primary'}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{lead.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className={getSourceColor(lead.source)}>{lead.source.replace('_', ' ')}</Badge>
                  <Badge variant="outline" className={getUrgencyColor(lead.urgency)}>{lead.urgency}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{lead.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {lead.location}</div>
                <div className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {formatTimeAgo(lead.posted_at)}</div>
                <div className="flex items-center"><DollarSign className="w-4 h-4 mr-2" /> {formatBudget(lead.budget_min, lead.budget_max)}</div>
                <div className="flex items-center"><Star className="w-4 h-4 mr-2" /> {lead.quality_score}/10 Quality</div>
              </div>
              <div className="flex justify-end items-center mt-4">
                <Button variant="ghost" size="sm" onClick={() => markAsViewed(lead.id)} disabled={lead.viewed}>
                  <Eye className="w-4 h-4 mr-2" />
                  {lead.viewed ? 'Viewed' : 'Mark as Viewed'}
                </Button>
                <Button size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Details & Bid
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
