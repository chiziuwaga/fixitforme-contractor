'use client';

import { useEffect, useState } from 'react';
import { Container, Paper, Title, Text, Button, Stack, Group } from '@mantine/core';
import { IconDeviceMobile, IconDeviceDesktop, IconDeviceTablet } from '@tabler/icons-react';

export function MobileRedirect() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <Container size="sm" py="xl">
      <Paper withBorder p="xl" radius="md" shadow="md">
        <Stack align="center" gap="lg">
          <div style={{ fontSize: '48px' }}>📱</div>
          
          <Title order={2} ta="center" c="var(--mantine-color-gray-8)">
            Mobile Experience Coming Soon
          </Title>
          
          <Text ta="center" c="dimmed" size="lg">
            FixItForMe is optimized for desktop and tablet use. Please access from a larger device for the full contractor experience.
          </Text>
          
          <Stack gap="sm" w="100%">
            <Group justify="center" gap="xl">
              <div style={{ textAlign: 'center' }}>
                <IconDeviceDesktop size={32} color="var(--mantine-color-blue-6)" />
                <Text size="sm" mt="xs">Desktop</Text>
                <Text size="xs" c="dimmed">Recommended</Text>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <IconDeviceTablet size={32} color="var(--mantine-color-green-6)" />
                <Text size="sm" mt="xs">Tablet</Text>
                <Text size="xs" c="dimmed">Supported</Text>
              </div>
              
              <div style={{ textAlign: 'center', opacity: 0.5 }}>
                <IconDeviceMobile size={32} color="var(--mantine-color-gray-6)" />
                <Text size="sm" mt="xs">Mobile</Text>
                <Text size="xs" c="dimmed">Coming Soon</Text>
              </div>
            </Group>
          </Stack>
          
          <Button 
            variant="light" 
            size="lg"
            onClick={() => window.location.reload()}
          >
            Continue Anyway
          </Button>
          
          <Text size="xs" c="dimmed" ta="center">
            For the best experience, please use a desktop computer or tablet.<br />
            Screen resolution: {isMounted ? `${window.innerWidth}x${window.innerHeight}` : 'Loading...'}
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
}
