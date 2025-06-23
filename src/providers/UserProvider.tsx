'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { useSessionContext, useUser as useSupaUser } from '@supabase/auth-helpers-react';
import { User } from '@supabase/supabase-js';

// Define interfaces for our data structures
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

// Define the shape of our context
export interface UserContextType {
  accessToken: string | null;
  user: User | null;
  profile: ContractorProfile | null;
  subscription: Subscription | null;
  loading: boolean;
  error: Error | null; // Changed from any
}

// Create the context
export const UserContext = createContext<UserContextType | undefined>(undefined);

// Define props for the provider component
export interface UserProviderProps {
  children: ReactNode;
}

// Create the provider component
export const UserProvider = ({ children }: UserProviderProps) => {
  const { session, isLoading: isLoadingUser, supabaseClient } = useSessionContext();
  const user = useSupaUser();
  const accessToken = session?.access_token ?? null;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState<Error | null>(null); // Changed from any

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          const [profileResponse, subscriptionResponse] = await Promise.all([
            supabaseClient.from('contractor_profiles').select('*').eq('user_id', user.id).single(),
            supabaseClient.from('subscriptions').select('*').eq('user_id', user.id).in('status', ['trialing', 'active']).single()
          ]);

          if (profileResponse.error && profileResponse.error.code !== 'PGRST116') {
            throw profileResponse.error;
          }
          if (profileResponse.data) {
            setProfile(profileResponse.data as ContractorProfile);
          }

          if (subscriptionResponse.error && subscriptionResponse.error.code !== 'PGRST116') {
            throw subscriptionResponse.error;
          }
          if (subscriptionResponse.data) {
            setSubscription(subscriptionResponse.data as Subscription);
          }

        } catch (e: unknown) { // Changed from any
          if (e instanceof Error) {
            setError(e);
          }
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

// Create the custom hook to use the context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider.');
  }
  return context;
};
