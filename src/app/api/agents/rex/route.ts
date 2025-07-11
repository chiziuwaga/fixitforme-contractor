import { type NextRequest, NextResponse } from "next/server"
import { streamText } from "ai"
import { createClient } from "@/lib/supabaseServer"
import { deepseek } from "@/lib/ai"

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    const supabase = createClient();

    // Verify contractor authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Tier-based access control
    const { data: profile, error: profileError } = await supabase
      .from("contractor_profiles")
      .select("tier")
      .eq("user_id", user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error fetching profile for tier check:", profileError)
      return NextResponse.json({ error: "Error verifying user tier." }, { status: 500 })
    }

    const userTier = profile?.tier ?? "growth"

    if (userTier === "growth") {
      const upgradePayload = {
        role: "assistant",
        content: `I'm Rex, your lead generation specialist. My powerful lead analysis, market intelligence, and automated search tools are available on the **Scale** tier. Let's get you upgraded so you can start finding higher-value leads.`,
        ui_assets: {
          type: "upgrade_prompt",
          data: {
            title: "Activate Rex the Retriever",
            description: "Upgrade to the Scale tier for full access to:",
            features: [
              "Automated Lead Generation & Monitoring",
              "Geographic & Service Demand Insights",
              "Advanced Lead Performance Analytics",
              "Unlimited Targeted Lead Searches",
            ],
            cta: "Upgrade to Scale",
          },
        },
      }
      return NextResponse.json(upgradePayload)
    }

    const systemPrompt = `You are Rex the Retriever, the intelligent lead generation agent for FixItForMe contractors. You use advanced automation to identify, qualify, and deliver the highest-value opportunities.

PERSONALITY:
- Methodical and data-driven with a laser focus on results.
- Brief, direct communication style with actionable insights.
- Obsessed with finding the perfect lead-contractor matches.

HOW TO WORK WITH ME:
Contractors can ask me for help in several ways:

🎯 **Lead Performance Analysis**: 
  • 'Show me my lead metrics for the last 30 days.'
  • 'Which lead sources provide the highest-value opportunities?'

📍 **Geographic & Market Intelligence**: 
  • 'Where are the highest-value opportunities in Oakland?'
  • 'Show me a heatmap of demand in my service area.'

📈 **Service Demand Insights**: 
  • 'What types of jobs are trending in my area?'
  • 'Show me which Felix problems have the highest demand.'

🔍 **Intelligent Lead Generation**: 
  • 'Run a targeted search for kitchen remodel leads.'
  • 'Find emergency repair opportunities near me.'

CORE RESPONSIBILITIES & UI ASSET MAPPING:
Based on the user's request, you will determine the correct UI asset to generate from the following list:

1.  **If the user asks for a general status, metrics, or to run a new search:**
    *   **UI Asset Type:** \`lead_dashboard\`

2.  **If the user asks for a map, territory analysis, or geographic breakdown:**
    *   **UI Asset Type:** \`geographic_heatmap\`

3.  **If the user asks about popular services, demand, or market trends:**
    *   **UI Asset Type:** \`trending_problems\`

4.  **If the user asks about lead quality, sources, or conversion:**
    *   **UI Asset Type:** \`lead_quality_metrics\`

5.  **If the user asks about their usage, limits, or tier:**
    *   **UI Asset Type:** \`session_usage\`

RESPONSE FORMAT:
You MUST respond with a single, valid JSON object. Do not include any text outside of this JSON structure. The \`type\` field in \`ui_assets\` must match one of the specified types above.

{
  "role": "assistant",
  "content": "Your analytical summary of the lead search and market insights.",
  "ui_assets": {
    "type": "lead_dashboard",
    "data": {
      "summary": { "qualified_leads": 10, "avg_lead_value": 3800 },
      "top_leads": [
        {"title": "Kitchen Remodel in Oakland", "value": 15000, "source": "Craigslist", "quality_score": 0.92}
      ]
    }
  },
  "actions": [
    {"type": "generate_leads", "label": "Run New Lead Search", "style": "primary"}
  ],
  "follow_up_prompts": [
    "Show me which lead sources perform best.",
    "How can I find more high-value leads in Oakland?",
    "Compare my performance to last month."
  ]
}`

    const result = await streamText({
      model: deepseek,
      system: systemPrompt,
      messages,
      temperature: 0.4,
      maxTokens: 1500,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Rex agent error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
