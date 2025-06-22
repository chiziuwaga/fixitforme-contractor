import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

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
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { location = 'Oakland, CA', categories = ['plumbing', 'electrical'], maxResults = 10 } = body;

    const supabase = createClient();
    
    // Verify contractor authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`Rex Search: Starting lead generation for ${categories.join(', ')} in ${location}`);

    // Build search terms from Felix categories
    const searchTerms: string[] = [];
    categories.forEach(category => {
      if (FELIX_SEARCH_CATEGORIES[category as keyof typeof FELIX_SEARCH_CATEGORIES]) {
        searchTerms.push(...FELIX_SEARCH_CATEGORIES[category as keyof typeof FELIX_SEARCH_CATEGORIES]);
      }
    });

    console.log(`Rex Search: Using ${searchTerms.length} search terms from Felix framework`);

    // Simulate lead generation process
    const mockLeads: LeadData[] = [
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
      }
    ];

    // Apply quality control and filtering
    const qualifiedLeads = mockLeads.filter(lead => {
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

    console.log(`Rex Search: Found ${qualifiedLeads.length} qualified leads after filtering`);

    // Store leads in database
    const leadInserts = qualifiedLeads.map(lead => ({
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
        search_timestamp: new Date().toISOString()
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

    // Return search results
    const searchResults = {
      success: true,
      leads_found: qualifiedLeads.length,
      leads_inserted: leadInserts.length,
      search_summary: {
        location,
        categories,
        search_terms_count: searchTerms.length,
        timestamp: new Date().toISOString()
      },
      quality_metrics: {
        avg_quality_score: qualifiedLeads.reduce((sum, lead) => sum + lead.quality_score, 0) / qualifiedLeads.length || 0,
        avg_estimated_value: qualifiedLeads.reduce((sum, lead) => sum + lead.estimated_value, 0) / qualifiedLeads.length || 0,
        urgent_leads: qualifiedLeads.filter(lead => lead.urgency_indicators.length > 0).length
      },
      leads: qualifiedLeads.slice(0, maxResults)
    };

    console.log('Rex Search: Complete', searchResults.search_summary);

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
