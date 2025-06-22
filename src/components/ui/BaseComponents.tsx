// Design System - Base Components for FixItForMe Contractor Module
// Following v0.dev patterns for consistency and reusability

import { ReactNode } from 'react'
import { Card, Badge, Button, Progress, Group, Text, Stack, ActionIcon } from '@mantine/core'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'

// Base Card Component for all agent outputs
interface BaseCardProps {
  title: string
  agent: 'lexi' | 'alex' | 'rex'
  priority?: 'high' | 'medium' | 'low'
  interactive?: boolean
  children: ReactNode
  actions?: Array<{
    type: string
    label: string
    style?: 'primary' | 'secondary' | 'outline'
    onClick?: () => void
  }>
}

export function BaseCard({ title, agent, priority = 'medium', interactive = false, children, actions }: BaseCardProps) {
  const agentColors = {
    lexi: '#D4A574', // Warm gold
    alex: '#1A2E1A', // Professional green  
    rex: '#6B7280'   // Neutral gray
  }

  const priorityColors = {
    high: 'red',
    medium: 'blue', 
    low: 'gray'
  }

  return (
    <Card 
      shadow="sm" 
      padding="lg" 
      radius="md" 
      withBorder
      className={interactive ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''}
    >
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <Badge color={agentColors[agent]} variant="light">
            {agent.charAt(0).toUpperCase() + agent.slice(1)}
          </Badge>
          <Badge color={priorityColors[priority]} size="sm">
            {priority}
          </Badge>
        </Group>
        <Text fw={500} size="lg">{title}</Text>
      </Group>

      {children}

      {actions && actions.length > 0 && (
        <Group gap="sm" mt="md">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.style === 'primary' ? 'filled' : action.style === 'outline' ? 'outline' : 'light'}
              size="sm"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </Group>
      )}
    </Card>
  )
}

// Metric Display Component
interface MetricProps {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
  format?: 'currency' | 'percentage' | 'number'
}

export function Metric({ label, value, trend, format = 'number' }: MetricProps) {
  const formatValue = (val: string | number) => {
    const numVal = typeof val === 'string' ? parseFloat(val) : val
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numVal)
      case 'percentage':
        return `${(numVal * 100).toFixed(1)}%`
      default:
        return val.toString()
    }
  }

  const trendColors = {
    up: 'green',
    down: 'red', 
    neutral: 'gray'
  }

  return (
    <div className="text-center">
      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
        {label}
      </Text>
      <Group gap="xs" justify="center" mt={4}>
        <Text size="xl" fw={700}>
          {formatValue(value)}
        </Text>
        {trend && (
          <ActionIcon size="sm" color={trendColors[trend]} variant="subtle">
            {trend === 'up' ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </ActionIcon>
        )}
      </Group>
    </div>
  )
}

// Progress Indicator Component
interface ProgressIndicatorProps {
  steps: Array<{
    id: string
    title: string
    status: 'completed' | 'in_progress' | 'pending'
    score?: number
  }>
  currentStep?: string
}

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green'
      case 'in_progress': return 'blue'
      default: return 'gray'
    }
  }

  const overallProgress = Math.round(
    (steps.filter(s => s.status === 'completed').length / steps.length) * 100
  )

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={500}>Overall Progress</Text>
        <Text size="sm" c="dimmed">{overallProgress}%</Text>
      </Group>
      
      <Progress value={overallProgress} color="blue" size="lg" radius="md" />
      
      <Stack gap="xs">
        {steps.map((step) => (
          <Group key={step.id} justify="space-between" className={
            currentStep === step.id ? 'bg-blue-50 p-2 rounded' : 'p-2'
          }>
            <Group gap="sm">
              <Badge color={getStepColor(step.status)} size="sm">
                {step.status.replace('_', ' ')}
              </Badge>
              <Text size="sm">{step.title}</Text>
            </Group>
            {step.score !== undefined && (
              <Text size="xs" c="dimmed">{step.score}%</Text>
            )}
          </Group>
        ))}
      </Stack>
    </Stack>
  )
}

// Data Table Component for structured information
interface DataTableProps {
  headers: string[]
  rows: Array<Record<string, string | number | boolean>>
  actionColumn?: {
    header: string
    render: (row: Record<string, string | number | boolean>) => ReactNode
  }
}

export function DataTable({ headers, rows, actionColumn }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {headers.map((header) => (
              <th key={header} className="text-left p-2 font-medium text-gray-600">
                {header}
              </th>
            ))}
            {actionColumn && (
              <th className="text-left p-2 font-medium text-gray-600">
                {actionColumn.header}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
              {headers.map((header) => (
                <td key={header} className="p-2">
                  {row[header.toLowerCase().replace(/\s+/g, '_')]}
                </td>
              ))}
              {actionColumn && (
                <td className="p-2">
                  {actionColumn.render(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
