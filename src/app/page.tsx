'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Monitor, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { User } from '@supabase/supabase-js';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

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

  // Mobile redirect banner - 21st.dev inspired clean design
  const MobileRedirectBanner = () => (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-card border-b border-border shadow-sm"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="text-center space-y-4 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Monitor className="h-5 w-5 text-primary" />
            </div>
            <Image 
              src="/logo.png" 
              alt="FixItForMe" 
              width={100} 
              height={25}
              className="opacity-80"
              priority
            />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Professional Contractor Platform
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Access your full contractor dashboard on desktop or tablet for the complete professional experience.
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center space-y-6 max-w-md mx-auto p-8"
        >
          <div className="flex items-center justify-center mb-8">
            <Image 
              src="/logo.png" 
              alt="FixItForMe" 
              width={200} 
              height={50}
              className="mb-4"
              priority
            />
          </div>
          <div className="space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <div className="space-y-2">
              <p className="text-foreground font-medium">Loading your contractor workspace</p>
              <p className="text-muted-foreground text-sm">Preparing your professional dashboard...</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatePresence>
        {isMobile && (
          <MobileRedirectBanner />
        )}
      </AnimatePresence>
      
      <main className="relative z-10 container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {user ? (
            // Redirect authenticated users to the premium dashboard
            <motion.div
              key="dashboard-redirect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center min-h-[80vh]"
            >
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Image 
                    src="/logo.png" 
                    alt="FixItForMe" 
                    width={120} 
                    height={120}
                    className="mx-auto mb-6 drop-shadow-lg"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  <h1 className="text-4xl font-bold text-white">
                    Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Contractor</span>
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-md mx-auto">
                    Redirecting to your premium dashboard...
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  onAnimationComplete={() => {
                    // Redirect to premium dashboard after animation
                    setTimeout(() => router.push('/contractor/dashboard'), 1000);
                  }}
                >
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                </motion.div>
              </div>
            </motion.div>
          ) : (
            // Redirect to the premium login page
            <motion.div
              key="redirect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center min-h-[80vh]"
            >
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Image 
                    src="/logo.png" 
                    alt="FixItForMe" 
                    width={120} 
                    height={120}
                    className="mx-auto mb-6 drop-shadow-lg"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  <h1 className="text-4xl font-bold text-white">
                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">FixItForMe</span>
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-md mx-auto">
                    Professional contractor platform powered by AI
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <button
                    onClick={() => router.push('/login')}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Access Contractor Portal
                  </button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center justify-center space-x-6 text-sm text-muted-foreground"
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Secure Platform</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span>AI-Powered</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
