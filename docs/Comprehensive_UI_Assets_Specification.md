# Generative UI Assets Specification - Complete Agent System

## Overview
This document defines the comprehensive generative UI asset system for all three FixItForMe agents (Lexi, Alex, Rex), explaining the rationale for each component and their specific use cases within the contractor workflow.

## Design Philosophy & Rationale

### Why Generative UI Assets?
1. **Dynamic Content**: Each contractor interaction requires personalized, context-aware responses
2. **Data Visualization**: Complex cost breakdowns, analytics, and timelines need interactive charts
3. **Action-Oriented**: Every UI asset includes clear next steps and actionable buttons
4. **Brand Consistency**: All components follow FixItForMe design system with agent-specific colors
5. **Mobile Responsiveness**: Components adapt to desktop-primary but remain functional on tablets

### Component Architecture
\`\`\`typescript
interface GenerativeUIAsset {
  type: string;
  agent: 'lexi' | 'alex' | 'rex';
  data: any;
  actions?: UIAction[];
  metadata: {
    generation_time: string;
    confidence_level: 'low' | 'medium' | 'high';
    requires_update: boolean;
  };
}

interface UIAction {
  type: string;
  label: string;
  style: 'primary' | 'secondary' | 'tertiary';
  handler?: string;
  payload?: any;
}
\`\`\`

---

## Lexi the Liaison - UI Assets

### **Rationale**: Lexi guides contractors through complex onboarding and system learning processes. Her UI assets focus on progress tracking, education, and smooth workflow transitions.

### 1. LexiOnboarding Component
**Purpose**: Track comprehensive contractor onboarding progress with Felix framework integration
**When Used**: Initial signup, profile completion, feature discovery

\`\`\`typescript
interface LexiOnboardingData {
  overall_progress: number; // 0-100 percentage
  current_step: 'welcome' | 'profile_basic' | 'service_selection' | 'territory_setup' | 'document_upload' | 'tier_selection' | 'completion';
  steps_completed: string[];
  felix_services: {
    selected: number[]; // Felix problem IDs
    recommended: number[]; // AI-recommended based on location/experience
    categories: FelixCategory[];
    tier_limit: number; // 5 for Growth, 15 for Scale
  };
  profile_score: number; // Completion percentage for profile strength
  estimated_time_remaining: number; // Minutes to complete
  benefits_unlocked: string[]; // Features available at current completion level
}

// Example UI Asset Response
{
  type: 'lexi_onboarding',
  data: {
    overall_progress: 75,
    current_step: 'service_selection',
    felix_services: {
      selected: [1, 5, 12, 25], // Toilet repair, cabinet fix, drywall, kitchen remodel
      recommended: [3, 7, 15], // Based on location demand
      categories: [
        { id: 1, name: "Toilet won't stop running", difficulty: "easy", avg_value: 45 },
        { id: 25, name: "Kitchen remodel", difficulty: "complex", avg_value: 8500 }
      ],
      tier_limit: 5 // Growth tier
    },
    profile_score: 78,
    estimated_time_remaining: 8
  },
  actions: [
    { type: "continue_onboarding", label: "Continue Setup", style: "primary" },
    { type: "save_and_resume", label: "Save Progress", style: "secondary" }
  ]
}
\`\`\`

### 2. LexiSystemGuide Component
**Purpose**: Provide contextual help and feature education throughout the platform
**When Used**: Feature introduction, tier upgrade explanations, workflow guidance

\`\`\`typescript
interface LexiSystemGuideData {
  guide_type: 'feature_intro' | 'tier_comparison' | 'workflow_help' | 'tips_and_tricks';
  title: string;
  content_sections: GuideSection[];
  interactive_elements: InteractiveDemo[];
  related_features: RelatedFeature[];
  completion_tracking: boolean;
}

// Example: Tier Comparison Guide
{
  type: 'lexi_system_guide',
  data: {
    guide_type: 'tier_comparison',
    title: 'Growth vs Scale: Which Tier is Right for You?',
    content_sections: [
      {
        heading: 'Lead Generation Capacity',
        growth_features: ['Manual lead viewing', 'Basic Felix categories'],
        scale_features: ['Rex automated search', '10 searches/month', 'Advanced analytics']
      }
    ],
    interactive_elements: [
      { type: 'cost_calculator', description: 'Calculate your ROI for Scale tier' }
    ]
  },
  actions: [
    { type: "upgrade_to_scale", label: "Upgrade Now", style: "primary" },
    { type: "learn_more", label: "See All Features", style: "secondary" }
  ]
}
\`\`\`

### 3. LexiNotification Component  
**Purpose**: System messages, limit notifications, and conversational enforcement
**When Used**: Chat limits reached, tier restrictions, system status updates

\`\`\`typescript
interface LexiNotificationData {
  notification_type: 'limit_reached' | 'system_update' | 'tip' | 'celebration';
  severity: 'info' | 'warning' | 'success' | 'error';
  message: string;
  explanation?: string;
  resolution_options: ResolutionOption[];
  dismissible: boolean;
}

// Example: Chat Limit Reached
{
  type: 'lexi_notification',
  data: {
    notification_type: 'limit_reached',
    severity: 'warning',
    message: 'You\'ve reached your Growth tier limit of 10 chat sessions.',
    explanation: 'To continue chatting, you can either close an existing conversation or upgrade to Scale tier for 30 concurrent chats.',
    resolution_options: [
      { action: 'view_existing_chats', label: 'Manage Chats' },
      { action: 'upgrade_tier', label: 'Upgrade to Scale' }
    ]
  }
}
\`\`\`

---

## Alex the Assessor - UI Assets

### **Rationale**: Alex provides detailed analytical data requiring sophisticated visualizations for cost breakdowns, timelines, and competitive analysis. His UI assets emphasize precision and actionable insights.

### 1. AlexCostBreakdown Component
**Purpose**: Comprehensive project cost analysis with interactive breakdown charts
**When Used**: Bid analysis, cost estimation requests, project planning

\`\`\`typescript
interface AlexCostBreakdownData {
  project_title: string;
  total_estimate: number;
  confidence_level: 'low' | 'medium' | 'high';
  breakdown: {
    materials: MaterialCost[];
    labor: LaborCost[];
    permits: PermitCost[];
    overhead: OverheadCost[];
    profit: ProfitAnalysis;
  };
  market_comparison: MarketComparison;
  risk_factors: RiskFactor[];
  optimization_suggestions: OptimizationSuggestion[];
}

interface MaterialCost {
  category: string;
  items: MaterialItem[];
  subtotal: number;
  supplier_options: SupplierOption[];
}

// Example UI Asset Response
{
  type: 'alex_cost_breakdown',
  data: {
    project_title: "Kitchen Renovation - Oakland Hills",
    total_estimate: 15750,
    confidence_level: "high",
    breakdown: {
      materials: [
        {
          category: "Cabinets & Hardware",
          items: [
            { name: "Kitchen Cabinet Set", quantity: 1, unit_cost: 3200, supplier: "Home Depot" },
            { name: "Cabinet Hardware", quantity: 12, unit_cost: 25, supplier: "Lowes" }
          ],
          subtotal: 3500
        }
      ],
      labor: {
        installation_hours: 32,
        hourly_rate: 75,
        subtotal: 2400
      },
      profit: {
        margin_percentage: 20,
        amount: 1575
      }
    },
    market_comparison: {
      your_bid: 15750,
      market_average: 16200,
      competitive_position: "slightly_below_market"
    },
    risk_factors: [
      { factor: "Electrical upgrade may be needed", probability: 0.3, cost_impact: 800 }
    ]
  },
  actions: [
    { type: "create_formal_bid", label: "Generate Proposal", style: "primary" },
    { type: "adjust_pricing", label: "Modify Pricing", style: "secondary" },
    { type: "research_materials", label: "Find Better Suppliers", style: "tertiary" }
  ]
}
\`\`\`

### 2. AlexTimelineChart Component
**Purpose**: Project scheduling visualization with critical path analysis
**When Used**: Timeline planning, client communication, resource scheduling

\`\`\`typescript
interface AlexTimelineData {
  project_duration: number; // Total days
  phases: ProjectPhase[];
  critical_path: CriticalPathItem[];
  resource_conflicts: ResourceConflict[];
  seasonal_considerations: SeasonalFactor[];
}

interface ProjectPhase {
  name: string;
  start_date: Date;
  end_date: Date;
  duration_days: number;
  progress: number; // 0-100 if project is active
  dependencies: string[];
  resource_requirements: ResourceRequirement[];
  risk_level: 'low' | 'medium' | 'high';
}

// Example Timeline Response
{
  type: 'alex_timeline_chart',
  data: {
    project_duration: 12,
    phases: [
      {
        name: "Demo & Prep",
        start_date: "2025-07-15",
        end_date: "2025-07-18",
        duration_days: 4,
        progress: 100,
        dependencies: [],
        risk_level: "low"
      },
      {
        name: "Cabinet Installation", 
        start_date: "2025-07-19",
        end_date: "2025-07-25",
        duration_days: 7,
        progress: 60,
        dependencies: ["Demo & Prep"],
        risk_level: "medium"
      }
    ],
    critical_path: [
      { task: "Cabinet delivery", date: "2025-07-18", importance: "Project cannot start without this" }
    ]
  },
  actions: [
    { type: "optimize_schedule", label: "Optimize Timeline", style: "primary" },
    { type: "export_schedule", label: "Export to Calendar", style: "secondary" }
  ]
}
\`\`\`

### 3. AlexMarketAnalysis Component
**Purpose**: Competitive intelligence and pricing strategy recommendations
**When Used**: Bid strategy development, market positioning, pricing optimization

\`\`\`typescript
interface AlexMarketAnalysisData {
  service_area: string;
  competition_level: 'low' | 'medium' | 'high';
  pricing_insights: PricingInsight[];
  demand_trends: DemandTrend[];
  positioning_strategy: PositioningStrategy;
  seasonal_factors: SeasonalFactor[];
}

// Example Market Analysis
{
  type: 'alex_market_analysis',
  data: {
    service_area: "Oakland Hills",
    competition_level: "medium",
    pricing_insights: [
      { service: "Kitchen Remodel", market_range: [12000, 18000], your_position: "competitive" }
    ],
    demand_trends: [
      { period: "Q3 2025", demand_level: "high", primary_services: ["kitchen", "bathroom"] }
    ],
    positioning_strategy: {
      recommended_approach: "premium_quality",
      differentiators: ["Licensed electrician on team", "5-year warranty"]
    }
  },
  actions: [
    { type: "adjust_pricing_strategy", label: "Update Pricing", style: "primary" },
    { type: "explore_market_gaps", label: "Find Opportunities", style: "secondary" }
  ]
}
\`\`\`

---

## Rex the Retriever - UI Assets

### **Rationale**: Rex focuses on lead generation analytics and performance tracking. His UI assets emphasize data-driven insights and actionable lead intelligence.

### 1. RexLeadDashboard Component
**Purpose**: Comprehensive lead generation performance analytics and KPI tracking
**When Used**: Performance reviews, strategy optimization, monthly reporting

\`\`\`typescript
interface RexLeadDashboardData {
  summary: LeadSummary;
  geographic_breakdown: GeographicLead[];
  trending_problems: TrendingProblem[];
  source_performance: SourcePerformance[];
  monthly_sessions: SessionUsage;
  conversion_analytics: ConversionAnalytics;
}

interface LeadSummary {
  total_leads: number;
  qualified_leads: number;
  conversion_rate: number;
  average_lead_value: number;
  total_pipeline_value: number;
}

// Example Dashboard Response
{
  type: 'rex_lead_dashboard',
  data: {
    summary: {
      total_leads: 47,
      qualified_leads: 23,
      conversion_rate: 0.34,
      average_lead_value: 3800,
      total_pipeline_value: 87400
    },
    geographic_breakdown: [
      { area: "Oakland Hills", count: 12, avg_value: 5200, competition: "medium" },
      { area: "Berkeley", count: 8, avg_value: 4100, competition: "high" }
    ],
    trending_problems: [
      { felix_id: 25, name: "Kitchen remodel", growth: "+15%", season: "summer_peak" },
      { felix_id: 12, name: "Drywall repair", growth: "+8%", season: "year_round" }
    ],
    monthly_sessions: {
      used: 8,
      remaining: 2,
      tier: "scale",
      resets_on: "2025-08-01"
    }
  },
  actions: [
    { type: "generate_leads", label: "Run Lead Search", style: "primary" },
    { type: "analyze_trends", label: "Deep Dive Analytics", style: "secondary" }
  ]
}
\`\`\`

### 2. RexLeadCard Component
**Purpose**: Individual lead display with all relevant information and action buttons
**When Used**: Lead feed display, search results, lead management

\`\`\`typescript
interface RexLeadCardData {
  lead_id: string;
  title: string;
  description: string;
  estimated_value: number;
  posted_time: Date;
  recency_score: number;
  location: LeadLocation;
  contact_method: ContactMethod;
  felix_categories: number[];
  urgency_level: 'low' | 'medium' | 'high' | 'urgent';
  quality_score: number;
  relevance_score: number;
  source_platform: string;
  competition_estimate: 'low' | 'medium' | 'high';
}

// Example Lead Card Response
{
  type: 'rex_lead_card',
  data: {
    lead_id: "lead_12345",
    title: "Kitchen Cabinet Installation - Urgent",
    description: "Need experienced contractor for full kitchen cabinet installation. 12x15 kitchen, white shaker style cabinets already purchased...",
    estimated_value: 4500,
    posted_time: "2025-06-23T14:30:00Z",
    recency_score: 0.95, // Posted 2 hours ago
    location: {
      city: "Oakland",
      neighborhood: "Montclair",
      distance_miles: 8.2
    },
    contact_method: {
      type: "phone",
      value: "(510) 555-0123",
      preferred_time: "weekday_evenings"
    },
    felix_categories: [25], // Kitchen remodel
    urgency_level: "high",
    quality_score: 0.85,
    relevance_score: 0.92,
    source_platform: "craigslist",
    competition_estimate: "medium"
  },
  actions: [
    { type: "contact_lead", label: "Contact Client", style: "primary" },
    { type: "save_for_later", label: "Save Lead", style: "secondary" },
    { type: "get_directions", label: "Get Directions", style: "tertiary" }
  ]
}
\`\`\`

### 3. RexMarketIntelligence Component
**Purpose**: Geographic market analysis and opportunity identification
**When Used**: Market expansion planning, service area optimization, strategic planning

\`\`\`typescript
interface RexMarketIntelligenceData {
  analysis_area: string;
  market_opportunities: MarketOpportunity[];
  competition_mapping: CompetitionMap[];
  demand_heatmap: DemandZone[];
  expansion_recommendations: ExpansionRecommendation[];
  seasonal_insights: SeasonalInsight[];
}

// Example Market Intelligence Response
{
  type: 'rex_market_intelligence',
  data: {
    analysis_area: "East Bay Region",
    market_opportunities: [
      {
        location: "Alameda",
        opportunity_score: 0.87,
        primary_demand: ["plumbing", "electrical"],
        competition_level: "low",
        avg_project_value: 3200
      }
    ],
    demand_heatmap: [
      { zone: "Oakland Hills", demand_intensity: "high", primary_services: ["kitchen", "bathroom"] }
    ],
    expansion_recommendations: [
      {
        target_area: "San Leandro",
        rationale: "High demand, low competition, 15-minute drive from current base",
        estimated_roi: "25% increase in monthly leads"
      }
    ]
  },
  actions: [
    { type: "expand_service_area", label: "Add Service Area", style: "primary" },
    { type: "schedule_analysis", label: "Schedule Deep Dive", style: "secondary" }
  ]
}
\`\`\`

---

## Pre-Prompt System Implementation

### Universal Pre-Prompt Architecture
Each agent provides exactly **3 contextual pre-prompts** after every response to guide the contractor toward productive next actions.

\`\`\`typescript
interface PrePromptSystem {
  agent: 'lexi' | 'alex' | 'rex';
  context_aware: boolean;
  prompts: PrePrompt[];
}

interface PrePrompt {
  emoji: string;
  category: string;
  suggestion: string;
  expected_outcome: string;
}

// Lexi's Pre-Prompts (Onboarding & System Guidance)
const lexiPrePrompts = [
  {
    emoji: "🎯",
    category: "Profile Optimization",
    suggestion: "Help me complete my contractor profile for better lead matching",
    expected_outcome: "Improved lead relevance and higher conversion rates"
  },
  {
    emoji: "📚", 
    category: "Feature Discovery",
    suggestion: "Show me how Alex and Rex can help grow my business",
    expected_outcome: "Understanding of platform capabilities and ROI potential"
  },
  {
    emoji: "💼",
    category: "Business Strategy",
    suggestion: "Guide me through Growth vs Scale tier benefits",
    expected_outcome: "Clear understanding of upgrade value proposition"
  }
];

// Alex's Pre-Prompts (Cost Analysis & Bidding)
const alexPrePrompts = [
  {
    emoji: "🔍",
    category: "Material Research",
    suggestion: "Find alternative suppliers for [specific material] to optimize costs",
    expected_outcome: "Lower material costs and improved profit margins"
  },
  {
    emoji: "📊",
    category: "Project Analysis", 
    suggestion: "Break down this project into manageable phases with timelines",
    expected_outcome: "Better project planning and client communication"
  },
  {
    emoji: "💰",
    category: "Pricing Strategy",
    suggestion: "Analyze how I can improve my profit margin on this type of work",
    expected_outcome: "Optimized pricing strategy and competitive positioning"
  }
];

// Rex's Pre-Prompts (Lead Generation & Analytics)
const rexPrePrompts = [
  {
    emoji: "📊",
    category: "Performance Analysis",
    suggestion: "Show me which lead sources perform best for my specific services",
    expected_outcome: "Data-driven lead generation strategy optimization"
  },
  {
    emoji: "🎯",
    category: "Search Optimization",
    suggestion: "How can I find more high-value leads in my target areas?",
    expected_outcome: "Improved lead quality and higher-value opportunities"
  },
  {
    emoji: "📈",
    category: "Growth Tracking",
    suggestion: "Compare my conversion rates and performance to last month",
    expected_outcome: "Clear business growth metrics and improvement areas"
  }
];
\`\`\`

### Context-Aware Pre-Prompt Selection
\`\`\`typescript
class PrePromptEngine {
  generateContextualPrompts(agent: Agent, conversation_context: ConversationContext): PrePrompt[] {
    const basePrompts = this.getBasePrompts(agent);
    const contextualPrompts = this.analyzeContext(conversation_context);
    
    return this.selectOptimalPrompts(basePrompts, contextualPrompts, 3);
  }
  
  private analyzeContext(context: ConversationContext): ContextualInsight {
    return {
      current_phase: this.identifyWorkflowPhase(context),
      user_skill_level: this.assessSkillLevel(context),
      immediate_needs: this.identifyImmediateNeeds(context),
      suggested_next_steps: this.recommendNextSteps(context)
    };
  }
}
\`\`\`

This comprehensive UI asset system ensures that each agent provides precisely the right visual and interactive components for their specific role while maintaining consistent branding and user experience patterns throughout the platform.
