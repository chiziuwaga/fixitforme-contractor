'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Text, Group, Stack, Grid, Badge, RingProgress, Loader, Center } from '@mantine/core';
import { IconTrendingUp, IconCurrencyDollar, IconClock, IconEye } from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';

interface ContractorStats {
  total_bids: number;
  won_bids: number;
  total_revenue: number;
  avg_bid_value: number;
  response_time_hours: number;
  leads_viewed_today: number;
  conversion_rate: number;
  active_projects: number;
}

interface QuickStatsProps {
  contractorId: string;
}

export default function QuickStats({ contractorId }: QuickStatsProps) {
  const [stats, setStats] = useState<ContractorStats | null>(null);
  const [loading, setLoading] = useState(true);
  // Remove this line - use the imported supabase directly

  const fetchStats = useCallback(async () => {
    try {
      // Fetch basic stats from bids table
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select('status, bid_amount, created_at')
        .eq('contractor_id', contractorId);

      if (bidsError) throw bidsError;

      // Fetch leads viewed today
      const today = new Date().toISOString().split('T')[0];
      const { data: leadsData, error: leadsError } = await supabase
        .from('lead_views')
        .select('id')
        .eq('contractor_id', contractorId)
        .gte('viewed_at', today);

      if (leadsError) throw leadsError;

      // Calculate stats
      const bids = bidsData || [];
      const totalBids = bids.length;
      const wonBids = bids.filter(bid => bid.status === 'won').length;
      const totalRevenue = bids
        .filter(bid => bid.status === 'won')
        .reduce((sum, bid) => sum + (bid.bid_amount || 0), 0);
      const avgBidValue = totalBids > 0 ? 
        bids.reduce((sum, bid) => sum + (bid.bid_amount || 0), 0) / totalBids : 0;
      const conversionRate = totalBids > 0 ? (wonBids / totalBids) * 100 : 0;
      const activeProjects = bids.filter(bid => bid.status === 'active').length;

      setStats({
        total_bids: totalBids,
        won_bids: wonBids,
        total_revenue: totalRevenue,
        avg_bid_value: avgBidValue,
        response_time_hours: 2.5, // Mock data - would be calculated from actual response times
        leads_viewed_today: leadsData?.length || 0,
        conversion_rate: conversionRate,
        active_projects: activeProjects
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, [contractorId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <Center h={200}>
        <Loader size="md" />
      </Center>
    );
  }

  if (!stats) {
    return (
      <Card withBorder>
        <Center py="xl">
          <Text c="dimmed">Unable to load stats</Text>
        </Center>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 30) return 'green';
    if (rate >= 15) return 'orange';
    return 'red';
  };

  return (
    <Stack gap="md">
      <Text size="lg" fw={600}>Performance Overview</Text>
      
      <Grid>
        <Grid.Col span={6}>
          <Card withBorder p="md" radius="sm">
            <Group justify="space-between" align="center">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                  Total Revenue
                </Text>
                <Text size="xl" fw={700} c="green">
                  {formatCurrency(stats.total_revenue)}
                </Text>
                <Text size="xs" c="dimmed">
                  {stats.won_bids} projects won
                </Text>
              </div>
              <IconCurrencyDollar size={32} color="#51cf66" />
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={6}>
          <Card withBorder p="md" radius="sm">
            <Group justify="space-between" align="center">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                  Win Rate
                </Text>
                <Group align="center" gap="sm">
                  <RingProgress
                    size={60}
                    thickness={6}
                    sections={[
                      { value: stats.conversion_rate, color: getPerformanceColor(stats.conversion_rate) }
                    ]}
                    label={
                      <Text ta="center" size="sm" fw={600}>
                        {stats.conversion_rate.toFixed(0)}%
                      </Text>
                    }
                  />
                  <div>
                    <Text size="sm" fw={500}>
                      {stats.won_bids}/{stats.total_bids}
                    </Text>
                    <Text size="xs" c="dimmed">
                      bids won
                    </Text>
                  </div>
                </Group>
              </div>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={6}>
          <Card withBorder p="md" radius="sm">
            <Group justify="space-between" align="center">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                  Avg Bid Value
                </Text>
                <Text size="lg" fw={600}>
                  {formatCurrency(stats.avg_bid_value)}
                </Text>
                <Text size="xs" c="dimmed">
                  across {stats.total_bids} bids
                </Text>
              </div>
              <IconTrendingUp size={32} color="#339af0" />
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={6}>
          <Card withBorder p="md" radius="sm">
            <Group justify="space-between" align="center">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                  Response Time
                </Text>
                <Text size="lg" fw={600}>
                  {stats.response_time_hours}h
                </Text>
                <Badge 
                  size="xs" 
                  color={stats.response_time_hours <= 4 ? 'green' : 'orange'}
                  variant="light"
                >
                  {stats.response_time_hours <= 4 ? 'Fast' : 'Average'}
                </Badge>
              </div>
              <IconClock size={32} color="#f59f00" />
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={12}>
          <Card withBorder p="md" radius="sm">
            <Group justify="space-between" align="center">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                  Today&apos;s Activity
                </Text>
                <Group gap="xl" mt="sm">
                  <div>
                    <Text size="lg" fw={600}>
                      {stats.leads_viewed_today}
                    </Text>
                    <Text size="xs" c="dimmed">
                      leads viewed
                    </Text>
                  </div>
                  <div>
                    <Text size="lg" fw={600}>
                      {stats.active_projects}
                    </Text>
                    <Text size="xs" c="dimmed">
                      active projects
                    </Text>
                  </div>
                </Group>
              </div>
              <IconEye size={32} color="#868e96" />
            </Group>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
