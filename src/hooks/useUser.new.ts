'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { useSessionContext, useUser as useSupaUser } from '@supabase/auth-helpers-react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// NEW: Add Subscription details to the context
export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  tier: 'growth' | 'scale';
  price_id: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface ContractorProfile {
  id: string;
  company_name: string;
  contact_phone: string;
  service_areas: string[];
  services_offered: string[];
  tier: 'growth' | 'scale';
  stripe_customer_id?: string;
}

export interface UserContextType {
  accessToken: string | null;
  user: User | null;
  profile: ContractorProfile | null;
  subscription: Subscription | null; // Add subscription
  loading: boolean;
  error: Error | null;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const { session, isLoading: isLoadingUser, supabaseClient } = useSessionContext();
  const user = useSupaUser();
  const accessToken = session?.access_token ?? null;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null); // Add subscription state
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          setLoading(true);
          setError(null);

          // Fetch the contractor profile
          const { data: profileData, error: profileError } = await supabaseClient
            .from('contractor_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) {
            throw new Error(`Profile fetch error: ${profileError.message}`);
          }

          setProfile(profileData);

          // NEW: Fetch the subscription details for the contractor
          const { data: subscriptionData, error: subscriptionError } = await supabaseClient
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (subscriptionError) {
            console.error('Subscription fetch error:', subscriptionError.message);
            // Don't throw here, subscription is optional
          } else {
            setSubscription(subscriptionData);
          }
        } catch (e: unknown) {
          setError(e instanceof Error ? e : new Error('Unknown error'));
        } finally {
          setLoading(false);
        }
      } else {
        setProfile(null);
        setSubscription(null);
        setLoading(false);
      }
    };

    if (!isLoadingUser) {
      fetchData();
    }
  }, [user, isLoadingUser, supabaseClient]);

  const value = {
    accessToken,
    user,
    profile,
    subscription,
    loading: loading || isLoadingUser,
    error,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider.');
  }
  return context;
};
