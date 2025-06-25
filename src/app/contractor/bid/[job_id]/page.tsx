'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  Group, 
  Badge, 
  Stack, 
  Grid,
  Card,
  Button,
  Loader,
  Center
} from '@mantine/core';
import { IconMapPin, IconClock, IconCurrencyDollar, IconUser } from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';
import EnhancedChatManager from '@/components/dashboard/EnhancedChatManager';

interface JobDetails {
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
  homeowner_name?: string;
  homeowner_phone?: string;
  requirements: string[];
  timeline_preference: string;
}

export default function JobBidView() {
  const params = useParams();
  const jobId = params?.job_id as string;
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error) throw error;
        setJob(data);
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const getUrgencyColor = (urgency: string) => {
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

  const formatBudget = (min: number, max: number) => {
    if (min === max) return `$${min.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!job) {
    return (
      <Container>
        <Center h="50vh">
          <Text c="dimmed">Job not found</Text>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Paper p="lg" withBorder>
          <Group justify="space-between" align="start">
            <div style={{ flex: 1 }}>
              <Group gap="sm" mb="sm">
                <Badge 
                  color={getSourceColor(job.source)}
                  variant="light"
                >
                  {job.source === 'felix_referral' ? 'Felix Referral' : 
                   job.source === 'rex_discovery' ? 'Rex Discovery' : 'Direct Inquiry'}
                </Badge>
                <Badge 
                  color={getUrgencyColor(job.urgency)}
                  variant="outline"
                >
                  {job.urgency} priority
                </Badge>
              </Group>
              
              <Title order={2} mb="sm">{job.title}</Title>
              
              <Group gap="xl" mb="md">
                <Group gap="xs">
                  <IconCurrencyDollar size={16} color="#666" />
                  <Text fw={500}>{formatBudget(job.budget_min, job.budget_max)}</Text>
                </Group>
                
                <Group gap="xs">
                  <IconMapPin size={16} color="#666" />
                  <Text>{job.location}</Text>
                </Group>
                
                <Group gap="xs">
                  <IconClock size={16} color="#666" />
                  <Text>{new Date(job.posted_at).toLocaleDateString()}</Text>
                </Group>
              </Group>
            </div>
            
            <Button size="lg" variant="filled">
              Submit Bid
            </Button>
          </Group>
        </Paper>

        <Grid>
          {/* Job Details */}
          <Grid.Col span={8}>
            <Stack gap="md">
              <Card withBorder>
                <Card.Section p="md" withBorder>
                  <Text fw={600}>Job Description</Text>
                </Card.Section>
                <Card.Section p="md">
                  <Text>{job.description}</Text>
                </Card.Section>
              </Card>

              {job.requirements && job.requirements.length > 0 && (
                <Card withBorder>
                  <Card.Section p="md" withBorder>
                    <Text fw={600}>Requirements</Text>
                  </Card.Section>
                  <Card.Section p="md">
                    <Stack gap="xs">
                      {job.requirements.map((req, index) => (
                        <Text key={index} size="sm">• {req}</Text>
                      ))}
                    </Stack>
                  </Card.Section>
                </Card>
              )}

              <Card withBorder>
                <Card.Section p="md" withBorder>
                  <Text fw={600}>Alex Analysis</Text>
                </Card.Section>
                <Card.Section p="md">
                  <Text c="dimmed" ta="center" py="md">
                    Ask @alex to analyze this job for competitive pricing and timeline estimates
                  </Text>
                  <Button 
                    variant="outline" 
                    fullWidth
                    onClick={() => {
                      // TODO: Implement Alex analysis trigger
                    }}
                  >
                    Get Alex&apos;s Analysis
                  </Button>
                </Card.Section>
              </Card>
            </Stack>
          </Grid.Col>

          {/* Sidebar */}
          <Grid.Col span={4}>
            <Stack gap="md">
              {job.source === 'felix_referral' && job.homeowner_name && (
                <Card withBorder>
                  <Card.Section p="md" withBorder>
                    <Group gap="xs">
                      <IconUser size={16} />
                      <Text fw={600}>Homeowner Details</Text>
                    </Group>
                  </Card.Section>
                  <Card.Section p="md">
                    <Stack gap="xs">
                      <Text size="sm">
                        <strong>Name:</strong> {job.homeowner_name}
                      </Text>
                      {job.homeowner_phone && (
                        <Text size="sm">
                          <strong>Phone:</strong> {job.homeowner_phone}
                        </Text>
                      )}
                      <Text size="sm">
                        <strong>Timeline:</strong> {job.timeline_preference || 'Flexible'}
                      </Text>
                    </Stack>
                  </Card.Section>
                </Card>
              )}

              <Card withBorder>
                <Card.Section p="md" withBorder>
                  <Text fw={600}>Quick Actions</Text>
                </Card.Section>
                <Card.Section p="md">
                  <Stack gap="sm">
                    <Button variant="outline" fullWidth>
                      Save for Later
                    </Button>
                    <Button variant="outline" fullWidth>
                      Request More Info
                    </Button>
                    <Button variant="outline" fullWidth>
                      Schedule Site Visit
                    </Button>
                  </Stack>
                </Card.Section>
              </Card>

              <Card withBorder>
                <Card.Section p="md" withBorder>
                  <Text fw={600}>Similar Jobs</Text>
                </Card.Section>
                <Card.Section p="md">
                  <Text c="dimmed" ta="center" py="md">
                    Rex will find similar opportunities
                  </Text>
                </Card.Section>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Enhanced Chat Manager for Alex Integration */}
      <EnhancedChatManager
        contractorId="mock-contractor-id" // Replace with actual contractor ID
      />
    </Container>
  );
}
