'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// The Lead interface, consistent with the database schema and component requirements
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
}

/**
 * The complete "brain" for managing the contractor's lead feed.
 * This hook encapsulates all logic for fetching, managing, and updating leads.
 * @param contractorId - The ID of the currently logged-in contractor.
 */
export const useLeads = (contractorId: string) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leads from Supabase
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // The RLS policies in Supabase will handle filtering leads for the specific contractor.
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('posted_at', { ascending: false });

      if (error) {
        throw error;
      }

      setLeads(data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast.error('Failed to fetch leads.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (contractorId) {
      fetchLeads();
    }
  }, [contractorId, fetchLeads]);

  // Mark a lead as viewed
  const markAsViewed = useCallback(
    async (leadId: string) => {
      // Optimistic UI update for immediate feedback
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, viewed: true } : lead
        )
      );

      // Update the database
      const { error } = await supabase
        .from('leads')
        .update({ viewed: true })
        .eq('id', leadId);

      if (error) {
        // Revert the optimistic update if the DB call fails
        setLeads(prevLeads =>
          prevLeads.map(lead =>
            lead.id === leadId ? { ...lead, viewed: false } : lead
          )
        );
        toast.error('Failed to mark lead as viewed.');
      }
    },
    []
  );

  return {
    leads,
    loading,
    error,
    markAsViewed,
    refetchLeads: fetchLeads,
  };
};
