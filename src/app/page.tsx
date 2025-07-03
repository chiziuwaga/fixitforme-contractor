'use client';

import { Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHomePage } from '@/hooks/useHomePage';

export default function HomePage() {
  const {
    loading,
    isMobile,
    navigateToLogin,
    sendEmailLink,
  } = useHomePage();

  // Mobile redirect message
  if (isMobile) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-secondary via-secondary/90 to-primary/20 flex items-center justify-center p-6"
      >
        <Card className="max-w-md mx-auto text-center space-y-6" useMotion>
          <CardHeader>
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Monitor className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold text-foreground mb-2">
              FixItForMe Professional
            </CardTitle>
            <p className="text-muted-foreground">
              Access your full contractor dashboard on desktop or tablet for the complete professional experience.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full"
              onClick={navigateToLogin}
            >
              Continue to Desktop Version
            </Button>
            <Button variant="outline" className="w-full" onClick={sendEmailLink}>
              Email Me the Link
            </Button>
            <div className="text-xs text-muted-foreground">
              For the best experience, use a screen 768px or larger
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Image src="/logo.png" alt="FixItForMe Logo" width={80} height={80} className="mx-auto mb-4" />
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your contractor portal...</p>
        </motion.div>
      </div>
    );
  }

  // Main landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary to-primary-dark text-white flex flex-col justify-center items-center p-8">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
        <Image src="/logo.png" alt="FixItForMe" width={96} height={96} />
      </motion.div>
      <motion.h1 initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.2 }} className="mt-6 text-4xl md:text-6xl font-bold">
        The Gold Standard in Contractor Solutions
      </motion.h1>
      <motion.p initial={{ y: 20 }} animate={{ y: 0 }} transition={{ delay: 0.4 }} className="mt-4 text-lg md:text-xl max-w-2xl text-center">
        Empowering professionals with AI-driven leads, real-time bidding insights, and seamless project management.
      </motion.p>
      <div className="mt-8 flex space-x-4">
        <Button variant="gradient" size="lg" className="px-10" onClick={navigateToLogin}>
          Get Started
        </Button>
        <Button variant="outline" size="lg" className="px-10">
          Learn More
        </Button>
      </div>
    </div>
  );
}
