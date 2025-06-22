'use client'

import { Card, Text, Group, Progress, Badge, Button, Checkbox, SimpleGrid } from '@mantine/core'
import { IconCheck, IconClock, IconArrowRight, IconStar } from '@tabler/icons-react'

interface OnboardingStep {
  id: string
  title: string
  status: 'completed' | 'in_progress' | 'pending'
  score: number
}

interface ServiceCategory {
  name: string
  selected: number
  total: number
}

interface OnboardingData {
  overall_progress: number
  current_step: string
  steps: OnboardingStep[]
  felix_services: {
    selected: string[]
    recommended: string[]
    categories: ServiceCategory[]
  }
}

interface OnboardingWizardProps {
  data: OnboardingData
  onServiceToggle?: (service: string, selected: boolean) => void
  onContinue?: () => void
}

export function OnboardingWizard({ 
  data, 
  onServiceToggle, 
  onContinue 
}: OnboardingWizardProps) {
  const currentStepIndex = data.steps.findIndex(step => step.id === data.current_step)
  const currentStep = data.steps[currentStepIndex]

  const getStepIcon = (status: OnboardingStep['status']) => {
    switch (status) {
      case 'completed': return <IconCheck size={16} color="green" />
      case 'in_progress': return <IconClock size={16} color="blue" />
      case 'pending': return <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #ccc' }} />
    }
  }

  const getStepColor = (status: OnboardingStep['status']) => {
    switch (status) {
      case 'completed': return 'green'
      case 'in_progress': return 'blue'
      case 'pending': return 'gray'
    }
  }

  // Sample services for the current step (service selection)
  const sampleServices = [
    { name: 'Kitchen remodel', category: 'Interior (33-40)', felix_id: 35, selected: true },
    { name: 'Bathroom renovation', category: 'Interior (33-40)', felix_id: 37, selected: true },
    { name: 'Electrical repair', category: 'Electrical (1-8)', felix_id: 3, selected: true },
    { name: 'Plumbing repair', category: 'Plumbing (9-16)', felix_id: 11, selected: false },
    { name: 'HVAC maintenance', category: 'HVAC (17-24)', felix_id: 20, selected: false },
    { name: 'Roof repair', category: 'Roofing & Exterior (25-32)', felix_id: 25, selected: false }
  ]

  return (
    <Card shadow="md" padding="xl" radius="md" withBorder>
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Text size="xl" fw={700}>Contractor Onboarding</Text>
          <Text size="sm" c="dimmed">Complete your profile to start receiving leads</Text>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Text size="lg" fw={600} c="blue">{data.overall_progress}% Complete</Text>
          <Progress value={data.overall_progress} color="blue" size="lg" mt="xs" style={{ width: 200 }} />
        </div>
      </Group>

      {/* Step Progress */}
      <Card withBorder mb="xl" bg="blue.0">
        <Text size="md" fw={600} mb="md">Your Progress</Text>
        <SimpleGrid cols={2} spacing="md">
          {data.steps.map((step) => (
            <Group key={step.id} gap="md">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: step.status === 'completed' ? '#51cf66' : 
                               step.status === 'in_progress' ? '#339af0' : '#f1f3f4'
              }}>
                {getStepIcon(step.status)}
              </div>
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={step.status === 'in_progress' ? 600 : 500}>
                  {step.title}
                </Text>
                <Group gap="xs">
                  <Progress 
                    value={step.score} 
                    color={getStepColor(step.status)} 
                    size="xs" 
                    style={{ flex: 1 }} 
                  />
                  <Text size="xs" c="dimmed">{step.score}%</Text>
                </Group>
              </div>
            </Group>
          ))}
        </SimpleGrid>
      </Card>

      {/* Current Step Content */}
      {currentStep && currentStep.id === 'service_selection' && (
        <div>
          <Group justify="space-between" mb="lg">
            <div>
              <Text size="lg" fw={600}>Select Your Services</Text>
              <Text size="sm" c="dimmed">Choose services based on Felix&apos;s 40-problem framework</Text>
            </div>
            <Badge variant="light" color="blue">Step {currentStepIndex + 1} of {data.steps.length}</Badge>
          </Group>

          {/* Service Categories Overview */}
          <SimpleGrid cols={2} spacing="md" mb="lg">
            {data.felix_services.categories.map((category, idx) => (
              <Card key={idx} withBorder padding="md">
                <Text size="sm" fw={500} mb="xs">{category.name}</Text>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">{category.selected} of {category.total} selected</Text>
                  <Progress 
                    value={(category.selected / category.total) * 100} 
                    color="blue" 
                    size="sm" 
                    style={{ width: 80 }} 
                  />
                </Group>
              </Card>
            ))}
          </SimpleGrid>

          {/* Service Selection */}
          <Text size="md" fw={600} mb="md">Available Services</Text>
          <SimpleGrid cols={2} spacing="md" mb="lg">
            {sampleServices.map((service, idx) => (
              <Card key={idx} withBorder padding="md" style={{ 
                backgroundColor: service.selected ? '#f0f9ff' : 'white',
                borderColor: service.selected ? '#3b82f6' : '#e5e7eb'
              }}>
                <Group justify="space-between" mb="xs">
                  <Checkbox
                    checked={service.selected}
                    onChange={(event) => onServiceToggle?.(service.name, event.currentTarget.checked)}
                    label={service.name}
                    size="sm"
                  />
                  {service.selected && <IconStar size={16} color="gold" />}
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">{service.category}</Text>
                  <Text size="xs" c="blue">Felix #{service.felix_id}</Text>
                </Group>
              </Card>
            ))}
          </SimpleGrid>

          {/* Recommended Services */}
          <Card withBorder bg="green.0" mb="lg">
            <Text size="sm" fw={600} mb="xs">💡 Recommended for Your Area</Text>
            <Text size="sm" c="dimmed" mb="md">
              Based on local demand and your profile, consider adding these services:
            </Text>
            <Group gap="xs">
              {data.felix_services.recommended.map((service, idx) => (
                <Badge key={idx} variant="light" color="green" size="sm">
                  {service}
                </Badge>
              ))}
            </Group>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <Group justify="space-between" mt="xl">
        <Text size="sm" c="dimmed">
          {currentStepIndex > 0 && `${currentStepIndex} of ${data.steps.length} steps completed`}
        </Text>
        <Group gap="md">
          {currentStepIndex > 0 && (
            <Button variant="outline" size="sm">
              Previous Step
            </Button>
          )}
          <Button 
            variant="filled" 
            size="sm"
            rightSection={<IconArrowRight size={16} />}
            onClick={onContinue}
            disabled={currentStep?.score < 60}
          >
            {currentStepIndex === data.steps.length - 1 ? 'Complete Onboarding' : 'Continue'}
          </Button>
        </Group>
      </Group>
    </Card>
  )
}
