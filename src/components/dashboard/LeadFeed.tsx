'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Text, Badge, Group, Stack, Button, ActionIcon, Loader, Center } from '@mantine/core';
import { IconMapPin, IconClock, IconCurrencyDollar, IconRefresh } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase';

interface Lead {
  id: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  location: string;
  posted_at: string;
  urgency: 'low' | 'medium' | 'high';
  felix_category: string;
  source: 'felix_referral' | 'rex_discovery' | 'direct_inquiry';
  quality_score: number;
  homeowner_id?: string; // Only for Felix referrals
  external_url?: string; // Only for Rex discoveries
}

interface LeadFeedProps {
  contractorId: string;
}

export default function LeadFeed({ contractorId }: LeadFeedProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const supabase = createClient();  const fetchLeads = useCallback(async () => {
    try {
      // Fetch both Felix referrals and Rex discoveries
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('contractor_id', contractorId)
        .in('source', ['felix_referral', 'rex_discovery'])
        .order('posted_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [contractorId, supabase]);
  useEffect(() => {
    fetchLeads();
  }, [contractorId, fetchLeads]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeads();
  };  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'felix_referral': return 'blue';
      case 'rex_discovery': return 'green';
      case 'direct_inquiry': return 'purple';
      default: return 'gray';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'felix_referral': return 'Felix Referral';
      case 'rex_discovery': return 'Rex Discovery';
      case 'direct_inquiry': return 'Direct Inquiry';
      default: return source;
    }
  };

  const formatBudget = (min: number, max: number) => {
    if (min === max) return `$${min.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just posted';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Center h={200}>
        <Loader size="md" />
      </Center>
    );
  }

  return (    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text size="lg" fw={600}>Recent Leads</Text>
        <ActionIcon 
          variant="outline" 
          onClick={handleRefresh}
          loading={refreshing}
        >
          <IconRefresh size={16} />
        </ActionIcon>
      </Group>

      {leads.length === 0 ? (
        <Card withBorder>
          <Center py="xl">
            <Stack align="center" gap="sm">
              <Text c="dimmed">No leads available</Text>
              <Text size="sm" c="dimmed">
                Rex is working to find opportunities for you
              </Text>
            </Stack>
          </Center>
        </Card>
      ) : (
        <Stack gap="sm">
          {leads.map((lead) => (
            <Card key={lead.id} withBorder p="md" radius="sm">
              <Stack gap="xs">
                <Group justify="space-between" align="start">
                  <div style={{ flex: 1 }}>
                    <Text fw={500} size="sm" lineClamp={2}>
                      {lead.title}
                    </Text>
                    <Text size="xs" c="dimmed" mt={2}>
                      {lead.description}
                    </Text>
                  </div>
                  <Badge 
                    size="xs" 
                    color={getUrgencyColor(lead.urgency)}
                    variant="light"
                  >
                    {lead.urgency}
                  </Badge>
                </Group>

                <Group gap="xs" align="center">
                  <Group gap={4} align="center">
                    <IconCurrencyDollar size={12} color="#666" />
                    <Text size="xs" c="dimmed">
                      {formatBudget(lead.budget_min, lead.budget_max)}
                    </Text>
                  </Group>
                  
                  <Group gap={4} align="center">
                    <IconMapPin size={12} color="#666" />
                    <Text size="xs" c="dimmed">
                      {lead.location}
                    </Text>
                  </Group>
                  
                  <Group gap={4} align="center">
                    <IconClock size={12} color="#666" />
                    <Text size="xs" c="dimmed">
                      {getRelativeTime(lead.posted_at)}
                    </Text>
                  </Group>
                </Group>                <Group justify="space-between" align="center" mt="xs">
                  <Group gap="xs">
                    <Badge size="xs" variant="outline">
                      {lead.felix_category}
                    </Badge>
                    <Badge 
                      size="xs" 
                      variant="outline" 
                      color={getSourceColor(lead.source)}
                    >
                      {getSourceLabel(lead.source)}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      Score: {lead.quality_score}/100
                    </Text>
                  </Group>
                  
                  <Button size="xs" variant="outline">
                    {lead.source === 'felix_referral' ? 'View Referral' : 'View Details'}
                  </Button>
                </Group>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
