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
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-950 to-purple-950 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            animate={{
              y: [-50, -800],
              x: [0, Math.random() * 100 - 50],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 8 + 12,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "linear"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: '100%',
            }}
          />
        ))}
      </div>

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
