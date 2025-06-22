<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

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
