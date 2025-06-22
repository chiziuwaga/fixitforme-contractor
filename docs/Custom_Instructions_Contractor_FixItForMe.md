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
- **Tiered Payments:** Growth (10% fee, 30/40/30 payouts) vs Scale ($250/mo, 7% fee, 50/25/25 payouts)

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

## Development Workflow & Key Tasks
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
