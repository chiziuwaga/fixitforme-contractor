'use client';

import { useState } from 'react';
import {
  Container, 
  Paper, 
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
import { containerVariants, itemVariants, hoverVariant } from '@/lib/animations';
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
        error: 'Invalid code. Please try again or request a new code.' 
      }));
    }
  };

  const handleTestLogin = async (testPhone: string) => {
    setAuthState(prev => ({ ...prev, step: 'loading', error: null, phone: testPhone }));
    
    try {
      const response = await fetch('/api/auth/test-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone })
      });

      const data = await response.json();

      if (response.ok) {
        notifications.show({
          title: 'Test Login Successful',
          message: `Logged in as test contractor: ${data.contractor_profile.company_name || 'Test Contractor'}`,
          color: 'green'
        });
        
        // Redirect based on onboarding status
        window.location.href = data.redirect_url;
      } else {
        throw new Error(data.error || 'Test login failed');
      }
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        step: 'phone', 
        error: error instanceof Error ? error.message : 'Test login failed. Please try again.' 
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
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      overflow: 'hidden' // Prevent scrollbars during animation
    }}>
        <Container size="xs" style={{ width: '100%' }}>
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Paper 
              withBorder 
              p="xl" 
              radius="lg" 
              shadow="xl" // Enhanced shadow for better contrast
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.98)', // Near-opaque for high contrast
                border: `1px solid ${BRAND.colors.background.tertiary}`
            }}>
              <Stack gap="lg">
                <motion.div variants={itemVariants} style={{ textAlign: 'center' }}>
                  <motion.div variants={hoverVariant} whileHover="hover" whileTap="tap">
                    <Image 
                      src="/logo.png"
                      alt="FixItForMe Logo"
                      width={80}
                      height={80}
                      style={{ margin: '0 auto' }}
                      priority // Preload the logo
                    />
                  </motion.div>
                  <Title order={1} style={{ 
                    color: BRAND.colors.text.primary,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: '32px',
                    marginBottom: '8px'
                  }}>
                    FixItForMe
                  </Title>
                  <Text style={{ 
                    color: BRAND.colors.text.secondary,
                    fontSize: '18px',
                    fontWeight: 500
                  }}>
                    Professional Home Repairs
                  </Text>
                  <Text style={{ 
                    color: BRAND.colors.text.accent,
                    fontSize: '14px',
                    marginTop: '4px'
                  }}>
                    Contractor Dashboard
                  </Text>
                </motion.div>

                <AnimatePresence mode="wait">
                  {authState.step === 'loading' && (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}
                    >
                      <Loader color={BRAND.colors.primary} />
                    </motion.div>
                  )}

                  {authState.step === 'phone' && (
                    <motion.div
                      key="phone-step"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                    >
                      <Stack gap="md">
                        <TextInput
                          leftSection={<IconPhone size={16} />}
                          label="Phone Number"
                          placeholder="(555) 555-5555"
                          size="lg"
                          value={authState.phone}
                          onChange={(e) => setAuthState(prev => ({ ...prev, phone: formatPhoneNumber(e.currentTarget.value) }))}
                          onKeyDown={(e) => e.key === 'Enter' && handlePhoneSubmit()}
                          error={authState.error && authState.step === 'phone'}
                        />
                        <motion.div variants={hoverVariant} whileHover="hover" whileTap="tap">
                          <Button 
                            fullWidth 
                            size="lg" 
                            onClick={handlePhoneSubmit}
                            style={{ backgroundColor: BRAND.colors.primary }}
                          >
                            Send Verification Code
                          </Button>
                        </motion.div>
                      </Stack>
                    </motion.div>
                  )}

                  {authState.step === 'verification' && (
                    <motion.div
                      key="verification-step"
                      variants={itemVariants}
                    >
                      <Stack align="center" gap="md">
                        <IconShieldCheck size={32} color={BRAND.colors.state.success} />
                        <Title order={3} style={{ color: BRAND.colors.text.primary }}>Enter Code</Title>
                        <Text size="sm" c="dimmed" ta="center" style={{ maxWidth: 300 }}>
                          We sent a 6-digit code to <span style={{ fontWeight: 'bold', color: BRAND.colors.text.primary }}>{authState.phone}</span>.
                        </Text>
                        <PinInput
                          length={6}
                          size="lg"
                          value={authState.verificationCode}
                          onChange={(value) => setAuthState(prev => ({ ...prev, verificationCode: value }))}
                          onComplete={handleVerificationSubmit}
                          autoFocus
                          error={!!authState.error}
                          styles={{
                            root: { justifyContent: 'center' },
                            pin: { 
                              borderColor: BRAND.colors.background.tertiary, 
                              '&:focus': { borderColor: BRAND.colors.primary }
                            }
                          }}
                        />
                        <motion.div variants={hoverVariant} whileHover="hover" whileTap="tap">
                          <Button 
                            fullWidth 
                            size="lg" 
                            onClick={handleVerificationSubmit}
                            style={{ backgroundColor: BRAND.colors.primary }}
                          >
                            Verify & Login
                          </Button>
                        </motion.div>
                        <Button variant="subtle" size="sm" onClick={() => setAuthState(prev => ({ ...prev, step: 'phone', error: null }))}>
                          Use a different number
                        </Button>
                      </Stack>
                    </motion.div>
                  )}
                </AnimatePresence>

                {authState.error && authState.step !== 'loading' && (
                  <motion.div variants={itemVariants}>
                    <Alert 
                      icon={<IconAlertCircle size={16} />} 
                      title="Error" 
                      color="red" 
                      variant="light"
                    >
                      {authState.error}
                    </Alert>
                  </motion.div>
                )}

                <Divider my="xs" label="For Development & Testing" labelPosition="center" />

                <motion.div variants={itemVariants}>
                  <Card withBorder radius="md" p="sm" bg={BRAND.colors.background.secondary}>
                    <Stack>
                      <Text size="sm" fw={500} ta="center">Test Accounts</Text>
                      <Group grow>
                        <motion.div variants={hoverVariant} whileHover="hover" whileTap="tap">
                          <Button variant="default" onClick={() => handleTestLogin('+1234567890')}>👷 Basic</Button>
                        </motion.div>
                        <motion.div variants={hoverVariant} whileHover="hover" whileTap="tap">
                          <Button variant="default" onClick={() => handleTestLogin('+1234567891')}>⚡ Premium</Button>
                        </motion.div>
                        <motion.div variants={hoverVariant} whileHover="hover" whileTap="tap">
                          <Button variant="default" onClick={() => handleTestLogin('+1234567892')}>🏆 Elite</Button>
                        </motion.div>
                      </Group>
                    </Stack>
                  </Card>
                </motion.div>
              </Stack>
            </Paper>
          </motion.div>
        </Container>
    </div>
  );
}
