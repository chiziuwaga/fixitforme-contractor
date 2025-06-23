# FixItForMe: Phased Implementation Plan for Contractor Module

This document outlines a phased development plan for the FixItForMe Contractor Module. The goal is to build a robust, AI-driven platform on Vercel, using Next.js for the frontend, Python for the backend, and Supabase as the central data hub, following a decoupled agentic architecture.

## 🔑 SESSION MANAGEMENT CLARIFICATION

**IMPORTANT**: The platform implements dual-session architecture:
- **Contractor Login Sessions**: 48 hours (secure desktop environment for professional workflow)
- **Agentic Operation Timeouts**: 10 minutes (prevents hanging AI operations, resource management)

This ensures contractors stay logged in across work sessions while maintaining tight control over AI operations. See `/docs/Session_Management_Rationale.md` for detailed implementation.

---

## Guiding Principles & Reference Documents

**Success depends on adhering to the architectural vision outlined in the core documents.** All development should align with these specifications.

*   **Primary Specification:** `FixItForMe_Contractor_Module_Specs.md`
*   **Technical Instructions:** `Custom_Instructions_Contractor_FixItForMe.md`
*   **Lead Generation Bible:** `AgentQL_Architecture_for_Contractor_Lead_Generation.md`
*   **Felix's Problem Framework:** `Felix_40_Problem_Reference.md`
*   **AI Methodology:** `IndyDev_Dan_Methodology_Reference.md`
*   **UI Rationale:** `Generative_UI_Rationale.md`
*   **Chat-centric Rationale:** `Chat_Centric_UI_Rationale.md`
*   **Generative UI Reference:** [v0.dev Chat Example](https://v0.dev/chat/b/b_MX1Ev6PvA7e)
*   **v0.dev Contractor Reference:** [Contractor Dashboard UI](https://v0.dev/chat/b/b_MX1Ev6PvA7e)
*   **MCP Integration:** MCP_DOCKER for research, @21st-dev/magic for UI components

**Rule for Changes:** Any deviation or new feature proposal must be reflected by an update to these core documents *before* implementation begins. This ensures our documentation remains the single source of truth.

---

## Phase 1: Foundation & Core Infrastructure (Weeks 1-2) 🔄 MOSTLY COMPLETE

**Objective:** Establish the project backbone, including the database schema, authentication, and the basic application shell.

### **✅ COMPLETION SUMMARY:**
- **Next.js Project**: ✅ Initialized with TypeScript, Tailwind CSS v4, App Router
- **Vercel Integration**: ✅ Connected to GitHub, deployed with CI/CD pipeline
- **Mantine UI**: ✅ Integrated with notification system and core components
- **AI Infrastructure**: ✅ Vercel AI SDK configured with Deepseek + AgentQL integration
- **Supabase Setup**: ✅ Utility functions created, schema defined, environment configured
- **Documentation**: ✅ All reference docs moved to `/docs` and version controlled

### **🔄 REMAINING WORK:**
- **Database Seeding**: Felix 40-problems data needs to be loaded into Supabase
- **Authentication Flow**: SMS verification with Twilio integration 
- **RLS Policy Testing**: Verify data isolation between contractors
- **UI Layout Structure**: Complete main dashboard layout per ASCII mockup

**Key Tasks:**

1.  **Project Setup:**
    *   ✅ Initialize a new Next.js project with TypeScript.
    *   ✅ Configure the project for Vercel deployment.
    *   ✅ Set up the Python backend environment within an `/api` directory, structured for Vercel Serverless Functions.

2.  **Supabase Configuration:**
    *   ✅ Create the Supabase project and define the schema precisely as detailed in `Custom_Instructions_Contractor_FixItForMe.md`.
    *   🔄 **Seed the `diy_guides` table with the provided 40-service JSON file.**
    *   ✅ **Implement Row Level Security (RLS) policies** to enforce the data access rules specified in the core documents.

3.  **Environment & Authentication:**
    *   ✅ Create and populate the `.env.local` file with all keys listed in `Custom_Instructions_Contractor_FixItForMe.md`.
    *   🔄 **Implement the email/phone + 6-digit SMS code login flow using Supabase Auth.**

4.  **UI Shell:**
    *   ✅ Integrate the Mantine UI library.
    *   ✅ Build the main contractor dashboard with professional desktop-first design
    *   🔄 **Build the main application layout, including the header, navigation, and the static structure of the `/contractor/dashboard` based on the ASCII mockup in `FixItForMe_Contractor_Module_Specs.md`.**

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

#### **Generative UI Asset Specification (JSON/HTML Payloads):**
- **Lexi the Liaison**: Returns **2** primary UI assets.
    1. `LexiOnboarding` component for progress tracking.
    2. A standard `MarkdownText` block for conversational guidance.
- **Alex the Assessor**: Returns up to **4** UI assets.
    1. `AlexCostBreakdown` component for detailed financial analysis.
    2. `TimelineChart` for project scheduling visualization.
    3. `RiskAnalysis` component to highlight potential issues.
    4. `MarkdownText` for conversational context.
- **Rex the Retriever**: Returns **3** primary UI assets.
    1. `RexLeadDashboard` for performance analytics.
    2. `LeadDistributionChart` for geographic market insights.
    3. `LeadCard` components (multiple) for individual lead items.

**Alex the Assessor - Enhanced Usage Guidance (IndyDev Dan Analyst Chain):**
```
📊 Comprehensive Cost Analysis: 'Analyze this kitchen remodel for competitive pricing'
🏗️ Detailed Material Estimates: 'Calculate materials for 120 sq ft tile installation'
⏱️ Project Timeline Planning: 'Create realistic timeline for bathroom renovation'
💰 Strategic Pricing Optimization: 'Is my $8,500 bid competitive for this project?'
⚠️ Risk Assessment & Planning: 'Identify potential issues in this renovation'
🎯 Bid Strategy Development: 'Help me create a winning proposal for this job'
- **Specialist Tools**: Comparative analysis using live data from Home Depot, Lowe's, and other supplier sites based on project zip code.
🔍 Tool Chain Architecture: Context → Analysis → Critique → Refinement → Structured Output
```

**Rex the Retriever - Enhanced Usage Guidance (IndyDev Dan Tool User Chain):**
```
🎯 Lead Performance Analysis: 'Show me my lead metrics for the last 30 days'
📍 Geographic & Market Intelligence: 'Where are highest-value opportunities in Oakland?'
📈 Service Demand Insights: 'What Felix problems have highest demand trending?'
- **Search Session Management**: 'How many search sessions do I have remaining?' (*Note: Scale tier limited to 10 sessions/month*)
⚡ Hyper-Relevant Lead Generation: 'Find 10 best leads matching my profile' (*Starts with 15, filters to top 10 by relevance*)
🎖️ Quality Scoring: 'Which lead sources convert best for my business?'
🛠️ Specialist Tools: Craigslist/SAMs.gov scrapers → Quality filters → Relevance ranking → Felix categorization
⏰ Recency Priority: Shows exact posting time - fresh leads get priority scoring
📊 Relevance Algorithm: Quality (40%) + Recency (30%) + Value (20%) + Urgency (10%) = Top 10 leads
```

**Lexi the Liaison - Enhanced Usage Guidance (IndyDev Dan Planner Chain):**
```
🎯 Profile Setup & Optimization: 'Help me complete my contractor profile'
- **Capacity & Team Size**: 'Help me set my business capacity and team size'
🛠️ Service Selection Strategy: 'Guide me through Felix's 40-problem framework' (*Note: 5 services for Growth tier, 15 for Scale tier*)
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
4. **Relevance Ranking**: Multi-factor scoring (Quality 40% + Recency 30% + Value 20% + Urgency 10%)
5. **Lead Filtering**: Start with 15 leads → Filter spam/low-value → Rank by relevance → Top 10 output
6. **Dashboard Integration**: Real-time lead feed with generative UI components
7. **Recency Display**: Show exact posting time for each lead with visual indicators
8. **CRON Automation**: Scheduled Rex runs for automated lead discovery

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
    *   Implement the `/api/agents/rex_run` endpoint as a robust, asynchronous background task.
    *   The agent will use the contractor's profile (`services`, `service_areas`) to generate search queries for Craigslist, SAM.gov, and other configured sources.
    *   **Crucially, limit higher-tier users to 10 search sessions per month**, tracking usage in the `contractor_profiles` table.
    *   The UI must display a progress bar and stream back status updates during execution.

2.  **Dashboard Job Feed:**
    *   Populate the `/contractor/dashboard` with a real-time feed of leads generated by Rex and jobs referred from the homeowner-facing platform.
    *   Render leads using the `LeadCard` generative UI component.
    *   For Growth tier users, the manual search trigger for Rex will be visible but disabled ("grayed out") with a tooltip/modal prompting an upgrade.

3.  **Alex - The Quote Agent Enhancement:**
    *   Enhance Alex's capabilities to function as the "Quote Agent" for Scale tier users.
    *   When prompted, Alex will perform comparative analysis against home improvement store sites (e.g., Home Depot) based on the user's zip code to validate material costs.
    *   This feature will be disabled for Growth tier users.

---

## Phase 4: Payments, Tiers, & Settings (Weeks 8-9) 🔄 IN PROGRESS

**Objective:** Implement the complete commercial framework, including tiered subscriptions, payment processing, and a comprehensive contractor settings area.

### **✅ COMPLETION SUMMARY:**
- **Message Limits Implementation**: Per-chat message limits enforced (50 for Growth, 200 for Scale)
- **Chat Thread Limits**: Concurrent chat session limits implemented (10 for Growth, 30 for Scale)
- **Enhanced ProfileEditor**: Upsert functionality with notifications and service management
- **Document Management**: 20MB file size limit enforced with user feedback
- **Conversational Enforcement**: Lexi provides system messages when limits are reached
- **SystemMessage Component**: Generative UI for in-chat system feedback
- **User Context Providers**: Centralized state management with subscription tier awareness
- **🌟 NEW: Agentic Execution UI**: ChatGPT-style deep research UI for AI operations
- **🌟 NEW: Notification System**: Comprehensive notification center with real-time updates
- **🌟 NEW: Concurrent Execution Limits**: Maximum 2 simultaneous AI operations per account
- **🌟 NEW: Agent Working Indicators**: Real-time progress tracking for Alex and Rex operations

**Objective:** Implement the complete commercial framework, including tiered subscriptions, payment processing, and a comprehensive contractor settings area.

### **🔑 USER SESSION & DATA FLOW LOGIC:**

This section details the critical logic for ensuring a secure, personalized, and tier-aware user experience.

1.  **Session-Aware Lead Feed & Bidding:**
    *   **API Endpoint (`/api/leads`):** A dedicated, secure API endpoint will be created to serve the live lead feed.
    *   **Authentication:** This endpoint will require a valid user session (JWT) to be accessed.
    *   **Matching Logic:** On request, the backend will:
        1.  Identify the user from their session.
        2.  Fetch the user's `contractor_profiles` record, specifically their `services` and `service_areas`.
        3.  Query the `leads` table, returning **only** the leads that match the contractor's profile.
    *   **Bidding Rules:**
        *   The frontend will track the number of bids used against the monthly limit defined by the user's tier.
        *   If a user attempts to bid beyond their limit, the UI will block the action and present an upgrade prompt.

2.  **Session-Aware Agent Interactions:**
    *   **Contextual Awareness:** All agent API calls (`/api/agents/*`) will be session-aware.
    *   **Mechanism:** The backend will use the user's JWT to create a scoped Supabase client instance. This instance will fetch the specific user's profile, settings, and history.
    *   **Personalization:** The agent's context and prompts will be dynamically built using the user's session data, ensuring all advice, analysis, and lead generation is tailored to them.
    *   **History Persistence:** All conversations will be saved and linked to the user's ID, allowing for persistent, stateful interactions on a per-bid or per-session basis.

3.  **Tier-Based Feature Gating & Upgrade Flow:**
    *   **UI Logic:** The frontend, particularly the `EnhancedChatManager` and `Dashboard`, will use a `useUser` hook to get the contractor's current `tier`.
    *   **Locked Features:** For "Growth" tier users, premium agent commands (`@rex` for search, `@alex` for advanced quotes) will be visually disabled (e.g., grayed out with a lock icon).
    *   **Upgrade Path:**
        1.  Attempting to use a locked feature will trigger a modal explaining the benefits of the "Scale" tier.
        2.  A clear "Upgrade Now" CTA will direct the user to the `/contractor/settings` page or initiate the Stripe Checkout flow directly.
        3.  Upon successful payment, a Stripe webhook updates the user's `tier` in Supabase.
        4.  The frontend `useUser` hook will automatically reflect this change, unlocking the feature without requiring a page reload.

### 🌟 NEW: System Constraints & Conversational Enforcement

To ensure a robust and fair platform, the following system-level constraints will be implemented, with enforcement handled conversationally by the agents to maintain a seamless user experience.

1.  **Chat Session Limits:**
    *   **Growth Tier:** Limited to **10** concurrent chat sessions.
    *   **Scale Tier:** Limited to **30** concurrent chat sessions.
    *   **Enforcement:** When a user attempts to open a new chat beyond their limit, the `EnhancedChatManager` will block the action. `Lexi` will then deliver a generative UI message explaining the limit and offering two options: close an existing chat or upgrade their plan.

2.  **Messages Per Chat Limits:**
    *   **Growth Tier:** Limited to **50** messages per chat thread.
    *   **Scale Tier:** Limited to **200** messages per chat thread.
    *   **Enforcement:** When a user reaches their message limit within a thread, `Lexi` will deliver a message explaining the limit has been reached for that specific conversation and suggest starting a new chat for a new topic or upgrading for higher limits.

4.  **Concurrent Agentic Execution Limits:**
    *   **Any Tier:** Maximum **2** concurrent AI agent operations per account.
    *   **Enforcement:** When a user attempts to start a third agent operation, the system will queue the request and display an estimated wait time. Visual progress indicators show active operations similar to ChatGPT's deep research UI.

5.  **Document Upload Limits:**
    *   **Max File Size:** Individual document uploads (e.g., certifications, proof of work) will be limited to **20MB**.
    *   **Enforcement:** The `DocumentUploader` component will validate the file size on the client side before upload, providing immediate feedback if the file is too large.

6.  **UI Layout Principle:**
    *   The main contractor dashboard will be redesigned to be **chat-centric**, with the `EnhancedChatManager` occupying approximately **70%** of the primary view. The lead feed and other modules will be positioned as secondary, supporting elements.

### 💳 TIERED SYSTEM & PAYMENT LOGIC:

| Feature | Growth Tier (Free) | Scale Tier ($250/month) |
| :--- | :--- | :--- |
| **Platform Fee** | 10% of job value | 7% of job value |
| **Payout Structure** | 30% Upfront, 40% Mid-Project, 30% Completion | 50% Upfront, 25% Mid-Project, 25% Completion |
| **Max Bids / Month**| 10 | 50 |
| **Max Active Chats** | 10 | 30 |
| **Messages / Chat** | 50 | 200 |
| **Max Services** | 5 | 15 |
| **Rex Search Agent**| Conversational Upsell | ✅ Enabled (10 sessions/month) |
| **Alex Quote Agent**| Conversational Upsell | ✅ Enabled |

**Key Tasks:**

1.  **Stripe Integration:**
    *   Implement Stripe Checkout for the `$250/month` "Scale" tier subscription.
    *   Create webhook endpoints in `/api/payments/stripe` to handle subscription events (`created`, `canceled`, `payment_failed`).
    *   Update the `contractor_profiles` table with `tier` (`growth` | `scale`) and `stripe_customer_id` columns.

2.  **Tiered Access Control:**
    *   Implement middleware or component-level checks to enforce feature access based on the contractor's tier.
    *   Build the UI for "locked" features, providing a clear upgrade path.

3.  **Payout & Job Completion Flow:**
    *   Implement the payout logic based on the defined tiered structure.
    *   Create a workflow where final payment is released only after the contractor uploads proof of work (images) and the homeowner confirms completion.

4.  **Contractor Settings Page (`/contractor/settings`):**
    *   Build a comprehensive settings page for managing:
        *   Subscription tier (upgrade/downgrade).
        *   Profile details, services offered, and service areas.
        *   Business documents and certifications for admin validation.

---

## Phase 5: Integration & System Enhancement (Current Phase - Week 7) ✅ COMPLETE

**Objective:** Integrate notification system, concurrent execution management, and agent working indicators into the live application.

### **✅ COMPLETION SUMMARY:**
- **Notification Center**: Integrated into main layout with real-time notifications
- **Concurrent Execution Manager**: Enforces 2-agent limit per account with visual feedback
- **Agent Working Indicators**: Shows real-time progress during Alex/Rex operations  
- **Global CSS**: Added agent animations and brand color variables
- **Execution Tracking**: Rex endpoint now tracks progress through Supabase
- **Chat Integration**: Premium agents now respect execution limits with conversational feedback

**Key Tasks:**
1.  **System Integration:**
    *   ✅ Created `AppSystemWrapper` component to provide notification and execution context
    *   ✅ Updated main layout to include notification center and execution manager
    *   ✅ Added global CSS animations for agent working states (pulse, progress bars)
    *   ✅ Integrated execution tracking into Rex endpoint with progress updates

2.  **Chat Manager Enhancement:**
    *   ✅ Enhanced `EnhancedChatManager` to use concurrent execution manager
    *   ✅ Added execution limit enforcement with conversational feedback via Lexi
    *   ✅ Integrated `AgentWorkingIndicator` to show active agent operations
    *   ✅ Updated Rex chat flow to trigger deep search endpoint with execution tracking

3.  **Agent Endpoint Updates:**
    *   ✅ Modified Rex endpoint to accept and track `execution_id` parameter
    *   ✅ Added progress updates throughout Rex lead generation process
    *   ✅ Implemented execution completion tracking in Supabase

4.  **User Experience:**
    *   ✅ Visual feedback for active agent executions with progress bars
    *   ✅ Enforcement of 2-concurrent-agent limit with user-friendly notifications
    *   ✅ Brand-aligned color scheme for agent working indicators
    *   ✅ Seamless integration preserving existing chat functionality

---

## Phase 6: Contractor Module Completion & Security (Weeks 10-11) 📋 NEXT PHASE

**Objective:** Complete contractor-side data endpoints, notification system, and security hardening. **Note: Admin module development is not required for this phase.**

### **🎯 CONTRACTOR DATA ENDPOINTS & MANAGEMENT:**
- **Complete Contractor API**: All contractor-side endpoints (no admin endpoints needed)
- **Profile Management**: Advanced profile editing, service area management, capacity settings
- **Document Status**: Real-time verification status tracking for contractor documents
- **Payment History**: Complete transaction logging and payment history access
- **Lead Analytics**: Contractor-specific lead performance and conversion tracking
- **Agent Usage**: Session tracking, usage analytics, and performance insights

### **🔔 DESKTOP NOTIFICATION SYSTEM:**
**Browser Push Notifications for Tablet/Desktop:**
```typescript
// Request notification permission on app load
await Notification.requestPermission();

// Thread-based notification navigation
interface ThreadNotification {
  type: 'chat' | 'bid' | 'document' | 'payment';
  thread_id: string;
  position: number; // Specific message/item position
  contractor_id: string;
  title: string;
  body: string;
  click_action: string; // Deep link to thread position
}

// Auto-navigate to thread position on notification click
notificationCenter.onClick = (notification) => {
  navigateToThread(notification.thread_id, notification.position);
  highlightItem(notification.position, 3000); // 3-second highlight
};
```

**Key Tasks:**

1.  **Contractor Data API Completion:**
    *   `/api/contractor/profile/*` - Advanced profile management endpoints
    *   `/api/contractor/documents/*` - Document status and verification tracking
    *   `/api/contractor/payments/*` - Payment history and transaction details
    *   `/api/contractor/analytics/*` - Lead performance and agent usage metrics
    *   `/api/contractor/settings/*` - Notification preferences and account settings

2.  **Session Management Implementation:**
    *   Configure 48-hour contractor login sessions in Supabase Auth
    *   Implement 10-minute timeouts for agent operations
    *   Add session refresh and graceful expiry handling
    *   Create session monitoring and security event tracking

3.  **Email Integration (Zapier):**
    *   Replace SendGrid references with Zapier webhook integration
    *   Implement email triggers for key contractor events
    *   Set up automated email sequences for onboarding and notifications
    *   Create email template system with contractor personalization

4.  **Enhanced Lead Management:**
    *   Advanced lead filtering and search capabilities
    *   Lead quality scoring improvements
    *   Contractor lead preference management
    *   Lead notification and alert system

5.  **Desktop Notification Integration:**
    *   Browser push notification setup for contractor alerts
    *   Thread-based navigation (click notification → jump to specific chat position)
    *   Real-time lead notifications and bid updates
    *   Notification preferences and management

6.  **Security Hardening:**
    *   Implement comprehensive audit logging for contractor actions
    *   Add rate limiting and IP whitelisting for admin endpoints
    *   Security monitoring and intrusion detection
    *   Regular security assessment and penetration testing

---

## Phase 7: Analytics & Reporting Dashboard (Weeks 12-13) 📊 UPCOMING

**Objective:** Build comprehensive analytics dashboards for both contractors and administrators with actionable insights.

### **📈 CONTRACTOR ANALYTICS:**
- **Performance Metrics**: Conversion rates, response times, project values
- **Lead Analytics**: Source performance, category trends, geographic insights  
- **Financial Reporting**: Income tracking, expense management, tax preparation
- **Agent Interaction**: Usage patterns, satisfaction ratings, ROI analysis

### **🎛️ ADMIN ANALYTICS:**
- **Platform Health**: User growth, revenue trends, churn analysis
- **Agent Performance**: AI effectiveness, response quality, usage patterns
- **Market Intelligence**: Lead quality trends, contractor success factors
- **Financial Oversight**: Revenue breakdowns, payment processing, tier performance

**Key Tasks:**

1.  **Advanced D3.js Visualizations:**
    *   Interactive revenue trend charts with drill-down capabilities
    *   Geographic heat maps for lead distribution and contractor density
    *   Agent performance scorecards with comparative analysis
    *   Custom dashboard builder for contractors

2.  **Real-time Analytics Engine:**
    *   Live metrics dashboard with WebSocket updates
    *   Predictive analytics for contractor success and churn
    *   Automated insights and recommendations
    *   Custom alert system for key metric thresholds

3.  **Reporting Infrastructure:**
    *   Automated report generation (daily, weekly, monthly)
    *   Export capabilities (PDF, CSV, Excel) for financial data
    *   Custom report builder with drag-drop interface
    *   Email delivery system for scheduled reports

---

## Phase 8: Advanced Features & UX Optimization (Weeks 14-15) ✨ PLANNED

**Objective:** Implement advanced platform features focused on intuitive UI/UX and incremental improvements using 21st.dev components.

### **🎨 21ST.DEV UI COMPONENT INTEGRATION:**
**Advanced Component Library Expansion:**
```typescript
// 21st.dev Magic Component Integration
import { 
  AdvancedDateRangePicker,
  SmartNotificationToast,
  InteractiveProgressTracker,
  DynamicFormBuilder,
  AIContextualHelp
} from '@21st-dev/magic';

// Incremental UX Improvements
- Smart auto-complete for contractor inputs
- Contextual help system with AI-powered suggestions
- Progressive disclosure patterns for complex forms
- Micro-interactions for enhanced user engagement
- Accessibility improvements (WCAG 2.1 AA compliance)
```

### **🤖 AI-POWERED UX ENHANCEMENTS:**
- **Smart Onboarding**: Adaptive onboarding flow based on contractor experience
- **Contextual Assistance**: AI-powered help system that understands user context
- **Predictive Text**: Smart auto-completion for common contractor tasks
- **Voice Interface**: Optional voice commands for hands-free operation
- **Mobile Optimization**: Enhanced mobile experience for field work

### **⚡ PERFORMANCE & OPTIMIZATION:**
- **Advanced Caching**: Intelligent caching strategies for faster load times
- **Code Splitting**: Optimized bundle sizes with route-based code splitting
- **Image Optimization**: Next.js Image optimization with WebP conversion
- **Database Optimization**: Query optimization and intelligent indexing
- **CDN Integration**: Global content delivery for improved performance

**Key Tasks:**

1.  **Design System Evolution:**
    *   Expand component library with 21st.dev magic components
    *   Implement design tokens for consistent theming
    *   Create interactive component documentation
    *   Build accessibility-first component patterns

2.  **User Experience Optimization:**
    *   Conduct user testing sessions with contractors
    *   Implement feedback-driven UI improvements
    *   Add micro-interactions and animations for engagement
    *   Optimize mobile experience for field contractors

3.  **Performance Monitoring:**
    *   Implement Core Web Vitals monitoring
    *   Set up performance budgets and alerts
    *   Optimize critical rendering path
    *   Implement progressive loading strategies

4.  **AI Feature Enhancements:**
    *   Improve agent response accuracy with fine-tuning
    *   Add contextual help system with AI suggestions
    *   Implement smart defaults based on contractor behavior
    *   Add voice interface for hands-free operation

---

## Phase 9: Launch Preparation & Go Live (Weeks 16-17) 🚀 FINAL

**Objective:** Finalize all aspects of the platform, conduct comprehensive testing, and execute successful launch.

### **🔧 PRE-LAUNCH CHECKLIST:**
- **Security Audit**: Complete penetration testing and vulnerability assessment
- **Performance Testing**: Load testing and stress testing under production conditions
- **Data Migration**: Production database setup with data integrity verification
- **Monitoring Setup**: Comprehensive logging, error tracking, and performance monitoring
- **Backup Systems**: Automated backup and disaster recovery procedures

### **📊 LAUNCH METRICS & MONITORING:**
- **Real-time Dashboards**: Live monitoring of all critical systems
- **Error Tracking**: Comprehensive error logging with Sentry integration
- **Performance Monitoring**: Core Web Vitals and user experience metrics
- **Business Metrics**: User adoption, conversion rates, revenue tracking
- **Security Monitoring**: Threat detection and incident response

**Key Tasks:**

1.  **Final Testing & QA:**
    *   End-to-end testing of all user journeys
    *   Cross-browser compatibility testing
    *   Mobile responsiveness verification
    *   Payment processing validation
    *   Security penetration testing

2.  **Production Environment Setup:**
    *   Production database configuration with RLS policies
    *   CDN and caching configuration
    *   SSL certificate installation and security headers
    *   Environment variable management
    *   Backup and monitoring systems

3.  **Launch Execution:**
    *   Gradual rollout with feature flags
    *   Real-time monitoring during launch
    *   Immediate support and issue resolution
    *   User onboarding and support documentation
    *   Marketing and communication coordination

4.  **Post-Launch Support:**
    *   24/7 monitoring for first 72 hours
    *   Rapid response team for critical issues
    *   User feedback collection and analysis
    *   Performance optimization based on real usage
    *   Continuous improvement planning

---

## 🎯 Success Metrics & KPIs

### **Technical Metrics:**
- **Performance**: < 2s initial load time, < 100ms agent response time
- **Reliability**: 99.9% uptime, < 0.1% error rate
- **Security**: Zero critical vulnerabilities, SOC 2 compliance ready
- **Scalability**: Support 10,000+ concurrent users

### **Business Metrics:**
- **User Adoption**: 80% contractor profile completion rate
- **Engagement**: 60% weekly active users, 30% daily active users  
- **Revenue**: $100K+ ARR within 6 months, 15% month-over-month growth
- **Satisfaction**: 4.5+ star average rating, < 5% churn rate

### **Platform Health:**
- **AI Agent Performance**: 90%+ user satisfaction, < 3s response time
- **Lead Quality**: 75%+ qualified leads, 30%+ conversion rate
- **Payment Processing**: 99.9% success rate, < 24h payout processing
- **Support**: < 2h response time, 95% first-contact resolution

---
