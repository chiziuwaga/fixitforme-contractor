/**
 * Demo Session Management
 * Handles demo mode authentication state without Supabase session requirements
 */

import { getStoredJSON, setStoredJSON } from './safeStorage';

export interface DemoSession {
  id: string;
  phone: string;
  user_type: 'demo_contractor' | 'test_contractor';
  subscription_tier: 'demo' | 'growth' | 'scale';
  demo_profile_type: 'basic_contractor' | 'established_business' | 'scale_tier_user' | 'multi_trade_pro';
  created_at: string;
  expires_at: string;
  demo_mode: true;
  user_metadata: {
    demo_mode: true;
    verification_method: 'demo_bypass';
    profile_type: string;
  };
}

export interface DemoContractorProfile {
  id: string;
  user_id: string;
  contact_phone: string;
  user_type: 'demo_contractor';
  tier: 'growth' | 'scale';
  demo_profile_type: 'basic_contractor' | 'established_business' | 'scale_tier_user' | 'multi_trade_pro';
  onboarding_completed: boolean;
  created_at: string;
  demo_mode: true;
  company_name: string;
  experience_years: number;
  business_type: string;
  services: string[];
  team_size: number;
  service_areas: string[];
  monthly_revenue: number;
  bid_win_rate: number;
}

// Demo profile configurations for different contractor experiences
const DEMO_PROFILES = {
  '209741': {
    type: 'basic_contractor' as const,
    company_name: "ABC Plumbing Services",
    experience_years: 3,
    business_type: "Plumbing",
    tier: 'growth' as const,
    services: ["plumbing", "drain_cleaning"],
    team_size: 1,
    service_areas: ["Downtown Seattle"],
    monthly_revenue: 8500,
    bid_win_rate: 25,
    onboarding_steps: 4,
    phone_suffix: "1234567890"
  },
  '503913': {
    type: 'established_business' as const,
    company_name: "Smith Construction LLC", 
    experience_years: 8,
    business_type: "General Contractor",
    tier: 'growth' as const,
    services: ["carpentry", "electrical", "plumbing", "drywall"],
    team_size: 5,
    service_areas: ["Seattle Metro Area", "Bellevue", "Tacoma"],
    monthly_revenue: 45000,
    bid_win_rate: 65,
    onboarding_steps: 2,
    phone_suffix: "5039131234"
  },
  '058732': {
    type: 'scale_tier_user' as const,
    company_name: "Premier Home Solutions",
    experience_years: 12,
    business_type: "Full Service Contractor", 
    tier: 'scale' as const,
    services: ["plumbing", "electrical", "hvac", "roofing", "flooring", "carpentry", "drywall", "painting"],
    team_size: 15,
    service_areas: ["Greater Puget Sound", "Eastside", "South King County"],
    monthly_revenue: 125000,
    bid_win_rate: 80,
    onboarding_steps: 0,
    phone_suffix: "5873205687"
  },
  '002231': {
    type: 'multi_trade_pro' as const,
    company_name: "ProTrade Services Group",
    experience_years: 6,
    business_type: "Multi-Specialty Contractor",
    tier: 'growth' as const,
    services: ["hvac", "electrical", "plumbing", "roofing", "flooring"],
    team_size: 8,
    service_areas: ["Seattle", "Redmond", "Kirkland", "Bothell"],
    monthly_revenue: 75000,
    bid_win_rate: 45,
    onboarding_steps: 6,
    phone_suffix: "2231002231"
  }
} as const;

type DemoCode = keyof typeof DEMO_PROFILES;

/**
 * Get demo profile configuration by demo code
 */
export function getDemoProfileConfig(demoCode: string) {
  return DEMO_PROFILES[demoCode as DemoCode] || null;
}

/**
 * Check if a code is a valid demo code
 */
export function isValidDemoCode(code: string): boolean {
  return code in DEMO_PROFILES;
}

const DEMO_SESSION_KEY_PREFIX = 'fixitforme_demo_session_';
const DEMO_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Create a demo session for a specific profile type
 */
export function createDemoSession(demoCode: string, userType: 'demo_contractor' | 'test_contractor' = 'demo_contractor'): DemoSession | null {
  const profileConfig = getDemoProfileConfig(demoCode);
  if (!profileConfig) {
    console.error('[DEMO SESSION] Invalid demo code:', demoCode);
    return null;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + DEMO_SESSION_DURATION);
  const phone = `+1${profileConfig.phone_suffix}`;
  
  const session: DemoSession = {
    id: `demo-session-${demoCode}-${profileConfig.phone_suffix}`,
    phone,
    user_type: userType,
    subscription_tier: profileConfig.tier === 'scale' ? 'scale' : 'growth',
    demo_profile_type: profileConfig.type,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    demo_mode: true,
    user_metadata: {
      demo_mode: true,
      verification_method: 'demo_bypass',
      profile_type: profileConfig.type
    }
  };
  
  // Store in localStorage with profile-specific key
  const sessionKey = `${DEMO_SESSION_KEY_PREFIX}${demoCode}`;
  setStoredJSON(sessionKey, session);
  
  console.log('[DEMO SESSION] Created demo session for profile:', profileConfig.type, session.id);
  return session;
}

/**
 * Get current demo session for a specific demo code
 */
export function getDemoSession(demoCode?: string): DemoSession | null {
  try {
    // If no demo code provided, try to find any active session
    if (!demoCode) {
      for (const code of Object.keys(DEMO_PROFILES)) {
        const sessionKey = `${DEMO_SESSION_KEY_PREFIX}${code}`;
        const session = getStoredJSON<DemoSession | null>(sessionKey, null);
        if (session && !isSessionExpired(session)) {
          console.log('[DEMO SESSION] Found active session for code:', code);
          return session;
        }
      }
      return null;
    }

    const sessionKey = `${DEMO_SESSION_KEY_PREFIX}${demoCode}`;
    const session = getStoredJSON<DemoSession | null>(sessionKey, null);
    
    if (!session) {
      return null;
    }
    
    // Check if session is expired
    if (isSessionExpired(session)) {
      console.log('[DEMO SESSION] Session expired, clearing');
      clearDemoSession(demoCode);
      return null;
    }
    
    console.log('[DEMO SESSION] Valid session found:', session.id);
    return session;
  } catch (error) {
    console.warn('[DEMO SESSION] Error getting session:', error);
    return null;
  }
}

/**
 * Check if a session is expired
 */
function isSessionExpired(session: DemoSession): boolean {
  const now = new Date();
  const expiresAt = new Date(session.expires_at);
  return now > expiresAt;
}

/**
 * Clear demo session for specific demo code
 */
export function clearDemoSession(demoCode?: string): void {
  try {
    if (!demoCode) {
      // Clear all demo sessions
      for (const code of Object.keys(DEMO_PROFILES)) {
        const sessionKey = `${DEMO_SESSION_KEY_PREFIX}${code}`;
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(sessionKey);
        }
      }
      console.log('[DEMO SESSION] All demo sessions cleared');
    } else {
      // Clear specific session
      const sessionKey = `${DEMO_SESSION_KEY_PREFIX}${demoCode}`;
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(sessionKey);
      }
      console.log('[DEMO SESSION] Session cleared for code:', demoCode);
    }
  } catch (error) {
    console.warn('[DEMO SESSION] Error clearing session:', error);
  }
}

/**
 * Check if user is in demo mode
 */
export function isDemoMode(): boolean {
  const session = getDemoSession();
  return session?.demo_mode === true;
}

/**
 * Get demo contractor profile for a session
 */
export function getDemoContractorProfile(session: DemoSession): DemoContractorProfile {
  const profileConfig = getDemoProfileConfig(session.user_metadata.profile_type === 'basic_contractor' ? '209741' :
    session.user_metadata.profile_type === 'established_business' ? '503913' :
    session.user_metadata.profile_type === 'scale_tier_user' ? '058732' : '002231');
  
  if (!profileConfig) {
    throw new Error('Invalid profile configuration');
  }

  return {
    id: `demo-contractor-${session.user_metadata.profile_type}`,
    user_id: session.id,
    contact_phone: session.phone,
    user_type: 'demo_contractor',
    tier: profileConfig.tier,
    demo_profile_type: profileConfig.type,
    onboarding_completed: profileConfig.type === 'scale_tier_user', // Scale users skip onboarding
    created_at: session.created_at,
    demo_mode: true,
    company_name: profileConfig.company_name,
    experience_years: profileConfig.experience_years,
    business_type: profileConfig.business_type,
    services: [...profileConfig.services],
    team_size: profileConfig.team_size,
    service_areas: [...profileConfig.service_areas],
    monthly_revenue: profileConfig.monthly_revenue,
    bid_win_rate: profileConfig.bid_win_rate
  };
}

/**
 * Extend demo session (refresh expiry) for specific demo code
 */
export function extendDemoSession(demoCode: string): DemoSession | null {
  const session = getDemoSession(demoCode);
  if (!session) {
    return null;
  }
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + DEMO_SESSION_DURATION);
  
  const extendedSession: DemoSession = {
    ...session,
    expires_at: expiresAt.toISOString()
  };
  
  const sessionKey = `${DEMO_SESSION_KEY_PREFIX}${demoCode}`;
  setStoredJSON(sessionKey, extendedSession);
  console.log('[DEMO SESSION] Session extended until:', expiresAt.toISOString());
  
  return extendedSession;
}
