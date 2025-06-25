'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, 
  Paper, 
  TextInput, 
  Button, 
  Title, 
  Text, 
  Stack,
  Alert,
  LoadingOverlay,
  Group
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPhone, IconShield, IconCheck, IconAlertCircle } from '@tabler/icons-react';

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
  const router = useRouter();

  const phoneForm = useForm({
    initialValues: {
      phone: ''
    },
    validate: {
      phone: (value) => {
        const phoneRegex = /^\+?[1-9]\d{9,14}$/;
        if (!phoneRegex.test(value.replace(/\s+/g, ''))) {
          return 'Please enter a valid phone number';
        }
        return null;
      }
    }
  });

  const verifyForm = useForm({
    initialValues: {
      code: ''
    },
    validate: {
      code: (value) => {
        if (!value || value.length !== 6) {
          return 'Please enter the 6-digit verification code';
        }
        return null;
      }
    }
  });

  const handlePhoneSubmit = async (values: { phone: string }) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: values.phone })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setPhoneNumber(values.phone);
      setStep('verify');
      
      notifications.show({
        title: 'Code Sent',
        message: 'Please check your phone for the 6-digit verification code',
        color: 'blue',
        icon: <IconCheck size={16} />
      });

    } catch (error) {
      console.error('Phone submission error:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to send verification code',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (values: { code: string }) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phoneNumber, 
          token: values.code 
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      notifications.show({
        title: 'Welcome!',
        message: 'Phone verification successful',
        color: 'green',
        icon: <IconCheck size={16} />
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
      notifications.show({
        title: 'Verification Failed',
        message: error instanceof Error ? error.message : 'Invalid verification code',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
      
      // Reset code input
      verifyForm.setFieldValue('code', '');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setPhoneNumber('');
    verifyForm.reset();
  };

  return (
    <Container size={420} my={40}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md" pos="relative">
        <LoadingOverlay visible={loading} overlayProps={{ radius: 'md', blur: 2 }} />
        
        <Stack gap="lg">
          <div style={{ textAlign: 'center' }}>
            <Title order={2} ta="center" fw={900}>
              FixItForMe Contractor
            </Title>
            <Text c="dimmed" size="sm" ta="center" mt={5}>
              {step === 'phone' 
                ? 'Enter your phone number to get started' 
                : 'Enter the verification code sent to your phone'
              }
            </Text>
          </div>

          {step === 'phone' ? (
            <form onSubmit={phoneForm.onSubmit(handlePhoneSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Phone Number"
                  placeholder="+1 (555) 123-4567"
                  leftSection={<IconPhone size={16} />}
                  size="md"
                  {...phoneForm.getInputProps('phone')}
                />
                  <Alert icon={<IconShield size={16} />} color="blue">
                  We&apos;ll send you a 6-digit verification code via SMS. 
                  Your number will be kept secure and only used for authentication.
                </Alert>

                <Button 
                  type="submit" 
                  fullWidth 
                  size="md"
                  disabled={loading}
                >
                  Send Verification Code
                </Button>
              </Stack>
            </form>
          ) : (
            <form onSubmit={verifyForm.onSubmit(handleVerifySubmit)}>
              <Stack gap="md">
                <Alert icon={<IconPhone size={16} />} color="blue">
                  Code sent to {phoneNumber}
                </Alert>

                <TextInput
                  label="Verification Code"
                  placeholder="123456"
                  size="md"
                  maxLength={6}
                  {...verifyForm.getInputProps('code')}
                />

                <Button 
                  type="submit" 
                  fullWidth 
                  size="md"
                  disabled={loading}
                >
                  Verify & Continue
                </Button>

                <Group justify="center">
                  <Button 
                    variant="subtle" 
                    size="sm"
                    onClick={handleBackToPhone}
                    disabled={loading}
                  >
                    Use Different Number
                  </Button>
                </Group>
              </Stack>
            </form>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
