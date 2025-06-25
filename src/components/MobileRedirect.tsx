'use client';

import { useEffect, useState } from 'react';
import { Container, Paper, Title, Text, Button, Stack, Group } from '@mantine/core';
import { IconDeviceMobile, IconDeviceDesktop, IconDeviceTablet, IconExternalLink } from '@tabler/icons-react';
import { BRAND } from '@/lib/brand';

export function MobileRedirect() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Prevent hydration mismatch
  }

  const handleContinueAnyway = () => {
    localStorage.setItem('mobile-continue-acknowledged', 'true');
    window.location.reload();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${BRAND.colors.primary}20 0%, ${BRAND.colors.secondary}10 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <Container size="sm">
        <Paper withBorder p="xl" radius="lg" shadow="lg" style={{
          backgroundColor: BRAND.colors.background.primary,
          border: `2px solid ${BRAND.colors.background.tertiary}`
        }}>
          <Stack align="center" gap="lg">
            {/* Brand Header */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '64px',
                background: `linear-gradient(135deg, ${BRAND.colors.primary} 0%, ${BRAND.colors.agents.felix} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold'
              }}>
                🏗️
              </div>
              <Title order={1} style={{ 
                color: BRAND.colors.text.primary,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: '28px',
                marginBottom: '8px'
              }}>
                FixItForMe
              </Title>
              <Text style={{ 
                color: BRAND.colors.text.secondary,
                fontSize: '16px',
                fontWeight: 500
              }}>
                Professional Home Repairs
              </Text>
            </div>
            
            <Title order={2} ta="center" style={{ 
              color: BRAND.colors.text.primary,
              fontSize: '24px',
              fontWeight: 600
            }}>
              📱 Desktop Experience Recommended
            </Title>
            
            <Text ta="center" style={{ 
              color: BRAND.colors.text.secondary,
              fontSize: '16px',
              lineHeight: '1.6',
              maxWidth: '400px'
            }}>
              FixItForMe is optimized for professional desktop and tablet workflows. 
              Our AI agents work best with larger screens for detailed project analysis.
            </Text>
            
            {/* Device Support Grid */}
            <Stack gap="sm" w="100%" style={{ maxWidth: '350px' }}>
              <Group justify="space-between" style={{
                padding: '12px 16px',
                backgroundColor: BRAND.colors.state.success + '20',
                borderRadius: '8px',
                border: `1px solid ${BRAND.colors.state.success}40`
              }}>
                <Group gap="sm">
                  <IconDeviceDesktop size={24} color={BRAND.colors.state.success} />
                  <div>
                    <Text size="sm" fw={600} style={{ color: BRAND.colors.text.primary }}>Desktop</Text>
                    <Text size="xs" style={{ color: BRAND.colors.text.secondary }}>8 responsive breakpoints</Text>
                  </div>
                </Group>
                <Text size="xs" fw={600} style={{ color: BRAND.colors.state.success }}>✓ Optimal</Text>
              </Group>
              
              <Group justify="space-between" style={{
                padding: '12px 16px',
                backgroundColor: BRAND.colors.agents.alex + '20',
                borderRadius: '8px',
                border: `1px solid ${BRAND.colors.agents.alex}40`
              }}>
                <Group gap="sm">
                  <IconDeviceTablet size={24} color={BRAND.colors.agents.alex} />
                  <div>
                    <Text size="sm" fw={600} style={{ color: BRAND.colors.text.primary }}>Tablet</Text>
                    <Text size="xs" style={{ color: BRAND.colors.text.secondary }}>8 responsive breakpoints</Text>
                  </div>
                </Group>
                <Text size="xs" fw={600} style={{ color: BRAND.colors.agents.alex }}>✓ Supported</Text>
              </Group>
              
              <Group justify="space-between" style={{
                padding: '12px 16px',
                backgroundColor: BRAND.colors.warning + '20',
                borderRadius: '8px',
                border: `1px solid ${BRAND.colors.warning}40`,
                opacity: 0.7
              }}>
                <Group gap="sm">
                  <IconDeviceMobile size={24} color={BRAND.colors.warning} />
                  <div>
                    <Text size="sm" fw={600} style={{ color: BRAND.colors.text.primary }}>Mobile</Text>
                    <Text size="xs" style={{ color: BRAND.colors.text.secondary }}>Limited experience</Text>
                  </div>
                </Group>
                <Text size="xs" fw={600} style={{ color: BRAND.colors.warning }}>⚠️ Beta</Text>
              </Group>
            </Stack>

            {/* Action Buttons */}
            <Stack gap="sm" w="100%" style={{ maxWidth: '300px' }}>
              <Button
                size="lg"
                fullWidth
                onClick={handleContinueAnyway}
                style={{
                  backgroundColor: BRAND.colors.primary,
                  fontSize: '16px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  height: '48px'
                }}
              >
                Continue on Mobile (Beta)
              </Button>
              
              <Button
                variant="light"
                size="sm"
                fullWidth
                component="a"
                href="https://fixitforme.ai"
                target="_blank"
                leftSection={<IconExternalLink size={16} />}
                style={{
                  color: BRAND.colors.text.secondary,
                  fontSize: '14px',
                  borderRadius: '6px'
                }}
              >
                Visit Main Website
              </Button>
            </Stack>

            {/* Footer */}
            <Text ta="center" style={{ 
              color: BRAND.colors.text.secondary,
              fontSize: '12px',
              lineHeight: '1.4',
              marginTop: '16px'
            }}>
              💻 Magic MCP Integration • 🎯 Chat-Centric AI Workflow • 🔧 Professional Tools
            </Text>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}