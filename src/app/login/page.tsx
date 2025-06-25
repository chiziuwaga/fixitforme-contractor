'use client';

import { useState } from 'react';
import { 
  MantineProvider, 
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
  Switch,
  Divider,
  Card
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPhone, IconShieldCheck, IconAlertCircle } from '@tabler/icons-react';
import { BRAND } from '@/lib/brand';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

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
    <MantineProvider>
      <div style={{ 
        minHeight: '100vh', 
        background: `linear-gradient(135deg, ${BRAND.colors.background.secondary} 0%, ${BRAND.colors.background.tertiary} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <Container size="xs">
          <Paper withBorder p="xl" radius="lg" shadow="lg">
            <Stack gap="lg">
              {/* Header */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '48px', 
                  marginBottom: '1rem',
                  color: BRAND.colors.primary 
                }}>
                  🔧
                </div>
                <Title order={1} style={{ color: BRAND.colors.secondary }}>
                  FixItForMe
                </Title>
                <Text c="dimmed" size="lg">
                  Contractor Dashboard
                </Text>
              </div>

              {/* Error Alert */}
              {authState.error && (
                <Alert 
                  icon={<IconAlertCircle size={16} />} 
                  color="red" 
                  variant="light"
                  onClose={() => setAuthState(prev => ({ ...prev, error: null }))}
                  withCloseButton
                >
                  {authState.error}
                </Alert>
              )}

              {/* Phone Input Step */}
              {authState.step === 'phone' && (
                <Stack gap="md">
                  <div>
                    <Text fw={500} mb="xs">
                      Enter your phone number
                    </Text>
                    <Text size="sm" c="dimmed">
                      We&apos;ll send you a verification code to access your contractor dashboard.
                    </Text>
                  </div>
                  
                  <TextInput
                    leftSection={<IconPhone size={16} />}
                    placeholder="(555) 123-4567"
                    value={authState.phone}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setAuthState(prev => ({ ...prev, phone: formatted }));
                    }}
                    maxLength={14}
                    size="lg"
                  />
                  
                  <Button 
                    onClick={handlePhoneSubmit}
                    size="lg" 
                    fullWidth
                    style={{ backgroundColor: BRAND.colors.primary }}
                  >
                    Send Verification Code
                  </Button>

                  {/* Test Mode Section */}
                  <Divider label="OR" labelPosition="center" my="md" />
                  
                  <Card withBorder p="md" radius="md" style={{ backgroundColor: '#f8f9fa' }}>
                    <Stack gap="sm">
                      <div>
                        <Text fw={500} size="sm" mb="xs">
                          Test Login (Development Mode)
                        </Text>
                        <Text size="xs" c="dimmed">
                          Skip SMS verification with test accounts
                        </Text>
                      </div>
                      
                      <Group grow>
                        <Button 
                          variant="light"
                          size="sm"
                          onClick={() => handleTestLogin('+1234567890')}
                          style={{ fontSize: '11px' }}
                        >
                          Basic Test Account
                        </Button>
                        <Button 
                          variant="light"
                          size="sm"
                          onClick={() => handleTestLogin('+1234567891')}
                          style={{ fontSize: '11px' }}
                        >
                          Premium Test Account
                        </Button>
                        <Button 
                          variant="light"
                          size="sm"
                          onClick={() => handleTestLogin('+1234567892')}
                          style={{ fontSize: '11px' }}
                        >
                          Complete Profile
                        </Button>
                      </Group>
                    </Stack>
                  </Card>
                </Stack>
              )}

              {/* Verification Code Step */}
              {authState.step === 'verification' && (
                <Stack gap="md">
                  <div>
                    <Text fw={500} mb="xs">
                      Enter verification code
                    </Text>
                    <Text size="sm" c="dimmed">
                      We sent a 6-digit code to {authState.phone}
                    </Text>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <PinInput
                      length={6}
                      size="lg"
                      value={authState.verificationCode}
                      onChange={(value) => setAuthState(prev => ({ ...prev, verificationCode: value }))}
                      placeholder="○"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleVerificationSubmit}
                    size="lg" 
                    fullWidth
                    style={{ backgroundColor: BRAND.colors.primary }}
                    leftSection={<IconShieldCheck size={16} />}
                  >
                    Verify & Continue
                  </Button>
                  
                  <Group justify="center">
                    <Button 
                      variant="subtle" 
                      size="sm"
                      onClick={() => setAuthState(prev => ({ ...prev, step: 'phone', verificationCode: '' }))}
                    >
                      ← Back to phone number
                    </Button>
                    <Button 
                      variant="subtle" 
                      size="sm"
                      onClick={handlePhoneSubmit}
                    >
                      Resend code
                    </Button>
                  </Group>
                </Stack>
              )}

              {/* Loading Step */}
              {authState.step === 'loading' && (
                <Stack gap="md" align="center">
                  <Loader size="lg" color={BRAND.colors.primary} />
                  <Text ta="center" c="dimmed">
                    Processing your request...
                  </Text>
                </Stack>
              )}

              {/* Footer */}
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Text size="xs" c="dimmed">
                  Secure contractor access • SMS verification required
                </Text>
                <Text size="xs" c="dimmed" mt="xs">
                  Test accounts available for development and testing
                </Text>
              </div>
            </Stack>
          </Paper>
        </Container>
      </div>
    </MantineProvider>
  );
}
