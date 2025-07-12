import { type NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { createClient } from "@/lib/supabaseServer";
import { deepseek } from "@/lib/ai";
import { createAgentQLClient, felixToSearchTerms } from "@/lib/agentql";

// Helper functions for Alex material analysis
function extractProjectContext(message: string, profile: any) {
  const lowerMessage = message.toLowerCase();
  
  const detectProjectType = (msg: string): string => {
    const projectTypes = {
      'kitchen': ['kitchen', 'cabinet', 'countertop', 'backsplash'],
      'bathroom': ['bathroom', 'vanity', 'toilet', 'shower', 'bathtub'],
      'roofing': ['roof', 'shingle', 'gutter', 'flashing'],
      'electrical': ['electrical', 'outlet', 'switch', 'panel', 'wiring'],
      'plumbing': ['plumbing', 'pipe', 'faucet', 'water', 'drain'],
      'flooring': ['floor', 'tile', 'hardwood', 'carpet', 'vinyl'],
      'drywall': ['drywall', 'wall', 'ceiling', 'painting', 'texture'],
      'hvac': ['hvac', 'heating', 'cooling', 'ductwork', 'furnace']
    };

    for (const [type, keywords] of Object.entries(projectTypes)) {
      if (keywords.some(keyword => msg.includes(keyword))) {
        return type;
      }
    }
    return 'general';
  };

  const requiresMaterialResearch = (msg: string): boolean => {
    const researchTriggers = [
      'material', 'cost', 'price', 'estimate', 'quote', 'budget',
      'how much', 'breakdown', 'supplier', 'parts', 'equipment'
    ];
    return researchTriggers.some(trigger => msg.includes(trigger));
  };

  const extractValueRange = (msg: string): string => {
    const dollarMatch = msg.match(/\$[\d,]+/);
    if (dollarMatch) return dollarMatch[0];
    
    const rangeKeywords = {
      'small': 'Under $5,000',
      'medium': '$5,000 - $20,000', 
      'large': '$20,000 - $50,000',
      'major': 'Over $50,000'
    };

    for (const [key, range] of Object.entries(rangeKeywords)) {
      if (msg.includes(key)) return range;
    }
    return 'Not specified';
  };

  const detectUrgency = (msg: string): 'low' | 'medium' | 'high' => {
    const highUrgency = ['urgent', 'asap', 'emergency', 'immediately', 'rush'];
    const mediumUrgency = ['soon', 'quickly', 'fast', 'prompt'];
    
    if (highUrgency.some(word => msg.includes(word))) return 'high';
    if (mediumUrgency.some(word => msg.includes(word))) return 'medium';
    return 'low';
  };

  const extractSpecialRequirements = (msg: string): string[] => {
    const requirements = [];
    if (msg.includes('permit')) requirements.push('Permits required');
    if (msg.includes('license')) requirements.push('Licensed contractor needed');
    if (msg.includes('insurance')) requirements.push('Insurance verification');
    if (msg.includes('emergency')) requirements.push('Emergency service');
    return requirements;
  };
  
  return {
    projectType: detectProjectType(lowerMessage),
    requiresMaterialResearch: requiresMaterialResearch(lowerMessage),
    estimatedValue: extractValueRange(lowerMessage),
    urgency: detectUrgency(lowerMessage),
    location: profile?.location || null,
    specialRequirements: extractSpecialRequirements(lowerMessage)
  };
}

function generateSearchTerms(context: any): string[] {
  const { projectType } = context;
  
  // Map to Felix problem categories if possible
  const projectTypeMapping: Record<string, number[]> = {
    'kitchen': [6, 21, 22], // Cabinet, kitchen remodel
    'bathroom': [1, 2, 7, 23], // Toilet, faucet, vanity, bathroom remodel
    'electrical': [3, 4, 12], // Outlet, light fixture, electrical system
    'plumbing': [1, 2, 10, 13], // Toilet, faucet, plumbing, water system
    'roofing': [31, 32], // Roof repair, roof replacement
    'flooring': [24, 25], // Hardwood, tile flooring
    'drywall': [5, 26], // Drywall repair, painting
    'hvac': [14, 15] // HVAC system, ductwork
  };

  const felixProblems = projectTypeMapping[projectType] || [1]; // Default to toilet repair
  const searchTerms: string[] = [];
  
  felixProblems.forEach(problemId => {
    const terms = felixToSearchTerms[problemId];
    if (terms) searchTerms.push(...terms);
  });

  return searchTerms.length > 0 ? searchTerms : [projectType + ' materials'];
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    const supabase = createClient();

    // Verify contractor authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Tier-based access control
    const { data: profile, error: profileError } = await supabase
      .from("contractor_profiles")
      .select("tier")
      .eq("user_id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error fetching profile for tier check:", profileError);
      return NextResponse.json({ error: "Error verifying user tier." }, { status: 500 });
    }

    const userTier = profile?.tier ?? "growth";

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
      };
      return NextResponse.json(upgradePayload);
    }

    // Get contractor profile for context
    const { data: contractorProfile } = await supabase
      .from("contractor_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Extract project details from conversation
    const lastMessage = messages[messages.length - 1]?.content || "";
    const projectContext = extractProjectContext(lastMessage, contractorProfile);

    // NEW: AgentQL Material Research Integration
    let materialResearchData = null;
    if (projectContext.requiresMaterialResearch) {
      try {
        const agentQL = createAgentQLClient();
        const searchTerms = generateSearchTerms(projectContext);
        const location = contractorProfile?.location || "Oakland, CA";
            console.log(`[Alex] Starting material research for: ${searchTerms.join(', ')}`);

      materialResearchData = await agentQL.researchMaterials(
        searchTerms, // Material list
        projectContext, // Project context
        { // Contractor profile
          id: user.id,
          services_offered: contractorProfile?.services || [],
          location: {
            city: location.split(',')[0],
            state: location.split(',')[1] || 'Unknown',
            radius_miles: 25
          },
          tier: userTier as 'growth' | 'scale'
        }
      );
        
        console.log(`[Alex] Material research completed: ${materialResearchData.length} sources`);
      } catch (error) {
        console.error("[Alex] Material research failed:", error);
        // Continue without material data - Alex can still provide estimates
      }
    }

    const systemPrompt = `You are Alex the Assessor, the analytical quantity surveyor and bidding specialist for FixItForMe contractors.

PERSONALITY:
- Precise, analytical, and detail-oriented
- Professional quantity surveyor expertise
- Strategic bidding and pricing specialist
- Thorough in cost analysis and risk assessment

CONTRACTOR CONTEXT:
- Location: ${contractorProfile?.location || "Not specified"}
- Services: ${contractorProfile?.services?.join(", ") || "Not specified"}
- Experience Level: ${contractorProfile?.experience_years || "Not specified"} years
- Tier: ${userTier.toUpperCase()}

PROJECT ANALYSIS CONTEXT:
${JSON.stringify(projectContext, null, 2)}

${materialResearchData ? `
REAL-TIME MATERIAL RESEARCH DATA:
${JSON.stringify(materialResearchData.slice(0, 2), null, 2)}
Use this current market data in your cost analysis and recommendations.
` : ''}

CORE CAPABILITIES:
1. **Comprehensive Cost Analysis**: Break down materials, labor, permits, overhead, and profit margins
2. **Real-Time Material Research**: Use AgentQL to get current pricing from Home Depot, Lowe's, and regional suppliers
3. **Strategic Bidding Advice**: Competitive positioning, win probability analysis, pricing strategies
4. **Risk Assessment**: Project complexity, timeline risks, cost overrun probability
5. **Felix Framework Integration**: Map project requirements to Felix's 40-problem categories for accurate scoping

RESPONSE FORMAT:
You must respond with structured JSON including both analysis and interactive UI components:

{
  "message": "Your detailed analytical response with cost breakdown and strategic recommendations",
  "ui_assets": {
    "type": "alex_cost_breakdown",
    "data": {
      "project_summary": {
        "title": "Project Title",
        "scope": "Detailed scope description",
        "complexity": "low|medium|high",
        "estimated_duration": "X days/weeks"
      },
      "cost_breakdown": {
        "materials": {
          "total": 0000,
          "items": [
            {
              "category": "Category Name",
              "description": "Item description",
              "quantity": "X units",
              "unit_cost": 00,
              "total_cost": 0000,
              "supplier": "Home Depot|Lowe's|Local",
              "availability": "In Stock|Order Required"
            }
          ]
        },
        "labor": {
          "total": 0000,
          "breakdown": [
            {
              "trade": "Trade type",
              "hours": 00,
              "rate": 00,
              "total": 0000
            }
          ]
        },
        "permits": 000,
        "overhead": 000,
        "profit_margin": 000,
        "total_project_cost": 0000
      },
      "bidding_strategy": {
        "recommended_bid": 0000,
        "win_probability": "X%",
        "competitive_position": "competitive|premium|value",
        "key_differentiators": ["Point 1", "Point 2"],
        "risk_factors": ["Risk 1", "Risk 2"]
      },
      "material_insights": ${materialResearchData ? `{
        "price_variance": "X% difference between suppliers",
        "availability_issues": "Any supply chain concerns",
        "cost_optimization": "Recommendations for cost savings",
        "supplier_recommendations": "Best suppliers for this project"
      }` : 'null'},
      "timeline": {
        "phases": [
          {
            "phase": "Phase Name",
            "duration": "X days",
            "dependencies": ["Dependency 1"]
          }
        ],
        "total_duration": "X weeks",
        "critical_path": "Key milestone sequence"
      },
      "pre_prompts": [
        "Analyze alternative materials to reduce costs",
        "Compare this bid to local market rates",
        "Research permit requirements for this project"
      ]
    }
  }
}

IMPORTANT GUIDELINES:
1. Use REAL material pricing data when available from AgentQL research
2. Include specific supplier recommendations with current availability
3. Factor in regional labor rates for ${contractorProfile?.location || "the area"}
4. Consider seasonal pricing variations and supply chain factors
5. Always provide 3 strategic pre-prompts for follow-up questions
6. Include Felix problem category mapping when relevant
7. Highlight any cost optimization opportunities discovered through material research

Begin your analysis now, incorporating all available market data.`;

    const result = await streamText({
      model: deepseek,
      system: systemPrompt,
      messages,
      temperature: 0.3,
      maxTokens: 1500,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Alex agent error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}