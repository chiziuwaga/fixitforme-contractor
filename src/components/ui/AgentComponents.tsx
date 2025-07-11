'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, TrendingUp, MapPin, DollarSign, Wrench, Users, Star, Crown, Check, Zap, Target, BarChart3, Settings, Scale } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { useAgentUI, type AgentAction } from '@/hooks/useAgentUI';
import { CostBreakdownChart, TimelineChart, LeadDistributionChart } from './Charts';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// Alex Cost Breakdown Component
interface AlexCostBreakdownProps {
  data: {
    project_title: string;
    total_estimate: number;
    confidence_level: 'high' | 'medium' | 'low';
    breakdown: {
      labor: number;
      materials: number;
      permits: number;
      overhead: number;
      profit: number;
    };
    timeline: {
      start: string;
      end: string;
      duration: string;
    };
    risk_factors: string[];
    materials_list?: Array<{
      category: string;
      items: Array<{
        name: string;
        quantity: number;
        unit_cost: number;
        supplier: string;
      }>;
    }>;
  };
  actions?: AgentAction[];
}

export function AlexCostBreakdown({ data, actions }: AlexCostBreakdownProps) {
  const { executeAction } = useAgentUI();

  const handleActionClick = async (actionType: string) => {
    await executeAction('alex-cost-breakdown', actionType, data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{data.project_title}</CardTitle>
              <CardDescription>Total Estimate: ${data.total_estimate.toLocaleString()}</CardDescription>
            </div>
            <Badge 
              variant={data.confidence_level === 'high' ? 'default' : data.confidence_level === 'medium' ? 'secondary' : 'destructive'}
            >
              {data.confidence_level} confidence
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="breakdown" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="breakdown">Cost Analysis</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
            </TabsList>

            <TabsContent value="breakdown" className="space-y-4">
              <CostBreakdownChart 
                data={data.breakdown} 
                totalEstimate={data.total_estimate}
                animated={true}
                interactive={true}
              />
              
              {data.risk_factors.length > 0 && (
                <Alert>
                  <AlertDescription>
                    <strong>Risk Factors:</strong> {data.risk_factors.join(', ')}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <TimelineChart 
                phases={[
                  {
                    name: data.project_title,
                    start: new Date(data.timeline.start),
                    end: new Date(data.timeline.end),
                    progress: 0
                  }
                ]}
                animated={true}
                interactive={true}
              />
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              {data.materials_list?.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.quantity} units from {item.supplier}</p>
                        </div>
                        <p className="font-semibold">${(item.quantity * item.unit_cost).toLocaleString()}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          {actions && actions.length > 0 && (
            <div className="flex gap-2 pt-4 border-t">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.style === 'primary' ? 'default' : action.style === 'secondary' ? 'secondary' : 'outline'}
                  onClick={() => handleActionClick(action.type)}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Rex Lead Dashboard Component  
interface RexLeadDashboardProps {
  data: {
    summary: {
      total_leads: number;
      qualified_leads: number;
      conversion_rate: number;
      average_lead_value: number;
      total_pipeline_value: number;
      search_sessions_used: number;
      search_sessions_remaining: number;
    };
    geographic_breakdown: Array<{
      area: string;
      count: number;
      avgValue: number;
      competition: 'low' | 'medium' | 'high';
    }>;
    trending_problems: Array<{
      felix_id: number;
      name: string;
      growth: string;
      season: string;
    }>;
    source_performance: Array<{
      source: string;
      leads: number;
      quality_score: number;
      conversion_rate: number;
    }>;
  };
  actions?: AgentAction[];
}

export function RexLeadDashboard({ data, actions }: RexLeadDashboardProps) {
  const { executeAction } = useAgentUI();

  const handleActionClick = async (actionType: string) => {
    await executeAction('rex-lead-dashboard', actionType, data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lead Generation Dashboard</CardTitle>
              <CardDescription>Rex's market intelligence and lead analysis</CardDescription>
            </div>
            <Badge variant="secondary">
              {data.summary.search_sessions_remaining} searches remaining
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{data.summary.total_leads}</div>
                <div className="text-sm text-muted-foreground">Total Leads</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">{data.summary.qualified_leads}</div>
                <div className="text-sm text-muted-foreground">Qualified</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-info">{(data.summary.conversion_rate * 100).toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Conversion</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning">${data.summary.average_lead_value.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Avg Value</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="geographic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="geographic">Geographic</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
            </TabsList>

            <TabsContent value="geographic" className="space-y-4">
              <LeadDistributionChart 
                data={data.geographic_breakdown}
                animated={true}
                interactive={true}
              />
            </TabsContent>

            <TabsContent value="trending" className="space-y-4">
              <div className="space-y-3">
                {data.trending_problems.map((problem, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{problem.name}</p>
                          <p className="text-sm text-muted-foreground">Felix ID: {problem.felix_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-success font-semibold">{problem.growth}</p>
                          <p className="text-sm text-muted-foreground">{problem.season}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sources" className="space-y-4">
              <div className="space-y-3">
                {data.source_performance.map((source, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{source.source}</p>
                          <p className="text-sm text-muted-foreground">{source.leads} leads</p>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-warning" />
                            <span className="text-sm">{source.quality_score}/100</span>
                          </div>
                          <p className="text-sm text-success">{(source.conversion_rate * 100).toFixed(1)}% conversion</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {actions && actions.length > 0 && (
            <div className="flex gap-2 pt-4 border-t">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.style === 'primary' ? 'default' : action.style === 'secondary' ? 'secondary' : 'outline'}
                  onClick={() => handleActionClick(action.type)}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Lexi Onboarding Component
interface LexiOnboardingProps {
  data: {
    overall_progress: number;
    current_step: string;
    steps_completed: string[];
    felix_services: {
      selected: number[];
      recommended: number[];
      categories: Array<{
        id: number;
        name: string;
        difficulty: string;
        avg_value: number;
      }>;
      tier_limit: number;
    };
    profile_score: number;
    estimated_time_remaining: number;
    benefits_unlocked: string[];
  };
  actions?: AgentAction[];
}

export function LexiOnboarding({ data, actions }: LexiOnboardingProps) {
  const { executeAction } = useAgentUI();

  const handleActionClick = async (actionType: string) => {
    await executeAction('lexi-onboarding', actionType, data);
  };

  const steps = [
    { id: 'welcome', name: 'Welcome', icon: Users },
    { id: 'profile_basic', name: 'Basic Info', icon: Users },
    { id: 'service_selection', name: 'Services', icon: Wrench },
    { id: 'territory_setup', name: 'Territory', icon: MapPin },
    { id: 'document_upload', name: 'Documents', icon: CheckCircle },
    { id: 'tier_selection', name: 'Tier', icon: Star },
    { id: 'completion', name: 'Complete', icon: CheckCircle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Contractor Setup Progress</CardTitle>
          <CardDescription>
            {data.overall_progress}% complete • {data.estimated_time_remaining} minutes remaining
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Progress value={data.overall_progress} className="w-full" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{data.profile_score}%</div>
                  <div className="text-sm text-muted-foreground">Profile Score</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-success">{data.felix_services.selected.length}</div>
                  <div className="text-sm text-muted-foreground">Services</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-info">{data.felix_services.tier_limit}</div>
                  <div className="text-sm text-muted-foreground">Tier Limit</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-warning">{data.benefits_unlocked.length}</div>
                  <div className="text-sm text-muted-foreground">Benefits</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Setup Steps</h4>
              <div className="space-y-2">
                {steps.map((step) => {
                  const isCompleted = data.steps_completed.includes(step.id);
                  const isCurrent = data.current_step === step.id;
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isCompleted ? 'bg-success/10 border-success/20' :
                        isCurrent ? 'bg-primary/10 border-primary/20' :
                        'bg-muted/50'
                      }`}
                    >
                      <Icon 
                        className={`h-5 w-5 ${
                          isCompleted ? 'text-success' :
                          isCurrent ? 'text-primary' :
                          'text-muted-foreground'
                        }`} 
                      />
                      <span className={`font-medium ${
                        isCompleted ? 'text-success' :
                        isCurrent ? 'text-primary' :
                        'text-muted-foreground'
                      }`}>
                        {step.name}
                      </span>
                      {isCompleted && <CheckCircle className="h-4 w-4 text-success ml-auto" />}
                      {isCurrent && <Clock className="h-4 w-4 text-primary ml-auto" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {data.felix_services.recommended.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Recommended Services</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.felix_services.categories.slice(0, 4).map((service) => (
                    <Card key={service.id} className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{service.name}</p>
                          <p className="text-xs text-muted-foreground">{service.difficulty}</p>
                        </div>
                        <p className="text-sm font-semibold text-success">
                          ${service.avg_value}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {actions && actions.length > 0 && (
              <div className="flex gap-2 pt-4 border-t">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.style === 'primary' ? 'default' : action.style === 'secondary' ? 'secondary' : 'outline'}
                    onClick={() => handleActionClick(action.type)}
                    disabled={action.disabled}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Upgrade Prompt Component
interface UpgradePromptProps {
  data: {
    currentTier?: string;
    requiredTier?: string;
    debugMode?: boolean;
    [key: string]: unknown;
  };
  actions?: AgentAction[];
}

export function UpgradePrompt({ data, actions }: UpgradePromptProps) {
  const { handleUpgradeAction } = useAgentUI();
  const [activeTab, setActiveTab] = useState<'comparison' | 'benefits' | 'pricing'>('comparison');

  const handleActionClick = async (actionType: string) => {
    await handleUpgradeAction(actionType);
  };

  const currentTier = data?.currentTier || 'Growth';
  const requiredTier = data?.requiredTier || 'Scale';

  const tierData = {
    Growth: {
      name: 'Growth Tier',
      price: 'Free',
      fee: '10% transaction fee',
      features: ['Basic lead matching', 'Email support', 'Standard analytics', 'Mobile app access'],
      limits: ['Limited to 20 bids/month', 'Basic agent assistance', 'Standard notifications']
    },
    Scale: {
      name: 'Scale Tier',
      price: '$250/month',
      fee: '7% transaction fee',
      features: ['Priority lead matching', 'AI-powered bidding', 'Advanced analytics', 'Priority support', 'Custom integrations'],
      limits: ['Unlimited bids', 'Full agent ecosystem', 'Real-time notifications', 'Advanced reporting']
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-slate-50 border-2 border-felix-gold/20 rounded-xl shadow-lg"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-felix-gold to-felix-gold/80 text-white p-4 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Upgrade to Scale Tier</h3>
            <p className="text-white/90 text-sm">Unlock advanced contractor features</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-white">
        {[
          { id: 'comparison', label: 'Tier Comparison', icon: Scale },
          { id: 'benefits', label: 'Benefits', icon: Star },
          { id: 'pricing', label: 'Pricing', icon: DollarSign }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              activeTab === tab.id
                ? 'border-b-2 border-felix-gold text-felix-gold bg-felix-gold/5'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'comparison' && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-4">
                {/* Current Tier */}
                <div className={`p-4 rounded-lg border-2 ${
                  currentTier === 'Growth' ? 'border-slate-300 bg-slate-50' : 'border-green-300 bg-green-50'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={currentTier === 'Growth' ? 'secondary' : 'default'}>
                      Current: {tierData[currentTier as keyof typeof tierData]?.name}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-lg">{tierData[currentTier as keyof typeof tierData]?.price}</p>
                    <p className="text-sm text-slate-600">{tierData[currentTier as keyof typeof tierData]?.fee}</p>
                    <div className="space-y-1">
                      {tierData[currentTier as keyof typeof tierData]?.features.slice(0, 3).map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Check className="w-3 h-3 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Required Tier */}
                <div className="p-4 rounded-lg border-2 border-felix-gold bg-felix-gold/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge style={{ backgroundColor: BRAND.colors.primary, color: 'white' }}>
                      Required: {tierData[requiredTier as keyof typeof tierData]?.name}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-lg">{tierData[requiredTier as keyof typeof tierData]?.price}</p>
                    <p className="text-sm text-slate-600">{tierData[requiredTier as keyof typeof tierData]?.fee}</p>
                    <div className="space-y-1">
                      {tierData[requiredTier as keyof typeof tierData]?.features.slice(0, 3).map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Star className="w-3 h-3 text-felix-gold" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'benefits' && (
            <motion.div
              key="benefits"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <h4 className="font-semibold text-lg mb-4">What You'll Get with Scale Tier:</h4>
              <div className="grid gap-3">
                {[
                  { icon: Zap, title: 'AI-Powered Bidding', desc: 'Alex automatically calculates optimal bid amounts' },
                  { icon: Target, title: 'Priority Lead Matching', desc: 'Get matched to high-value leads first' },
                  { icon: BarChart3, title: 'Advanced Analytics', desc: 'Detailed performance insights and ROI tracking' },
                  { icon: Users, title: 'Priority Support', desc: 'Direct access to our contractor success team' },
                  { icon: Settings, title: 'Custom Integrations', desc: 'Connect with your existing business tools' }
                ].map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50"
                  >
                    <div className="w-8 h-8 bg-felix-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-4 h-4 text-felix-gold" />
                    </div>
                    <div>
                      <h5 className="font-medium">{benefit.title}</h5>
                      <p className="text-sm text-slate-600">{benefit.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'pricing' && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="text-center py-4">
                <h4 className="font-semibold text-lg mb-2">Scale Tier Pricing</h4>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-felix-gold">$250/month</div>
                  <div className="text-sm text-slate-600">+ 7% transaction fee</div>
                  <div className="text-xs text-slate-500">30-day money-back guarantee</div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-medium text-green-800 mb-2">ROI Calculator</h5>
                <div className="text-sm text-green-700">
                  <p>Average Scale tier contractors see:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>40% more successful bids</li>
                    <li>25% higher project values</li>
                    <li>60% time savings on bidding</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      {actions && (
        <div className="px-6 pb-6">
          <div className="flex gap-3 justify-center">
            {actions.map((action, index) => (
              <Button 
                key={index} 
                variant={action.style === 'primary' ? 'default' : 'outline'}
                size="lg"
                style={action.style === 'primary' ? { backgroundColor: BRAND.colors.primary } : {}}
                onClick={() => handleActionClick(action.type)}
                disabled={action.disabled}
                className="min-w-[120px]"
              >
                {action.type === 'upgrade' && <Crown className="w-4 h-4 mr-2" />}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {data && data.debugMode && (
        <div className="px-6 pb-4">
          <details className="text-xs">
            <summary className="cursor-pointer text-slate-500">Debug Data</summary>
            <pre className="mt-2 text-xs text-slate-600 bg-slate-100 p-2 rounded overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </motion.div>
  );
}

// System Message Component
interface SystemMessageProps {
  message: string;
  data?: Record<string, unknown>;
  icon?: React.ElementType;
}

export function SystemMessage({ message, data, icon: Icon }: SystemMessageProps) {
  return (
    <Alert className="my-4">
      <AlertDescription>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" />}
            <p className="text-sm">{message}</p>
          </div>
          {data && <pre className="text-xs text-muted-foreground">{JSON.stringify(data, null, 2)}</pre>}
        </div>
      </AlertDescription>
    </Alert>
  );
}
