'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Phone, Shield, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthFormProps {
  onSuccess?: (data: {
    user: unknown;
    session: unknown;
    contractor_profile: unknown;
    is_new_user: boolean;
    redirect_url: string;
  }) => void;
}

export default function ContractorAuth({ onSuccess }: AuthFormProps) {
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<{ phone?: string; code?: string }>({});
  const router = useRouter();

  const validatePhone = (value: string) => {
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(value.replace(/\s+/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return null;
  };

  const validateCode = (value: string) => {
    if (!value || value.length !== 6) {
      return 'Please enter the 6-digit verification code';
    }
    return null;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setErrors({ phone: phoneError });
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setPhoneNumber(phone);
      setStep('verify');
      
      toast.success('Code Sent', {
        description: 'Please check your phone for the 6-digit verification code',
      });

    } catch (error) {
      console.error('Phone submission error:', error);
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to send verification code',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeError = validateCode(code);
    if (codeError) {
      setErrors({ code: codeError });
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phoneNumber, 
          token: code 
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      toast.success('Welcome!', {
        description: 'Phone verification successful',
      });

      // Handle successful authentication
      if (onSuccess) {
        onSuccess(data);
      } else {
        // Redirect based on user status
        router.push(data.redirect_url || '/contractor/dashboard');
      }

    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Verification Failed', {
        description: error instanceof Error ? error.message : 'Invalid verification code',
      });
      
      // Reset code input
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setPhoneNumber('');
    setCode('');
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-card/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center"
            >
              {step === 'phone' ? (
                <Phone className="h-8 w-8 text-white" />
              ) : (
                <Shield className="h-8 w-8 text-white" />
              )}
            </motion.div>
            
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                {step === 'phone' ? 'Welcome Back' : 'Verify Your Phone'}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {step === 'phone' 
                  ? 'Enter your phone number to continue'
                  : `We sent a code to ${phoneNumber}`
                }
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 'phone' ? (
                <motion.form
                  key="phone"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handlePhoneSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 text-lg border-2 brand-focus"
                      disabled={loading}
                    />
                    {errors.phone && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.phone}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading || !phone.trim()}
                    className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      'Send Verification Code'
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="verify"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifySubmit}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="h-12 text-lg text-center tracking-widest border-2 brand-focus"
                      maxLength={6}
                      disabled={loading}
                    />
                    {errors.code && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.code}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Button 
                      type="submit" 
                      disabled={loading || code.length !== 6}
                      className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-5 w-5" />
                          Verify & Continue
                        </>
                      )}
                    </Button>

                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={handleBackToPhone}
                      disabled={loading}
                      className="w-full h-10 text-muted-foreground hover:text-primary"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Phone Number
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                By continuing, you agree to our{' '}
                <a href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
