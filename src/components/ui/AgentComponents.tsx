'use client'

import { useState } from 'react'
import { BaseCard, Metric, ProgressIndicator, DataTable } from './BaseComponents'
import { CostBreakdownCard, LeadDistributionCard } from './Charts'
import { Stack, Group, Text, Button, Tabs, Badge, Collapse, List, ThemeIcon, Paper, Box, rem } from '@mantine/core'
import { IconChevronDown, IconChevronUp, IconCalculator, IconFileText, IconClock, IconCheck } from '@tabler/icons-react'
import { loadStripe } from '@stripe/stripe-js'

// Alex's Enhanced Cost Breakdown Component
interface AlexCostBreakdownProps {
  data: {
    project_title: string
    total_estimate: number
    confidence_level: 'high' | 'medium' | 'low'
    breakdown: {
      labor: { cost: number; hours: number; rate: number }
      materials: Array<{
        category: string
        items: Array<{
          name: string
          qty: number
          unit: string
          cost: number
        }>
      }>
      permits: number
      overhead: number
      profit: number
    }
    timeline: {
      start: string
      end: string
      duration: string
    }
    risk_factors: string[]
  }
  actions: Array<{
    type: string
    label: string
    style: 'primary' | 'secondary' | 'outline'
  }>
}

export function AlexCostBreakdown({ data, actions }: AlexCostBreakdownProps) {
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [showRisks, setShowRisks] = useState(false)

  const chartData = {
    labor: data.breakdown.labor.cost,
    materials: data.breakdown.materials.reduce((sum, cat) => 
      sum + cat.items.reduce((catSum, item) => catSum + item.cost, 0), 0
    ),
    permits: data.breakdown.permits,
    overhead: data.breakdown.overhead,
    profit: data.breakdown.profit
  }

  return (
    <BaseCard 
      title={data.project_title} 
      agent="alex" 
      priority={data.confidence_level === 'high' ? 'high' : 'medium'}
      interactive
      actions={actions}
    >
      <Tabs value={activeTab} onChange={(value) => value && setActiveTab(value)}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconCalculator size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="materials" leftSection={<IconFileText size={16} />}>
            Materials
          </Tabs.Tab>
          <Tabs.Tab value="timeline" leftSection={<IconClock size={16} />}>
            Timeline
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <Group grow mb="md">
            <Metric 
              label="Total Estimate" 
              value={data.total_estimate} 
              format="currency"
            />
            <Metric 
              label="Labor Hours" 
              value={data.breakdown.labor.hours}
            />
            <Metric 
              label="Confidence" 
              value={data.confidence_level}
            />
          </Group>

          <CostBreakdownCard 
            data={chartData} 
            totalEstimate={data.total_estimate}
            title=""
          />

          {data.risk_factors.length > 0 && (
            <div className="mt-4">
              <Button
                variant="light"
                size="sm"
                onClick={() => setShowRisks(!showRisks)}
                rightSection={showRisks ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
              >
                Risk Factors ({data.risk_factors.length})
              </Button>
              
              <Collapse in={showRisks}>
                <Stack gap="xs" mt="sm">
                  {data.risk_factors.map((risk, index) => (
                    <Badge key={index} color="yellow" variant="light" size="lg">
                      {risk}
                    </Badge>
                  ))}
                </Stack>
              </Collapse>
            </div>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="materials" pt="md">
          {data.breakdown.materials.map((category, catIndex) => (
            <div key={catIndex} className="mb-6">
              <Text fw={500} size="lg" mb="sm">{category.category}</Text>
              <DataTable
                headers={['Item', 'Quantity', 'Unit Cost', 'Total']}
                rows={category.items.map(item => ({
                  item: item.name,
                  quantity: `${item.qty} ${item.unit}`,
                  unit_cost: `$${item.cost / item.qty}`,
                  total: `$${item.cost}`
                }))}
              />
            </div>
          ))}
        </Tabs.Panel>

        <Tabs.Panel value="timeline" pt="md">
          <Group grow mb="md">
            <Metric label="Start Date" value={new Date(data.timeline.start).toLocaleDateString()} />
            <Metric label="End Date" value={new Date(data.timeline.end).toLocaleDateString()} />
            <Metric label="Duration" value={data.timeline.duration} />
          </Group>
        </Tabs.Panel>
      </Tabs>
    </BaseCard>
  )
}

// Rex's Enhanced Lead Dashboard Component  
interface RexLeadDashboardProps {
  data: {
    summary: {
      total_leads: number
      qualified_leads: number
      conversion_rate: number
      avg_project_value: number
    }
    geographic_breakdown: Array<{
      area: string
      count: number
      avg_value: number
      competition: 'low' | 'medium' | 'high'
    }>
    trending_problems: Array<{
      problem: string
      felix_id: number
      demand: 'high' | 'medium' | 'low'
      leads: number
    }>
    monthly_sessions: {
      used: number
      remaining: number
      tier: 'growth' | 'scale'
    }
  }
  actions: Array<{
    type: string
    label: string
    style: 'primary' | 'secondary' | 'outline'
  }>
}

export function RexLeadDashboard({ data, actions }: RexLeadDashboardProps) {
  const [activeView, setActiveView] = useState<string>('summary')

  return (
    <BaseCard 
      title="Lead Generation Dashboard" 
      agent="rex" 
      priority="medium"
      interactive
      actions={actions}
    >
      <Tabs value={activeView} onChange={(value) => value && setActiveView(value)}>
        <Tabs.List>
          <Tabs.Tab value="summary">Summary</Tabs.Tab>
          <Tabs.Tab value="geographic">Geographic</Tabs.Tab>
          <Tabs.Tab value="trending">Trending</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="summary" pt="md">
          <Group grow mb="md">
            <Metric 
              label="Total Leads" 
              value={data.summary.total_leads}
              trend="up"
            />
            <Metric 
              label="Qualified" 
              value={data.summary.qualified_leads}
            />
            <Metric 
              label="Conversion Rate" 
              value={data.summary.conversion_rate}
              format="percentage"
              trend="up"
            />
            <Metric 
              label="Avg Project Value" 
              value={data.summary.avg_project_value}
              format="currency"
            />
          </Group>

          <Group justify="space-between" mt="lg">
            <Text size="sm" c="dimmed">
              Search Sessions ({data.monthly_sessions.tier} tier)
            </Text>
            <Badge color={data.monthly_sessions.remaining > 5 ? 'green' : 'orange'}>
              {data.monthly_sessions.remaining} remaining
            </Badge>
          </Group>
        </Tabs.Panel>

        <Tabs.Panel value="geographic" pt="md">          <LeadDistributionCard 
            data={data.geographic_breakdown.map(item => ({
              ...item,
              avgValue: item.avg_value
            }))}
            title=""
          />
        </Tabs.Panel>

        <Tabs.Panel value="trending" pt="md">
          <DataTable
            headers={['Problem', 'Felix ID', 'Demand', 'Lead Count']}
            rows={data.trending_problems.map(problem => ({
              problem: problem.problem,
              felix_id: problem.felix_id,
              demand: problem.demand,
              lead_count: problem.leads
            }))}            actionColumn={{
              header: 'Actions',
              render: () => (
                <Button size="xs" variant="light">
                  Focus Search
                </Button>
              )
            }}
          />
        </Tabs.Panel>
      </Tabs>
    </BaseCard>
  )
}

// Lexi's Enhanced Onboarding Component
interface LexiOnboardingProps {
  data: {
    overall_progress: number
    current_step: string
    steps: Array<{
      id: string
      title: string
      status: 'completed' | 'in_progress' | 'pending'
      score: number
    }>
    felix_services: {
      selected: string[]
      recommended: string[]
      categories: Array<{
        name: string
        selected: number
        total: number
      }>
    }
  }
  actions: Array<{
    type: string
    label: string
    style: 'primary' | 'secondary' | 'outline'
  }>
}

export function LexiOnboarding({ data, actions }: LexiOnboardingProps) {
  return (
    <BaseCard 
      title="Contractor Onboarding Progress" 
      agent="lexi" 
      priority="high"
      interactive
      actions={actions}
    >
      <ProgressIndicator 
        steps={data.steps}
        currentStep={data.current_step}
      />

      {data.current_step === 'service_selection' && (
        <div className="mt-6">
          <Text fw={500} mb="md">Service Selection Progress</Text>
          
          <Group grow mb="md">
            <Metric 
              label="Services Selected" 
              value={data.felix_services.selected.length}
            />
            <Metric 
              label="Recommended" 
              value={data.felix_services.recommended.length}
            />
          </Group>

          <Stack gap="xs">
            {data.felix_services.categories.map((category, index) => (
              <Group key={index} justify="space-between" className="p-2 bg-gray-50 rounded">
                <Text size="sm">{category.name}</Text>
                <Badge color={category.selected > 0 ? 'green' : 'gray'}>
                  {category.selected}/{category.total}
                </Badge>
              </Group>
            ))}
          </Stack>

          <div className="mt-4">
            <Text size="sm" fw={500} mb="xs">Recommended Next:</Text>
            <Group gap="xs">
              {data.felix_services.recommended.slice(0, 3).map((service, index) => (
                <Badge key={index} variant="light" color="blue">
                  {service}
                </Badge>
              ))}
            </Group>
          </div>
        </div>
      )}
    </BaseCard>
  )
}

// Component for Conversational Tier Upgrades
interface UpgradePromptProps {
  data: {
    title: string;
    description: string;
    features: string[];
    cta: string;
  };
}

export const UpgradePrompt = ({ data }: UpgradePromptProps) => {
  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
      });
      const session = await response.json();
      if (response.ok) {
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        if (stripe) {
          stripe.redirectToCheckout({ sessionId: session.sessionId });
        } else {
          console.error('Stripe.js has not loaded yet.');
        }
      } else {
        console.error(`Error creating checkout session: ${session.error}`);
      }
    } catch (error) {
      console.error('Error during upgrade process:', error);
    }
  };

  return (
    <BaseCard
      title={data.title}
      agent="lexi" // Lexi handles all user-facing account interactions
      priority="high"
      interactive={false}
    >
      <Stack gap="md">
        <Text>{data.description}</Text>
        <List
          spacing="xs"
          size="sm"
          center
          icon={
            <ThemeIcon color="teal" size={24} radius="xl">
              <IconCheck size={16} />
            </ThemeIcon>
          }
        >
          {data.features.map((feature, index) => (
            <List.Item key={index}>{feature}</List.Item>
          ))}
        </List>
        <Button 
          fullWidth 
          size="lg" 
          onClick={handleUpgrade}
          gradient={{ from: 'blue', to: 'cyan' }}
          variant="gradient"
        >
          {data.cta}
        </Button>
      </Stack>
    </BaseCard>
  );
}

/**
 * A component for displaying system-level messages in the chat interface.
 * Used for notifications like chat limits, errors, or other system feedback.
 * Renders with a distinct style to differentiate from user and agent messages.
 */
export const SystemMessage = ({ message, icon: Icon }: { message: string; icon?: React.ElementType }) => (
    <Paper p="md" withBorder radius="lg" style={{ background: 'var(--mantine-color-gray-0)' }}>
        <Group>
            {Icon && <ThemeIcon variant="light" size="lg"><Icon style={{ width: rem(24), height: rem(24) }} /></ThemeIcon>}
            <Box>
                <Text fw={500} size="sm">System Message</Text>
                <Text>{message}</Text>
            </Box>
        </Group>
    </Paper>
);
