'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import ContractorAuth from '@/components/auth/ContractorAuth';
import ContractorDashboard from '@/components/dashboard/ContractorDashboard';
import { Loader2, Monitor, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { User } from '@supabase/supabase-js';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Mobile detection
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
  }, []);

  // Mobile redirect banner
  const MobileRedirectBanner = () => (
    <motion.div 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 text-center"
    >
      <div className="flex items-center justify-center gap-3 mb-3">
        <Monitor className="h-6 w-6" />
        <Image 
          src="/logo.png" 
          alt="FixItForMe" 
          width={120} 
          height={30}
          className="brightness-0 invert"
        />
      </div>
      <h2 className="text-xl font-semibold mb-2">
        Built for Professional Contractors
      </h2>
      <p className="text-primary-foreground/90 mb-4">
        Access your full contractor dashboard on desktop or tablet for the complete experience.
      </p>
      <div className="flex items-center justify-center gap-2 text-sm">
        <Shield className="h-4 w-4" />
        <span>Secure</span>
        <Zap className="h-4 w-4" />
        <span>AI-Powered</span>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center mb-6">
            <Image 
              src="/logo.png" 
              alt="FixItForMe" 
              width={200} 
              height={50}
              className="mb-4"
            />
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your contractor workspace...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AnimatePresence>
        {isMobile && (
          <MobileRedirectBanner />
        )}
      </AnimatePresence>
      
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {user ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ContractorDashboard />
            </motion.div>
          ) : (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-md mx-auto"
            >
              <ContractorAuth />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
