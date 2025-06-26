'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, DollarSign, User, Loader2, Calendar, MessageSquare, BookOpen, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import EnhancedChatManager from '@/components/EnhancedChatManager';
import { motion } from 'framer-motion';

interface JobDetails {
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
  homeowner_name?: string;
  homeowner_phone?: string;
  requirements: string[];
  timeline_preference: string;
}

export default function JobBidView() {
  const params = useParams();
  const jobId = params?.job_id as string;
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error) throw error;
        setJob(data);
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'felix_referral': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rex_discovery': return 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20';
      case 'direct_inquiry': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatBudget = (min: number, max: number) => {
    if (min === max) return `$${min.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
          <span className="text-muted-foreground">Loading job details...</span>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">Job Not Found</h2>
          <p className="text-muted-foreground">The requested job could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-secondary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="space-y-8"
        >
          {/* Header */}
          <Card className="border-2 border-brand-primary/10 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b border-brand-primary/10">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      className={getSourceColor(job.source)}
                      variant="outline"
                    >
                      {job.source === 'felix_referral' ? 'Felix Referral' : 
                       job.source === 'rex_discovery' ? 'Rex Discovery' : 'Direct Inquiry'}
                    </Badge>
                    <Badge 
                      className={getUrgencyColor(job.urgency)}
                      variant="outline"
                    >
                      {job.urgency} priority
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-3xl font-bold text-gray-900 leading-tight">
                    {job.title}
                  </CardTitle>
                  
                  <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-brand-primary" />
                      <span className="font-semibold">{formatBudget(job.budget_min, job.budget_max)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-brand-primary" />
                      <span>{job.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-brand-primary" />
                      <span>{new Date(job.posted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-brand-primary to-brand-primary/80 hover:from-brand-primary/90 hover:to-brand-primary/70 shadow-lg min-w-[140px]"
                >
                  Submit Bid
                </Button>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Job Details - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="border-b bg-gradient-to-r from-brand-primary/5 to-transparent">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-brand-primary" />
                    Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-700 leading-relaxed">{job.description}</p>
                </CardContent>
              </Card>

              {job.requirements && job.requirements.length > 0 && (
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="border-b bg-gradient-to-r from-brand-secondary/5 to-transparent">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-brand-secondary" />
                      Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-2">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-brand-primary font-bold mt-1">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="border-b border-blue-100">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2 text-blue-900">
                    <User className="h-5 w-5 text-blue-600" />
                    Alex Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 text-center">
                  <p className="text-blue-700/70 mb-6">
                    Ask @alex to analyze this job for competitive pricing and timeline estimates
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      // TODO: Implement Alex analysis trigger
                    }}
                  >
                    Get Alex&apos;s Analysis
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {job.source === 'felix_referral' && job.homeowner_name && (
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="border-b bg-gradient-to-r from-green-50 to-transparent">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-green-800">
                      <User className="h-5 w-5 text-green-600" />
                      Homeowner Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-3">
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">Name:</span>
                      <span className="ml-2 text-gray-600">{job.homeowner_name}</span>
                    </div>
                    {job.homeowner_phone && (
                      <div className="text-sm">
                        <span className="font-semibold text-gray-700">Phone:</span>
                        <span className="ml-2 text-gray-600">{job.homeowner_phone}</span>
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">Timeline:</span>
                      <span className="ml-2 text-gray-600">{job.timeline_preference || 'Flexible'}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="border-b bg-gradient-to-r from-brand-primary/5 to-transparent">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-brand-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <Button variant="outline" className="w-full hover:bg-brand-primary/5">
                    Save for Later
                  </Button>
                  <Button variant="outline" className="w-full hover:bg-brand-primary/5">
                    Request More Info
                  </Button>
                  <Button variant="outline" className="w-full hover:bg-brand-primary/5">
                    Schedule Site Visit
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-brand-secondary/10 to-transparent">
                <CardHeader className="border-b border-brand-secondary/20">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-brand-secondary">
                    <Search className="h-5 w-5" />
                    Similar Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 text-center">
                  <p className="text-brand-secondary/70 text-sm">
                    Rex will find similar opportunities
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Chat Manager for Alex Integration */}
      <EnhancedChatManager />
    </div>
  );
}
