# FixItForMe Contractor Module - Development Instructions

## Project Overview
This is the contractor-facing module for FixItForMe, built with Next.js, TypeScript, and a Python backend on Vercel. The system follows a decoupled agentic architecture with Supabase as the central data hub.

## Key Technologies
- **Frontend:** Next.js 15 with TypeScript and Tailwind CSS
- **Backend:** Vercel Serverless Functions (Python for agents)
- **Database:** Supabase with Row Level Security (RLS)
- **AI:** Vercel AI SDK with Deepseek for reasoning
- **Payments:** Stripe integration with tiered contractor plans
- **Authentication:** Supabase Auth with SMS verification

## AI Agent Personas
When working with agent-related code, maintain these distinct personas:

- **Lexi the Liaison:** Friendly onboarding guide for new contractors
- **Alex the Assessor:** Precise, analytical bidding assistant (quantity surveyor persona)
- **Rex the Retriever:** Silent background lead generation agent
- **Felix the Fixer:** Homeowner-facing diagnostic agent (referenced in referrals)

## Architecture Principles
- **Decoupled Intelligence:** Agents communicate only through Supabase, never directly
- **Async UX:** UI never blocks on AI processes
- **Desktop-first:** Professional-grade contractor experience
- **Tiered Payments:** Growth (6% fee, 30/40/30 payouts) vs Scale ($250/mo, 4% fee, 50/25/25 payouts)

## Development Guidelines
- Always implement Row Level Security (RLS) policies for contractor data isolation
- Use the Vercel AI SDK for streaming agent responses
- Follow the established prompt chain architectures (Analyst, Critic, Planner, Tool User, Simulator)
- Store agent interactions in `bids.assistance_data` JSONB column
- Implement proper error handling with `handle_payment_failure` and `handle_agent_error` functions

## File Structure Conventions
- `/src/app/contractor/*` - Contractor-facing pages
- `/src/app/api/agents/*` - AI agent endpoints
- `/src/app/api/payments/*` - Payment processing
- `/src/lib/*` - Shared utilities (supabase.ts, ai.ts)
- `/src/components/*` - Reusable React components

## Supabase Schema
- **Key Tables:** `users`, `contractor_profiles` (with `tier`, `search_sessions_used_this_month`), `jobs`, `bids` (with `assistance_data` jsonb), `payments` (with `status`, `payment_type`, `platform_fee_collected`), `contractor_leads`, `agent_requests`, `agent_responses`, `system_logs`.
- **RLS is CRITICAL:** Enforce policies so contractors only access their own data.

## Environment Setup
- **`.env.local`:** Populate keys for Supabase, Deepseek/LLM, Stripe (Test Keys), and Twilio.

## 🎯 Development Workflow

### Contextual Awareness
- **Analyze Previous Turns:** Before responding, review the last 2-4 turns of the conversation to maintain context and avoid redundancy.

### Hook-First Development Process
1. **Define business requirements** → Create custom hook with TypeScript interfaces
2. **Implement backend logic** → Vercel function with Python
3. **Develop frontend components** → React components with Tailwind CSS
4. **Integrate AI agents** → Connect with Vercel AI SDK
5. **Set up payments** → Stripe integration for contractor tiers
6. **Test thoroughly** → Unit, integration, and end-to-end tests
7. **Deploy on Vercel** → Preview deployment for review, then production

### Key Tasks
1.  **Implement Payment Logic (`/api/payments/`):**
    -   Create the Stripe webhook handler (`webhook_handler.py`).
    -   Implement the payout logic differentiating between `tier` ('free' vs 'premium').
    -   Build robust error handling (`handle_payment_failure`).
2.  **Build the Bidding Interface (`/contractor/bid/[job_id]`):**
    -   Integrate the Vercel AI SDK to stream responses from **Alex the Assessor** via the `/api/agents/alex_assist` endpoint.
    -   Render Alex's structured JSON responses into interactive Mantine components.
3.  **Implement Rex the Retriever (`/api/agents/rex_run`):**
    -   Create the backend function for the lead generation batch process.
    -   Set up a Vercel CRON job to trigger this function.
4.  **Develop Admin Views:**
    -   Build admin-only pages that use tools like `ADMIN_TOOL_view_job_ledger` to get a full financial picture of a job from Supabase.
5.  **Write End-to-End Tests (Cypress/Playwright):**
    -   Prioritize testing the full payment lifecycle for both contractor tiers.
    -   Test Admin intervention scenarios and API failure modes.

## Agent Prompts & Personas
- Adhere strictly to the defined system prompts and personas for **Lexi**, **Alex**, and **Rex** to ensure a consistent brand experience.

## AI Agent Interaction System

### @ Mention Protocol
The system supports both explicit agent calls and intelligent orchestration:

#### Explicit @ Mentions
- **@lexi** - Directly invokes Lexi for onboarding and setup questions
- **@alex** - Directly invokes Alex for bidding and cost estimation
- **@rex** - Directly invokes Rex for lead generation and market insights

#### Orchestrated Agent Routing
When no explicit @ mention is used, the system automatically routes messages based on content analysis:

**Lexi Keywords:** onboard, getting started, setup, profile, new, help me start
**Alex Keywords:** bid, price, cost, estimate, quote, material, labor
**Rex Keywords:** lead, search, generate, opportunities, find work, jobs

#### Fallback Logic
1. Route to most recently active chat window
2. Default to Lexi for general queries
3. Auto-open appropriate agent chat window when routing

### Generative UI Asset Requirements

#### JSON Response Format
All agent responses must support structured data alongside conversational text:

```json
{
  "message": "Conversational response text",
  "ui_assets": {
    "type": "cost_breakdown" | "lead_summary" | "onboarding_checklist" | "market_insights",
    "data": {
      // Structured data for UI component rendering
    },
    "render_hints": {
      "component": "CostBreakdownCard | LeadCard | ChecklistWidget | InsightChart",
      "priority": "high" | "medium" | "low",
      "interactive": true | false
    }
  },
  "actions": [
    {
      "type": "update_profile" | "create_bid" | "mark_lead_interested",
      "label": "Human-readable action text",
      "data": { /* action payload */ }
    }
  ]
}
```

#### UI Component Types

**Alex's Cost Breakdown Cards:**
```json
{
  "type": "cost_breakdown",
  "data": {
    "total_estimate": 2500,
    "labor_cost": 1200,
    "materials": [
      {"item": "Ceramic tiles", "quantity": "120 sq ft", "unit_cost": 4.50, "total": 540},
      {"item": "Grout", "quantity": "5 bags", "unit_cost": 12.00, "total": 60}
    ],
    "overhead": 300,
    "profit_margin": 400,
    "timeline": "3-4 days"
  }
}
```

**Rex's Lead Summary Cards:**
```json
{
  "type": "lead_summary",
  "data": {
    "lead_count": 12,
    "high_value_leads": 3,
    "geographic_distribution": {...},
    "trending_services": ["kitchen remodel", "bathroom renovation"],
    "conversion_probability": 0.68
  }
}
```

**Lexi's Onboarding Checklists:**
```json
{
  "type": "onboarding_checklist",
  "data": {
    "steps": [
      {"id": "profile", "label": "Complete business profile", "status": "completed"},
      {"id": "services", "label": "Select your services", "status": "in_progress"},
      {"id": "pricing", "label": "Set pricing strategy", "status": "pending"}
    ],
    "completion_percentage": 60
  }
}
```

### Reference Implementation
See [v0.dev contractor chat example](https://v0.dev/chat/b/b_MX1Ev6PvA7e) for generative UI patterns and component interactions.

### Felix Integration
All contractor-generated leads reference Felix's 40-problem diagnostic framework (see `Felix_40_Problem_Reference.md`):
- Problem classification maps to contractor specialties
- Urgency scoring prioritizes contractor notifications  
- Quality assessment ensures high-value lead generation
- Felix's assessments feed the contractor matching algorithm
