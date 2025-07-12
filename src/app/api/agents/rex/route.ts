import { type NextRequest, NextResponse } from "next/server"
import { streamText } from "ai"
import { createClient } from "@/lib/supabaseServer"
import { deepseek } from "@/lib/ai"
import { createAgentQLClient, felixToSearchTerms } from "@/lib/agentql"

// Helper functions for Rex lead generation
const extractSearchContext = (message: string, profile: any) => {
  const lowerMessage = message.toLowerCase();
  
  return {
    performSearch: shouldPerformLiveSearch(lowerMessage),
    serviceFilter: extractServiceFilter(lowerMessage, profile?.services),
    locationFilter: extractLocationFilter(lowerMessage, profile?.location),
    valueRange: extractValueRange(lowerMessage),
    urgencyPreference: detectUrgencyPreference(lowerMessage),
    platformPreference: extractPlatformPreference(lowerMessage)
  };
};

const shouldPerformLiveSearch = (message: string): boolean => {
  const searchTriggers = [
    'find', 'search', 'generate', 'look for', 'get leads', 
    'opportunities', 'work available', 'projects', 'jobs'
  ];
  return searchTriggers.some(trigger => message.includes(trigger));
};

const extractServiceFilter = (message: string, profileServices: number[] = []): string[] => {
  const serviceKeywords = {
    'plumbing': ['plumbing', 'pipe', 'toilet', 'faucet', 'water'],
    'electrical': ['electrical', 'wiring', 'outlet', 'panel', 'switch'],
    'roofing': ['roof', 'shingle', 'gutter', 'leak'],
    'drywall': ['drywall', 'wall', 'ceiling', 'paint'],
    'flooring': ['floor', 'tile', 'hardwood', 'carpet'],
    'kitchen': ['kitchen', 'cabinet', 'countertop'],
    'bathroom': ['bathroom', 'vanity', 'shower', 'bathtub'],
    'hvac': ['hvac', 'heating', 'cooling', 'furnace']
  };

  const mentionedServices = [];
  for (const [service, keywords] of Object.entries(serviceKeywords)) {
    if (keywords.some(keyword => message.includes(keyword))) {
      mentionedServices.push(service);
    }
  }

  // If no specific services mentioned, use contractor's profile
  if (mentionedServices.length === 0 && profileServices.length > 0) {
    return mapServicesToCategories(profileServices);
  }

  return mentionedServices;
};

const extractLocationFilter = (message: string, profileLocation: string): string => {
  // Look for location mentions in message
  const locationMatch = message.match(/in\s+([A-Za-z\s,]+)/);
  if (locationMatch) {
    return locationMatch[1].trim();
  }
  return profileLocation || "Oakland, CA";
};

const extractValueRange = (message: string): string => {
  const dollarMatch = message.match(/\$[\d,]+(?:\s*-\s*\$[\d,]+)?/);
  if (dollarMatch) return dollarMatch[0];
  
  const rangeKeywords = {
    'small': '$1,000 - $5,000',
    'medium': '$5,000 - $15,000',
    'large': '$15,000 - $50,000',
    'major': '$50,000+'
  };

  for (const [key, range] of Object.entries(rangeKeywords)) {
    if (message.includes(key)) return range;
  }
  return 'Any value';
};

const detectUrgencyPreference = (message: string): 'any' | 'urgent' | 'flexible' => {
  if (message.includes('urgent') || message.includes('emergency') || message.includes('asap')) {
    return 'urgent';
  }
  if (message.includes('flexible') || message.includes('long term')) {
    return 'flexible';
  }
  return 'any';
};

const extractPlatformPreference = (message: string): string[] => {
  const platforms = ['craigslist', 'facebook', 'government', 'municipal', 'nextdoor'];
  return platforms.filter(platform => message.includes(platform));
};

const mapServicesToCategories = (serviceIds: number[]): string[] => {
  // Map Felix problem IDs to search categories
  const categoryMapping: Record<number, string> = {
    1: 'plumbing', 2: 'plumbing', 3: 'electrical', 4: 'electrical',
    5: 'drywall', 6: 'kitchen', 7: 'bathroom', 8: 'flooring',
    9: 'painting', 10: 'plumbing', 11: 'electrical', 12: 'electrical',
    13: 'plumbing', 14: 'hvac', 15: 'hvac', 16: 'electrical',
    17: 'appliance', 18: 'cleaning', 19: 'maintenance', 20: 'general',
    21: 'kitchen', 22: 'kitchen', 23: 'bathroom', 24: 'flooring',
    25: 'flooring', 26: 'painting', 27: 'exterior', 28: 'landscaping',
    29: 'deck', 30: 'fence', 31: 'roofing', 32: 'roofing',
    33: 'foundation', 34: 'insulation', 35: 'windows', 36: 'doors',
    37: 'garage', 38: 'basement', 39: 'attic', 40: 'emergency'
  };

  const categories = serviceIds.map(id => categoryMapping[id]).filter(Boolean);
  return [...new Set(categories)]; // Remove duplicates
};

const mapServicesToNAICS = (serviceIds: number[]): string[] => {
  // Map Felix services to NAICS codes for government contracts
  const naicsMapping: Record<string, string> = {
    'roofing': '238160',
    'drywall': '238310', 
    'painting': '238320',
    'flooring': '238330',
    'electrical': '238210',
    'plumbing': '238220',
    'hvac': '238220'
  };

  const categories = mapServicesToCategories(serviceIds);
  return categories.map((cat: string) => naicsMapping[cat]).filter(Boolean);
};

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

    // Get contractor profile for lead targeting
    const { data: contractorProfile } = await supabase
      .from("contractor_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Extract lead search parameters from conversation
    const lastMessage = messages[messages.length - 1]?.content || "";
    const searchContext = extractSearchContext(lastMessage, contractorProfile);

    // NEW: AgentQL Lead Generation Integration
    let leadGenerationData = null;
    if (searchContext.performSearch) {
      try {
        const agentQL = createAgentQLClient();
        const location = contractorProfile?.location || "Oakland, CA";
        const serviceCategories = mapServicesToCategories(contractorProfile?.services || []);
        
        console.log(`[Rex] Starting lead search for: ${serviceCategories.join(', ')} in ${location}`);
        
        // Create document analysis from contractor profile
        const documentAnalysis = {
          services: contractorProfile?.services || [],
          specialties: contractorProfile?.specialties || [],
          certifications: contractorProfile?.certifications || [],
          experience_areas: serviceCategories,
          project_types: serviceCategories,
          geographic_focus: [location]
        };
        
        // Search multiple platforms concurrently
        const [craigslistResults, governmentResults] = await Promise.all([
          agentQL.generateDocumentBasedLeads(contractorProfile, documentAnalysis),
          agentQL.searchGovernmentContracts(contractorProfile)
        ]);
        
        leadGenerationData = {
          craigslist: craigslistResults,
          government: governmentResults,
          total_sources: 2,
          search_timestamp: new Date().toISOString()
        };
        
        console.log(`[Rex] Lead search completed: ${leadGenerationData.total_sources} platforms searched`);
      } catch (error) {
        console.error("[Rex] Lead generation failed:", error);
        // Continue without live data - Rex can still provide guidance
      }
    }

    const systemPrompt = `You are Rex the Retriever, the data-driven lead generation specialist for FixItForMe contractors.

PERSONALITY:
- Analytical and strategic in lead discovery
- Market intelligence expert
- Focused on ROI and lead quality
- Persistent in finding opportunities

CONTRACTOR CONTEXT:
- Location: ${contractorProfile?.location || "Not specified"}
- Services: ${contractorProfile?.services?.join(", ") || "Not specified"}
- Service Areas: ${contractorProfile?.service_areas?.join(", ") || "Not specified"}
- Tier: ${userTier.toUpperCase()}

LEAD SEARCH CONTEXT:
${JSON.stringify(searchContext, null, 2)}

${leadGenerationData ? `
REAL-TIME LEAD GENERATION DATA:
${JSON.stringify(leadGenerationData, null, 2)}
Use this live market data to provide specific lead recommendations and insights.
` : ''}

CORE CAPABILITIES:
1. **Multi-Platform Lead Discovery**: Search Craigslist, Facebook Marketplace, SAMs.gov, municipal sites
2. **Felix Framework Targeting**: Use contractor's selected services to optimize search terms
3. **Geographic Intelligence**: Analyze local market conditions and competition density  
4. **Quality Scoring**: Relevance (40%) + Recency (30%) + Value (20%) + Urgency (10%)
5. **Lead Performance Analytics**: Track conversion rates and ROI by source

RESPONSE FORMAT:
You must respond with structured JSON including both insights and interactive lead dashboard:

{
  "message": "Your strategic analysis of the lead market and specific recommendations",
  "ui_assets": {
    "type": "rex_lead_dashboard",
    "data": {
      "search_summary": {
        "total_leads_found": 0,
        "platforms_searched": ["Platform 1", "Platform 2"],
        "search_date": "ISO timestamp",
        "location_focus": "Geographic area",
        "service_categories": ["Category 1", "Category 2"]
      },
      "lead_opportunities": [
        {
          "id": "unique_id",
          "title": "Lead title",
          "description": "Brief description",
          "estimated_value": "$X,XXX",
          "location": "City, State",
          "posted_date": "Date",
          "urgency": "low|medium|high",
          "quality_score": 85,
          "relevance_factors": ["Factor 1", "Factor 2"],
          "contact_method": "phone|email|platform",
          "source_platform": "Platform name",
          "competition_level": "low|medium|high",
          "felix_categories": [1, 5, 12]
        }
      ],
      "market_insights": {
        "demand_trends": "Current market conditions",
        "competition_analysis": "Competitive landscape",
        "pricing_intelligence": "Market rate insights",
        "seasonal_factors": "Timing considerations",
        "growth_opportunities": "Expansion recommendations"
      },
      "performance_metrics": ${leadGenerationData ? `{
        "sources_by_performance": "Best performing platforms",
        "avg_response_rate": "X% typical response rate",
        "conversion_insights": "Lead to contract ratios",
        "roi_analysis": "Cost per lead and revenue potential"
      }` : 'null'},
      "recommended_actions": [
        {
          "priority": "high|medium|low",
          "action": "Specific recommended action",
          "reason": "Why this action is recommended",
          "estimated_impact": "Expected outcome"
        }
      ],
      "pre_prompts": [
        "Search for leads in a specific service category",
        "Analyze competition in my area",
        "Find emergency/urgent opportunities"
      ]
    }
  }
}

IMPORTANT GUIDELINES:
1. Use REAL lead data when available from AgentQL searches
2. Prioritize leads by quality score algorithm (Relevance 40%, Recency 30%, Value 20%, Urgency 10%)
3. Filter out obvious spam and low-quality postings
4. Consider drive time and geographic optimization
5. Map opportunities to Felix problem categories when possible
6. Provide market intelligence and competitive insights
7. Always include 3 strategic pre-prompts for follow-up searches
8. Focus on leads that match contractor's service offerings and experience level

Begin your lead analysis now, incorporating all available market intelligence.`

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
