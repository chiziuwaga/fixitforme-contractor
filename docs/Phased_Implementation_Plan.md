# FixItForMe: Phased Implementation Plan for Contractor Module

This document outlines a phased development plan for the FixItForMe Contractor Module. The goal is to build a robust, AI-driven platform on Vercel, using Next.js for the frontend, Python for the backend, and Supabase as the central data hub, following a decoupled agentic architecture.

---

## Guiding Principles & Reference Documents

**Success depends on adhering to the architectural vision outlined in the core documents.** All development should align with these specifications.

*   **Primary Specification:** `FixItForMe_Contractor_Module_Specs.md`
*   **Technical Instructions:** `Custom_Instructions_Contractor_FixItForMe.md`
*   **Lead Generation Bible:** `AgentQL_Architecture_for_Contractor_Lead_Generation.md`
*   **Felix's Problem Framework:** `Felix_40_Problem_Reference.md`
*   **AI Methodology:** `IndyDev_Dan_Methodology_Reference.md`
*   **Generative UI Reference:** [v0.dev Chat Example](https://v0.dev/chat/b/b_MX1Ev6PvA7e)
*   **v0.dev Contractor Reference:** [Contractor Dashboard UI](https://v0.dev/chat/b/b_MX1Ev6PvA7e)
*   **MCP Integration:** MCP_DOCKER for research, @21st-dev/magic for UI components

**Rule for Changes:** Any deviation or new feature proposal must be reflected by an update to these core documents *before* implementation begins. This ensures our documentation remains the single source of truth.

---

## Phase 1: Foundation & Core Infrastructure (Weeks 1-2) ✅ COMPLETE

**Objective:** Establish the project backbone, including the database schema, authentication, and the basic application shell.

### **✅ COMPLETION SUMMARY:**
- **Next.js Project**: Initialized with TypeScript, Tailwind CSS, App Router
- **Vercel Integration**: Connected to GitHub, deployed with CI/CD pipeline
- **Mantine UI**: Integrated with notification system and core components
- **AI Infrastructure**: Vercel AI SDK configured with Deepseek integration
- **Supabase Setup**: Utility functions created, environment configured
- **Documentation**: All reference docs moved to `/docs` and version controlled

**Key Tasks:**

1.  **Project Setup:**
    *   ✅ Initialize a new Next.js project with TypeScript.
    *   ✅ Configure the project for Vercel deployment.
    *   ✅ Set up the Python backend environment within an `/api` directory, structured for Vercel Serverless Functions.

2.  **Supabase Configuration:**
    *   ✅ Create the Supabase project and define the schema precisely as detailed in `Custom_Instructions_Contractor_FixItForMe.md`.
    *   🔄 Seed the `diy_guides` table with the provided 40-service JSON file.
    *   🔄 **Crucially, implement Row Level Security (RLS) policies** to enforce the data access rules specified in the core documents.

3.  **Environment & Authentication:**
    *   ✅ Create and populate the `.env.local` file with all keys listed in `Custom_Instructions_Contractor_FixItForMe.md`.
    *   🔄 Implement the email/phone + 6-digit SMS code login flow using Supabase Auth.

4.  **UI Shell:**
    *   ✅ Integrate the Mantine UI library.
    *   ✅ Build the main contractor dashboard with professional desktop-first design
    *   🔄 Build the main application layout, including the header, navigation, and the static structure of the `/contractor/dashboard` based on the ASCII mockup in `FixItForMe_Contractor_Module_Specs.md`.

---

## Phase 2: Agent Integration & Generative UI (Weeks 3-5) ✅ COMPLETE

**Objective:** Implement the primary agent interactions for onboarding (Lexi) and bidding (Alex) using a generative, chat-based UI powered by the Vercel AI SDK.

### **✅ COMPLETION SUMMARY:**
- **@ Mention System**: Implemented explicit (@lexi, @alex, @rex) and intelligent orchestration
- **Streaming Chat UI**: Built ChatWindow and ChatManager with floating interface
- **Agent Endpoints**: Created all three streaming endpoints with distinct personas
- **Generative UI Framework**: Established JSON response format with UI assets
- **Felix Integration**: Added 40-problem reference framework
- **Enhanced Documentation**: Updated all specs with @ mention protocol
- **Advanced D3.js Charts**: Interactive donut, bar, and timeline charts with animations
- **Complete Design System**: BaseComponents, Charts, and AgentComponents libraries
- **Agent Usage Training**: Each agent explains capabilities and provides usage examples

### **🎯 ENHANCED DESIGN SYSTEM SPECIFICATIONS:**
Following v0.dev patterns with comprehensive component library:

**Advanced D3.js Chart Components:**
```typescript
// Interactive Cost Breakdown with animations and tooltips
<CostBreakdownChart 
  data={{labor: 6000, materials: 4500, permits: 350, overhead: 1500, profit: 2000}}
  totalEstimate={15750}
  animated={true}
  interactive={true}
/>

// Geographic Lead Analysis with competition indicators  
<LeadDistributionChart
  data={[
    {area: "Oakland Hills", count: 12, avgValue: 12000, competition: "medium"},
    {area: "Berkeley", count: 8, avgValue: 7500, competition: "high"}
  ]}
  animated={true}
  interactive={true}
/>

// Project Timeline with progress tracking
<TimelineChart
  phases={[
    {name: "Demo & Prep", start: new Date("2025-07-15"), end: new Date("2025-07-18"), progress: 100},
    {name: "Installation", start: new Date("2025-07-19"), end: new Date("2025-07-25"), progress: 60}
  ]}
  animated={true}
  interactive={true}
/>
```

**Agent-Specific UI Components:**
```typescript
// Alex's comprehensive bidding interface
<AlexCostBreakdown 
  data={{
    project_title: "Kitchen Renovation - Oakland Hills",
    total_estimate: 15750,
    confidence_level: "high",
    breakdown: {/* detailed cost structure */},
    timeline: {/* project scheduling */},
    risk_factors: ["Electrical upgrade may be needed"]
  }}
  actions={[
    {type: "create_formal_bid", label: "Generate Formal Proposal", style: "primary"},
    {type: "adjust_pricing", label: "Modify Pricing Strategy", style: "secondary"}
  ]}
/>

// Rex's lead generation dashboard
<RexLeadDashboard
  data={{
    summary: {total_leads: 47, qualified_leads: 23, conversion_rate: 0.34},
    geographic_breakdown: [/* area analysis */],
    trending_problems: [/* Felix framework trends */],
    monthly_sessions: {used: 8, remaining: 22, tier: "growth"}
  }}
  actions={[{type: "generate_leads", label: "Run Lead Generation", style: "primary"}]}
/>

// Lexi's onboarding progress tracker
<LexiOnboarding
  data={{
    overall_progress: 75,
    current_step: "service_selection",
    felix_services: {
      selected: ["Kitchen remodel", "Bathroom renovation"],
      recommended: ["Plumbing repair", "HVAC maintenance"],
      categories: [/* Felix problem categories */]
    }
  }}
  actions={[{type: "continue_onboarding", label: "Continue Setup", style: "primary"}]}
/>
```

### **🤖 AGENT CAPABILITIES DOCUMENTATION:**

**Alex the Assessor - Enhanced Usage Guidance (IndyDev Dan Analyst Chain):**
```
📊 Comprehensive Cost Analysis: 'Analyze this kitchen remodel for competitive pricing'
🏗️ Detailed Material Estimates: 'Calculate materials for 120 sq ft tile installation'
⏱️ Project Timeline Planning: 'Create realistic timeline for bathroom renovation'
💰 Strategic Pricing Optimization: 'Is my $8,500 bid competitive for this project?'
⚠️ Risk Assessment & Planning: 'Identify potential issues in this renovation'
🎯 Bid Strategy Development: 'Help me create a winning proposal for this job'
🔍 Tool Chain Architecture: Context → Analysis → Critique → Refinement → Structured Output
```

**Rex the Retriever - Enhanced Usage Guidance (IndyDev Dan Tool User Chain):**
```
🎯 Lead Performance Analysis: 'Show me my lead metrics for the last 30 days'
📍 Geographic & Market Intelligence: 'Where are highest-value opportunities in Oakland?'
📈 Service Demand Insights: 'What Felix problems have highest demand trending?'
🔍 Search Session Management: 'How many search sessions do I have remaining?'
⚡ Automated Lead Generation: 'Set up background monitoring for electrical jobs'
🎖️ Quality Scoring: 'Which lead sources convert best for my business?'
🛠️ Specialist Tools: Craigslist/SAMs.gov scrapers → Quality filters → Felix categorization
```

**Lexi the Liaison - Enhanced Usage Guidance (IndyDev Dan Planner Chain):**
```
🎯 Profile Setup & Optimization: 'Help me complete my contractor profile'
🛠️ Service Selection Strategy: 'Guide me through Felix's 40-problem framework'
📚 Platform Features Training: 'Show me how to use Alex and Rex effectively'
📍 Territory & Market Setup: 'Help me define my service areas'
💼 Business Strategy Guidance: 'Explain Growth vs Scale tier benefits'
🚀 Getting Started Checklist: 'What steps do I need to complete to start?'
🎭 Co-Creation Flow: Human intent → AI guidance → Interactive refinement → Progress tracking
```

**Key Tasks:**

1.  **Vercel AI SDK & Generative UI:**
    *   ✅ Install and configure the Vercel AI SDK on both the frontend and backend.
    *   ✅ Create a `lib/ai.ts` file (or a similar client-side helper) to manage streaming UI from agent responses, as inspired by the `v0.dev` reference.
    *   ✅ Design the "nested chat window" UI, which will serve as the primary interface for invoking and interacting with AI agents.

2.  **Lexi - The Onboarder:**
    *   ✅ Develop the `/api/agents/lexi` endpoints using streaming responses.
    *   ✅ Implement the "Planner Chain" prompt architecture for Lexi, adhering to her persona defined in `FixItForMe_Contractor_Module_Specs.md`.
    *   🔄 Build the interactive onboarding UI where Lexi's streamed responses guide the user, updating the `contractor_profiles` table upon completion.

3.  **Alex - The Assessor:**
    *   ✅ Develop the `/api/agents/alex` streaming endpoint.
    *   ✅ Implement the "Analyst Chain" and "Critic Chain" prompt architectures for Alex using Deepseek for reasoning, ensuring his persona matches the spec.
    *   🔄 Build the "Job Bid View" (`/contractor/bid/[job_id]`), integrating the generative chat UI for contractors to interact with Alex.
    *   🔄 Render Alex's structured JSON responses (e.g., cost breakdowns) into interactive Mantine components.
    *   🔄 Persist the full conversation and structured data into the `bids.assistance_data` JSONB column.

4.  **Rex - The Retriever Infrastructure:**
    *   ✅ Develop the `/api/agents/rex` streaming endpoint for monitoring and insights.
    *   ✅ Enhanced with @ mention system and intelligent orchestration
    *   🔄 Implement the background `/api/agents/rex_run` asynchronous endpoint for lead generation tasks.

---

## Phase 3: Rex - Lead Generation & Job Feed (Weeks 6-7) 🔄 IN PROGRESS

**Objective:** Activate the background lead generation agent (Rex) and populate the contractor's dashboard with a unified feed of jobs and leads.

### **🎯 CURRENT IMPLEMENTATION STATUS:**
- **Felix Search Strategy**: ✅ Complete - Rex uses Felix 40-problem categories as search vocabulary
- **AgentQL Architecture**: ✅ Enhanced - Integrated roofing, drywall, and expanded categories  
- **IndyDev Dan Principles**: ✅ Implemented - Following "Big Three" (Context, Prompt, Model) methodology
- **Tool User Chain**: 🔄 In Progress - Background lead generation engine with specialist focus
- **Quality Control**: ✅ Complete - Spam detection and recency scoring
- **MCP Integration**: ✅ Ready - MCP_DOCKER for research, @21st-dev/magic for UI generation

### **🔍 REX SEARCH CATEGORIES (Felix + AgentQL + Expanded Vocabulary):**

**Core Felix Categories (Primary Search Terms):**
```typescript
plumbing: [
  // Felix Core
  "running toilet repair", "leaky faucet fix", "clogged drain", "toilet flush mechanism",
  // AgentQL Expanded
  "water heater repair", "pipe leak", "sump pump", "garbage disposal", "shower head replacement"
],
electrical: [
  // Felix Core  
  "light fixture replacement", "electrical outlet", "circuit breaker", "ceiling fan installation",
  // AgentQL Expanded
  "panel upgrade", "GFCI outlet", "electrical inspection", "generator installation", "smart switch"
],
hvac: [
  // Felix Core
  "thermostat installation", "heating repair", "AC repair", "ventilation", "HVAC maintenance", 
  // AgentQL Expanded
  "ductwork cleaning", "heat pump", "furnace replacement", "air quality", "zoning system"
],
carpentry: [
  // Felix Core
  "cabinet repair", "deck repair", "handrail fix", "door lock replacement",
  // AgentQL Expanded  
  "custom shelving", "trim work", "stair repair", "window installation", "door hanging"
]
```

**AgentQL Specialized Categories (High-Value Opportunities):**
```typescript
roofing: [
  "roof leak repair", "shingle replacement", "gutter cleaning", "roof inspection",
  "emergency roof repair", "flat roof repair", "skylight repair", "ice dam removal",
  "metal roofing", "solar panel installation", "chimney repair", "fascia board replacement"
],
drywall: [
  "drywall patching", "drywall repair", "hole in wall", "crack repair", "texture matching",
  "ceiling repair", "water damage repair", "wall finishing", "mud and tape",
  "drywall installation", "soundproofing", "basement finishing", "garage conversion"
],
flooring: [
  "tile repair", "hardwood refinishing", "grout resealing", "floor leveling",
  "laminate installation", "carpet replacement", "vinyl plank", "subfloor repair",
  "stone restoration", "epoxy coating", "radiant heating", "transition strips"
],
exterior: [
  "siding repair", "deck staining", "pressure washing", "window screen repair", 
  "fence installation", "concrete repair", "walkway repair", "landscape lighting",
  "exterior painting", "caulking", "weatherstripping", "storm door installation"
],
kitchen_bath: [
  "kitchen remodel", "bathroom renovation", "countertop installation", "backsplash tile",
  "vanity replacement", "shower surround", "faucet upgrade", "cabinet refacing",
  "tile work", "plumbing fixture", "exhaust fan", "lighting upgrade"
],
emergency_services: [
  "emergency repair", "water damage", "storm damage", "fallen tree removal",
  "power outage", "heating emergency", "plumbing emergency", "roof emergency",
  "flood cleanup", "mold remediation", "fire damage", "structural repair"
]
```

### **🎯 INDYDEV DAN INTEGRATION - TOOL USER CHAIN ARCHITECTURE:**

**Rex as Specialist Tool User:**
```typescript
// Context: Rich contractor profile and search parameters
const rexContext = {
  contractor_profile: {
    services: ["plumbing", "electrical"], // From Felix framework
    service_areas: ["Oakland", "Berkeley"],
    pricing_tier: "premium",
    availability: "immediate"
  },
  search_parameters: {
    budget_range: [1000, 15000],
    urgency_keywords: ["emergency", "ASAP", "urgent"],
    quality_indicators: ["licensed", "insured", "permit"]
  },
  performance_history: {
    conversion_rates: {plumbing: 0.34, electrical: 0.28},
    avg_project_value: 4500,
    response_time_preference: "24h"
  }
};

// Tool Chain: Specialized execution sequence
const toolChain = [
  "craigslist_scraper", // Primary lead source
  "sams_gov_scraper",   // Government contracts
  "quality_filter",     // Spam detection using AgentQL patterns
  "value_scorer",       // Budget and urgency analysis
  "geo_matcher",        // Service area validation
  "felix_categorizer"   // Map to 40-problem framework
];

// Output: Structured data for generative UI components
const output = {
  leads: [...], // Qualified leads with Felix categories
  analytics: {...}, // Performance metrics for dashboard
  ui_assets: {...}, // Component specifications for React
  quality_score: 0.85 // Overall batch quality indicator
};
```

### **🔧 TECHNICAL IMPLEMENTATION ROADMAP:**
1. **Database Schema**: Complete Supabase tables with RLS policies
2. **Rex Background Engine**: Tool User Chain for autonomous lead generation  
3. **Quality Control**: AgentQL spam detection and value thresholds
4. **Dashboard Integration**: Real-time lead feed with generative UI components
5. **CRON Automation**: Scheduled Rex runs for automated lead discovery

### **📋 PRIORITY ORDER:**
1. **Database & Auth First** ✅ Schema designed, need implementation
2. **Rex Tool Chain** 🔄 Background endpoint with Felix search terms  
3. **Quality Control** ✅ AgentQL patterns and value thresholds
4. **Dashboard Integration** 🔄 UI components for lead display with loading states
5. **Testing & Validation** 🔄 End-to-end contractor workflows

### **🎯 FELIX → REX INTEGRATION CLARIFICATION:**
**Felix's Role:** Provides Rex with **search vocabulary** and **problem categories** - tells Rex what contractors actually look for.

**Rex's Role:** Uses Felix categories as **search terms** to find leads on Craigslist/SAMs.gov, not complex Felix mapping.

**Correct Approach:**
```typescript
// Rex searches with Felix terms as vocabulary
const searchTerms = ["toilet repair", "roof leak", "drywall patch"]; // From Felix
searchCraigslist(searchTerms, location, budget_range); // Simple search, no mapping
```

**Key Tasks:**

1.  **Rex - The Retriever Backend (IndyDev Dan Tool User Chain):**
    *   🔄 Implement `/api/agents/rex_run` asynchronous endpoint following Tool User Chain architecture
    *   ✅ **Specialist Design**: Rex executes specific tools (scrapers, filters, categorizers) rather than general reasoning
    *   ✅ **Context Management**: Rich contractor profiles and search parameters as foundation
    *   ✅ **Quality Control**: AgentQL spam detection and value thresholds
    *   ✅ **Felix Integration**: Use 40-problem framework as search vocabulary (not complex mapping)
    *   🔄 **Structured Output**: JSON responses with UI component specifications

2.  **Automation & Dashboard Integration:**
    *   🔄 Configure Vercel CRON job to periodically trigger `/api/agents/rex_run` endpoint
    *   🔄 Implement data fetching on `/contractor/dashboard` for merged job/lead feed
    *   ✅ **UI Components**: Built generative components for Rex analytics and lead display
    *   🔄 **Real-time Updates**: WebSocket or SSE for live lead notifications

3.  **Search View & Tier Management:**
    *   🔄 Build `/contractor/search` page for manual Rex triggers and session management
    *   🔄 **Tier Logic**: Growth (30 sessions/month) vs Scale (unlimited) with billing integration
    *   🔄 **Session Tracking**: Usage analytics and quota enforcement
    *   🔄 **Manual Controls**: Contractor-initiated lead generation with parameter customization

### **🔧 TECHNICAL PREREQUISITES:**
- **Environment Variables**: All API keys configured for live testing
- **Supabase Connection**: Database tables created with proper RLS policies  
- **Vercel Deployment**: Production environment ready for CRON jobs
- **Authentication**: SMS verification flow operational
- **MCP Integration**: MCP_DOCKER configured for research, @21st-dev/magic for UI components

---

## 🎯 META-PATTERN VERIFICATION FRAMEWORK

**Identified Core Issues & Solutions:**

### **My Previous Mistake Pattern:**
❌ **Issue**: Incorrectly stated Rex was "IN PROGRESS" when search strategy was incomplete
✅ **Solution**: Proper completion tracking with specific implementation details

### **Documentation Verification Index:**
1. **Phase Implementation Plan** ← Current document (verification hub)
2. **IndyDev Dan Reference** ← New methodology framework
3. **Felix 40-Problem Reference** ← Search vocabulary source  
4. **AgentQL Architecture** ← Quality control and tool chains
5. **Custom Instructions** ← Environment and configuration specs

### **Verification Checkpoints:**
- [ ] **Rex Search Strategy**: Complete Felix + AgentQL category expansion ✅ 
- [ ] **IndyDev Dan Integration**: Tool User Chain architecture documented ✅
- [ ] **MCP Configuration**: Docker and 21st-dev magic integration ✅
- [ ] **Agent Specialization**: Each agent follows single-responsibility principle ✅
- [ ] **Quality Control**: Spam detection and value thresholds defined ✅

### **Next Implementation Steps (Phase 3 Continuation):**
1. **Complete Supabase Schema** with RLS policies 
2. **Implement Rex Background Engine** using Tool User Chain
3. **Build Dashboard Integration** with generative UI components
4. **Configure CRON Automation** for scheduled lead generation
5. **End-to-End Testing** of contractor workflows

---

## Phase 4: Payments, Tiers, & Settings (Weeks 8-9)

**Objective:** Build the complete financial lifecycle for both contractor tiers, including subscriptions and payouts.

**Key Tasks:**

1.  **Stripe Integration:**
    *   Integrate the Stripe Python SDK for payment processing.
    *   Set up Stripe products for the "Scale" tier subscription.

2.  **Payment & Payout Logic:**
    *   Create the `/api/payments/webhook_handler` to listen for Stripe events.
    *   Implement the differentiated payout logic based on the contractor's `tier`, as defined in the "Payment User Stories" section of `FixItForMe_Contractor_Module_Specs.md`.
        *   **Growth Tier:** 10% platform fee, 30%/40%/30% payout structure.
        *   **Scale Tier:** 7% platform fee, 50%/25%/25% payout structure.
    *   Rigorously track all transactions in the `payments` table.

3.  **Settings & Subscription Management:**
    *   Develop the `/contractor/settings` page for profile and service management.
    *   Integrate the Stripe Customer Portal to allow premium contractors to manage their subscriptions.

---

## Phase 5: Admin, Testing, & Deployment (Weeks 10-12)

**Objective:** Ensure system robustness, provide administrative oversight through backend tooling, and prepare for a successful launch.

**Key Tasks:**

1.  **Admin Endpoints & Tooling:**
    *   Build secure backend endpoints for administrative actions. The UI for these endpoints is **not** in scope for this phase.
    *   Implement the logic for admin-only tools, such as the `ADMIN_TOOL_view_job_ledger` mentioned in the instructions, which can be called via a secure API.

2.  **End-to-End Testing:**
    *   Use Cypress or Playwright to write E2E tests for all critical user flows, especially the full payment lifecycles for both contractor tiers and agent interaction scenarios.
    *   Test API failure modes and admin intervention paths (by calling the admin APIs directly).

3.  **Hardening & Deployment:**
    *   Implement the defined `handle_payment_failure` and `handle_agent_error` functions for robust error handling.
    *   Set up logging and monitoring via Vercel.
    *   Conduct final testing on the production environment and launch.
