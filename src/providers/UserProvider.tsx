'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useSessionContext, useUser as useSupaUser } from '@supabase/auth-helpers-react';
import { UserContext, ContractorProfile, Subscription } from '@/hooks/useUser';

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
