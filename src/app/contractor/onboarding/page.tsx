'use client';

import { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  Group,
  Select,
  MultiSelect,
  Textarea,
  Progress,
  Stepper,
  NumberInput,
  Alert,
  Card,
  Badge
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBuilding, IconCertificate, IconMapPin, IconCheck } from '@tabler/icons-react';
import { BRAND } from '@/lib/brand';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';

interface OnboardingData {
  company_name: string;
  contact_name: string;
  email: string;
  business_type: string;
  services: string[];
  license_number: string;
  years_experience: number;
  team_size: number;
  service_areas: string[];
  insurance_verified: boolean;
  business_address: string;
}

const SERVICE_OPTIONS = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'kitchen_remodeling', label: 'Kitchen Remodeling' },
  { value: 'bathroom_renovation', label: 'Bathroom Renovation' },
  { value: 'painting', label: 'Painting' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'general_contracting', label: 'General Contracting' }
];

const BUSINESS_TYPES = [
  { value: 'sole_proprietor', label: 'Sole Proprietor' },
  { value: 'llc', label: 'LLC' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'partnership', label: 'Partnership' }
];

export default function ContractorOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    company_name: '',
    contact_name: '',
    email: '',
    business_type: '',
    services: [],
    license_number: '',
    years_experience: 0,
    team_size: 1,
    service_areas: [],
    insurance_verified: false,
    business_address: ''
  });

  const updateFormData = (field: keyof OnboardingData, value: string | string[] | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/contractor/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        notifications.show({
          title: 'Welcome to FixItForMe!',
          message: 'Your contractor profile has been created successfully.',
          color: 'green'
        });
        
        // Redirect to dashboard
        window.location.href = '/contractor/dashboard';
      } else {
        throw new Error('Failed to complete onboarding');
      }
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to complete onboarding. Please try again.',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Stack gap="md">
            <div>
              <Title order={3} mb="xs">Company Information</Title>
              <Text size="sm" c="dimmed">Tell us about your business</Text>
            </div>
            
            <TextInput
              label="Company Name"
              placeholder="Enter your company name"
              value={formData.company_name}
              onChange={(e) => updateFormData('company_name', e.target.value)}
              required
            />
            
            <TextInput
              label="Contact Name"
              placeholder="Your full name"
              value={formData.contact_name}
              onChange={(e) => updateFormData('contact_name', e.target.value)}
              required
            />
            
            <TextInput
              label="Email Address"
              placeholder="your@email.com"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              required
            />
            
            <Select
              label="Business Type"
              placeholder="Select your business structure"
              data={BUSINESS_TYPES}
              value={formData.business_type}
              onChange={(value) => updateFormData('business_type', value)}
              required
            />
          </Stack>
        );

      case 1:
        return (
          <Stack gap="md">
            <div>
              <Title order={3} mb="xs">Services & Expertise</Title>
              <Text size="sm" c="dimmed">What services do you provide?</Text>
            </div>
            
            <MultiSelect
              label="Services Offered"
              placeholder="Select all services you provide"
              data={SERVICE_OPTIONS}
              value={formData.services}
              onChange={(value) => updateFormData('services', value)}
              required
            />
            
            <Group grow>
              <NumberInput
                label="Years of Experience"
                placeholder="0"
                min={0}
                max={50}
                value={formData.years_experience}
                onChange={(value) => updateFormData('years_experience', value)}
              />
              
              <NumberInput
                label="Team Size"
                placeholder="1"
                min={1}
                max={100}
                value={formData.team_size}
                onChange={(value) => updateFormData('team_size', value)}
              />
            </Group>
            
            <TextInput
              label="License Number"
              placeholder="Enter your contractor license number"
              value={formData.license_number}
              onChange={(e) => updateFormData('license_number', e.target.value)}
            />
          </Stack>
        );

      case 2:
        return (
          <Stack gap="md">
            <div>
              <Title order={3} mb="xs">Service Areas</Title>
              <Text size="sm" c="dimmed">Where do you provide services?</Text>
            </div>
            
            <Textarea
              label="Business Address"
              placeholder="Enter your business address"
              value={formData.business_address}
              onChange={(e) => updateFormData('business_address', e.target.value)}
              minRows={2}
            />
            
            <Alert title="Service Areas" color="blue" variant="light">
              <Text size="sm">
                We&apos;ll help you identify optimal service areas based on your location and competition analysis.
                Our AI agents will suggest the best markets for your business.
              </Text>
            </Alert>
          </Stack>
        );

      case 3:
        return (
          <Stack gap="md">
            <div>
              <Title order={3} mb="xs">Review & Complete</Title>
              <Text size="sm" c="dimmed">Confirm your information</Text>
            </div>
            
            <Card withBorder p="md">
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text fw={500}>Company</Text>
                  <Text>{formData.company_name}</Text>
                </Group>
                <Group justify="space-between">
                  <Text fw={500}>Contact</Text>
                  <Text>{formData.contact_name}</Text>
                </Group>
                <Group justify="space-between">
                  <Text fw={500}>Email</Text>
                  <Text>{formData.email}</Text>
                </Group>
                <Group justify="space-between">
                  <Text fw={500}>Services</Text>
                  <Group gap="xs">
                    {formData.services.map(service => (
                      <Badge key={service} size="sm" variant="light">
                        {SERVICE_OPTIONS.find(s => s.value === service)?.label}
                      </Badge>
                    ))}
                  </Group>
                </Group>
                <Group justify="space-between">
                  <Text fw={500}>Experience</Text>
                  <Text>{formData.years_experience} years</Text>
                </Group>
              </Stack>
            </Card>
            
            <Alert title="Next Steps" color="green" variant="light">
              <Text size="sm">
                After completing onboarding, you&apos;ll get access to:
                • AI-powered lead generation with Rex
                • Bidding assistance with Alex
                • Real-time market insights
                • Growth plan benefits (6% platform fee)
              </Text>
            </Alert>
          </Stack>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.company_name && formData.contact_name && formData.email && formData.business_type;
      case 1:
        return formData.services.length > 0;
      case 2:
        return true; // Optional step
      case 3:
        return true; // Review step
      default:
        return false;
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ 
        minHeight: '100vh', 
        background: `linear-gradient(135deg, ${BRAND.colors.background.secondary} 0%, ${BRAND.colors.background.tertiary} 100%)`,
        padding: '2rem 0'
      }}
    >
      <Container size="md">
        <motion.div variants={itemVariants}>
          <Paper withBorder p="xl" radius="lg" shadow="lg">
            {/* Header */}
            <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '1rem',
                color: BRAND.colors.primary 
              }}>
                🔧
              </div>
              <Title order={1} style={{ color: BRAND.colors.text.primary }}>
                Welcome to FixItForMe
              </Title>
              <Text c="dimmed" size="lg">
                Let&apos;s set up your contractor profile
              </Text>
            </motion.div>

          {/* Progress */}
          <div style={{ marginBottom: '2rem' }}>
            <Progress 
              value={(currentStep + 1) / 4 * 100} 
              size="lg" 
              color={BRAND.colors.primary}
              mb="md"
            />
            <Group justify="center">
              <Text size="sm" c="dimmed">
                Step {currentStep + 1} of 4
              </Text>
            </Group>
          </div>

          {/* Stepper */}
          <Stepper active={currentStep} size="sm" mb="xl">
            <Stepper.Step 
              icon={<IconBuilding size={18} />}
              label="Company Info"
              description="Basic information"
            />
            <Stepper.Step 
              icon={<IconCertificate size={18} />}
              label="Services"
              description="What you offer"
            />
            <Stepper.Step 
              icon={<IconMapPin size={18} />}
              label="Location"
              description="Service areas"
            />
            <Stepper.Step 
              icon={<IconCheck size={18} />}
              label="Review"
              description="Confirm details"
            />
          </Stepper>

          {/* Step Content */}
          <div style={{ minHeight: '400px', marginBottom: '2rem' }}>
            {getStepContent()}
          </div>

          {/* Navigation */}
          <Group justify="space-between">
            <Button 
              variant="subtle"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              loading={loading}
              style={{ backgroundColor: BRAND.colors.primary }}
            >
              {currentStep === 3 ? 'Complete Setup' : 'Next Step'}
            </Button>
          </Group>
          </Paper>
        </motion.div>
      </Container>
    </motion.div>
  );
}
