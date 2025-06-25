'use client';

import { useState } from 'react';
import {
  Container, 
  Title, 
  Text, 
  TextInput, 
  Button, 
  Stack, 
  Group,
  PinInput,
  Alert,
  Loader,
  Divider,
  Card
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPhone, IconShieldCheck, IconAlertCircle } from '@tabler/icons-react';
import { BRAND } from '@/lib/brand';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';
import Image from 'next/image';

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
        notifications.show({
          title: 'Verification Sent',
          message: `A 6-digit code has been sent to ${authState.phone}`,
          color: 'green'
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
        notifications.show({
          title: 'Welcome!',
          message: 'Successfully logged in. Redirecting to dashboard...',
          color: 'green'
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
        notifications.show({
          title: 'Test Mode Activated',
          message: 'Successfully logged in as a test user.',
          color: 'blue'
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
    <Container size="xs" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <Card shadow="xl" p="xl" radius="lg" withBorder>
          <Stack align="center" gap="md">
            <motion.div variants={itemVariants}>
              <Image 
                src="/logo.png" 
                alt={`${BRAND.name} Logo`} 
                width={80} 
                height={80} 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Title order={2} ta="center" c="brand-secondary">{BRAND.name} Contractor</Title>
              <Text size="sm" c="dimmed" ta="center">Welcome back. Please sign in to continue.</Text>
            </motion.div>
          </Stack>

          <AnimatePresence mode="wait">
            {authState.step === 'phone' && (
              <motion.div key="phone" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <Stack gap="lg" mt="xl">
                  <TextInput
                    label="Phone Number"
                    placeholder="(555) 555-5555"
                    type="tel"
                    leftSection={<IconPhone size={16} />}
                    value={authState.phone}
                    onChange={(e) => setAuthState(prev => ({ ...prev, phone: e.currentTarget.value, error: null }))}
                    error={authState.error && authState.step === 'phone'}
                    size="md"
                  />
                  <Button 
                    fullWidth 
                    onClick={handlePhoneSubmit}
                    leftSection={<IconShieldCheck size={18} />}
                    size="md"
                  >
                    Send Verification Code
                  </Button>
                </Stack>
              </motion.div>
            )}

            {authState.step === 'verification' && (
              <motion.div key="verification" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <Stack gap="lg" mt="xl">
                  <Text size="sm" ta="center">Enter the 6-digit code sent to {authState.phone}</Text>
                  <Group justify="center">
                    <PinInput 
                      length={6} 
                      size="lg"
                      value={authState.verificationCode}
                      onChange={(value) => setAuthState(prev => ({ ...prev, verificationCode: value, error: null }))}
                      error={!!authState.error}
                      oneTimeCode
                      autoFocus
                    />
                  </Group>
                  <Button 
                    fullWidth 
                    onClick={handleVerificationSubmit}
                    leftSection={<IconShieldCheck size={18} />}
                    size="md"
                  >
                    Verify & Sign In
                  </Button>
                  <Button variant="subtle" size="sm" onClick={() => setAuthState(prev => ({ ...prev, step: 'phone', error: null }))}>
                    Back to phone number
                  </Button>
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>

          {authState.step === 'loading' && (
            <Group justify="center" mt="xl">
              <Loader />
              <Text>Please wait...</Text>
            </Group>
          )}

          {authState.error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Alert 
                title="Authentication Error"
                color="red" 
                icon={<IconAlertCircle />} 
                mt="md" 
                withCloseButton 
                onClose={() => setAuthState(prev => ({ ...prev, error: null }))}
              >
                {authState.error}
              </Alert>
            </motion.div>
          )}

          <Divider my="lg" label="Or" labelPosition="center" />

          <motion.div variants={itemVariants}>
            <Button 
              fullWidth 
              variant="light"
              onClick={handleTestModeSubmit}
              disabled={authState.step === 'loading'}
            >
              Continue in Test Mode (for internal use)
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </Container>
  );
}
