/**
 * Demo Session Management
 * Handles demo mode authentication state without Supabase session requirements
 */

import { getStoredJSON, setStoredJSON } from './safeStorage';

export interface DemoSession {
  id: string;
  phone: string;
  user_type: 'demo_contractor' | 'test_contractor';
  subscription_tier: 'demo' | 'test';
  created_at: string;
  expires_at: string;
  demo_mode: true;
  user_metadata: {
    demo_mode: true;
    verification_method: 'demo_bypass';
  };
}

export interface DemoContractorProfile {
  id: string;
  user_id: string;
  contact_phone: string;
  user_type: 'demo_contractor';
  tier: 'demo';
  onboarding_completed: boolean;
  created_at: string;
  demo_mode: true;
}

const DEMO_SESSION_KEY = 'fixitforme_demo_session';
const DEMO_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Create a demo session that bypasses Supabase authentication
 */
export function createDemoSession(phone: string, userType: 'demo_contractor' | 'test_contractor' = 'demo_contractor'): DemoSession {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + DEMO_SESSION_DURATION);
  
  const session: DemoSession = {
    id: `demo-session-${phone.replace('+', '')}`,
    phone,
    user_type: userType,
    subscription_tier: userType === 'demo_contractor' ? 'demo' : 'test',
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    demo_mode: true,
    user_metadata: {
      demo_mode: true,
      verification_method: 'demo_bypass'
    }
  };
  
  // Store in localStorage with SafeStorage
  setStoredJSON(DEMO_SESSION_KEY, session);
  
  console.log('[DEMO SESSION] Created demo session:', session.id);
  return session;
}

/**
 * Get current demo session if valid
 */
export function getDemoSession(): DemoSession | null {
  try {
    const session = getStoredJSON<DemoSession | null>(DEMO_SESSION_KEY, null);
    
    if (!session) {
      return null;
    }
    
    // Check if session is expired
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    
    if (now > expiresAt) {
      console.log('[DEMO SESSION] Session expired, clearing');
      clearDemoSession();
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
 * Clear demo session
 */
export function clearDemoSession(): void {
  try {
    // Use direct localStorage access for demo session cleanup
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(DEMO_SESSION_KEY);
    }
    console.log('[DEMO SESSION] Session cleared');
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
 * Get demo contractor profile
 */
export function getDemoContractorProfile(session: DemoSession): DemoContractorProfile {
  return {
    id: `demo-contractor-${session.phone.replace('+', '')}`,
    user_id: session.id,
    contact_phone: session.phone,
    user_type: 'demo_contractor',
    tier: 'demo',
    onboarding_completed: false, // Demo users always start with onboarding
    created_at: session.created_at,
    demo_mode: true
  };
}

/**
 * Extend demo session (refresh expiry)
 */
export function extendDemoSession(): DemoSession | null {
  const session = getDemoSession();
  if (!session) {
    return null;
  }
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + DEMO_SESSION_DURATION);
  
  const extendedSession: DemoSession = {
    ...session,
    expires_at: expiresAt.toISOString()
  };
  
  setStoredJSON(DEMO_SESSION_KEY, extendedSession);
  console.log('[DEMO SESSION] Session extended until:', expiresAt.toISOString());
  
  return extendedSession;
}

/**
 * Mock Supabase user for demo mode
 */
export function getDemoUser(session: DemoSession) {
  return {
    id: session.id,
    phone: session.phone,
    user_metadata: session.user_metadata,
    app_metadata: {},
    aud: 'authenticated',
    created_at: session.created_at,
    updated_at: session.created_at,
    email: undefined, // Demo mode is phone-only
    email_confirmed_at: undefined,
    phone_confirmed_at: session.created_at,
    last_sign_in_at: session.created_at,
    role: 'authenticated',
    confirmation_sent_at: undefined
  };
}
