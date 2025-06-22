'use client'

import { Card, Text, Group, Stack, Progress, Badge, Button, Grid, SimpleGrid } from '@mantine/core'
import { IconMapPin, IconTrendingUp, IconSearch, IconUsers } from '@tabler/icons-react'

interface GeographicArea {
  area: string
  count: number
  avg_value: number
  competition: 'low' | 'medium' | 'high'
}

interface TrendingProblem {
  problem: string
  felix_id: number
  demand: 'low' | 'medium' | 'high'
  leads: number
}

interface LeadDashboardData {
  summary: {
    total_leads: number
    qualified_leads: number
    conversion_rate: number
    avg_project_value: number
  }
  geographic_breakdown: GeographicArea[]
  trending_problems: TrendingProblem[]
  monthly_sessions: {
    used: number
    remaining: number
    tier: 'growth' | 'scale'
  }
}

interface LeadDashboardProps {
  data: LeadDashboardData
  onGenerateLeads?: () => void
  onViewDetails?: (area: string) => void
  onUpgradeTier?: () => void
}

export function LeadDashboard({ 
  data, 
  onGenerateLeads, 
  onViewDetails, 
  onUpgradeTier 
}: LeadDashboardProps) {
  const { summary, geographic_breakdown, trending_problems, monthly_sessions } = data

  const competitionColors = {
    low: 'green',
    medium: 'yellow',
    high: 'red'
  } as const

  const demandColors = {
    low: 'gray',
    medium: 'blue',
    high: 'green'
  } as const

  const sessionProgress = (monthly_sessions.used / (monthly_sessions.used + monthly_sessions.remaining)) * 100

  return (
    <Stack gap="md">
      {/* Summary Cards */}
      <SimpleGrid cols={4} spacing="md">
        <Card withBorder padding="md">
          <Group gap="xs" mb="xs">
            <IconUsers size={20} color="blue" />
            <Text size="sm" c="dimmed">Total Leads</Text>
          </Group>
          <Text size="xl" fw={700}>{summary.total_leads}</Text>
          <Text size="xs" c="green">
            {summary.qualified_leads} qualified ({Math.round((summary.qualified_leads / summary.total_leads) * 100)}%)
          </Text>
        </Card>

        <Card withBorder padding="md">
          <Group gap="xs" mb="xs">
            <IconTrendingUp size={20} color="green" />
            <Text size="sm" c="dimmed">Conversion Rate</Text>
          </Group>
          <Text size="xl" fw={700}>{(summary.conversion_rate * 100).toFixed(1)}%</Text>
          <Progress value={summary.conversion_rate * 100} color="green" size="xs" mt="xs" />
        </Card>

        <Card withBorder padding="md">
          <Group gap="xs" mb="xs">
            <IconSearch size={20} color="orange" />
            <Text size="sm" c="dimmed">Avg Project Value</Text>
          </Group>
          <Text size="xl" fw={700}>${summary.avg_project_value.toLocaleString()}</Text>
          <Text size="xs" c="dimmed">Per qualified lead</Text>
        </Card>

        <Card withBorder padding="md">
          <Group gap="xs" mb="xs">
            <IconMapPin size={20} color="purple" />
            <Text size="sm" c="dimmed">Monthly Sessions</Text>
          </Group>
          <Text size="xl" fw={700}>{monthly_sessions.remaining}</Text>
          <Group gap={4} mt="xs">
            <Progress value={sessionProgress} color={sessionProgress > 80 ? 'red' : 'blue'} size="xs" style={{ flex: 1 }} />
            <Text size="xs" c="dimmed">{monthly_sessions.used} used</Text>
          </Group>
        </Card>
      </SimpleGrid>

      <Grid>
        {/* Geographic Breakdown */}
        <Grid.Col span={6}>
          <Card withBorder padding="lg">
            <Group justify="space-between" mb="md">
              <Text size="lg" fw={600}>Geographic Distribution</Text>
              <Badge variant="light">Live Data</Badge>
            </Group>
            <Stack gap="md">
              {geographic_breakdown.map((area, idx) => (
                <div key={idx}>
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <Text size="sm" fw={500}>{area.area}</Text>
                      <Badge 
                        size="xs" 
                        color={competitionColors[area.competition]} 
                        variant="light"
                      >
                        {area.competition} competition
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed">{area.count} leads</Text>
                  </Group>
                  <Group justify="space-between" mb="xs">
                    <Text size="xs" c="dimmed">Avg Value: ${area.avg_value.toLocaleString()}</Text>
                    <Button 
                      size="xs" 
                      variant="light" 
                      onClick={() => onViewDetails?.(area.area)}
                    >
                      View Details
                    </Button>
                  </Group>
                  <Progress 
                    value={(area.count / summary.total_leads) * 100} 
                    color="blue" 
                    size="sm" 
                  />
                </div>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Trending Problems */}
        <Grid.Col span={6}>
          <Card withBorder padding="lg">
            <Group justify="space-between" mb="md">
              <Text size="lg" fw={600}>Trending Service Requests</Text>
              <Badge variant="light">Felix Framework</Badge>
            </Group>
            <Stack gap="md">
              {trending_problems.map((problem, idx) => (
                <div key={idx}>
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <Text size="sm" fw={500}>{problem.problem}</Text>
                      <Badge size="xs" color={demandColors[problem.demand]} variant="light">
                        {problem.demand} demand
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed">{problem.leads} leads</Text>
                  </Group>
                  <Group justify="space-between" mb="xs">
                    <Text size="xs" c="dimmed">Felix Problem #{problem.felix_id}</Text>
                    <Text size="xs" c="blue">View similar projects</Text>
                  </Group>
                  <Progress 
                    value={(problem.leads / summary.total_leads) * 100} 
                    color={demandColors[problem.demand]} 
                    size="sm" 
                  />
                </div>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Action Panel */}
      <Card withBorder padding="lg" bg="blue.0">
        <Group justify="space-between">
          <div>
            <Text size="lg" fw={600} mb="xs">Lead Generation Actions</Text>
            <Text size="sm" c="dimmed">
              {monthly_sessions.tier === 'growth' 
                ? `Growth tier: ${monthly_sessions.remaining} sessions remaining this month`
                : `Scale tier: Unlimited sessions + premium features`
              }
            </Text>
          </div>
          <Group gap="md">
            {monthly_sessions.tier === 'growth' && monthly_sessions.remaining < 5 && (
              <Button variant="outline" color="orange" onClick={onUpgradeTier}>
                Upgrade to Scale
              </Button>
            )}
            <Button 
              variant="filled" 
              onClick={onGenerateLeads}
              disabled={monthly_sessions.remaining === 0}
            >
              Generate New Leads
            </Button>
          </Group>
        </Group>
      </Card>
    </Stack>
  )
}
