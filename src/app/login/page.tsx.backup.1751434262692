'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Shield, Loader2, KeyRound } from 'lucide-react';
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
    } catch (err) {
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
    } catch (err) {
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
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-secondary via-background to-accent/30 p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className="bg-background/60 backdrop-blur-xl border border-white/10 shadow-2xl shadow-primary/10">
          <CardHeader className="text-center pt-10 pb-6">
            <motion.div variants={itemVariants} className="flex justify-center">
              <Image
                src="/logo.png"
                alt={`${BRAND.name} Logo`}
                width={72}
                height={72}
                className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]"
                priority
              />
            </motion.div>
            <motion.div variants={itemVariants} className="mt-4">
              <CardTitle className="text-3xl font-bold tracking-tight text-primary">
                Contractor Portal
              </CardTitle>
              <CardDescription className="text-secondary/80 mt-1">
                Secure & Professional Sign-In
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="px-8 pb-4">
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
                    <Label htmlFor="phone" className="text-secondary">Your Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-accent" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(555) 555-5555"
                        value={authState.phone}
                        onChange={handlePhoneChange}
                        className="pl-11 h-12 text-base"
                        autoComplete="tel"
                        required
                        disabled={authState.isSubmitting}
                        aria-invalid={!!(authState.error && authState.step === 'phone')}
                        aria-describedby="phone-error"
                      />
                    </div>
                    {authState.error && authState.step === 'phone' && (
                      <p id="phone-error" className="text-sm font-medium text-destructive">{authState.error}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transform transition-transform hover:scale-[1.02]" disabled={authState.isSubmitting}>
                    {authState.isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Shield className="mr-2 h-5 w-5" />}
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
                  <div className="text-center">
                    <p className="text-sm text-secondary/90">
                      Enter the 6-digit code sent to <span className="font-semibold text-primary">{authState.phone}</span>.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="verification" className="text-secondary">Verification Code</Label>
                    <Input
                      id="verification"
                      name="verification"
                      type="text"
                      placeholder="123456"
                      value={authState.verificationCode}
                      onChange={(e) => setAuthState(prev => ({ ...prev, verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6), error: null }))}
                      className="h-14 text-center text-2xl tracking-[0.3em]"
                      maxLength={6}
                      autoComplete="one-time-code"
                      required
                      autoFocus
                      disabled={authState.isSubmitting}
                      aria-invalid={!!(authState.error && authState.step === 'verification')}
                      aria-describedby="verification-error"
                    />
                    {authState.error && authState.step === 'verification' && (
                      <p id="verification-error" className="text-sm font-medium text-destructive text-center">{authState.error}</p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Button type="submit" className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transform transition-transform hover:scale-[1.02]" disabled={authState.isSubmitting}>
                      {authState.isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <KeyRound className="mr-2 h-5 w-5" />}
                      Verify & Sign In
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setAuthState(prev => ({ ...prev, step: 'phone', error: null, verificationCode: '' }))}
                      className="w-full text-accent hover:text-primary"
                      disabled={authState.isSubmitting}
                    >
                      Use a different number
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
            
            <motion.div variants={itemVariants} className="!mt-8 relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background/60 px-2 text-secondary/60">Or</span></div>
            </motion.div>

            <motion.div variants={itemVariants} className="!mt-6">
              <Button variant="outline" onClick={handleTestModeSubmit} disabled={authState.isSubmitting} className="w-full h-12 border-accent/50 text-accent hover:bg-accent/10 hover:border-accent hover:text-accent">
                Continue in Test Mode
              </Button>
            </motion.div>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center px-8 pb-8 pt-4">
            <motion.div variants={itemVariants} className="flex items-center text-xs text-secondary/60">
              <Shield size={14} className="mr-2 text-green-400" />
              <span>SSL Secured Connection</span>
            </motion.div>
          </CardFooter>
        </Card>
        <motion.div variants={itemVariants} className="pt-6 text-center text-xs text-secondary/50">
          &copy; {new Date().getFullYear()} {BRAND.name}. All Rights Reserved.
        </motion.div>
      </motion.div>
    </main>
  );
}