'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to the premium login experience
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-950 to-purple-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-slate-300">Redirecting to premium login experience...</p>
      </motion.div>
    </div>
  );
}
