'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Shield, 
  Loader2, 
  KeyRound, 
  CheckCircle, 
  Clock,
  Users,
  Award
} from 'lucide-react';
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
import { useAuth } from '@/hooks/useAuth';

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
 * A multi-step authentication component for contractors using phone number and SMS verification.
 * It provides a secure, premium, and professional login experience with a glass-morphism UI,
 * smooth animations, clear error handling, and a test mode for development.
 */
export default function ContractorLogin() {
  const {
    authState,
    updatePhone,
    updateVerificationCode,
    testModeLogin,
    resetToPhone,
    handlePhoneSubmit,
    handleVerificationSubmit,
  } = useAuth();

  return (
    <main className="min-h-screen w-full relative overflow-hidden bg-secondary">
      {/* Cinematic Background */}
      <div className="absolute inset-0 opacity-50">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        
        {/* Animated geometric shapes */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1.2, 0.8, 1.2],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-secondary/10 to-primary/5 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Header with Logo */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 backdrop-blur-xl border border-primary/20 mb-6">
              <Image
                src="/logo.png"
                alt="FixItForMe"
                width={48}
                height={48}
                className="rounded-lg"
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome to FixItForMe
            </h1>
            <p className="text-muted-foreground">
              Professional contractor platform
            </p>
          </motion.div>

          {/* Main Auth Card */}
          <motion.div variants={itemVariants}>
            <Card className="backdrop-blur-xl bg-card/60 border-primary/20 shadow-2xl">
              <AnimatePresence mode="wait">
                {authState.step === 'phone' && (
                  <motion.div
                    key="phone"
                    variants={formVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                  >
                    <CardHeader className="text-center space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <Phone className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">Enter Your Phone</CardTitle>
                      <CardDescription>
                        We&apos;ll send you a secure verification code
                      </CardDescription>
                    </CardHeader>

                    <form onSubmit={handlePhoneSubmit}>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={authState.phone}
                            onChange={(e) => updatePhone(e.target.value)}
                            className="text-center text-lg tracking-wider"
                            disabled={authState.isSubmitting}
                            maxLength={14}
                          />
                        </div>
                        
                        {authState.error && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                          >
                            <p className="text-sm text-destructive text-center">
                              {authState.error}
                            </p>
                          </motion.div>
                        )}
                      </CardContent>

                      <CardFooter className="flex flex-col space-y-3">
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={authState.isSubmitting}
                          style={{ backgroundColor: BRAND.colors.primary }}
                        >
                          {authState.isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending Code...
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4 mr-2" />
                              Send Verification Code
                            </>
                          )}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                          <p>For testing purposes:</p>
                          <Button
                            type="button"
                            variant="link"
                            onClick={testModeLogin}
                            className="text-primary hover:underline p-0 h-auto"
                          >
                            Continue with Test Account
                          </Button>
                        </div>
                      </CardFooter>
                    </form>
                  </motion.div>
                )}

                {authState.step === 'verification' && (
                  <motion.div
                    key="verification"
                    variants={formVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                  >
                    <CardHeader className="text-center space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-2">
                        <KeyRound className="w-6 h-6 text-success" />
                      </div>
                      <CardTitle className="text-xl">Enter Verification Code</CardTitle>
                      <CardDescription>
                        Enter the 6-digit code sent to {authState.phone}
                      </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleVerificationSubmit}>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="code">Verification Code</Label>
                          <Input
                            id="code"
                            type="text"
                            placeholder="000000"
                            value={authState.verificationCode}
                            onChange={(e) => updateVerificationCode(e.target.value)}
                            className="text-center text-2xl tracking-[0.5em] font-mono"
                            disabled={authState.isSubmitting}
                            maxLength={6}
                          />
                        </div>

                        {authState.error && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                          >
                            <p className="text-sm text-destructive text-center">
                              {authState.error}
                            </p>
                          </motion.div>
                        )}
                      </CardContent>

                      <CardFooter className="flex flex-col space-y-3">
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={authState.isSubmitting}
                          style={{ backgroundColor: BRAND.colors.primary }}
                        >
                          {authState.isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Verify & Login
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          onClick={resetToPhone}
                          disabled={authState.isSubmitting}
                          className="w-full text-muted-foreground"
                        >
                          ← Back to Phone Number
                        </Button>
                      </CardFooter>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div variants={itemVariants} className="mt-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-8 h-8 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">48-Hour Sessions</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">5,000+ Contractors</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Professional Grade</p>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Secure SMS authentication powered by Supabase
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
