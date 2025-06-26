'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building, Clock, DollarSign, MapPin, Star, Loader2 } from 'lucide-react';
import { EnhancedChatManager } from '@/components/EnhancedChatManager';
import { useUser } from '@/hooks/useUser';
import { BRAND } from '@/lib/brand';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';
import { toast } from 'sonner';

interface Lead {
  id: string;
  title: string;
  description: string;
  estimated_value: number;
  location_city: string;
  location_state: string;
  quality_score: number;
  recency_score: number;
  source: string;
  posted_at: string;
  urgency_indicators: string[];
  contact_info: { phone?: string; email?: string };
}

const LeadCard = ({ lead }: { lead: Lead }) => (
  <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
    <Card className="border border-neutral-200 hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <h4 className="text-lg font-semibold text-neutral-900 line-clamp-2 flex-1 mr-3">
              {lead.title}
            </h4>
            <Badge 
              variant={lead.quality_score > 80 ? "default" : "secondary"}
              className={`${lead.quality_score > 80 ? 'bg-success-500 hover:bg-success-600' : 'bg-warning-500 hover:bg-warning-600'} text-white flex items-center gap-1`}
            >
              <Star className="h-3 w-3" />
              {lead.quality_score}
            </Badge>
          </div>
          
          <p className="text-sm text-neutral-600 line-clamp-2">{lead.description}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-neutral-500" />
              <span className="text-neutral-700">Est. Value: ${lead.estimated_value.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-neutral-500" />
              <span className="text-neutral-700">{lead.location_city}, {lead.location_state}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-500" />
              <span className="text-neutral-700">{new Date(lead.posted_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-neutral-500" />
              <span className="text-neutral-700">Source: {lead.source}</span>
            </div>
          </div>
          
          {lead.urgency_indicators && lead.urgency_indicators.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {lead.urgency_indicators.map(indicator => (
                <Badge key={indicator} variant="destructive" className="text-xs">
                  {indicator.toUpperCase()}
                </Badge>
              ))}
            </div>
          )}
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              className="w-full bg-[rgb(var(--primary-orange))] hover:bg-[rgb(var(--primary-orange))]/90 text-white"
            >
              View & Bid
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function ContractorDashboard() {
  const { user, loading: userLoading } = useUser();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data only when the user context is available
    if (user && !userLoading) {
        loadDashboardData();
    }
    // If the user is not logged in and loading is finished, stop loading.
    if (!user && !userLoading) {
        setLoading(false);
    }
  }, [user, userLoading]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/leads');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch leads');
      }
      const data = await response.json();
      setLeads(data.leads);    } catch (error: unknown) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Error Loading Leads', {
        description: error instanceof Error ? error.message : 'Could not retrieve the lead feed. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary-orange))]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600">Please log in to view your dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex h-[calc(100vh-var(--app-shell-header-height,0px)-2px)]"
    >
      {/* Main Chat Interface */}
      <motion.div 
        variants={itemVariants} 
        className="flex-1 h-full border-r border-neutral-200"
        style={{ flex: '1 1 70%' }}
      >
        <EnhancedChatManager />
      </motion.div>

      {/* Lead Feed Sidebar */}
      <motion.div 
        variants={itemVariants} 
        className="bg-neutral-50 h-full"
        style={{ flex: '1 1 30%' }}
      >
        <ScrollArea className="h-full">
          <div className="p-6">
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-heading font-semibold text-[rgb(var(--primary-orange))] mb-6">
                Your Lead Feed
              </h3>
            </motion.div>
            
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[rgb(var(--primary-orange))]" />
              </div>
            )}
            
            {!loading && leads.length === 0 && (
              <motion.div variants={itemVariants}>
                <Card className="text-center">
                  <CardContent className="p-6">
                    <p className="text-neutral-600">
                      No new leads matching your profile right now. Check back later!
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            <div className="space-y-4">
              {leads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
            </div>
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
}
