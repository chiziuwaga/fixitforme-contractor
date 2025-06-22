# FixItForMe: Phased Implementation Plan for Contractor Module

This document outlines a phased development plan for the FixItForMe Contractor Module. The goal is to build a robust, AI-driven platform on Vercel, using Next.js for the frontend, Python for the backend, and Supabase as the central data hub, following a decoupled agentic architecture.

---

## Guiding Principles & Reference Documents

**Success depends on adhering to the architectural vision outlined in the core documents.** All development should align with these specifications.

*   **Primary Specification:** `FixItForMe_Contractor_Module_Specs.md`
*   **Technical Instructions:** `Custom_Instructions_Contractor_FixItForMe.md`
*   **Lead Generation Bible:** `AgentQL_Architecture_for_Contractor_Lead_Generation.md`
*   **Generative UI Reference:** [v0.dev Chat Example](https://v0.dev/chat/b/b_MX1Ev6PvA7e)

**Rule for Changes:** Any deviation or new feature proposal must be reflected by an update to these core documents *before* implementation begins. This ensures our documentation remains the single source of truth.

---

## Phase 1: Foundation & Core Infrastructure (Weeks 1-2) ✅ COMPLETE

**Objective:** Establish the project backbone, including the database schema, authentication, and the basic application shell.

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
    *   🔄 Build the main application layout, including the header, navigation, and the static structure of the `/contractor/dashboard` based on the ASCII mockup in `FixItForMe_Contractor_Module_Specs.md`.

---

## Phase 2: Agent Integration & Generative UI (Weeks 3-5) 🔄 IN PROGRESS

**Objective:** Implement the primary agent interactions for onboarding (Lexi) and bidding (Alex) using a generative, chat-based UI powered by the Vercel AI SDK.

**Key Tasks:**

1.  **Vercel AI SDK & Generative UI:**
    *   ✅ Install and configure the Vercel AI SDK on both the frontend and backend.
    *   ✅ Create a `lib/ai.ts` file (or a similar client-side helper) to manage streaming UI from agent responses, as inspired by the `v0.dev` reference.
    *   🔄 Design the "nested chat window" UI, which will serve as the primary interface for invoking and interacting with AI agents.

2.  **Lexi - The Onboarder:**
    *   🔄 Develop the `/api/onboarding/` endpoints using Python.
    *   🔄 Implement the "Planner Chain" prompt architecture for Lexi, adhering to her persona defined in `FixItForMe_Contractor_Module_Specs.md`.
    *   🔄 Build the interactive onboarding UI where Lexi's streamed responses guide the user, updating the `contractor_profiles` table upon completion.

3.  **Alex - The Assessor:**
    *   🔄 Develop the `/api/agents/alex_assist` streaming endpoint.
    *   🔄 Implement the "Analyst Chain" and "Critic Chain" prompt architectures for Alex using Deepseek for reasoning, ensuring his persona matches the spec.
    *   🔄 Build the "Job Bid View" (`/contractor/bid/[job_id]`), integrating the generative chat UI for contractors to interact with Alex.
    *   🔄 Render Alex's structured JSON responses (e.g., cost breakdowns) into interactive Mantine components.
    *   🔄 Persist the full conversation and structured data into the `bids.assistance_data` JSONB column.

---

## Phase 3: Rex - Lead Generation & Job Feed (Weeks 6-7)

**Objective:** Activate the background lead generation agent (Rex) and populate the contractor's dashboard with a unified feed of jobs and leads.

**Key Tasks:**

1.  **Rex - The Retriever Backend:**
    *   Implement the `/api/agents/rex_run` asynchronous endpoint. This implementation must **strictly follow** the detailed plans in the `AgentQL_Architecture_for_Contractor_Lead_Generation.md` document.
    *   Implement the "Tool User Chain" architecture, where Rex's sole purpose is to execute tools (web scrapers, API clients) to populate the `contractor_leads` table.
    *   Integrate the specified recency scoring and quality control logic as defined in the architecture document.

2.  **Automation & Dashboard Integration:**
    *   Configure a Vercel CRON job to periodically trigger the `/api/agents/rex_run` endpoint.
    *   Implement the data fetching logic on the `/contractor/dashboard` to display a merged, real-time feed from both the `jobs` table (internal) and `contractor_leads` table (external).

3.  **Search View:**
    *   Build the `/contractor/search` page to allow manual triggering of Rex's runs and to display the remaining monthly search sessions.

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
