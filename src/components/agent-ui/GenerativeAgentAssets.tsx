'use client';

import React from 'react';
import { Card, Progress, Badge, Group, Text, Stack, Button, List, ThemeIcon, Grid, NumberFormatter } from '@mantine/core';
import { IconCheck, IconX, IconBuilding, IconMapPin, IconStar, IconInfoCircle, IconChevronRight, IconTarget, IconCurrencyDollar } from '@tabler/icons-react';

interface OnboardingData {
  overall_progress: number;
  current_step: string;
  completed_steps: string[];
  remaining_steps: string[];
  felix_services?: {
    selected: string[];
    recommended: string[];
    available_growth: number;
    available_scale: number;
    current_tier: string;
  };
  profile_strength?: {
    score: number;
    missing_elements: string[];
    impact: string;
  };
  tier_benefits?: {
    current: string;
    upgrade_benefits: string[];
    cost_savings: string;
    feature_access: string[];
  };
  usage_tracking?: {
    current_usage: number;
    monthly_limits: Record<string, number>;
    percentage_used: number;
  };
  peer_benchmarks?: {
    avg_bid_value: number;
    avg_conversion_rate: number;
    your_position: string;
    improvement_tips: string[];
  };
}

interface MaterialBreakdownData {
  cost_breakdown?: Array<{
    name: string;
    price: number;
    quantity: number;
    store: string;
    availability: string;
    alternative_options: number;
  }>;
  location_insights?: {
    message: string;
  };
}

interface LeadOpportunityData {
  quality_score: number;
  urgency: 'high' | 'medium' | 'low';
  project_details?: {
    title: string;
    location: string;
    description: string;
    budget: number;
    posted_date: string;
  };
  match_reasoning?: string[];
  competition_analysis?: {
    level: 'low' | 'medium' | 'high';
    insight: string;
  };
}

interface SystemMessageData {
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  upgrade_hint?: string;
}

type AgentUIData = OnboardingData | MaterialBreakdownData | LeadOpportunityData | SystemMessageData;

interface AgentUIAsset {
  type: 'onboarding_progress' | 'tier_comparison' | 'feature_education' | 'system_message' | 'material_breakdown' | 'lead_opportunity' | 'bid_analysis' | 'market_intelligence';
  data: AgentUIData;
  render_hints: {
    component: string;
    priority: 'high' | 'medium' | 'low';
    interactive: boolean;
    progress_tracking?: boolean;
  };
}

interface AgentAction {
  type: string;
  label: string;
  style: 'primary' | 'secondary' | 'outline';
}

interface GenerativeAgentAssetsProps {
  ui_assets: AgentUIAsset;
  actions?: AgentAction[];
  follow_up_prompts?: string[];
  onAction?: (action: AgentAction) => void;
  onPrompt?: (prompt: string) => void;
}

export function GenerativeAgentAssets({ 
  ui_assets, 
  actions = [], 
  follow_up_prompts = [],
  onAction,
  onPrompt 
}: GenerativeAgentAssetsProps) {
    const renderOnboardingProgress = () => {
    const data = ui_assets.data as OnboardingData;
    
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600} size="lg">Profile Setup Progress</Text>
            <Badge color={data.overall_progress === 100 ? 'green' : 'blue'} size="lg">
              {data.overall_progress}% Complete
            </Badge>
          </Group>
          
          <Progress value={data.overall_progress} size="lg" radius="xl" />
          
          <Grid>
            <Grid.Col span={6}>
              <Stack gap="xs">
                <Text size="sm" fw={500} c="green">✅ Completed Steps</Text>
                <List size="sm" spacing="xs">
                  {data.completed_steps.map((step: string, idx: number) => (
                    <List.Item key={idx} icon={<ThemeIcon color="green" size={16} radius="xl"><IconCheck size={12} /></ThemeIcon>}>
                      {step.replace('_', ' ').toUpperCase()}
                    </List.Item>
                  ))}
                </List>
              </Stack>
            </Grid.Col>
            
            <Grid.Col span={6}>
              <Stack gap="xs">
                <Text size="sm" fw={500} c="orange">🔄 Remaining Steps</Text>
                <List size="sm" spacing="xs">
                  {data.remaining_steps.map((step: string, idx: number) => (
                    <List.Item key={idx} icon={<ThemeIcon color="orange" size={16} radius="xl"><IconX size={12} /></ThemeIcon>}>
                      {step.replace('_', ' ').toUpperCase()}
                    </List.Item>
                  ))}
                </List>
              </Stack>
            </Grid.Col>
          </Grid>

          {data.felix_services && (
            <Card withBorder p="sm">
              <Text size="sm" fw={500} mb="xs">Felix Service Categories</Text>
              <Group gap="xs" mb="xs">
                {data.felix_services.selected.map((service: string, idx: number) => (
                  <Badge key={idx} color="blue" variant="filled" size="sm">{service}</Badge>
                ))}
              </Group>
              {data.felix_services.recommended.length > 0 && (
                <>
                  <Text size="xs" c="dimmed" mb="xs">Recommended for your market:</Text>
                  <Group gap="xs">
                    {data.felix_services.recommended.map((service: string, idx: number) => (
                      <Badge key={idx} color="gray" variant="outline" size="sm">{service}</Badge>
                    ))}
                  </Group>
                </>
              )}
            </Card>
          )}

          {data.profile_strength && (
            <Card withBorder p="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={500}>Profile Strength</Text>
                <Badge color={data.profile_strength.score >= 80 ? 'green' : data.profile_strength.score >= 60 ? 'yellow' : 'red'}>
                  {data.profile_strength.score}/100
                </Badge>
              </Group>
              <Progress value={data.profile_strength.score} size="sm" mb="xs" />
              <Text size="xs" c="dimmed">{data.profile_strength.impact}</Text>
            </Card>
          )}
        </Stack>
      </Card>
    );
  };

  const renderTierComparison = () => {
    const data = ui_assets.data as OnboardingData;
    
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600} size="lg">Tier Benefits</Text>
            <Badge color={data.tier_benefits?.current === 'scale' ? 'green' : 'blue'} size="lg">
              {data.tier_benefits?.current.toUpperCase()} TIER
            </Badge>
          </Group>
          
          {data.tier_benefits?.current === 'growth' && (
            <Card withBorder p="md" bg="blue.0">
              <Stack gap="xs">
                <Text fw={500} c="blue">Upgrade to Scale Tier Benefits:</Text>
                <List size="sm" spacing="xs">
                  {data.tier_benefits.upgrade_benefits.map((benefit: string, idx: number) => (
                    <List.Item key={idx} icon={<ThemeIcon color="blue" size={16} radius="xl"><IconStar size={12} /></ThemeIcon>}>
                      {benefit}
                    </List.Item>
                  ))}
                </List>
                <Text size="sm" fw={500} c="green">💰 {data.tier_benefits.cost_savings}</Text>
              </Stack>
            </Card>
          )}

          {data.usage_tracking && (
            <Card withBorder p="sm">
              <Text size="sm" fw={500} mb="xs">Monthly Usage</Text>
              <Group justify="space-between" mb="xs">
                <Text size="sm">Bids Used</Text>
                <Text size="sm" fw={500}>{data.usage_tracking.current_usage} / {data.usage_tracking.monthly_limits.bids}</Text>
              </Group>
              <Progress 
                value={data.usage_tracking.percentage_used} 
                size="sm" 
                color={data.usage_tracking.percentage_used > 80 ? 'red' : 'blue'} 
              />
            </Card>
          )}

          {data.peer_benchmarks && (
            <Card withBorder p="sm">
              <Text size="sm" fw={500} mb="xs">Local Market Benchmarks</Text>
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="xs" c="dimmed">Average Bid Value</Text>
                    <Text fw={500}><NumberFormatter prefix="$" value={data.peer_benchmarks.avg_bid_value} thousandSeparator /></Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="xs" c="dimmed">Conversion Rate</Text>
                    <Text fw={500}>{data.peer_benchmarks.avg_conversion_rate}%</Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Card>
          )}
        </Stack>
      </Card>
    );
  };

  const renderMaterialBreakdown = () => {
    const data = ui_assets.data as MaterialBreakdownData;
    
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600} size="lg">Material Cost Analysis</Text>
            <Badge color="green" size="lg">
              <IconCurrencyDollar size={14} />
              Live Pricing
            </Badge>
          </Group>
          
          {data.cost_breakdown && (
            <Grid>
              {data.cost_breakdown.map((item, idx: number) => (
                <Grid.Col span={12} key={idx}>
                  <Card withBorder p="sm">
                    <Group justify="space-between" mb="xs">
                      <Text fw={500}>{item.name}</Text>
                      <Group gap="xs">
                        <Badge color={item.availability === 'in_stock' ? 'green' : 'red'} size="sm">
                          {item.availability}
                        </Badge>
                        <Text fw={600}><NumberFormatter prefix="$" value={item.price} /></Text>
                      </Group>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Qty: {item.quantity} | Store: {item.store}</Text>
                      {item.alternative_options > 0 && (
                        <Text size="sm" c="blue">+{item.alternative_options} alternatives</Text>
                      )}
                    </Group>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          )}

          {data.location_insights && (
            <Card withBorder p="sm" bg="blue.0">
              <Group>
                <ThemeIcon color="blue" size="lg">
                  <IconMapPin size={18} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text fw={500} size="sm">Location Insights</Text>
                  <Text size="xs" c="dimmed">{data.location_insights.message}</Text>
                </Stack>
              </Group>
            </Card>
          )}
        </Stack>
      </Card>
    );
  };

  const renderLeadOpportunity = () => {
    const data = ui_assets.data as LeadOpportunityData;
    
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600} size="lg">Lead Opportunity</Text>
            <Group gap="xs">
              <Badge color="green" size="lg">
                Score: {data.quality_score}%
              </Badge>
              <Badge color={data.urgency === 'high' ? 'red' : data.urgency === 'medium' ? 'yellow' : 'blue'}>
                {data.urgency} urgency
              </Badge>
            </Group>
          </Group>
          
          {data.project_details && (
            <Card withBorder p="md">
              <Stack gap="sm">
                <Group>
                  <ThemeIcon color="blue" size="lg">
                    <IconBuilding size={18} />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text fw={500}>{data.project_details.title}</Text>
                    <Text size="sm" c="dimmed">{data.project_details.location}</Text>
                  </Stack>
                </Group>
                
                <Text size="sm">{data.project_details.description}</Text>
                
                <Group justify="space-between">
                  <Text size="sm" fw={500}>
                    Budget: <NumberFormatter prefix="$" value={data.project_details.budget} thousandSeparator />
                  </Text>
                  <Text size="sm" c="dimmed">
                    Posted: {data.project_details.posted_date}
                  </Text>
                </Group>
              </Stack>
            </Card>
          )}

          {data.match_reasoning && (
            <Card withBorder p="sm">
              <Text size="sm" fw={500} mb="xs">Why this matches you:</Text>
              <List size="sm" spacing="xs">
                {data.match_reasoning.map((reason: string, idx: number) => (
                  <List.Item key={idx} icon={<ThemeIcon color="green" size={16} radius="xl"><IconTarget size={12} /></ThemeIcon>}>
                    {reason}
                  </List.Item>
                ))}
              </List>
            </Card>
          )}

          {data.competition_analysis && (
            <Card withBorder p="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={500}>Competition Level</Text>
                <Badge color={data.competition_analysis.level === 'low' ? 'green' : data.competition_analysis.level === 'medium' ? 'yellow' : 'red'}>
                  {data.competition_analysis.level}
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">{data.competition_analysis.insight}</Text>
            </Card>
          )}
        </Stack>
      </Card>
    );
  };

  const renderSystemMessage = () => {
    const data = ui_assets.data as SystemMessageData;
    
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group>
          <ThemeIcon color={data.type === 'warning' ? 'yellow' : data.type === 'error' ? 'red' : 'blue'} size="lg">
            <IconInfoCircle size={18} />
          </ThemeIcon>
          <Stack gap={0} style={{ flex: 1 }}>
            <Text fw={500}>{data.title}</Text>
            <Text size="sm" c="dimmed">{data.message}</Text>
            {data.upgrade_hint && (
              <Text size="sm" c="blue" mt="xs">{data.upgrade_hint}</Text>
            )}
          </Stack>
        </Group>
      </Card>
    );
  };

  const renderAsset = () => {
    switch (ui_assets.type) {
      case 'onboarding_progress':
        return renderOnboardingProgress();
      case 'tier_comparison':
        return renderTierComparison();
      case 'material_breakdown':
        return renderMaterialBreakdown();
      case 'lead_opportunity':
        return renderLeadOpportunity();
      case 'system_message':
        return renderSystemMessage();
      default:
        return null;
    }
  };

  return (
    <Stack gap="md">
      {renderAsset()}
      
      {/* Actions */}
      {actions.length > 0 && (
        <Group>
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.style === 'primary' ? 'filled' : action.style === 'secondary' ? 'light' : 'outline'}
              onClick={() => onAction?.(action)}
            >
              {action.label}
            </Button>
          ))}
        </Group>
      )}
      
      {/* Follow-up Prompts */}
      {follow_up_prompts.length > 0 && (
        <Card withBorder p="sm">
          <Text size="sm" fw={500} mb="xs">Quick Actions:</Text>
          <Stack gap="xs">
            {follow_up_prompts.map((prompt, idx) => (
              <Button
                key={idx}
                variant="subtle"
                size="sm"
                justify="space-between"
                rightSection={<IconChevronRight size={14} />}
                onClick={() => onPrompt?.(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}

export default GenerativeAgentAssets;
