'use client';

import { useState, useEffect } from 'react';
import { Container, Grid, Title, Text, Loader, Paper, ScrollArea, Group, Badge, Stack, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBuilding, IconClock, IconCurrencyDollar, IconMapPin, IconStar } from '@tabler/icons-react';
import { EnhancedChatManager } from '@/components/EnhancedChatManager';
import { useUser } from '@/providers/UserProvider';
import { BRAND } from '@/lib/brand';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';

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
  <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
    <Paper withBorder p="md" radius="lg" shadow="sm">
        <Stack>
            <Group justify="space-between">
                <Title order={4} style={{ color: BRAND.colors.text.primary, maxWidth: '80%' }}>{lead.title}</Title>
                <Badge color={lead.quality_score > 80 ? 'green' : 'orange'} variant="light">
                    <Group gap="xs">
                        <IconStar size={14} />
                        {lead.quality_score}
                    </Group>
                </Badge>
            </Group>
            <Text c="dimmed" size="sm" lineClamp={2}>{lead.description}</Text>
            <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Group gap="xs">
                        <IconCurrencyDollar size={16} color={BRAND.colors.text.secondary} />
                        <Text>Est. Value: ${lead.estimated_value.toLocaleString()}</Text>
                    </Group>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Group gap="xs">
                        <IconMapPin size={16} color={BRAND.colors.text.secondary} />
                        <Text>{lead.location_city}, {lead.location_state}</Text>
                    </Group>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Group gap="xs">
                        <IconClock size={16} color={BRAND.colors.text.secondary} />
                        <Text>{new Date(lead.posted_at).toLocaleDateString()}</Text>
                    </Group>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Group gap="xs">
                        <IconBuilding size={16} color={BRAND.colors.text.secondary} />
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
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                fullWidth
                color="brand-primary"
              >
                  View & Bid
              </Button>
            </motion.div>
        </Stack>
    </Paper>
  </motion.div>
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ display: 'flex', height: 'calc(100vh - var(--app-shell-header-height, 0px) - 2px)' }}
    >
        {/* Main Chat Interface */}
        <motion.div variants={itemVariants} style={{ flex: '1 1 70%', height: '100%', borderRight: `1px solid ${BRAND.colors.background.tertiary}` }}>
            <EnhancedChatManager />
        </motion.div>

        {/* Lead Feed Sidebar */}
        <motion.div variants={itemVariants} style={{ flex: '1 1 30%', height: '100%', backgroundColor: BRAND.colors.background.secondary }}>
            <ScrollArea h="100%">
                <Container fluid p="lg">
                    <motion.div variants={itemVariants}>
                      <Title order={3} mb="lg" style={{ color: BRAND.colors.text.primary }}>Your Lead Feed</Title>
                    </motion.div>
                    {loading && <Loader />}
                    {!loading && leads.length === 0 && (
                        <motion.div variants={itemVariants}>
                          <Paper p="lg" withBorder style={{ textAlign: 'center' }}>
                              <Text>No new leads matching your profile right now. Check back later!</Text>
                          </Paper>
                        </motion.div>
                    )}
                    <Stack>
                        {leads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
                    </Stack>
                </Container>
            </ScrollArea>
        </motion.div>
    </motion.div>
  );
}
