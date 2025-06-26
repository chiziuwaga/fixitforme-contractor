'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import ContractorAuth from '@/components/auth/ContractorAuth';
import ContractorDashboard from '@/components/dashboard/ContractorDashboard';
import { Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Use imported supabase directly

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary-orange))]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <ContractorAuth />
        </div>
      </div>
    );
  }

  return <ContractorDashboard />;
}
