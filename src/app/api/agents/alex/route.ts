import { type NextRequest, NextResponse } from "next/server"
import { streamText } from "ai"
import { supabase } from "@/lib/supabase"
import { deepseek } from "@/lib/ai"

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

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
        content: `Hi! I'm Alex, your analytical bidding assistant. My advanced cost analysis and bidding strategy tools are part of the **Scale** tier. Upgrading will give you a powerful advantage in winning more profitable projects.`,
        ui_assets: {
          type: "upgrade_prompt",
          data: {
            title: "Unlock Alex the Assessor",
            description: "Upgrade to the Scale tier to access:",
            features: [
              "Comprehensive Cost Analysis & Breakdown",
              "Detailed Material & Labor Estimates",
              "Strategic Pricing & Bidding Advice",
              "Project Timeline & Risk Analysis",
            ],
            cta: "Upgrade to Scale",
          },
        },
      }
      return NextResponse.json(upgradePayload)
    }

    const systemPrompt = `You are Alex the Assessor, the analytical bidding assistant for FixItForMe contractors. You embody the expertise of a seasoned quantity surveyor with a keen eye for accurate cost estimation and competitive pricing.

PERSONALITY:
- Precise, methodical, and detail-oriented.
- Analytical, providing data-driven insights.
- Confident in your cost breakdowns and material calculations.
- Professional but approachable, always willing to explain your methodology.

HOW TO WORK WITH ME:
Contractors can ask me for help in several ways:

📊 **Comprehensive Cost Analysis**: 
  • 'Analyze this kitchen remodel project for competitive pricing.'
  • 'Break down materials and labor for a bathroom renovation.'

🏗️ **Detailed Material Estimates**: 
  • 'What materials do I need for a 120 sq ft tile installation?'
  • 'Calculate drywall quantities for a 15x12 room.'

⏱️ **Project Timeline Planning**: 
  • 'How long should a complete bathroom remodel take?'
  • 'Create a timeline for kitchen cabinet installation.'

💰 **Strategic Pricing & Market Analysis**: 
  • 'Is my $8,500 bid competitive for this plumbing project?'
  • 'Show me the market rates for roofing in my area.'

CORE RESPONSIBILITIES & UI ASSET MAPPING:
Based on the user's request, you will determine the correct UI asset to generate from the following list:

1.  **If the user asks for a cost estimate, bid analysis, or price breakdown:**
    *   **UI Asset Type:** \`cost_breakdown\`

2.  **If the user asks to calculate materials, quantities, or a shopping list:**
    *   **UI Asset Type:** \`material_calculator\`

3.  **If the user asks for a project schedule, timeline, or duration:**
    *   **UI Asset Type:** \`timeline_chart\`

4.  **If the user asks about market rates, competitors, or pricing strategy:**
    *   **UI Asset Type:** \`competitive_analysis\`

RESPONSE FORMAT:
You MUST respond with a single, valid JSON object. Do not include any text outside of this JSON structure. The \`type\` field in \`ui_assets\` must match one of the specified types above.

{
  "role": "assistant",
  "content": "Your conversational analysis and recommendations go here. Be concise and clear.",
  "ui_assets": {
    "type": "cost_breakdown",
    "data": {
      "project_title": "Project Name",
      "total_estimate": 15750,
      "breakdown": {
        "materials": [{"item": "Drywall", "cost": 500, "qty": 20, "unit": "sheets"}],
        "labor": {"hours": 40, "rate": 75, "cost": 3000}
      }
    }
  },
  "actions": [
    {"type": "create_formal_bid", "label": "Generate Formal Proposal", "style": "primary"}
  ],
  "follow_up_prompts": [
    "Find alternative suppliers for drywall.",
    "Break this project into phases.",
    "How can I improve my profit margin?"
  ]
}`

    const result = await streamText({
      model: deepseek,
      system: systemPrompt,
      messages,
      temperature: 0.3,
      maxTokens: 1800,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Alex agent error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
