'use client';

import { useState, useEffect } from 'react';
import { Container, Grid, Title, Text, Loader, Paper, ScrollArea, Group, Badge, Stack, Box, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBuilding, IconClock, IconCurrencyDollar, IconMapPin, IconStar } from '@tabler/icons-react';
import { EnhancedChatManager } from '@/components/EnhancedChatManager';
import { useUser } from '@/providers/UserProvider';
import { BRAND } from '@/lib/brand';

interface Lead {
  id: string;
  title: string;
  description: string;
  estimated_value: number;
  location_city: string;
  location_state: string;
  quality_score: number;
  recency_score: number;
  source: string;
  posted_at: string;
  urgency_indicators: string[];
  contact_info: { phone?: string; email?: string };
}

const LeadCard = ({ lead }: { lead: Lead }) => (
    <Paper withBorder p="md" radius="md" shadow="sm">
        <Stack>
            <Group justify="space-between">
                <Title order={4} style={{ maxWidth: '80%' }}>{lead.title}</Title>
                <Badge color={lead.quality_score > 80 ? 'teal' : 'orange'} variant="light">
                    <Group gap="xs">
                        <IconStar size={14} />
                        {lead.quality_score}
                    </Group>
                </Badge>
            </Group>
            <Text c="dimmed" size="sm">{lead.description}</Text>
            <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Group gap="xs">
                        <IconCurrencyDollar size={16} color={BRAND.colors.gray[600]} />
                        <Text>Est. Value: ${lead.estimated_value.toLocaleString()}</Text>
                    </Group>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Group gap="xs">
                        <IconMapPin size={16} color={BRAND.colors.gray[600]} />
                        <Text>{lead.location_city}, {lead.location_state}</Text>
                    </Group>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Group gap="xs">
                        <IconClock size={16} color={BRAND.colors.gray[600]} />
                        <Text>{new Date(lead.posted_at).toLocaleDateString()}</Text>
                    </Group>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Group gap="xs">
                        <IconBuilding size={16} color={BRAND.colors.gray[600]} />
                        <Text>Source: {lead.source}</Text>
                    </Group>
                </Grid.Col>
            </Grid>
            {lead.urgency_indicators && lead.urgency_indicators.length > 0 && (
                <Group gap="xs">
                    {lead.urgency_indicators.map(indicator => (
                        <Badge key={indicator} color="red" variant="filled">{indicator.toUpperCase()}</Badge>
                    ))}
                </Group>
            )}
            <Button variant="gradient" gradient={{ from: BRAND.colors.primary, to: BRAND.colors.accent }}>
                View & Bid
            </Button>
        </Stack>
    </Paper>
);

export default function ContractorDashboard() {
  const { user, loading: userLoading } = useUser();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data only when the user context is available
    if (user && !userLoading) {
        loadDashboardData();
    }
    // If the user is not logged in and loading is finished, stop loading.
    if (!user && !userLoading) {
        setLoading(false);
    }
  }, [user, userLoading]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/leads');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch leads');
      }
      const data = await response.json();
      setLeads(data.leads);    } catch (error: unknown) {
      console.error('Failed to load dashboard data:', error);
      notifications.show({
        title: 'Error Loading Leads',
        message: error instanceof Error ? error.message : 'Could not retrieve the lead feed. Please try again later.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return <Container p="xl" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Loader /></Container>;
  }

  if (!user) {
    return (
        <Container>
            <Paper p="xl" withBorder mt="xl">
                <Title order={2}>Access Denied</Title>
                <Text mt="md">Please log in to view your dashboard.</Text>
            </Paper>
        </Container>
    );
  }

  return (
    <Box style={{ display: 'flex', height: 'calc(100vh - var(--app-shell-header-height, 0px) - 2px)' /* Adjust for layout borders */ }}>
        {/* Main Chat Interface */}
        <Box style={{ flex: '1 1 70%', height: '100%', borderRight: '1px solid var(--mantine-color-gray-3)' }}>
            <EnhancedChatManager />
        </Box>

        {/* Lead Feed Sidebar */}
        <Box style={{ flex: '1 1 30%', height: '100%' }}>
            <ScrollArea h="100%">
                <Container fluid p="lg">
                    <Title order={3} mb="lg">Your Lead Feed</Title>
                    {loading && <Loader />}
                    {!loading && leads.length === 0 && (
                        <Paper p="lg" withBorder style={{ textAlign: 'center' }}>
                            <Text>No new leads matching your profile right now. Check back later!</Text>
                        </Paper>
                    )}
                    <Stack>
                        {leads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
                    </Stack>
                </Container>
            </ScrollArea>
        </Box>
    </Box>
  );
}
