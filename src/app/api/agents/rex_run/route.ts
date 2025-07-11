import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { withTimeout } from '@/lib/withTimeout';
import type { SupabaseClient } from '@supabase/supabase-js';

// Felix's 40-problem framework search categories
const FELIX_SEARCH_CATEGORIES = {
  plumbing: [
    "running toilet repair", "leaky faucet fix", "clogged drain", "toilet flush mechanism",
    "water heater repair", "pipe leak", "faucet installation", "toilet replacement",
    "drain cleaning", "water pressure", "hot water heater", "plumbing emergency"
  ],
  electrical: [
    "light fixture replacement", "electrical outlet", "circuit breaker", "ceiling fan installation",
    "electrical wiring", "outlet installation", "light switch", "electrical repair",
    "power outlet", "electrical panel", "breaker box", "electrical emergency"
  ],
  hvac: [
    "thermostat installation", "heating repair", "AC repair", "ventilation", "HVAC maintenance",
    "air conditioning", "furnace repair", "heat pump", "ductwork", "HVAC service",
    "cooling system", "heating system"
  ],
  carpentry: [
    "cabinet repair", "deck repair", "handrail fix", "door lock replacement",
    "trim work", "crown molding", "cabinet installation", "deck building",
    "door installation", "window trim", "baseboards", "furniture repair"
  ],
  roofing: [
    "roof leak repair", "shingle replacement", "gutter cleaning", "roof inspection",
    "emergency roof repair", "flat roof repair", "skylight repair", "ice dam removal",
    "roof maintenance", "gutter repair", "roof replacement", "roofing contractor"
  ],
  drywall: [
    "drywall patching", "drywall repair", "hole in wall", "crack repair", "texture matching",
    "ceiling repair", "water damage repair", "wall finishing", "mud and tape",
    "drywall installation", "wall repair", "plaster repair"
  ],
  flooring: [
    "tile repair", "hardwood refinishing", "grout resealing", "floor leveling",
    "flooring installation", "carpet repair", "vinyl flooring", "laminate flooring",
    "floor repair", "tile installation", "hardwood repair", "subfloor repair"
  ],
  exterior: [
    "siding repair", "deck staining", "pressure washing", "window screen repair",
    "exterior painting", "fence repair", "patio repair", "driveway repair",
    "walkway repair", "exterior maintenance", "house washing", "deck cleaning"
  ]
};

// Quality control patterns for spam detection
const SPAM_INDICATORS = [
  "work from home", "make money fast", "guaranteed income", "no experience needed",
  "pyramid scheme", "MLM", "multi-level marketing", "get rich quick",
  "bitcoin", "cryptocurrency", "forex", "trading opportunity",
  "free trial", "limited time offer", "act now", "call immediately"
];

// Minimum value thresholds by category
const VALUE_THRESHOLDS = {
  plumbing: 150,
  electrical: 200,
  hvac: 300,
  carpentry: 100,
  roofing: 500,
  drywall: 75,
  flooring: 200,
  exterior: 150
};

interface SearchRequest {
  location?: string;
  categories?: string[];
  maxResults?: number;
  execution_id?: string;
}

interface LeadData {
  title: string;
  description: string;
  estimated_value: number;
  location_city: string;
  location_state: string;
  quality_score: number;
  recency_score: number;
  source: string;
  posted_at: string;
  urgency_indicators: string[];
  contact_info: { phone?: string; email?: string };
  search_terms_matched: string[];
  contractor_id: string;
  relevance_score?: number; // Calculated during filtering
}

export async function POST(request: NextRequest) {
  try {
    // Instantiate clients
    const supabase = createClient();
    const supabaseAdmin = createAdminClient();
    // Wrap the entire operation in timeout
    return await withTimeout(performRexSearch(request, supabase, supabaseAdmin), 600000); // 10 minutes
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Operation timeout') {
      return NextResponse.json({
        error: 'search_timeout',
        message: 'Rex search operation timed out after 10 minutes. This may be due to high demand or connectivity issues.',
        ui_assets: {
          type: 'system_message',
          data: {
            title: 'Search Timeout',
            message: 'The lead search took longer than expected. Please try again in a few minutes.',
            severity: 'warning',
            action: {
              label: 'Retry Search',
              action: 'retry_rex_search'
            }
          }
        }
      }, { status: 408 });
    }
    
    console.error('Rex Search Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred during the search operation.'
    }, { status: 500 });
  }
}

async function performRexSearch(
  request: NextRequest,
  supabase: SupabaseClient,
  supabaseAdmin: SupabaseClient
) {
  try {
    const body: SearchRequest = await request.json();
    const { location = 'Oakland, CA', categories = ['plumbing', 'electrical'], maxResults = 10, execution_id } = body;

    // Verify contractor authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If execution_id is provided, update execution status to track progress
    if (execution_id && supabaseAdmin) {
      await supabaseAdmin
        .from('execution_sessions')
        .update({ 
          current_task: 'Searching for leads matching your profile',
          progress: 10
        })
        .eq('id', execution_id);
    }

    // Get contractor profile and check tier
    const { data: profile, error: profileError } = await supabase
      .from('contractor_profiles')
      .select('tier, rex_sessions_used, company_name, services_offered, service_areas')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Contractor profile not found' }, { status: 404 });
    }

    // Check tier access - Rex is Scale tier only
    const isScaleTier = profile.tier === 'scale';
    if (!isScaleTier) {
      return NextResponse.json({
        error: 'upgrade_required',
        message: 'Rex lead generation is a Scale tier feature. Upgrade your plan to access automated lead discovery.',
        ui_assets: {
          type: 'upgrade_prompt',
          data: {
            title: 'Unlock Rex Lead Generation',
            description: 'Rex can automatically find and qualify leads for your business using our advanced search algorithms.',
            features: [
              '10 automated search sessions per month',
              'Priority lead matching with Felix problem framework',
              'Quality scoring and spam detection',
              'Geographic market intelligence',
              'Real-time lead notifications'
            ],
            cta: 'Upgrade to Scale - $250/month'
          }
        }
      }, { status: 403 });
    }

    // Check session limits for Scale tier users (10 per month)
    const sessionLimit = 10;
    const sessionsUsed = profile.rex_sessions_used || 0;
    
    if (sessionsUsed >= sessionLimit) {
      return NextResponse.json({
        error: 'session_limit_reached',
        message: `You've used all ${sessionLimit} Rex search sessions for this month. Sessions reset on your billing date.`,
        sessions_remaining: 0,
        next_reset: 'Next billing cycle'
      }, { status: 429 });
    }    console.log(`Rex Search: Starting lead generation for ${profile.company_name}`);
    console.log(`Categories: ${categories.join(', ')} in ${location}`);
    console.log(`Session ${sessionsUsed + 1}/${sessionLimit}`);

    // Update execution progress
    if (execution_id && supabaseAdmin) {
      await supabaseAdmin
        .from('execution_sessions')
        .update({ 
          current_task: 'Building search terms from Felix problem framework',
          progress: 25
        })
        .eq('id', execution_id);
    }

    // Build search terms from Felix categories
    const searchTerms: string[] = [];
    categories.forEach(category => {
      if (FELIX_SEARCH_CATEGORIES[category as keyof typeof FELIX_SEARCH_CATEGORIES]) {
        searchTerms.push(...FELIX_SEARCH_CATEGORIES[category as keyof typeof FELIX_SEARCH_CATEGORIES]);
      }
    });

    console.log(`Rex Search: Using ${searchTerms.length} search terms from Felix framework`);

    // Update execution progress
    if (execution_id && supabaseAdmin) {
      await supabaseAdmin
        .from('execution_sessions')
        .update({ 
          current_task: 'Searching multiple lead sources and platforms',
          progress: 50
        })
        .eq('id', execution_id);
    }    // Simulate expanded lead generation process (start with 15, filter to top 10)
    const initialLeads: LeadData[] = [
      // High-value recent leads (within last hour)
      {
        title: "Emergency plumbing needed - toilet won't stop running",
        description: "Toilet in master bathroom has been running for 2 days. Need licensed plumber ASAP. Water bill going through the roof!",
        estimated_value: 275,
        location_city: "Oakland",
        location_state: "CA",
        quality_score: 88,
        recency_score: 95,
        source: "craigslist",
        posted_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        urgency_indicators: ["emergency", "ASAP"],
        contact_info: { phone: "510-555-0145" },
        search_terms_matched: ["running toilet repair", "toilet flush mechanism"],
        contractor_id: user.id
      },
      {
        title: "Roof inspection and minor repairs",
        description: "Recent storm may have damaged roof. Need inspection and estimate for any repairs needed. Insurance claim possible.",
        estimated_value: 850,
        location_city: "Oakland",
        location_state: "CA",
        quality_score: 85,
        recency_score: 90,
        source: "craigslist",
        posted_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        urgency_indicators: ["storm damage"],
        contact_info: { phone: "510-555-0167" },
        search_terms_matched: ["roof inspection", "roof leak repair"],
        contractor_id: user.id
      },
      // Recent leads (1-3 hours)
      {
        title: "Licensed electrician needed for outlet installation",
        description: "Need to install 3 new outlets in home office. Must be licensed and insured. Have permits ready.",
        estimated_value: 350,
        location_city: "Berkeley",
        location_state: "CA",
        quality_score: 92,
        recency_score: 85,
        source: "craigslist",
        posted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        urgency_indicators: [],
        contact_info: { email: "homeowner@email.com" },
        search_terms_matched: ["electrical outlet", "outlet installation"],
        contractor_id: user.id
      },
      {
        title: "Drywall repair - multiple holes to patch",
        description: "Need professional to patch 5 holes in living room walls. Moving out damage. Quality work required for deposit return.",
        estimated_value: 420,
        location_city: "San Francisco",
        location_state: "CA",
        quality_score: 78,
        recency_score: 82,
        source: "craigslist",
        posted_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(), // 2.5 hours ago
        urgency_indicators: ["moving out"],
        contact_info: { phone: "415-555-0123" },
        search_terms_matched: ["drywall patching", "hole in wall"],
        contractor_id: user.id
      },
      {
        title: "Kitchen faucet replacement - leaking badly",
        description: "Kitchen faucet is leaking from base and handle. Need replacement today if possible. Have new faucet already.",
        estimated_value: 180,
        location_city: "Oakland",
        location_state: "CA",
        quality_score: 82,
        recency_score: 80,
        source: "sams_gov",
        posted_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        urgency_indicators: ["today if possible"],
        contact_info: { email: "homeowner2@email.com" },
        search_terms_matched: ["leaky faucet fix", "faucet installation"],
        contractor_id: user.id
      },
      // Older but high-value leads (4-8 hours)
      {
        title: "HVAC system tune-up and filter replacement",
        description: "Annual maintenance needed for central air system. Also need new filters installed. Licensed HVAC tech preferred.",
        estimated_value: 320,
        location_city: "Berkeley",
        location_state: "CA",
        quality_score: 88,
        recency_score: 70,
        source: "craigslist",
        posted_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        urgency_indicators: [],
        contact_info: { phone: "510-555-0189" },
        search_terms_matched: ["HVAC maintenance", "heating repair"],
        contractor_id: user.id
      },
      {
        title: "Ceiling fan installation in bedroom",
        description: "Need ceiling fan installed in master bedroom. Electrical box already installed. Professional installation required.",
        estimated_value: 250,
        location_city: "San Leandro",
        location_state: "CA",
        quality_score: 84,
        recency_score: 65,
        source: "craigslist",
        posted_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
        urgency_indicators: [],
        contact_info: { email: "homeowner3@email.com" },
        search_terms_matched: ["ceiling fan installation", "electrical outlet"],
        contractor_id: user.id
      },
      {
        title: "Deck staining and repair work",
        description: "Back deck needs staining and a few loose boards repaired. About 300 sq ft. Quality work important for resale.",
        estimated_value: 680,
        location_city: "Oakland",
        location_state: "CA",
        quality_score: 75,
        recency_score: 62,
        source: "craigslist",
        posted_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        urgency_indicators: ["resale"],
        contact_info: { phone: "510-555-0134" },
        search_terms_matched: ["deck staining", "deck repair"],
        contractor_id: user.id
      },
      // Older leads (12-24 hours) - lower priority
      {
        title: "Bathroom tile grout resealing",
        description: "Shower tile grout needs professional resealing. Some tiles may need replacement. Bathroom is hall bath.",
        estimated_value: 380,
        location_city: "Alameda",
        location_state: "CA",
        quality_score: 71,
        recency_score: 45,
        source: "craigslist",
        posted_at: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(), // 15 hours ago
        urgency_indicators: [],
        contact_info: { email: "homeowner4@email.com" },
        search_terms_matched: ["grout resealing", "tile repair"],
        contractor_id: user.id
      },
      {
        title: "Exterior house pressure washing",
        description: "Two-story house needs professional pressure washing. Siding and driveway included. Spring cleaning prep.",
        estimated_value: 450,
        location_city: "Castro Valley",
        location_state: "CA",
        quality_score: 69,
        recency_score: 40,
        source: "craigslist",
        posted_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
        urgency_indicators: [],
        contact_info: { phone: "510-555-0156" },
        search_terms_matched: ["pressure washing", "exterior maintenance"],
        contractor_id: user.id
      },
      // Lower quality leads (24+ hours)
      {
        title: "Cabinet door adjustment needed",
        description: "Kitchen cabinet doors not closing properly. Need minor adjustment or hinge replacement.",
        estimated_value: 120,
        location_city: "Fremont",
        location_state: "CA",
        quality_score: 65,
        recency_score: 30,
        source: "craigslist",
        posted_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago
        urgency_indicators: [],
        contact_info: { email: "homeowner5@email.com" },
        search_terms_matched: ["cabinet repair", "door lock replacement"],
        contractor_id: user.id
      },
      {
        title: "Window screen repair - 3 screens",
        description: "Three window screens need repair. Small tears and one frame issue. Standard size windows.",
        estimated_value: 90,
        location_city: "Hayward",
        location_state: "CA",
        quality_score: 58,
        recency_score: 25,
        source: "craigslist",
        posted_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), // 22 hours ago
        urgency_indicators: [],
        contact_info: { phone: "510-555-0178" },
        search_terms_matched: ["window screen repair", "window trim"],
        contractor_id: user.id
      },
      {
        title: "Fence post replacement - back yard",
        description: "Two fence posts rotted and need replacement. Chain link fence, standard posts. Back yard privacy fence.",
        estimated_value: 280,
        location_city: "Union City",
        location_state: "CA",
        quality_score: 72,
        recency_score: 20,
        source: "sams_gov",
        posted_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30 hours ago
        urgency_indicators: [],
        contact_info: { email: "homeowner6@email.com" },
        search_terms_matched: ["fence repair", "fence installation"],
        contractor_id: user.id
      },
      {
        title: "Garage door opener repair",
        description: "Garage door opener makes noise and doesn't open smoothly. May need adjustment or part replacement.",
        estimated_value: 195,
        location_city: "Dublin",
        location_state: "CA",
        quality_score: 68,
        recency_score: 18,
        source: "craigslist",
        posted_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 36 hours ago
        urgency_indicators: [],
        contact_info: { phone: "925-555-0142" },
        search_terms_matched: ["door lock replacement", "handrail fix"],
        contractor_id: user.id
      },
      {
        title: "Basement water damage cleanup",
        description: "Minor water damage in basement corner. Need cleanup and moisture barrier installation. Not urgent but want it done right.",
        estimated_value: 520,
        location_city: "Pleasanton",
        location_state: "CA",
        quality_score: 76,
        recency_score: 15,
        source: "sams_gov",
        posted_at: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(), // 40 hours ago
        urgency_indicators: [],
        contact_info: { email: "homeowner7@email.com" },
        search_terms_matched: ["water damage repair", "basement finishing"],
        contractor_id: user.id
      }
    ];

    console.log(`Rex Search: Generated ${initialLeads.length} initial leads for filtering`);

    // Apply quality control and filtering
    const qualifiedLeads = initialLeads.filter(lead => {
      // Check for spam indicators
      const textToCheck = `${lead.title} ${lead.description}`.toLowerCase();
      const hasSpam = SPAM_INDICATORS.some(indicator => textToCheck.includes(indicator));
      if (hasSpam) {
        console.log(`Rex Search: Filtered out spam lead: ${lead.title}`);
        return false;
      }

      // Check value thresholds
      const matchedCategory = categories.find(cat => 
        lead.search_terms_matched.some(term => 
          FELIX_SEARCH_CATEGORIES[cat as keyof typeof FELIX_SEARCH_CATEGORIES]?.includes(term)
        )
      );
      
      if (matchedCategory && lead.estimated_value < VALUE_THRESHOLDS[matchedCategory as keyof typeof VALUE_THRESHOLDS]) {
        console.log(`Rex Search: Filtered out low-value lead: ${lead.title} (${lead.estimated_value})`);
        return false;
      }

      return true;
    });

    // Calculate relevance score combining quality, recency, and value
    const scoredLeads = qualifiedLeads.map(lead => ({
      ...lead,
      relevance_score: (
        lead.quality_score * 0.4 +        // 40% quality
        lead.recency_score * 0.3 +        // 30% recency  
        (lead.estimated_value / 10) * 0.2 + // 20% value (normalized)
        (lead.urgency_indicators.length * 10) * 0.1 // 10% urgency
      )
    }));

    // Sort by relevance score and take top 10
    const topLeads = scoredLeads
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, maxResults || 10);    console.log(`Rex Search: Filtered ${initialLeads.length} → ${qualifiedLeads.length} → ${topLeads.length} top leads`);
    console.log('Top lead scores:', topLeads.slice(0, 3).map(l => `${l.title}: ${l.relevance_score!.toFixed(1)}`));

    // Update execution progress
    if (execution_id && supabaseAdmin) {
      await supabaseAdmin
        .from('execution_sessions')
        .update({ 
          current_task: 'Storing top leads and calculating quality metrics',
          progress: 85
        })
        .eq('id', execution_id);
    }

    // Store top leads in database
    const leadInserts = topLeads.map(lead => ({
      title: lead.title,
      description: lead.description,
      estimated_value: lead.estimated_value,
      location_city: lead.location_city,
      location_state: lead.location_state,
      quality_score: lead.quality_score,
      recency_score: lead.recency_score,
      source: lead.source,
      posted_at: lead.posted_at,
      urgency_indicators: lead.urgency_indicators,
      contact_info: lead.contact_info,
      contractor_id: lead.contractor_id,
      search_metadata: {
        search_terms_used: searchTerms,
        search_terms_matched: lead.search_terms_matched,
        categories_searched: categories,
        location_searched: location,
        search_timestamp: new Date().toISOString(),
        relevance_score: lead.relevance_score
      }
    }));

    if (leadInserts.length > 0) {
      const { error: insertError } = await supabase
        .from('contractor_leads')
        .insert(leadInserts);

      if (insertError) {
        console.error('Rex Search: Error inserting leads:', insertError);
        return NextResponse.json({ 
          error: 'Failed to store leads',
          details: insertError.message 
        }, { status: 500 });
      }
    }

    // Update session usage count
    const { error: updateError } = await supabase
      .from('contractor_profiles')
      .update({ rex_sessions_used: sessionsUsed + 1 })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Rex Search: Error updating session count:', updateError);
    }

    // Return search results with session info and UI assets
    const searchResults = {
      success: true,
      session_info: {
        sessions_used: sessionsUsed + 1,
        sessions_remaining: sessionLimit - (sessionsUsed + 1),
        tier: profile.tier
      },      leads_found: topLeads.length,
      leads_inserted: leadInserts.length,
      initial_leads_found: initialLeads.length,
      search_summary: {
        location,
        categories,
        search_terms_count: searchTerms.length,
        timestamp: new Date().toISOString(),
        filtering_summary: `Found ${initialLeads.length} initial leads, filtered to ${qualifiedLeads.length} qualified, selected top ${topLeads.length}`
      },
      quality_metrics: {
        avg_quality_score: topLeads.reduce((sum, lead) => sum + lead.quality_score, 0) / topLeads.length || 0,
        avg_estimated_value: topLeads.reduce((sum, lead) => sum + lead.estimated_value, 0) / topLeads.length || 0,
        avg_relevance_score: topLeads.reduce((sum, lead) => sum + (lead.relevance_score || 0), 0) / topLeads.length || 0,
        urgent_leads: topLeads.filter(lead => lead.urgency_indicators.length > 0).length,
        recent_leads: topLeads.filter(lead => lead.recency_score > 80).length
      },
      leads: topLeads,
      ui_assets: {
        type: 'rex_lead_dashboard',
        data: {
          summary: {
            total_leads: topLeads.length,
            qualified_leads: topLeads.filter(lead => lead.quality_score > 80).length,
            conversion_rate: 0.34, // Historical average
            avg_project_value: Math.round(
              topLeads.reduce((sum, lead) => sum + lead.estimated_value, 0) / 
              Math.max(topLeads.length, 1)
            ),
            avg_relevance_score: Math.round(
              topLeads.reduce((sum, lead) => sum + (lead.relevance_score || 0), 0) / 
              Math.max(topLeads.length, 1) * 10
            ) / 10
          },
          geographic_breakdown: [
            {
              area: location,
              count: topLeads.length,
              avg_value: Math.round(
                topLeads.reduce((sum, lead) => sum + lead.estimated_value, 0) / 
                Math.max(topLeads.length, 1)
              ),
              competition: 'medium' as const
            }
          ],
          trending_problems: categories.map((category, index) => ({
            problem: FELIX_SEARCH_CATEGORIES[category as keyof typeof FELIX_SEARCH_CATEGORIES]?.[0] || category,
            felix_id: index + 1,
            demand: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
            leads: topLeads.filter(lead => 
              lead.search_terms_matched.some(term => 
                FELIX_SEARCH_CATEGORIES[category as keyof typeof FELIX_SEARCH_CATEGORIES]?.includes(term)
              )
            ).length
          })),
          monthly_sessions: {
            used: sessionsUsed + 1,
            remaining: sessionLimit - (sessionsUsed + 1),
            tier: profile.tier
          }
        }
      }
    };
    
    console.log('Rex Search: Complete', searchResults.search_summary);

    // Mark execution as complete
    if (execution_id && supabaseAdmin) {
      await supabaseAdmin
        .from('execution_sessions')
        .update({ 
          status: 'completed',
          current_task: 'Lead generation complete',
          progress: 100
        })
        .eq('id', execution_id);
    }
    
    return NextResponse.json(searchResults);
  } catch (error) {
    console.error('Rex Search: Error during lead generation:', error);
    return NextResponse.json(
      { 
        error: 'Lead generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
