'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useSessionContext, useUser as useSupaUser } from '@supabase/auth-helpers-react';
import { UserContext, ContractorProfile } from './useUser';

export const MyUserContextProvider = ({ children }: { children: ReactNode }) => {
  const { session, isLoading: isLoadingUser, supabaseClient } = useSessionContext();
  const user = useSupaUser();
  const accessToken = session?.access_token ?? null;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setLoading(true);
        try {
          const { data, error: profileError } = await supabaseClient
            .from('contractor_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          if (data) {
            setProfile(data as ContractorProfile);
          }
        } catch (e: any) {
          setError(e);
        } finally {
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    };

    if (!isLoadingUser) {
      fetchProfile();
    }
  }, [user, isLoadingUser, supabaseClient]);

  const value = {
    accessToken,
    user,
    profile,
    loading: loading || isLoadingUser,
    error,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
