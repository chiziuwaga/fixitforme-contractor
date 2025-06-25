'use client';

import { useState } from 'react';
import {
  MantineProvider,
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Card,
  Badge,
  Grid,
  List,
  ThemeIcon
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCrown, IconCheck, IconX, IconCreditCard, IconShield } from '@tabler/icons-react';
import { BRAND } from '@/lib/brand';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

export default function TestStripePage() {
  const [loading, setLoading] = useState(false);
  const [testMode, setTestMode] = useState(true);

  const plans = [
    {
      tier: 'growth',
      name: 'Growth Tier',
      price: 'Free',
      subtitle: 'Perfect for getting started',
      platformFee: '6%',
      payoutStructure: '30% / 40% / 30%',
      features: [
        '10 bids per month',
        '10 active chat sessions',
        '50 messages per chat',
        'Basic AI agent access',
        'Standard support'
      ],
      limitations: [
        'Limited Rex lead generation',
        'Basic Alex analysis only',
        'No premium features'
      ],
      buttonText: 'Current Plan',
      disabled: true,
      variant: 'outline'
    },
    {
      tier: 'scale',
      name: 'Scale Tier',
      price: '$250',
      subtitle: 'For growing businesses',
      platformFee: '4%',
      payoutStructure: '50% / 25% / 25%',
      features: [
        '50 bids per month',
        '30 active chat sessions',
        '200 messages per chat',
        'Full AI agent access',
        'Rex lead generation (10/month)',
        'Alex material research',
        'Priority support',
        '7-day free trial'
      ],
      popular: true,
      buttonText: testMode ? 'Test Upgrade ($0.50)' : 'Start Free Trial',
      disabled: false,
      variant: 'filled'
    }
  ];

  const handleTestUpgrade = async (tier: string) => {
    if (tier !== 'scale') return;

    setLoading(true);

    try {
      if (testMode) {
        // Simulate a successful upgrade for testing
        notifications.show({
          title: 'Test Upgrade Successful!',
          message: 'This is a test transaction. No actual payment was processed.',
          color: 'green',
          icon: <IconCheck size={16} />
        });
        
        setTimeout(() => {
          notifications.show({
            title: 'Welcome to Scale Tier!',
            message: 'You now have access to all premium features. Test mode active.',
            color: 'blue'
          });
        }, 1000);
      } else {
        // Real Stripe checkout
        const response = await fetch('/api/payments/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tier: 'scale',
            contractor_id: 'test-contractor-1' // Would be real contractor ID
          })
        });

        const { url } = await response.json();
        if (url) {
          window.location.href = url;
        }
      }
    } catch {
      notifications.show({
        title: 'Upgrade Failed',
        message: 'Please try again or contact support.',
        color: 'red',
        icon: <IconX size={16} />
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MantineProvider>
      <div style={{ 
        minHeight: '100vh', 
        background: `linear-gradient(135deg, ${BRAND.colors.background.secondary} 0%, ${BRAND.colors.background.tertiary} 100%)`,
        padding: '2rem 0'
      }}>
        <Container size="lg">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '1rem',
              color: BRAND.colors.primary 
            }}>
              💳
            </div>
            <Title order={1} style={{ color: BRAND.colors.secondary, marginBottom: '1rem' }}>
              Subscription Tiers
            </Title>
            <Text size="lg" c="dimmed">
              Choose the plan that fits your business needs
            </Text>
          </div>

          {/* Test Mode Toggle */}
          <Card withBorder p="md" mb="xl" style={{ backgroundColor: '#fff3cd', borderColor: '#ffeaa7' }}>
            <Group justify="space-between" align="center">
              <div>
                <Text fw={500} c="orange">
                  <IconShield size={16} style={{ marginRight: '8px' }} />
                  Test Mode Active
                </Text>
                <Text size="sm" c="dimmed">
                  Payments are simulated. No real charges will be made.
                </Text>
              </div>
              <Button 
                variant="light" 
                color="orange"
                onClick={() => setTestMode(!testMode)}
              >
                {testMode ? 'Enable Live Mode' : 'Enable Test Mode'}
              </Button>
            </Group>
          </Card>

          {/* Pricing Cards */}
          <Grid>
            {plans.map((plan) => (
              <Grid.Col key={plan.tier} span={{ base: 12, md: 6 }}>
                <Card 
                  withBorder 
                  p="xl" 
                  radius="lg" 
                  shadow="lg"
                  style={{ 
                    height: '100%',
                    position: 'relative',
                    border: plan.popular ? `2px solid ${BRAND.colors.primary}` : undefined
                  }}
                >
                  {plan.popular && (
                    <Badge 
                      size="lg" 
                      style={{ 
                        position: 'absolute', 
                        top: '-12px', 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        backgroundColor: BRAND.colors.primary
                      }}
                    >
                      <IconCrown size={14} style={{ marginRight: '4px' }} />
                      Most Popular
                    </Badge>
                  )}

                  <Stack gap="lg">
                    {/* Plan Header */}
                    <div style={{ textAlign: 'center' }}>
                      <Title order={2} style={{ color: BRAND.colors.secondary }}>
                        {plan.name}
                      </Title>
                      <Text c="dimmed" size="sm">{plan.subtitle}</Text>
                      <div style={{ marginTop: '1rem' }}>
                        <Text size="3rem" fw={900} style={{ color: BRAND.colors.primary, lineHeight: 1 }}>
                          {plan.price}
                        </Text>
                        {plan.price !== 'Free' && (
                          <Text c="dimmed" size="sm">/month</Text>
                        )}
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <Card withBorder p="md" style={{ backgroundColor: '#f8f9fa' }}>
                      <Group justify="space-between">
                        <div>
                          <Text size="sm" c="dimmed">Platform Fee</Text>
                          <Text fw={500}>{plan.platformFee}</Text>
                        </div>
                        <div>
                          <Text size="sm" c="dimmed">Payout Split</Text>
                          <Text fw={500} size="sm">{plan.payoutStructure}</Text>
                        </div>
                      </Group>
                    </Card>

                    {/* Features */}
                    <div>
                      <Text fw={500} mb="sm">Included Features:</Text>
                      <List
                        spacing="xs"
                        size="sm"
                        center
                        icon={
                          <ThemeIcon color="teal" size={20} radius="xl">
                            <IconCheck size={12} />
                          </ThemeIcon>
                        }
                      >
                        {plan.features.map((feature, index) => (
                          <List.Item key={index}>{feature}</List.Item>
                        ))}
                      </List>
                    </div>

                    {/* Limitations (if any) */}
                    {plan.limitations && (
                      <div>
                        <Text fw={500} mb="sm" c="orange">Limitations:</Text>
                        <List
                          spacing="xs"
                          size="sm"
                          center
                          icon={
                            <ThemeIcon color="orange" size={20} radius="xl">
                              <IconX size={12} />
                            </ThemeIcon>
                          }
                        >
                          {plan.limitations.map((limitation, index) => (
                            <List.Item key={index}>{limitation}</List.Item>
                          ))}
                        </List>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      size="lg"
                      fullWidth
                      variant={plan.variant as 'filled' | 'outline'}
                      disabled={plan.disabled}
                      loading={loading && !plan.disabled}
                      onClick={() => handleTestUpgrade(plan.tier)}
                      leftSection={plan.tier === 'scale' ? <IconCreditCard size={20} /> : undefined}
                      style={{ 
                        backgroundColor: plan.variant === 'filled' ? BRAND.colors.primary : undefined,
                        marginTop: 'auto'
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>

          {/* Additional Information */}
          <Card withBorder p="xl" mt="xl">
            <Stack gap="md">
              <Title order={3} style={{ color: BRAND.colors.secondary }}>
                How It Works
              </Title>
              <Grid>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <div style={{ textAlign: 'center' }}>
                    <Text fw={500} mb="xs">1. Choose Your Plan</Text>
                    <Text size="sm" c="dimmed">
                      Start with Growth tier or upgrade to Scale for advanced features
                    </Text>
                  </div>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <div style={{ textAlign: 'center' }}>
                    <Text fw={500} mb="xs">2. Start Bidding</Text>
                    <Text size="sm" c="dimmed">
                      Use AI agents to find leads and create competitive bids
                    </Text>
                  </div>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <div style={{ textAlign: 'center' }}>
                    <Text fw={500} mb="xs">3. Get Paid</Text>
                    <Text size="sm" c="dimmed">
                      Receive payments according to your tier&apos;s payout structure
                    </Text>
                  </div>
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Text size="sm" c="dimmed">
              All plans include secure payment processing and 24/7 support
            </Text>
            <Group justify="center" mt="md" gap="md">
              <Button variant="subtle" component="a" href="/contractor/dashboard">
                ← Back to Dashboard
              </Button>
              <Button variant="subtle" component="a" href="/contractor/settings">
                Account Settings
              </Button>
            </Group>
          </div>
        </Container>
      </div>
    </MantineProvider>
  );
}
