'use client'

import { Card, Text, Group, Stack, Progress, Badge, Button, Table, Accordion } from '@mantine/core'
import { IconCalendar, IconCurrency, IconTools, IconAlertCircle } from '@tabler/icons-react'

interface Material {
  name: string
  qty: number
  unit: string
  cost: number
}

interface MaterialCategory {
  category: string
  items: Material[]
}

interface CostBreakdownData {
  project_title: string
  total_estimate: number
  confidence_level: 'high' | 'medium' | 'low'
  breakdown: {
    labor: { cost: number; hours: number; rate: number }
    materials: MaterialCategory[]
    permits: number
    overhead: number
    profit: number
  }
  timeline: {
    start: string
    end: string
    duration: string
  }
  risk_factors?: string[]
}

interface CostBreakdownCardProps {
  data: CostBreakdownData
  onCreateBid?: () => void
  onAdjustPricing?: () => void
  onScheduleVisit?: () => void
}

export function CostBreakdownCard({ 
  data, 
  onCreateBid, 
  onAdjustPricing, 
  onScheduleVisit 
}: CostBreakdownCardProps) {
  const { breakdown } = data
  const totalMaterialCost = breakdown.materials.reduce((total, category) => 
    total + category.items.reduce((catTotal, item) => catTotal + item.cost, 0), 0
  )

  const confidenceColors = {
    high: 'green',
    medium: 'yellow', 
    low: 'red'
  } as const

  const costItems = [
    { label: 'Labor', value: breakdown.labor.cost, color: 'blue' },
    { label: 'Materials', value: totalMaterialCost, color: 'green' },
    { label: 'Permits', value: breakdown.permits, color: 'orange' },
    { label: 'Overhead', value: breakdown.overhead, color: 'gray' },
    { label: 'Profit', value: breakdown.profit, color: 'indigo' }
  ]

  return (
    <Card shadow="md" padding="lg" radius="md" withBorder>
      {/* Header */}
      <Group justify="space-between" mb="md">
        <div>
          <Text size="lg" fw={700}>{data.project_title}</Text>
          <Group gap="xs" mt={4}>
            <Text size="xl" fw={900} c="blue">${data.total_estimate.toLocaleString()}</Text>
            <Badge color={confidenceColors[data.confidence_level]} variant="light">
              {data.confidence_level} confidence
            </Badge>
          </Group>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Group gap="xs">
            <IconCalendar size={16} />
            <Text size="sm" c="dimmed">{data.timeline.duration}</Text>
          </Group>
          <Text size="xs" c="dimmed">
            {new Date(data.timeline.start).toLocaleDateString()} - {new Date(data.timeline.end).toLocaleDateString()}
          </Text>
        </div>
      </Group>

      {/* Cost Breakdown Chart */}
      <Stack gap="xs" mb="lg">
        {costItems.map((item) => {
          const percentage = (item.value / data.total_estimate) * 100
          return (
            <div key={item.label}>
              <Group justify="space-between" mb={4}>
                <Text size="sm" fw={500}>{item.label}</Text>
                <Text size="sm">${item.value.toLocaleString()} ({percentage.toFixed(1)}%)</Text>
              </Group>
              <Progress value={percentage} color={item.color} size="sm" />
            </div>
          )
        })}
      </Stack>

      {/* Detailed Breakdown */}
      <Accordion variant="contained" mb="lg">
        <Accordion.Item value="labor">
          <Accordion.Control icon={<IconTools size={16} />}>
            Labor Details
          </Accordion.Control>
          <Accordion.Panel>
            <Group justify="space-between">
              <Text size="sm">Hours: {breakdown.labor.hours}</Text>
              <Text size="sm">Rate: ${breakdown.labor.rate}/hr</Text>
              <Text size="sm" fw={600}>Total: ${breakdown.labor.cost.toLocaleString()}</Text>
            </Group>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="materials">
          <Accordion.Control icon={<IconCurrency size={16} />}>
            Materials Breakdown
          </Accordion.Control>
          <Accordion.Panel>
            {breakdown.materials.map((category, idx) => (
              <div key={idx}>
                <Text size="sm" fw={600} mb="xs">{category.category}</Text>                <div style={{ marginBottom: '1rem' }}>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Item</Table.Th>
                        <Table.Th>Quantity</Table.Th>
                        <Table.Th>Cost</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {category.items.map((item, itemIdx) => (
                        <Table.Tr key={itemIdx}>
                          <Table.Td>{item.name}</Table.Td>
                          <Table.Td>{item.qty} {item.unit}</Table.Td>
                          <Table.Td>${item.cost.toLocaleString()}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </div>
              </div>
            ))}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      {/* Risk Factors */}
      {data.risk_factors && data.risk_factors.length > 0 && (
        <Card withBorder mb="lg" bg="yellow.0">
          <Group gap="xs" mb="xs">
            <IconAlertCircle size={16} color="orange" />
            <Text size="sm" fw={600}>Risk Factors</Text>
          </Group>
          {data.risk_factors.map((risk, idx) => (
            <Text key={idx} size="sm" c="dimmed">• {risk}</Text>
          ))}
        </Card>
      )}

      {/* Actions */}
      <Group gap="md">
        <Button 
          variant="filled" 
          size="sm" 
          style={{ flex: 1 }}
          onClick={onCreateBid}
        >
          Generate Formal Proposal
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onAdjustPricing}
        >
          Modify Pricing
        </Button>
        <Button 
          variant="light" 
          size="sm"
          onClick={onScheduleVisit}
        >
          Schedule Visit
        </Button>
      </Group>
    </Card>
  )
}
