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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { BRAND } from '@/lib/brand';
import { containerVariants, itemVariants } from '@/lib/animations';

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

/**
 * A multi-step authentication component for contractors using phone number and SMS verification.
 * It provides a secure and professional login experience with clear steps, error handling,
 * loading states, and a test mode for internal development. The component adheres to a strict
 * design system using semantic Tailwind classes.
 */
export default function ContractorLogin() {
  const [authState, setAuthState] = useState<AuthState>({
    step: 'phone',
    phone: '',
    verificationCode: '',
    error: null,
    isSubmitting: false,
  });

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authState.phone.replace(/\D/g, '').length < 10) {
      setAuthState(prev => ({ ...prev, error: 'Please enter a valid 10-digit phone number.' }));
      return;
    }

    setAuthState(prev => ({ ...prev, isSubmitting: true, error: null }));
    try {
      const response = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: authState.phone }),
      });

      if (!response.ok) {
        throw new Error('Failed to send verification code');
      }

      setAuthState(prev => ({ ...prev, step: 'verification', isSubmitting: false }));
      toast.success('Verification Code Sent', {
        description: `A 6-digit code has been sent to your phone.`,
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
      setAuthState(prev => ({ ...prev, error: 'Please enter the complete 6-digit code.' }));
      return;
    }

    setAuthState(prev => ({ ...prev, isSubmitting: true, error: null }));
    try {
      const response = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: authState.phone,
          token: authState.verificationCode,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      toast.success('Welcome!', {
        description: 'Successfully logged in. Redirecting to your dashboard...',
      });
      window.location.href = '/contractor/dashboard';
    } catch (err) {
      setAuthState(prev => ({
        ...prev,
        step: 'verification',
        isSubmitting: false,
        error: 'Invalid or expired code. Please try again.',
      }));
    }
  };

  const handleTestModeSubmit = async () => {
    setAuthState(prev => ({ ...prev, isSubmitting: true, error: null }));
    try {
      const response = await fetch('/api/auth/test-login', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Test login failed');
      }

      toast.success('Test Mode Activated', {
        description: 'Successfully logged in as a test user.',
      });
      window.location.href = '/contractor/dashboard';
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isSubmitting: false,
        step: 'phone', // Reset to the first step on failure
        error: 'Could not log in using test mode.',
      }));
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl bg-card/95 backdrop-blur-sm border-border">
          <CardHeader className="text-center space-y-4 pt-8">
            <motion.div variants={itemVariants} className="flex justify-center">
              <Image
                src="/logo.png"
                alt={`${BRAND.name} Logo`}
                width={80}
                height={80}
                className="drop-shadow-lg"
                priority
              />
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-1">
              <CardTitle className="text-3xl font-bold tracking-tight text-primary">
                {BRAND.name} Portal
              </CardTitle>
              <CardDescription>Secure contractor sign-in</CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="px-6 pb-8 pt-6">
            <AnimatePresence mode="wait">
              {authState.step === 'phone' ? (
                <motion.form
                  key="phone"
                  onSubmit={handlePhoneSubmit}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(555) 555-5555"
                        value={authState.phone}
                        onChange={(e) => setAuthState(prev => ({ ...prev, phone: e.target.value, error: null }))}
                        className="pl-10"
                        autoComplete="tel"
                        required
                        disabled={authState.isSubmitting}
                        aria-invalid={!!(authState.error && authState.step === 'phone')}
                        aria-describedby="phone-error"
                      />
                    </div>
                    {authState.error && authState.step === 'phone' && (
                      <p id="phone-error" className="text-sm font-medium text-destructive">
                        {authState.error}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={authState.isSubmitting}>
                    {authState.isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Shield className="mr-2 h-4 w-4" />
                    )}
                    Send Verification Code
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="verification"
                  onSubmit={handleVerificationSubmit}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit code sent to your phone.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="verification">Verification Code</Label>
                    <Input
                      id="verification"
                      name="verification"
                      type="text"
                      placeholder="123456"
                      value={authState.verificationCode}
                      onChange={(e) => setAuthState(prev => ({ ...prev, verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6), error: null }))}
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                      autoComplete="one-time-code"
                      required
                      autoFocus
                      disabled={authState.isSubmitting}
                      aria-invalid={!!(authState.error && authState.step === 'verification')}
                      aria-describedby="verification-error"
                    />
                    {authState.error && authState.step === 'verification' && (
                      <p id="verification-error" className="text-sm font-medium text-destructive">
                        {authState.error}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Button type="submit" className="w-full" size="lg" disabled={authState.isSubmitting}>
                      {authState.isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <KeyRound className="mr-2 h-4 w-4" />
                      )}
                      Verify & Sign In
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setAuthState(prev => ({ ...prev, step: 'phone', error: null, verificationCode: '' }))}
                      className="w-full text-muted-foreground hover:text-foreground"
                      size="sm"
                      disabled={authState.isSubmitting}
                    >
                      Use a different phone number
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
            
            <motion.div variants={itemVariants} className="!mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="!mt-8">
              <Button variant="outline" onClick={handleTestModeSubmit} disabled={authState.isSubmitting} className="w-full" size="lg">
                Continue in Test Mode
              </Button>
            </motion.div>
          </CardContent>
        </Card>
        <motion.div variants={itemVariants} className="pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {BRAND.name}. All Rights Reserved.
        </motion.div>
      </motion.div>
    </div>
  );
}