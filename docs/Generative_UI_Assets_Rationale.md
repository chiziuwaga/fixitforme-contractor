# Generative UI Assets Rationale for FixItForMe Agents

## Overview
Each agent returns specific UI components that transform raw AI output into interactive, professional interfaces. This document explains what each agent generates, why these specific components were chosen, and how they create value for contractors.

---

## Alex the Assessor - Generative UI Assets

### Primary Components Generated

#### 1. **AlexCostBreakdown** - The Core Bidding Interface
\`\`\`typescript
<AlexCostBreakdown 
  data={{
    project_title: "Kitchen Renovation - Oakland Hills",
    total_estimate: 15750,
    confidence_level: "high",
    breakdown: {
      labor: {cost: 6000, hours: 75, rate: 80},
      materials: [
        {
          category: "Cabinets & Hardware",
          items: [
            {name: "Upper cabinets", qty: 8, unit: "linear ft", cost: 2400},
            {name: "Base cabinets", qty: 12, unit: "linear ft", cost: 3600},
            {name: "Cabinet hardware", qty: 20, unit: "pieces", cost: 300}
          ]
        }
      ],
      permits: 350,
      overhead: 1500,
      profit: 2000
    },
    timeline: {
      start: "2025-07-15",
      end: "2025-07-25", 
      duration: "8 business days"
    },
    risk_factors: ["Electrical upgrade may be needed", "Plumbing relocation required"]
  }}
  actions={[
    {type: "create_formal_bid", label: "Generate Formal Proposal", style: "primary"},
    {type: "adjust_pricing", label: "Modify Pricing Strategy", style: "secondary"},
    {type: "material_research", label: "Research Current Prices", style: "outline"}
  ]}
/>
\`\`\`

**Why This Component:**
- **Professional Presentation**: Transforms Alex's analysis into client-ready format
- **Interactive Editing**: Contractors can adjust estimates in real-time
- **Detailed Transparency**: Shows exactly how the estimate was calculated
- **Risk Awareness**: Highlights potential cost overruns before bidding
- **Action-Oriented**: Direct paths to formal proposal generation

#### 2. **MaterialResearchPanel** - AgentQL Integration Results
\`\`\`typescript
<MaterialResearchPanel
  data={{
    research_timestamp: "2025-06-23T10:30:00Z",
    materials: [
      {
        item: "Kitchen Cabinets - Shaker Style",
        suppliers: [
          {name: "Home Depot", price: 2400, availability: "in_stock", delivery: "3-5 days"},
          {name: "Lowe's", price: 2280, availability: "limited", delivery: "7-10 days"},
          {name: "Local Supplier", price: 2100, availability: "custom_order", delivery: "2-3 weeks"}
        ],
        market_trend: "stable",
        professional_discount: 15,
        recommendation: "Book Lowe's pricing - good balance of cost and timing"
      }
    ],
    market_alerts: [
      "Lumber prices down 8% this month - good time for structural work",
      "Appliance delivery delays expected through Q3 - order early"
    ]
  }}
/>
\`\`\`

**Why This Component:**
- **Real-Time Intelligence**: Live pricing data prevents outdated estimates
- **Supplier Comparison**: Helps contractors choose best value suppliers
- **Market Timing**: Alerts contractors to favorable pricing conditions
- **Professional Insights**: Leverages AgentQL research for competitive advantage

#### 3. **TimelineChart** - Project Scheduling Visualization
\`\`\`typescript
<TimelineChart
  phases={[
    {name: "Demo & Prep", start: new Date("2025-07-15"), end: new Date("2025-07-18"), progress: 100, status: "completed"},
    {name: "Rough-In Work", start: new Date("2025-07-19"), end: new Date("2025-07-22"), progress: 60, status: "in_progress"},
    {name: "Installation", start: new Date("2025-07-23"), end: new Date("2025-07-25"), progress: 0, status: "pending"}
  ]}
  dependencies={[
    {from: "Demo & Prep", to: "Rough-In Work", type: "finish_to_start"},
    {from: "Rough-In Work", to: "Installation", type: "finish_to_start"}
  ]}
  critical_path={["Demo & Prep", "Rough-In Work", "Installation"]}
  weather_impact={true}
  permit_delays={["Electrical inspection required before rough-in completion"]}
/>
\`\`\`

**Why This Component:**
- **Visual Planning**: Clear project timeline helps contractors and clients
- **Dependency Management**: Shows how delays cascade through project
- **Risk Mitigation**: Identifies potential scheduling conflicts early
- **Client Communication**: Professional timeline builds confidence

#### 4. **RiskAnalysis** - Project Risk Assessment
\`\`\`typescript
<RiskAnalysis
  data={{
    overall_risk: "medium",
    risk_factors: [
      {
        category: "technical",
        description: "Electrical panel upgrade may be needed",
        probability: 0.6,
        impact: 1500,
        mitigation: "Electrical inspection before demo phase"
      },
      {
        category: "schedule", 
        description: "Custom cabinet lead time",
        probability: 0.3,
        impact: 2000,
        mitigation: "Order cabinets immediately upon contract signing"
      }
    ],
    contingency_recommended: 2250,
    insurance_requirements: ["General liability", "Workers compensation"]
  }}
/>
\`\`\`

**Why This Component:**
- **Professional Risk Management**: Shows contractor understands project complexities
- **Accurate Pricing**: Incorporates risk-based contingencies
- **Client Trust**: Transparent about potential issues builds credibility
- **Legal Protection**: Documents known risks for both parties

---

## Rex the Retriever - Generative UI Assets

### Primary Components Generated

#### 1. **RexLeadDashboard** - Performance Analytics Hub
\`\`\`typescript
<RexLeadDashboard
  data={{
    summary: {
      total_leads: 47,
      qualified_leads: 23,
      conversion_rate: 0.34,
      average_value: 8500,
      search_sessions_used: 8,
      search_sessions_remaining: 22
    },
    geographic_breakdown: [
      {area: "Oakland Hills", count: 12, avg_value: 12000, competition: "medium", drive_time: "15min"},
      {area: "Berkeley", count: 8, avg_value: 7500, competition: "high", drive_time: "25min"},
      {area: "Richmond", count: 6, avg_value: 5500, competition: "low", drive_time: "30min"}
    ],
    trending_problems: [
      {felix_id: 15, name: "Kitchen Renovation", demand_change: "+23%", avg_value: 15000},
      {felix_id: 32, name: "Bathroom Remodel", demand_change: "+12%", avg_value: 8500},
      {felix_id: 8, name: "Roof Repair", demand_change: "-5%", avg_value: 6000}
    ],
    lead_sources: [
      {source: "Craigslist", count: 28, quality: 0.65, conversion: 0.42},
      {source: "Facebook Marketplace", count: 12, quality: 0.55, conversion: 0.28},
      {source: "Referrals", count: 7, quality: 0.95, conversion: 0.85}
    ]
  }}
  actions={[
    {type: "generate_leads", label: "Run Lead Generation", style: "primary"},
    {type: "optimize_targeting", label: "Optimize Search Parameters", style: "secondary"}
  ]}
/>
\`\`\`

**Why This Component:**
- **Business Intelligence**: Shows contractors their market performance
- **Strategic Planning**: Geographic and service demand insights
- **ROI Tracking**: Which lead sources provide best return
- **Tier Management**: Displays remaining search session allowance

#### 2. **LeadCard** - Individual Lead Display
\`\`\`typescript
<LeadCard
  data={{
    id: "lead_12345",
    title: "Kitchen Remodel - Urgent",
    location: "Oakland Hills",
    estimated_value: 12000,
    urgency: "high",
    posted_time: "2 hours ago",
    recency_score: 95,
    quality_score: 88,
    contact_method: "phone",
    contact_info: "(510) 555-0123",
    description: "Complete kitchen renovation needed ASAP. Cabinets, countertops, flooring...",
    felix_categories: [15, 23, 31], // Kitchen, Flooring, Electrical
    competition_level: "medium",
    client_type: "homeowner",
    budget_confirmed: true,
    timeline: "Start within 2 weeks"
  }}
  actions={[
    {type: "contact_lead", label: "Contact Now", style: "primary"},
    {type: "save_lead", label: "Save for Later", style: "secondary"},
    {type: "analyze_project", label: "Get Alex Analysis", style: "outline"}
  ]}
/>
\`\`\`

**Why This Component:**
- **Instant Qualification**: All key lead info at a glance
- **Recency Priority**: Visual indicators for fresh leads
- **Quick Action**: Direct contact methods prominently displayed
- **Integration Ready**: Links to Alex for immediate project analysis

#### 3. **LeadDistributionChart** - Geographic Intelligence
\`\`\`typescript
<LeadDistributionChart
  data={[
    {area: "Oakland Hills", count: 12, avg_value: 12000, competition: "medium", lat: 37.8199, lng: -122.2483},
    {area: "Berkeley", count: 8, avg_value: 7500, competition: "high", lat: 37.8715, lng: -122.2730},
    {area: "Richmond", count: 6, avg_value: 5500, competition: "low", lat: 37.9358, lng: -122.3477}
  ]}
  contractor_location={{lat: 37.8044, lng: -122.2712}}
  drive_time_overlay={true}
  animated={true}
  interactive={true}
/>
\`\`\`

**Why This Component:**
- **Market Intelligence**: Visual understanding of opportunity distribution
- **Strategic Planning**: Identifies under-served high-value areas
- **Efficiency Optimization**: Shows drive times for territory planning
- **Competitive Analysis**: Competition density mapping

---

## Lexi the Liaison - Generative UI Assets

### Primary Components Generated

#### 1. **LexiOnboarding** - Progress Tracking Interface
\`\`\`typescript
<LexiOnboarding
  data={{
    overall_progress: 75,
    current_step: "service_selection",
    completed_steps: ["basic_info", "business_details", "service_areas"],
    remaining_steps: ["service_selection", "document_upload", "tier_selection"],
    felix_services: {
      selected: ["Kitchen remodel", "Bathroom renovation", "Tile work"],
      recommended: ["Plumbing repair", "Electrical work", "HVAC maintenance"],
      available_growth: 5,
      available_scale: 15,
      current_tier: "growth"
    },
    profile_strength: {
      score: 68,
      missing_elements: ["Business license upload", "Insurance certificate", "Work portfolio"],
      impact: "Complete profile gets 40% more lead matches"
    }
  }}
  actions={[
    {type: "continue_onboarding", label: "Continue Setup", style: "primary"},
    {type: "save_progress", label: "Save & Continue Later", style: "secondary"},
    {type: "upgrade_tier", label: "Upgrade to Scale", style: "outline"}
  ]}
/>
\`\`\`

**Why This Component:**
- **Progress Motivation**: Clear visual progress encourages completion
- **Strategic Guidance**: Shows impact of profile completion on lead matching
- **Tier Education**: Explains benefits of service selection limits
- **Flexibility**: Allows saving progress for busy contractors

#### 2. **SystemMessage** - Conversational Limit Enforcement
\`\`\`typescript
<SystemMessage
  type="limit_reached"
  data={{
    limit_type: "messages_per_chat",
    current_count: 50,
    limit: 50,
    tier: "growth",
    message: "You've reached the 50-message limit for this conversation on the Growth tier.",
    options: [
      {
        action: "start_new_chat",
        label: "Start New Chat",
        description: "Continue with a fresh conversation thread"
      },
      {
        action: "upgrade_tier", 
        label: "Upgrade to Scale",
        description: "Get 200 messages per chat + premium features"
      }
    ],
    upgrade_benefits: [
      "200 messages per chat thread (vs 50)",
      "30 concurrent chats (vs 10)", 
      "Rex lead generation access",
      "Alex advanced bidding tools"
    ]
  }}
/>
\`\`\`

**Why This Component:**
- **Graceful Degradation**: Limits don't break the experience
- **Clear Options**: User always has a path forward
- **Value Communication**: Explains exactly what upgrade provides
- **Conversational**: Maintains chat-centric experience

#### 3. **FeatureEducation** - Platform Capability Training
\`\`\`typescript
<FeatureEducation
  data={{
    agent: "alex",
    capabilities: [
      {
        category: "Cost Analysis",
        description: "Get detailed material and labor breakdowns for any project",
        example: "Analyze this bathroom remodel for competitive pricing",
        value: "Win more bids with accurate estimates"
      },
      {
        category: "Material Research", 
        description: "Real-time pricing from Home Depot, Lowe's, and local suppliers",
        example: "Research current cabinet prices for kitchen renovation",
        value: "Always bid with up-to-date material costs"
      }
    ],
    usage_tips: [
      "Be specific about project details for better analysis",
      "Include location for accurate material pricing",
      "Ask about risks and contingencies"
    ],
    next_steps: [
      "Try asking: 'Analyze this kitchen remodel project'",
      "Or: 'What materials do I need for bathroom renovation?'",
      "Or: 'Help me price this electrical upgrade job'"
    ]
  }}
/>
\`\`\`

**Why This Component:**
- **User Education**: Helps contractors understand agent capabilities
- **Usage Examples**: Provides specific prompts that work well
- **Value Articulation**: Shows business impact of each feature
- **Guided Discovery**: Encourages effective agent interaction

---

## Three Pre-Prompts System

### Implementation Strategy
After each agent response, the system automatically generates three contextual follow-up prompts:

\`\`\`typescript
// Dynamic prompt generation based on conversation context
function generateThreePrompts(agentType: string, lastResponse: any, contractorProfile: any): string[] {
  const promptTemplates = {
    alex: {
      after_cost_breakdown: [
        "Adjust pricing strategy for faster timeline",
        "Research alternative materials to reduce costs", 
        "Analyze potential risks and contingencies"
      ],
      after_material_research: [
        "Create formal bid proposal with these prices",
        "Compare with my usual suppliers",
        "Calculate profit margins at different price points"
      ]
    },
    rex: {
      after_lead_analysis: [
        "Run targeted search for similar projects",
        "Show me geographic lead distribution",
        "Analyze my conversion rates by lead source"
      ],
      after_dashboard_view: [
        "Generate leads matching my top services",
        "Optimize my service area targeting",
        "Review my lead response performance"
      ]
    },
    lexi: {
      after_onboarding_step: [
        "Continue to next setup step",
        "Explain Scale tier benefits in detail",
        "Help me optimize my service selection"
      ],
      after_feature_education: [
        "Show me how to use Alex for bidding",
        "Demonstrate Rex lead generation",
        "Complete my contractor profile setup"
      ]
    }
  };
  
  return promptTemplates[agentType][lastResponse.context] || [
    "Tell me more about this",
    "How can I optimize this further?",
    "What should I do next?"
  ];
}
\`\`\`

This generative UI system transforms raw AI output into professional, interactive interfaces that provide immediate business value to contractors while maintaining the conversational, chat-centric experience that makes the platform approachable and efficient.
