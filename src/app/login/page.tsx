'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Shield, 
  Loader2, 
  KeyRound, 
  Sparkles, 
  CheckCircle, 
  Clock,
  Users,
  TrendingUp,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BRAND } from '@/lib/brand';

/**
 * Defines the authentication state for the multi-step login process.
 */
interface AuthState {
  step: 'phone' | 'verification';
  phone: string;
  verificationCode: string;
  error: string | null;
  isSubmitting: boolean;
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      duration: 0.4,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100 },
  },
};

const formVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
};

/**
 * Formats a raw string of digits into a standard US phone number format.
 * e.g., "5551234567" -> "(555) 123-4567"
 * @param value - The raw phone number string.
 * @returns The formatted phone number string.
 */
const formatPhoneNumber = (value: string): string => {
  const cleaned = ('' + value).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (!match) return value;
  const parts = [match[1], match[2], match[3]].filter(Boolean);
  let formatted = parts.join('');
  if (parts.length > 1) {
    formatted = `(${parts[0]}) ${parts[1]}`;
    if (parts[2]) {
      formatted += `-${parts[2]}`;
    }
  } else if (parts.length > 0) {
    formatted = `(${parts[0]}`;
  }
  return formatted;
};

/**
 * A multi-step authentication component for contractors using phone number and SMS verification.
 * It provides a secure, premium, and professional login experience with a glass-morphism UI,
 * smooth animations, clear error handling, and a test mode for development.
 */
export default function ContractorLogin() {
  const [authState, setAuthState] = useState<AuthState>({
    step: 'phone',
    phone: '',
    verificationCode: '',
    error: null,
    isSubmitting: false,
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setAuthState(prev => ({ ...prev, phone: formatted, error: null }));
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authState.phone.replace(/\D/g, '').length !== 10) {
      setAuthState(prev => ({ ...prev, error: 'A valid 10-digit phone number is required.' }));
      return;
    }

    setAuthState(prev => ({ ...prev, isSubmitting: true, error: null }));
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // await fetch('/api/auth/send-sms', { ... });

      setAuthState(prev => ({ ...prev, step: 'verification', isSubmitting: false }));
      toast.success('Verification Code Sent', {
        description: `A 6-digit code was sent to ${authState.phone}.`,
        duration: 5000,
      });
    } catch {
      setAuthState(prev => ({
        ...prev,
        step: 'phone',
        isSubmitting: false,
        error: 'Failed to send code. Please check the number and try again.',
      }));
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authState.verificationCode.length !== 6) {
      setAuthState(prev => ({ ...prev, error: 'The 6-digit code is required.' }));
      return;
    }

    setAuthState(prev => ({ ...prev, isSubmitting: true, error: null }));
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // await fetch('/api/auth/verify-sms', { ... });

      toast.success('Login Successful!', {
        description: 'Welcome back. Redirecting to your dashboard...',
        duration: 3000,
      });
      // In a real app, use next/navigation router.push
      window.location.href = '/contractor/dashboard';
    } catch {
      setAuthState(prev => ({
        ...prev,
        step: 'verification',
        isSubmitting: false,
        error: 'Invalid or expired code. Please request a new one.',
      }));
    }
  };

  const handleTestModeSubmit = () => {
    toast.info('Redirecting in Test Mode...', {
      description: 'Accessing the dashboard with a test account.',
    });
    window.location.href = '/contractor/dashboard';
  };

  return (
    <main className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-blue-950 via-slate-950 to-purple-950">
      {/* Cinematic Background */}
      <div className="absolute inset-0">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
        
        {/* Animated geometric shapes */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-accent/15 to-secondary/15 rounded-full blur-3xl"
        />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/40 rounded-full"
            animate={{
              y: [-100, -1000],
              x: [0, Math.random() * 200 - 100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: '100%',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Trust Indicators & Features */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden lg:flex lg:w-1/2 xl:w-2/3 flex-col justify-center px-8 xl:px-16"
        >
          <div className="max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4">
                Welcome to the Future of
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  Home Repairs
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Join thousands of contractors earning more with AI-powered lead generation and intelligent bidding assistance.
              </p>
            </motion.div>

            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, staggerChildren: 0.1 }}
            >
              {[
                { icon: TrendingUp, title: "Average 40% Revenue Increase", desc: "AI-optimized bidding strategies" },
                { icon: Users, title: "10,000+ Active Contractors", desc: "Growing nationwide network" },
                { icon: Clock, title: "Save 15+ Hours Weekly", desc: "Automated lead generation" },
                { icon: Award, title: "99.9% Platform Reliability", desc: "Enterprise-grade infrastructure" },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center space-x-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-8 flex items-center space-x-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Bank-Level Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>AI-Powered</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 xl:w-1/3 flex items-center justify-center p-4 lg:p-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            <Card className="bg-background/80 backdrop-blur-xl border border-white/20 shadow-2xl shadow-primary/20 overflow-hidden">
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 pointer-events-none" />
              
              <CardHeader className="text-center pt-10 pb-6 relative">
                <motion.div variants={itemVariants} className="flex justify-center">
                  <div className="relative">
                    <Image
                      src="/logo.png"
                      alt={`${BRAND.name} Logo`}
                      width={72}
                      height={72}
                      className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
                      priority
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="mt-6">
                  <CardTitle className="text-3xl font-bold tracking-tight text-primary">
                    Contractor Portal
                  </CardTitle>
                  <CardDescription className="text-secondary/80 mt-2 text-base">
                    Secure • Professional • AI-Enhanced
                  </CardDescription>
                </motion.div>
              </CardHeader>

          <CardContent className="px-8 pb-4 relative">
            <AnimatePresence mode="wait">
              {authState.step === 'phone' ? (
                <motion.form
                  key="phone"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  onSubmit={handlePhoneSubmit}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-secondary font-medium">Your Phone Number</Label>
                    <div className="relative group">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-accent transition-colors group-focus-within:text-primary" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(555) 555-5555"
                        value={authState.phone}
                        onChange={handlePhoneChange}
                        className="pl-11 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        autoComplete="tel"
                        required
                        disabled={authState.isSubmitting}
                        aria-invalid={!!(authState.error && authState.step === 'phone')}
                        aria-describedby="phone-error"
                      />
                      <motion.div
                        className="absolute inset-0 rounded-md border border-primary/50 pointer-events-none opacity-0"
                        animate={{
                          opacity: authState.phone ? [0, 1, 0] : 0,
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    {authState.error && authState.step === 'phone' && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        id="phone-error" 
                        className="text-sm font-medium text-destructive flex items-center space-x-1"
                      >
                        <span>⚠️</span>
                        <span>{authState.error}</span>
                      </motion.p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25" 
                    disabled={authState.isSubmitting}
                  >
                    {authState.isSubmitting ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Shield className="mr-2 h-5 w-5" />
                    )}
                    Send Verification Code
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="verification"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  onSubmit={handleVerificationSubmit}
                  className="space-y-6"
                >
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full">
                      <KeyRound className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-1">Check Your Phone</h3>
                      <p className="text-sm text-secondary/90">
                        Enter the 6-digit code sent to{' '}
                        <span className="font-semibold text-primary">{authState.phone}</span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="verification" className="text-secondary font-medium">Verification Code</Label>
                    <div className="relative">
                      <Input
                        id="verification"
                        name="verification"
                        type="text"
                        placeholder="••••••"
                        value={authState.verificationCode}
                        onChange={(e) => setAuthState(prev => ({ 
                          ...prev, 
                          verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6), 
                          error: null 
                        }))}
                        className="h-14 text-center text-2xl tracking-[0.5em] font-mono bg-background/50"
                        maxLength={6}
                        autoComplete="one-time-code"
                        required
                        autoFocus
                        disabled={authState.isSubmitting}
                        aria-invalid={!!(authState.error && authState.step === 'verification')}
                        aria-describedby="verification-error"
                      />
                      {/* Progress indicators */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              i < authState.verificationCode.length
                                ? 'bg-primary'
                                : 'bg-secondary/30'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {authState.error && authState.step === 'verification' && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        id="verification-error" 
                        className="text-sm font-medium text-destructive text-center flex items-center justify-center space-x-1"
                      >
                        <span>⚠️</span>
                        <span>{authState.error}</span>
                      </motion.p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25" 
                      disabled={authState.isSubmitting || authState.verificationCode.length !== 6}
                    >
                      {authState.isSubmitting ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <KeyRound className="mr-2 h-5 w-5" />
                      )}
                      Verify & Sign In
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setAuthState(prev => ({ 
                        ...prev, 
                        step: 'phone', 
                        error: null, 
                        verificationCode: '' 
                      }))}
                      className="w-full text-accent hover:text-primary hover:bg-accent/10"
                      disabled={authState.isSubmitting}
                    >
                      ← Use a different number
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
            
            <motion.div variants={itemVariants} className="!mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background/80 px-3 text-secondary/60 font-medium">Development Mode</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="!mt-6">
              <Button 
                variant="outline" 
                onClick={handleTestModeSubmit} 
                disabled={authState.isSubmitting} 
                className="w-full h-12 border-accent/30 text-accent hover:bg-accent/10 hover:border-accent hover:text-accent transition-all duration-200"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Continue in Test Mode
              </Button>
            </motion.div>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center justify-center px-8 pb-8 pt-4 space-y-4 relative">
            <motion.div variants={itemVariants} className="flex items-center space-x-4 text-xs text-secondary/70">
              <div className="flex items-center space-x-1">
                <Shield size={14} className="text-primary" />
                <span>SSL Secured</span>
              </div>
              <div className="w-1 h-1 bg-secondary/40 rounded-full" />
              <div className="flex items-center space-x-1">
                <CheckCircle size={14} className="text-primary" />
                <span>SOC 2 Compliant</span>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants} 
              className="text-center"
            >
              <p className="text-xs text-secondary/50">
                Protected by enterprise-grade security
              </p>
            </motion.div>
          </CardFooter>
        </Card>
        
        <motion.div variants={itemVariants} className="pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {BRAND.name}. All Rights Reserved.
        </motion.div>
      </motion.div>
        </div>
      </div>
    </main>
  );
}