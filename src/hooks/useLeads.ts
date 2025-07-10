'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

// The Lead interface, consistent with the sophisticated database schema
export interface Lead {
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
  distance_miles?: number;
  relevance_score: number;
}

interface LeadFilters {
  urgency?: 'low' | 'medium' | 'high';
  minBudget?: number;
  maxBudget?: number;
  source?: string;
  maxDistance?: number;
}

interface DatabaseLead {
  id: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  location: string;
  posted_at: string;
  urgency_level: 'low' | 'medium' | 'high';
  source: 'felix_referral' | 'rex_discovery' | 'direct_inquiry';
  viewed: boolean;
  relevance_score: number;
  distance_miles?: number;
  felix_categories?: {
    category_name: string;
  };
}

/**
 * The complete "brain" for managing the contractor's lead feed.
 * Connects to sophisticated Rex lead generation and database schema.
 */
export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [rexRunning, setRexRunning] = useState(false);
  
  const supabase = createClientComponentClient();

  // Fetch leads from sophisticated database with Rex algorithm results
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get authenticated user and contractor profile
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error("User not authenticated")
      }

      const { data: profile } = await supabase
        .from("contractor_profiles")
        .select("id, tier")
        .eq("user_id", user.id)
        .single()

      if (!profile) {
        throw new Error("Contractor profile not found")
      }

      // Fetch leads with sophisticated Rex algorithm results and Felix categories
      const { data, error } = await supabase
        .from('contractor_leads')
        .select(`
          *,
          felix_categories(category_name)
        `)
        .eq('contractor_id', profile.id)
        .order('relevance_score', { ascending: false })
        .order('posted_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform data to match interface
      const transformedLeads: Lead[] = data?.map((lead: DatabaseLead) => ({
        id: lead.id,
        title: lead.title,
        description: lead.description,
        budget_min: lead.budget_min,
        budget_max: lead.budget_max,
        location: lead.location,
        posted_at: lead.posted_at,
        urgency: lead.urgency_level,
        felix_category: lead.felix_categories?.category_name || 'General',
        source: lead.source,
        quality_score: lead.relevance_score,
        viewed: lead.viewed,
        distance_miles: lead.distance_miles,
        relevance_score: lead.relevance_score,
      })) || [];

      setLeads(transformedLeads);
      setFilteredLeads(transformedLeads);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast.error('Failed to fetch leads: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Mark a lead as viewed using sophisticated database updates
  const markAsViewed = useCallback(
    async (leadId: string) => {
      // Optimistic UI update for immediate feedback
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, viewed: true } : lead
        )
      );
      setFilteredLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, viewed: true } : lead
        )
      );

      // Update the database using correct table name
      const { error } = await supabase
        .from('contractor_leads')
        .update({ viewed: true })
        .eq('id', leadId);

      if (error) {
        // Revert the optimistic update if the DB call fails
        setLeads(prevLeads =>
          prevLeads.map(lead =>
            lead.id === leadId ? { ...lead, viewed: false } : lead
          )
        );
        setFilteredLeads(prevLeads =>
          prevLeads.map(lead =>
            lead.id === leadId ? { ...lead, viewed: false } : lead
          )
        );
        toast.error('Failed to mark lead as viewed.');
      }
    },
    [supabase]
  );

  // Trigger Rex sophisticated lead generation
  const triggerRexSearch = useCallback(async () => {
    try {
      setRexRunning(true)
      
      // Get contractor profile and check tier access
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error("User not authenticated")
      }

      const { data: profile } = await supabase
        .from("contractor_profiles")
        .select("id, tier, rex_search_usage")
        .eq("user_id", user.id)
        .single()

      if (!profile) {
        throw new Error("Contractor profile not found")
      }

      if (profile.tier !== "scale") {
        toast.error("Rex lead generation requires Scale tier", {
          description: "Upgrade to access automated lead discovery with Felix's 40-problem framework."
        })
        return
      }

      // Check sophisticated usage limits (10 searches per month for Scale tier)
      if (profile.rex_search_usage >= 10) {
        toast.error("Monthly Rex search limit reached", {
          description: "You've used all 10 searches this month. Limit resets on your billing date."
        })
        return
      }

      // Trigger Rex lead generation using sophisticated 660-line algorithm
      const response = await fetch("/api/agents/rex_run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractor_id: profile.id,
          search_type: "full_scan"
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Rex search failed")
      }

      const result = await response.json()

      toast.success("Rex search completed!", {
        description: `Rex found ${result.leads_generated || 0} new leads using Felix's framework. Quality scores calculated.`
      })

      // Refresh leads to show new sophisticated results
      fetchLeads()
    } catch (error) {
      console.error("Error triggering Rex search:", error)
      toast.error("Rex search failed", {
        description: error instanceof Error ? error.message : "Please try again later."
      })
    } finally {
      setRexRunning(false)
    }
  }, [supabase, fetchLeads])

  return {
    leads: filteredLeads,
    allLeads: leads,
    loading,
    error,
    rexRunning,
    markAsViewed,
    triggerRexSearch,
    refetchLeads: fetchLeads,
  };
};
