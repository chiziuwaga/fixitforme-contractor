'use client'

import { useState } from 'react'
import { MantineProvider, Container, Title, Tabs, Stack, Button, Group } from '@mantine/core'
import { 
  CostBreakdownCard, 
  LeadDistributionCard, 
  TimelineCard,
  QuickMetricsChart
} from '@/components/ui/Charts'
import { 
  AlexCostBreakdown, 
  RexLeadDashboard, 
  LexiOnboarding 
} from '@/components/ui/AgentComponents'
import { BaseCard, Metric, ProgressIndicator, DataTable } from '@/components/ui/BaseComponents'
import '@mantine/core/styles.css'

// Sample data for demonstration
const sampleCostData = {
  labor: 6000,
  materials: 4500,
  permits: 350,
  overhead: 1500,
  profit: 2000
}

const sampleLeadData = [
  { area: "Oakland Hills", count: 12, avgValue: 12000, competition: "medium" as const },
  { area: "Berkeley", count: 8, avgValue: 7500, competition: "high" as const },
  { area: "San Leandro", count: 15, avgValue: 8500, competition: "low" as const },
  { area: "Alameda", count: 6, avgValue: 9200, competition: "medium" as const }
]

const sampleRexGeographicData = [
  { area: "Oakland Hills", count: 12, avg_value: 12000, competition: "medium" as const },
  { area: "Berkeley", count: 8, avg_value: 7500, competition: "high" as const },
  { area: "San Leandro", count: 15, avg_value: 8500, competition: "low" as const },
  { area: "Alameda", count: 6, avg_value: 9200, competition: "medium" as const }
]

const sampleTimelineData = [
  { 
    name: "Demo & Prep", 
    start: new Date("2025-07-15"), 
    end: new Date("2025-07-18"), 
    progress: 100 
  },
  { 
    name: "Installation", 
    start: new Date("2025-07-19"), 
    end: new Date("2025-07-25"), 
    progress: 60 
  },
  { 
    name: "Finishing", 
    start: new Date("2025-07-26"), 
    end: new Date("2025-07-29"), 
    progress: 0 
  }
]

const sampleAlexData = {
  project_title: "Kitchen Renovation - Oakland Hills",
  total_estimate: 15750,
  confidence_level: "high" as const,
  breakdown: {
    labor: { cost: 6000, hours: 80, rate: 75 },
    materials: [
      {
        category: "Cabinets",
        items: [
          { name: "Upper cabinets", qty: 8, unit: "linear ft", cost: 3200 },
          { name: "Lower cabinets", qty: 10, unit: "linear ft", cost: 4000 }
        ]
      },
      {
        category: "Countertops", 
        items: [
          { name: "Quartz countertop", qty: 45, unit: "sq ft", cost: 2700 }
        ]
      }
    ],
    permits: 350,
    overhead: 1500,
    profit: 2000
  },
  timeline: {
    start: "2025-07-15",
    end: "2025-07-29", 
    duration: "10 business days"
  },
  risk_factors: ["Electrical upgrade may be needed", "Plumbing relocation possible"]
}

const sampleRexData = {
  summary: {
    total_leads: 47,
    qualified_leads: 23,
    conversion_rate: 0.34,
    avg_project_value: 8500
  },
  geographic_breakdown: sampleRexGeographicData,
  trending_problems: [
    { problem: "Kitchen remodel", felix_id: 35, demand: "high" as const, leads: 8 },
    { problem: "Bathroom renovation", felix_id: 37, demand: "medium" as const, leads: 5 },
    { problem: "Electrical repair", felix_id: 12, demand: "high" as const, leads: 12 },
    { problem: "Plumbing repair", felix_id: 9, demand: "medium" as const, leads: 7 }
  ],
  monthly_sessions: { used: 8, remaining: 22, tier: "growth" as const }
}

const sampleLexiData = {
  overall_progress: 75,
  current_step: "service_selection",
  steps: [
    { id: "business_info", title: "Business Information", status: "completed" as const, score: 100 },
    { id: "service_selection", title: "Service Selection", status: "in_progress" as const, score: 60 },
    { id: "pricing_strategy", title: "Pricing Strategy", status: "pending" as const, score: 0 },
    { id: "profile_optimization", title: "Profile Optimization", status: "pending" as const, score: 0 }
  ],
  felix_services: {
    selected: ["Kitchen remodel", "Bathroom renovation", "Electrical repair"],
    recommended: ["Plumbing repair", "HVAC maintenance"],
    categories: [
      { name: "Electrical (1-8)", selected: 2, total: 8 },
      { name: "Plumbing (9-16)", selected: 1, total: 8 },
      { name: "HVAC (17-24)", selected: 0, total: 8 },
      { name: "Interior (33-40)", selected: 2, total: 8 }
    ]
  }
}

const sampleActions = [
  { type: "create_formal_bid", label: "Generate Formal Proposal", style: "primary" as const },
  { type: "adjust_pricing", label: "Modify Pricing Strategy", style: "secondary" as const },
  { type: "schedule_site_visit", label: "Schedule Site Assessment", style: "outline" as const }
]

export default function ComponentShowcasePage() {
  const [activeTab, setActiveTab] = useState<string>('charts')

  return (
    <MantineProvider>
      <Container size="xl" py="xl">
        <Title order={1} mb="xl">FixItForMe Design System Showcase</Title>
        
        <Tabs value={activeTab} onChange={(value) => value && setActiveTab(value)}>
          <Tabs.List>
            <Tabs.Tab value="charts">D3.js Charts</Tabs.Tab>
            <Tabs.Tab value="alex">Alex Components</Tabs.Tab>
            <Tabs.Tab value="rex">Rex Components</Tabs.Tab>
            <Tabs.Tab value="lexi">Lexi Components</Tabs.Tab>
            <Tabs.Tab value="base">Base Components</Tabs.Tab>
          </Tabs.List>

        <Tabs.Panel value="charts" pt="md">
          <Stack gap="xl">
            <Title order={2}>Interactive D3.js Charts</Title>
            
            <Group align="flex-start">
              <CostBreakdownCard
                data={sampleCostData}
                totalEstimate={15750}
                title="Interactive Cost Breakdown"
                animated={true}
                interactive={true}
              />
            </Group>

            <LeadDistributionCard
              data={sampleLeadData}
              title="Geographic Lead Distribution"
              animated={true}
              interactive={true}
            />

            <TimelineCard
              phases={sampleTimelineData}
              title="Project Timeline with Progress"
              animated={true}
              interactive={true}
            />

            <BaseCard title="Quick Metrics Dashboard" agent="rex" priority="medium">
              <QuickMetricsChart
                metrics={[
                  { label: "Total Revenue", value: 125000, format: "currency", trend: "up" },
                  { label: "Conversion Rate", value: 0.34, format: "percentage", trend: "up" },
                  { label: "Active Leads", value: 23, format: "number", trend: "neutral" },
                  { label: "Avg Project", value: 8500, format: "currency", trend: "down" }
                ]}
              />
            </BaseCard>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="alex" pt="md">
          <Stack gap="xl">
            <Title order={2}>Alex - The Assessor Components</Title>
            <AlexCostBreakdown
              data={sampleAlexData}
              actions={sampleActions}
            />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="rex" pt="md">
          <Stack gap="xl">
            <Title order={2}>Rex - The Retriever Components</Title>
            <RexLeadDashboard
              data={sampleRexData}
              actions={[
                { type: "generate_leads", label: "Run Lead Generation", style: "primary" },
                { type: "export_data", label: "Export Analytics", style: "secondary" }
              ]}
            />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="lexi" pt="md">
          <Stack gap="xl">
            <Title order={2}>Lexi - The Liaison Components</Title>
            <LexiOnboarding
              data={sampleLexiData}
              actions={[
                { type: "continue_onboarding", label: "Continue Setup", style: "primary" },
                { type: "save_progress", label: "Save Progress", style: "secondary" }
              ]}
            />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="base" pt="md">
          <Stack gap="xl">
            <Title order={2}>Base Design System Components</Title>
            
            <Group grow>
              <Metric label="Total Projects" value={47} trend="up" />
              <Metric label="Revenue" value={125000} format="currency" trend="up" />
              <Metric label="Success Rate" value={0.78} format="percentage" trend="neutral" />
              <Metric label="Avg Timeline" value={12} trend="down" />
            </Group>

            <ProgressIndicator
              steps={sampleLexiData.steps}
              currentStep="service_selection"
            />

            <BaseCard title="Sample Data Table" agent="alex" priority="medium">
              <DataTable
                headers={["Service", "Demand", "Avg Value", "Competition"]}
                rows={[
                  { service: "Kitchen Remodel", demand: "High", avg_value: "$12,000", competition: "Medium" },
                  { service: "Bathroom Renovation", demand: "Medium", avg_value: "$8,500", competition: "High" },
                  { service: "Electrical Repair", demand: "High", avg_value: "$3,200", competition: "Low" }
                ]}
                actionColumn={{
                  header: "Actions",
                  render: () => <Button size="xs" variant="light">View Details</Button>
                }}
              />
            </BaseCard>
          </Stack>        </Tabs.Panel>
      </Tabs>
    </Container>
    </MantineProvider>
  )
}
