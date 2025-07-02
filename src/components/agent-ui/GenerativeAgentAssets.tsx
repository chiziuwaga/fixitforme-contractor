'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Check, 
  MapPin, 
  Star, 
  Info, 
  ChevronRight, 
  Target, 
  DollarSign,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

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
  labor_estimate?: {
    hours: number;
    rate: number;
    complexity: string;
    skill_requirements: string[];
  };
  timeline?: {
    total_days: number;
    phases: Array<{
      name: string;
      duration: number;
      dependencies: string[];
    }>;
  };
  risk_assessment?: {
    level: string;
    factors: string[];
    mitigation: string[];
  };
  market_comparison?: {
    competitor_range: { min: number; max: number };
    your_position: string;
    win_probability: number;
  };
}

interface RexLeadData {
  total_leads: number;
  qualified_leads: number;
  conversion_rate: number;
  avg_lead_value: number;
  pipeline_value: number;
  geographic_breakdown: Array<{
    area: string;
    count: number;
    avg_value: number;
    competition: string;
    drive_time: string;
    opportunity_score: number;
  }>;
  trending_problems: Array<{
    felix_id: number;
    name: string;
    demand_change: string;
    avg_value: number;
    competition_level: string;
  }>;
  lead_sources: Array<{
    source: string;
    count: number;
    quality_score: number;
    conversion_rate: number;
    avg_response_time: string;
  }>;
  market_intelligence: {
    seasonal_trends: string[];
    pricing_insights: string[];
    opportunity_alerts: string[];
  };
}

interface LeadData {
  id: string;
  title: string;
  budget_range: string;
  location: string;
  urgency: string;
  felix_category: string;
  quality_score: number;
  distance: string;
  posted_time: string;
  competition_level: string;
}

interface GenerativeAgentAssetsProps {
  type: string;
  data: OnboardingData | MaterialBreakdownData | RexLeadData | LeadData[] | Record<string, unknown>;
  actions?: Array<{
    type: string;
    label: string;
    style: string;
    disabled?: boolean;
  }>;
}

const GenerativeAgentAssets: React.FC<GenerativeAgentAssetsProps> = ({ type, data, actions }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const renderOnboardingWizard = (onboardingData: OnboardingData) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-2 border-brand-primary/10 bg-gradient-to-r from-brand-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-brand-primary" />
            Onboarding Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-semibold">{onboardingData.overall_progress}%</span>
            </div>
            <Progress value={onboardingData.overall_progress} className="h-3" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 text-success-foreground">Completed Steps</h4>
              <div className="space-y-1">
                {onboardingData.completed_steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 text-warning-foreground">Remaining Steps</h4>
              <div className="space-y-1">
                {onboardingData.remaining_steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-warning" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {onboardingData.profile_strength && (
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Profile Strength</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={onboardingData.profile_strength.score} className="h-2" />
                </div>
                <Badge variant={onboardingData.profile_strength.score > 80 ? 'default' : 'secondary'}>
                  {onboardingData.profile_strength.score}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {onboardingData.profile_strength.impact}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {onboardingData.felix_services && (
        <Card>
          <CardHeader>
            <CardTitle>Felix Service Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="selected">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="selected">Selected Services</TabsTrigger>
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
              </TabsList>
              
              <TabsContent value="selected" className="space-y-2">
                {onboardingData.felix_services.selected.map((service, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-success/10 rounded-lg">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-sm">{service}</span>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="recommended" className="space-y-2">
                {onboardingData.felix_services.recommended.map((service, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-info/10 rounded-lg">
                    <Plus className="h-4 w-4 text-info" />
                    <span className="text-sm">{service}</span>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  const renderMaterialBreakdown = (materialData: MaterialBreakdownData) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {materialData.cost_breakdown && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-brand-primary" />
              Material Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materialData.cost_breakdown.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(item.price)}</TableCell>
                    <TableCell>{item.store}</TableCell>
                    <TableCell>
                      <Badge variant={item.availability === 'In Stock' ? 'default' : 'secondary'}>
                        {item.availability}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {materialData.labor_estimate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-secondary" />
              Labor Estimate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Total Hours</span>
                <p className="text-2xl font-bold">{materialData.labor_estimate.hours}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Hourly Rate</span>
                <p className="text-2xl font-bold">{formatCurrency(materialData.labor_estimate.rate)}</p>
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-muted-foreground">Complexity Level</span>
              <Badge variant="outline" className="ml-2">
                {materialData.labor_estimate.complexity}
              </Badge>
            </div>
            
            <div>
              <span className="text-sm font-medium text-muted-foreground">Required Skills</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {materialData.labor_estimate.skill_requirements.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {materialData.timeline && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-primary" />
              Project Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-sm font-medium text-muted-foreground">Total Duration</span>
              <p className="text-xl font-bold">{materialData.timeline.total_days} days</p>
            </div>
            
            <div className="space-y-3">
              {materialData.timeline.phases.map((phase, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{phase.name}</h4>
                    <p className="text-sm text-muted-foreground">{phase.duration} days</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  const renderRexLeadDashboard = (rexData: RexLeadData) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-primary">{rexData.total_leads}</p>
              <p className="text-sm text-muted-foreground">Total Leads</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{rexData.qualified_leads}</p>
              <p className="text-sm text-muted-foreground">Qualified</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-info">{formatPercentage(rexData.conversion_rate)}</p>
              <p className="text-sm text-muted-foreground">Conversion</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{formatCurrency(rexData.avg_lead_value)}</p>
              <p className="text-sm text-muted-foreground">Avg Value</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-foreground">{formatCurrency(rexData.pipeline_value)}</p>
              <p className="text-sm text-muted-foreground">Pipeline</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand-primary" />
            Geographic Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Avg Value</TableHead>
                <TableHead>Competition</TableHead>
                <TableHead>Drive Time</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rexData.geographic_breakdown.map((area, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{area.area}</TableCell>
                  <TableCell>{area.count}</TableCell>
                  <TableCell>{formatCurrency(area.avg_value)}</TableCell>
                  <TableCell>
                    <Badge variant={area.competition === 'low' ? 'default' : area.competition === 'medium' ? 'secondary' : 'destructive'}>
                      {area.competition}
                    </Badge>
                  </TableCell>
                  <TableCell>{area.drive_time}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{area.opportunity_score}/10</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderLeadCards = (leads: LeadData[]) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {leads.map((lead, index) => (
        <motion.div
          key={lead.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg leading-tight">{lead.title}</CardTitle>
                <Badge variant={lead.urgency === 'high' ? 'destructive' : lead.urgency === 'medium' ? 'secondary' : 'default'}>
                  {lead.urgency}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>{lead.budget_range}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{lead.location}</span>
                <span>•</span>
                <span>{lead.distance}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <Badge variant="outline">{lead.felix_category}</Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">{lead.quality_score}/10</span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <Button className="w-full bg-brand-primary hover:bg-brand-primary/90">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );

  const renderActions = () => {
    if (!actions || actions.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 pt-4 border-t">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.style === 'primary' ? 'default' : action.style === 'secondary' ? 'secondary' : 'outline'}
            disabled={action.disabled}
            className={action.style === 'primary' ? 'bg-brand-primary hover:bg-brand-primary/90' : ''}
          >
            {action.label}
          </Button>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (type) {
      case 'lexi_onboarding_wizard':
        return renderOnboardingWizard(data as OnboardingData);
      case 'alex_material_breakdown':
        return renderMaterialBreakdown(data as MaterialBreakdownData);
      case 'rex_lead_dashboard':
        return renderRexLeadDashboard(data as RexLeadData);
      case 'lead_cards':
        return renderLeadCards(data as LeadData[]);
      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Unsupported asset type: {type}
                </p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-4">
      {renderContent()}
      {renderActions()}
    </div>
  );
};

export default GenerativeAgentAssets;
