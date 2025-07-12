import { NextRequest, NextResponse } from "next/server"
import { streamText } from "ai"
import { deepseek } from "@/lib/ai"
import { createClient } from "@/lib/supabase"
import { orchestrateMessage, createOrchestrationContext, LexiOrchestrator } from "@/lib/orchestration"
import { createAgentQLClient } from "@/lib/agentql"

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    const lastMessage = messages[messages.length - 1]?.content || ""

    const supabase = createClient();

    // Verify contractor authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get contractor profile and current state
    const { data: contractorProfile } = await supabase.from("contractors").select("*").eq("id", user.id).single()

    // Get current subscription tier
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("contractor_id", user.id)
      .eq("status", "active")
      .single()

    // Get onboarding completion status
    const { data: onboardingSteps } = await supabase
      .from("onboarding_progress")
      .select("*")
      .eq("contractor_id", user.id)

    // Get current month's usage statistics
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: currentUsage } = await supabase
      .from("usage_tracking")
      .select("*")
      .eq("contractor_id", user.id)
      .gte("created_at", startOfMonth.toISOString()) // Calculate usage limits based on tier
    const currentTier = subscription?.tier || "growth"
    const tierLimits: Record<string, { bids: number; chats: number; messages: number; services: number }> = {
      growth: { bids: 10, chats: 10, messages: 50, services: 5 },
      scale: { bids: 50, chats: 30, messages: 200, services: 15 },
    }

    // Get peer benchmarking data (anonymous aggregated data)
    const { data: peerData } = await supabase
      .from("contractors")
      .select("avg_bid_value, conversion_rate, services")
      .eq("location", contractorProfile?.location)
      .neq("id", user.id)

    // Calculate profile completion score
    const profileFields = ["business_name", "phone", "location", "services", "bio", "certifications"]
    const completedFields = profileFields.filter((field) => contractorProfile?.[field])
    const profileCompletionScore = Math.round((completedFields.length / profileFields.length) * 100)

    // Prepare contractor intelligence context for agent
    const contractorContext = {
      profile: contractorProfile,
      tier: currentTier,
      usage: currentUsage,
      limits: tierLimits[currentTier],
      onboarding: onboardingSteps,
      profileScore: profileCompletionScore,
      peerBenchmarks: peerData
        ? {
            avgBidValue: peerData.reduce((sum, p) => sum + (p.avg_bid_value || 0), 0) / peerData.length,
            avgConversionRate: peerData.reduce((sum, p) => sum + (p.conversion_rate || 0), 0) / peerData.length,
            commonServices: peerData.flatMap((p) => p.services || []).slice(0, 5),
          }
        : null,
    }

    // NEW: Orchestration Analysis
    const orchestrationContext = createOrchestrationContext(
      lastMessage,
      'lexi', // Current agent
      ['lexi'], // Active chats (Lexi is always active)
      [], // Conversation history - could be populated from Supabase
      {
        services: contractorProfile?.services || [],
        location: contractorProfile?.location || "",
        tier: currentTier as 'growth' | 'scale'
      }
    );

    const orchestrationResult = orchestrateMessage(orchestrationContext);
    const orchestrator = LexiOrchestrator.getInstance();

    // Build dynamic system prompt enhancements
    let systemPromptAdditions = '';

    // Check if user should be routed to a different agent
    if (orchestrationResult.targetAgent !== 'lexi') {
      const accessCheck = orchestrator.validateAgentAccess(
        orchestrationResult.targetAgent,
        orchestrationContext.contractorProfile
      );

      if (!accessCheck.hasAccess) {
        // Generate upgrade prompt instead of routing
        const upgradePrompt = `I see you want to use @${orchestrationResult.targetAgent}, but that requires a Scale tier subscription. 
        
        ${accessCheck.reason}
        
        Would you like me to explain the Scale tier benefits and how to upgrade?`;
        
        // Continue with Lexi but include upgrade guidance
        systemPromptAdditions += `\n\nORCHESTRATION NOTICE: User tried to access @${orchestrationResult.targetAgent} but lacks Scale tier. Guide them toward upgrade. ${upgradePrompt}`;
      } else {
        // Generate routing instruction for UI
        const routingInstruction = {
          route_to_agent: orchestrationResult.targetAgent,
          reason: orchestrationResult.reason,
          preprocessed_message: orchestrationResult.preprocessedMessage,
          context: orchestrator.generateContextualPrompt(orchestrationResult, orchestrationContext)
        };

        return NextResponse.json({
          role: "assistant",
          content: `I understand you want to work with @${orchestrationResult.targetAgent}. Let me route your message there.`,
          ui_assets: {
            type: "agent_routing",
            data: routingInstruction
          }
        });
      }
    }

    // Enhanced system prompt with orchestration awareness
    const enhancedSystemPrompt = `You are Lexi the Liaison, the core orchestrator and friendly onboarding guide for FixItForMe.

ORCHESTRATION CAPABILITIES:
You are the CENTRAL HUB for all agent interactions. When users mention @alex or @rex, you:
1. Analyze their request and validate their tier access
2. Route them to the appropriate agent with context
3. Handle tier limitations gracefully with upgrade guidance
4. Maintain conversation continuity across all agent interactions

ORCHESTRATION ANALYSIS FOR THIS MESSAGE:
- Target Agent: ${orchestrationResult.targetAgent}
- Routing Reason: ${orchestrationResult.reason}
- User Intent: ${orchestrationResult.context}
- Should Open New Chat: ${orchestrationResult.shouldOpenNewChat}

AGENT ROUTING PROTOCOL:
- @lexi (you) - Onboarding, platform guidance, tier management, general assistance
- @alex - Bidding assistance, cost analysis, material research (Scale tier only)
- @rex - Lead generation, market insights, opportunity discovery (Scale tier only)

When users ask for @alex or @rex without Scale tier, provide compelling upgrade guidance with specific ROI calculations.

PERSONALITY:
- Warm, encouraging, and genuinely helpful.
- Patient and professional, breaking down complex topics into simple steps.

CURRENT CONTRACTOR CONTEXT:
- Profile Completion: ${profileCompletionScore}%
- Current Tier: ${currentTier.toUpperCase()}
- Location: ${contractorProfile?.location || "Not set"}
- Services: ${contractorProfile?.services?.join(", ") || "None selected"}
- Orchestration Context: ${orchestrationResult.context}

CORE RESPONSIBILITIES:
1. AGENT ORCHESTRATION: Route @mentions to appropriate agents with full context
2. Complete onboarding guidance with real-time progress tracking
3. Felix framework service selection strategy with peer benchmarks
4. Tier comparison and upgrade timing recommendations with ROI analysis  
5. Feature education for Alex and Rex capabilities with personalized demos
6. System limits enforcement with friendly upgrade prompts and usage tracking
7. Best practices for lead conversion and business growth based on local market data
8. Market intelligence and competitive positioning advice using peer benchmarks
9. Technical support and workflow optimization

💡 **ORCHESTRATION EXAMPLES:**
"@alex can you help me bid on this kitchen remodel?" → Route to Alex with project context
"@rex find me plumbing leads" → Route to Rex with service category filter
"@lexi how do I upgrade?" → Handle directly with tier comparison

Always maintain context when routing between agents and provide seamless user experience.${systemPromptAdditions}`;

    const result = await streamText({
      model: deepseek,
      system: enhancedSystemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 1200,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Lexi agent error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
