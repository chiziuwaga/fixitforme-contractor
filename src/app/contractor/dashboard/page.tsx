'use client';

import { useState, useEffect } from 'react';
import { MantineProvider, Container, Grid, Card, Title, Text, Badge, Button, Stack, Group, Loader, Paper, Affix } from '@mantine/core';
import { Notifications, notifications } from '@mantine/notifications';
import { IconBuilding, IconClock, IconCurrencyDollar, IconMapPin, IconStar, IconSearch, IconRobot } from '@tabler/icons-react';
import { ChatManager } from '@/components/ChatManager';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

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

interface DashboardStats {
  totalLeads: number;
  qualifiedLeads: number;
  avgValue: number;
  conversionRate: number;
}

export default function ContractorDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    qualifiedLeads: 0,
    avgValue: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data for demonstration - replace with actual API calls
      const mockLeads: Lead[] = [
        {
          id: '1',
          title: 'Urgent: Kitchen faucet repair needed ASAP',
          description: 'Need licensed plumber to fix leaky kitchen faucet. Water damage starting.',
          estimated_value: 350,
          location_city: 'Oakland',
          location_state: 'CA',
          quality_score: 85,
          recency_score: 95,
          source: 'craigslist',
          posted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          urgency_indicators: ['urgent', 'ASAP'],
          contact_info: { phone: '510-555-0123' }
        },
        {
          id: '2',
          title: 'City Hall HVAC Maintenance Contract',
          description: 'Annual HVAC maintenance for municipal building. Certified contractors only.',
          estimated_value: 15000,
          location_city: 'Berkeley',
          location_state: 'CA',
          quality_score: 92,
          recency_score: 70,
          source: 'sams_gov',
          posted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          urgency_indicators: [],
          contact_info: { email: 'procurement@berkeley.gov' }
        },
        {
          id: '3',
          title: 'Roof leak - emergency repair needed',
          description: 'Roof started leaking during storm. Need immediate repair. Insurance claim.',
          estimated_value: 2500,
          location_city: 'Oakland',
          location_state: 'CA',
          quality_score: 78,
          recency_score: 85,
          source: 'craigslist',
          posted_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          urgency_indicators: ['emergency'],
          contact_info: { phone: '510-555-0124' }
        }
      ];

      setLeads(mockLeads);
      setStats({
        totalLeads: mockLeads.length,
        qualifiedLeads: mockLeads.filter(lead => lead.quality_score >= 70).length,
        avgValue: Math.round(mockLeads.reduce((sum, lead) => sum + lead.estimated_value, 0) / mockLeads.length),
        conversionRate: 0.68
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load dashboard data',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const runRexSearch = async () => {
    try {
      notifications.show({
        title: 'Rex Search Started',
        message: 'Running background lead generation...',
        color: 'blue'
      });

      // Call Rex background endpoint
      const response = await fetch('/api/agents/rex_run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'Oakland, CA',
          categories: ['plumbing', 'electrical', 'roofing']
        })
      });

      if (response.ok) {
        notifications.show({
          title: 'Search Complete',
          message: 'Rex found new leads! Refreshing dashboard...',
          color: 'green'
        });
        loadDashboardData();
      }
    } catch (error) {
      console.error('Rex search error:', error);
      notifications.show({
        title: 'Search Failed',
        message: 'Failed to run Rex search',
        color: 'red'
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getQualityColor = (score: number) => {
    if (score >= 85) return 'green';
    if (score >= 70) return 'yellow';
    return 'red';
  };

  if (loading) {
    return (
      <MantineProvider>
        <Container size="xl" py="xl">
          <Stack align="center" justify="center" h="50vh">
            <Loader size="lg" />
            <Text>Loading dashboard...</Text>
          </Stack>
        </Container>
      </MantineProvider>
    );
  }

  return (
    <MantineProvider>
      <Notifications />
      <Container size="xl" py="md">
        {/* Header */}
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={1}>Contractor Dashboard</Title>
            <Text c="dimmed">Manage your leads and projects with AI-powered insights</Text>
          </div>
          <Button 
            leftSection={<IconSearch />} 
            onClick={runRexSearch}
            loading={loading}
          >
            Run Rex Search
          </Button>
        </Group>

        {/* Stats Cards */}
        <Grid mb="xl">
          <Grid.Col span={3}>
            <Card withBorder>
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="sm">Total Leads</Text>
                  <Title order={2}>{stats.totalLeads}</Title>
                </div>
                <IconBuilding size={24} color="var(--mantine-color-blue-6)" />
              </Group>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={3}>
            <Card withBorder>
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="sm">Qualified</Text>
                  <Title order={2}>{stats.qualifiedLeads}</Title>
                </div>
                <IconStar size={24} color="var(--mantine-color-green-6)" />
              </Group>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={3}>
            <Card withBorder>
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="sm">Avg Value</Text>
                  <Title order={2}>${stats.avgValue.toLocaleString()}</Title>
                </div>
                <IconCurrencyDollar size={24} color="var(--mantine-color-yellow-6)" />
              </Group>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={3}>
            <Card withBorder>
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="sm">Win Rate</Text>
                  <Title order={2}>{Math.round(stats.conversionRate * 100)}%</Title>
                </div>
                <IconStar size={24} color="var(--mantine-color-purple-6)" />
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Lead Feed */}
        <Title order={2} mb="md">Active Leads</Title>
        <Grid>
          {leads.map((lead) => (
            <Grid.Col key={lead.id} span={4}>
              <Card withBorder h="100%">
                <Stack h="100%" justify="space-between">
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Badge 
                        color={getQualityColor(lead.quality_score)} 
                        variant="light"
                        size="sm"
                      >
                        {lead.quality_score}% Quality
                      </Badge>
                      <Badge variant="outline" size="sm">
                        {lead.source}
                      </Badge>
                    </Group>

                    <Title order={4} mb="xs" lineClamp={2}>
                      {lead.title}
                    </Title>
                    
                    <Text size="sm" c="dimmed" mb="md" lineClamp={3}>
                      {lead.description}
                    </Text>

                    <Stack gap="xs">
                      <Group gap="xs">
                        <IconCurrencyDollar size={16} color="var(--mantine-color-green-6)" />
                        <Text size="sm" fw={500}>${lead.estimated_value.toLocaleString()}</Text>
                      </Group>
                      
                      <Group gap="xs">
                        <IconMapPin size={16} color="var(--mantine-color-blue-6)" />
                        <Text size="sm">{lead.location_city}, {lead.location_state}</Text>
                      </Group>
                      
                      <Group gap="xs">
                        <IconClock size={16} color="var(--mantine-color-gray-6)" />
                        <Text size="sm" c="dimmed">{formatTimeAgo(lead.posted_at)}</Text>
                      </Group>
                    </Stack>

                    {lead.urgency_indicators.length > 0 && (
                      <Group gap="xs" mt="xs">
                        {lead.urgency_indicators.map((indicator, index) => (
                          <Badge key={index} size="xs" color="red" variant="light">
                            {indicator}
                          </Badge>
                        ))}
                      </Group>
                    )}
                  </div>

                  <Group justify="space-between" mt="md">
                    <Button variant="light" size="xs" fullWidth>
                      View Details
                    </Button>
                    <Button size="xs" fullWidth ml="xs">
                      Create Bid
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        {leads.length === 0 && (
          <Paper p="xl" withBorder>
            <Stack align="center">
              <IconBuilding size={48} color="var(--mantine-color-gray-4)" />
              <Title order={3} c="dimmed">No leads found</Title>
              <Text c="dimmed" ta="center">
                Run a Rex search to find new leads in your area, or check back later for updates.
              </Text>
              <Button onClick={runRexSearch}>Run Rex Search</Button>
            </Stack>
          </Paper>
        )}

        {/* Floating Chat Button */}
        <Affix position={{ bottom: 20, right: 20 }}>
          <Button
            onClick={() => setChatOpen(!chatOpen)}
            size="lg"
            radius="xl"
            variant="filled"
            leftSection={<IconRobot />}
          >
            AI Assistant
          </Button>
        </Affix>

        {/* Chat Interface */}
        {chatOpen && (
          <div style={{ position: 'fixed', bottom: 80, right: 20, zIndex: 1000 }}>
            <ChatManager />
          </div>
        )}
      </Container>
    </MantineProvider>
  );
}
