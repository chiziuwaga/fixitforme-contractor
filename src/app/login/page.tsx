'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Phone, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';
import Image from 'next/image';
import { toast } from 'sonner';

interface AuthStep {
  step: 'phone' | 'verification' | 'loading';
  phone: string;
  verificationCode: string;
  error: string | null;
  testMode: boolean;
}

export default function ContractorLogin() {
  const [authState, setAuthState] = useState<AuthStep>({
    step: 'phone',
    phone: '',
    verificationCode: '',
    error: null,
    testMode: false
  });

  const handlePhoneSubmit = async () => {
    if (!authState.phone || authState.phone.length < 10) {
      setAuthState(prev => ({ ...prev, error: 'Please enter a valid phone number' }));
      return;
    }

    setAuthState(prev => ({ ...prev, step: 'loading', error: null }));    try {
      const response = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: authState.phone })
      });

      if (response.ok) {
        setAuthState(prev => ({ ...prev, step: 'verification' }));
        toast.success('Verification Sent', {
          description: `A 6-digit code has been sent to ${authState.phone}`,
        });
      } else {
        throw new Error('Failed to send verification code');
      }    } catch {
      setAuthState(prev => ({ 
        ...prev, 
        step: 'phone', 
        error: 'Failed to send verification code. Please try again.' 
      }));
    }
  };

  const handleVerificationSubmit = async () => {
    if (authState.verificationCode.length !== 6) {
      setAuthState(prev => ({ ...prev, error: 'Please enter the complete 6-digit code' }));
      return;
    }

    setAuthState(prev => ({ ...prev, step: 'loading', error: null }));    try {
      const response = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: authState.phone, 
          token: authState.verificationCode 
        })
      });

      if (response.ok) {
        toast.success('Welcome!', {
          description: 'Successfully logged in. Redirecting to dashboard...',
        });
        // Redirect to dashboard
        window.location.href = '/contractor/dashboard';
      } else {
        throw new Error('Invalid verification code');
      }    } catch {
      setAuthState(prev => ({ 
        ...prev, 
        step: 'verification', 
        error: 'Invalid or expired code. Please try again.' 
      }));
    }
  };

  const handleTestModeSubmit = async () => {
    setAuthState(prev => ({ ...prev, step: 'loading', error: null }));
    try {
      const response = await fetch('/api/auth/test-login', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Test Mode Activated', {
          description: 'Successfully logged in as a test user.',
        });
        window.location.href = '/contractor/dashboard';
      } else {
        throw new Error('Test login failed');
      }
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        step: 'phone', 
        error: 'Could not log in using test mode.' 
      }));
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={containerVariants}
        className="w-full max-w-md"
      >
        <Card className="brand-shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <motion.div variants={itemVariants} className="flex justify-center">
              <Image 
                src="/logo.png" 
                alt={`${BRAND.name} Logo`} 
                width={80} 
                height={80} 
                className="drop-shadow-sm"
              />
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-2">
              <CardTitle className="text-2xl font-heading text-primary">
                {BRAND.name} Contractor
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Welcome back. Please sign in to continue.
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {authState.step === 'phone' && (
                <motion.div 
                  key="phone" 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 555-5555"
                        value={authState.phone}
                        onChange={(e) => setAuthState(prev => ({ ...prev, phone: e.target.value, error: null }))}
                        className="pl-10 brand-focus"
                      />
                    </div>
                    {authState.error && authState.step === 'phone' && (
                      <p className="text-sm text-error-600 mt-1">{authState.error}</p>
                    )}
                  </div>
                  <Button 
                    onClick={handlePhoneSubmit}
                    className="w-full brand-transition bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Send Verification Code
                  </Button>
                </motion.div>
              )}

              {authState.step === 'verification' && (
                <motion.div 
                  key="verification" 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit code sent to {authState.phone}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="verification" className="text-sm font-medium">
                      Verification Code
                    </Label>
                    <Input
                      id="verification"
                      type="text"
                      placeholder="123456"
                      value={authState.verificationCode}
                      onChange={(e) => setAuthState(prev => ({ ...prev, verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6), error: null }))}
                      className="text-center text-lg tracking-widest brand-focus"
                      maxLength={6}
                      autoComplete="one-time-code"
                      autoFocus
                    />
                    {authState.error && (
                      <p className="text-sm text-error-600 mt-1">{authState.error}</p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Button 
                      onClick={handleVerificationSubmit}
                      className="w-full brand-transition bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Verify & Sign In
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setAuthState(prev => ({ ...prev, step: 'phone', error: null }))}
                      className="w-full text-muted-foreground hover:text-foreground"
                      size="sm"
                    >
                      Back to phone number
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {authState.step === 'loading' && (
              <div className="flex items-center justify-center space-x-3 py-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Please wait...</span>
              </div>
            )}

            {authState.error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert className="border-error-200 bg-error-50">
                  <AlertCircle className="h-4 w-4 text-error-600" />
                  <AlertDescription className="text-error-800">
                    {authState.error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-2 text-xs text-muted-foreground">Or</span>
              </div>
            </div>

            <motion.div variants={itemVariants}>
              <Button 
                variant="outline"
                onClick={handleTestModeSubmit}
                disabled={authState.step === 'loading'}
                className="w-full border text-foreground hover:bg-muted brand-transition"
                size="lg"
              >
                Continue in Test Mode (for internal use)
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
