'use client';

import { createContext, useContext } from 'react';
import { User } from '@supabase/auth-helpers-nextjs';

export interface ContractorProfile {
  id: string;
  user_id: string;
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  license_number?: string;
  insurance_info?: Record<string, unknown>;
  specialties: string[];
  experience_years: number;
  service_areas: string[];
  services_offered: string[];
  subscription_tier: 'growth' | 'scale';
  subscription_status: 'active' | 'inactive' | 'pending';
  onboarding_completed: boolean;
  tier: 'growth' | 'scale';
  stripe_customer_id?: string;
  contact_phone: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  tier: 'growth' | 'scale';
  price_id: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface UserContextType {
  accessToken: string | null;
  user: User | null;
  profile: ContractorProfile | null;
  subscription: Subscription | null;
  loading: boolean;
  error: Error | null;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserContextProvider');
  }
  return context;
};
