# Rex the Retriever - Enhanced AgentQL Lead Generation Engine

## Overview
Rex the Retriever is enhanced with sophisticated AgentQL-powered lead generation across multiple platforms, utilizing location-aware search strategies and intelligent quality filtering. This document outlines the comprehensive lead generation architecture.

## AgentQL Lead Generation Architecture

### Platform-Specific Query Strategies

\`\`\`typescript
// AgentQL queries optimized for each lead source platform
const leadSourceQueries = {
  craigslist: {
    search_sections: {
      labor_gigs: "/lbg/", // 70% success rate
      skilled_trades: "/trd/", // 60% success rate  
      real_estate_jobs: "/rej/" // 40% success rate
    },
    selectors: {
      search_box: "#query",
      post_listings: ".result-row",
      post_title: ".result-title",
      post_price: ".result-price",
      post_date: ".result-date",
      post_location: ".result-hood",
      contact_info: ".reply-button, .post-contact"
    },
    quality_filters: {
      exclude_spam: "title:not(*'$500 bonus'*, *'same day cash'*, *'www.rentatech.org'*)",
      exclude_phone_scams: "description:not(*'18337368835'*)",
      prioritize_professional: "description:contains(*company*, *licensed*, *insured*)"
    }
  },
  
  facebook_marketplace: {
    search_interface: {
      search_input: "[placeholder*='Search Marketplace']",
      category_filter: "[data-testid='marketplace-category-filter']",
      location_filter: "[data-testid='marketplace-location-filter']"
    },
    results: {
      listing_cards: "[data-testid='marketplace-listing']",
      listing_title: "[data-testid='marketplace-listing-title']",
      listing_price: "[data-testid='marketplace-listing-price']",
      listing_location: "[data-testid='marketplace-listing-location']",
      listing_time: "[data-testid='marketplace-listing-time']"
    }
  },
  
  sams_gov: {
    search_interface: {
      search_input: "#search-keywords",
      naics_filter: "#naics-code-filter",
      location_filter: "#place-of-performance",
      opportunity_type: "#opportunity-type"
    },
    results: {
      opportunity_cards: ".opportunity-result",
      opportunity_title: ".opportunity-title",
      agency: ".agency-name",
      value: ".opportunity-value",
      deadline: ".submission-deadline",
      naics_code: ".naics-code"
    }
  },
  
  thumbtack: {
    pro_search: {
      service_categories: ".service-category",
      lead_requests: ".lead-request-card",
      client_budget: ".budget-range",
      project_timeline: ".timeline-indicator",
      location_radius: ".service-area"
    }
  }
};
\`\`\`

### Felix-Driven Search Term Generation

\`\`\`typescript
interface RexSearchContext {
  contractor_profile: {
    services: number[]; // Felix problem IDs
    service_areas: string[];
    pricing_tier: 'budget' | 'mid_tier' | 'premium';
    experience_level: 'novice' | 'experienced' | 'expert';
  };
  search_parameters: {
    value_threshold: number;
    urgency_preference: 'immediate' | 'flexible';
    travel_radius: number;
    preferred_sources: string[];
  };
}

class FelixSearchTermEngine {
  generateSearchTerms(felixProblemIds: number[]): SearchTermSet {
    const searchTerms = {};
    
    felixProblemIds.forEach(problemId => {
      const felixData = felixMaterialMappings[problemId];
      
      searchTerms[problemId] = {
        primary_terms: felixData.search_terms,
        related_terms: this.expandSearchTerms(felixData),
        urgency_indicators: this.getUrgencyKeywords(problemId),
        value_indicators: this.getValueKeywords(problemId)
      };
    });
    
    return this.optimizeSearchTerms(searchTerms);
  }
  
  private expandSearchTerms(felixData: FelixProblemData): string[] {
    // Use AgentQL to find related search terms from successful historical searches
    const agentql = new AgentQLClient();
    
    return agentql.query(`
      analyze_successful_searches {
        category: "${felixData.category}"
        historical_conversions: high_value
        related_keywords {
          term
          success_rate
          average_project_value
        }
      }
    `).then(results => 
      results.related_keywords
        .filter(k => k.success_rate > 0.3)
        .map(k => k.term)
    );
  }
}
\`\`\`

### Location-Aware Lead Intelligence

\`\`\`typescript
interface LocationContext {
  contractor_base: {
    zip_code: string;
    city: string;
    state: string;
    coordinates: [number, number];
  };
  service_areas: ServiceArea[];
  market_intelligence: {
    competition_density: 'low' | 'medium' | 'high';
    avg_project_values: number;
    seasonal_demand: SeasonalTrends;
  };
}

class LocationAwareLeadEngine {
  async searchByLocation(searchTerms: string[], location: LocationContext): Promise<Lead[]> {
    const agentql = new AgentQLClient();
    const leads: Lead[] = [];
    
    // Search each platform with location-specific optimizations
    for (const platform of ['craigslist', 'facebook_marketplace', 'sams_gov']) {
      const platformLeads = await this.searchPlatform(platform, searchTerms, location);
      leads.push(...platformLeads);
    }
    
    // Apply location-based quality scoring
    return this.scoreLeadsByLocation(leads, location);
  }
  
  private async searchPlatform(platform: string, terms: string[], location: LocationContext) {
    const agentql = new AgentQLClient();
    const platformConfig = leadSourceQueries[platform];
    
    const query = `
      navigate_to_platform("${platform}") {
        set_location("${location.contractor_base.zip_code}") {
          search_with_filters("${terms.join(' OR ')}") {
            results {
              title
              description
              price
              location
              posted_time
              contact_method
              urgency_indicators
            }
          }
        }
      }
    `;
    
    const results = await agentql.execute(query);
    return this.processLeadResults(results, platform, location);
  }
  
  private scoreLeadsByLocation(leads: Lead[], location: LocationContext): Lead[] {
    return leads.map(lead => {
      // Calculate distance score
      const distance = this.calculateDistance(lead.coordinates, location.contractor_base.coordinates);
      const distanceScore = Math.max(0, 1 - (distance / location.service_areas[0].max_radius));
      
      // Calculate market alignment score
      const marketScore = this.calculateMarketAlignment(lead, location.market_intelligence);
      
      // Calculate competition density impact
      const competitionScore = this.calculateCompetitionImpact(lead, location.market_intelligence.competition_density);
      
      lead.location_score = (distanceScore * 0.4) + (marketScore * 0.4) + (competitionScore * 0.2);
      
      return lead;
    });
  }
}
\`\`\`

### Advanced Quality Control & Spam Detection

\`\`\`typescript
class RexQualityControl {
  async applyQualityFilters(leads: Lead[]): Promise<Lead[]> {
    const agentql = new AgentQLClient();
    
    // AI-powered spam detection
    const spamAnalysis = await agentql.query(`
      analyze_for_spam_patterns {
        leads: ${JSON.stringify(leads.map(l => ({ title: l.title, description: l.description })))}
        spam_indicators {
          suspicious_phrases
          repetitive_posting_patterns
          fake_contact_methods
          unrealistic_compensation
        }
      }
    `);
    
    // Filter based on quality thresholds
    return leads.filter(lead => {
      return this.passesQualityThreshold(lead, spamAnalysis) &&
             this.hasValidContactInfo(lead) &&
             this.meetsValueThreshold(lead) &&
             this.matchesServiceCapability(lead);
    });
  }
  
  private passesQualityThreshold(lead: Lead, spamAnalysis: any): boolean {
    const qualityScore = this.calculateQualityScore(lead, spamAnalysis);
    
    return qualityScore > 0.6 && // Base quality threshold
           !this.containsSpamPatterns(lead, spamAnalysis) &&
           this.hasSpecificProjectDetails(lead) &&
           this.hasReasonableBudget(lead);
  }
  
  private calculateQualityScore(lead: Lead, spamAnalysis: any): number {
    let score = 0.5; // Base score
    
    // Professional posting indicators
    if (lead.description.includes('licensed') || lead.description.includes('insured')) score += 0.2;
    if (lead.title.length > 20 && lead.title.length < 100) score += 0.1; // Appropriate title length
    if (lead.description.length > 100) score += 0.1; // Detailed description
    if (lead.contact_method.includes('phone') || lead.contact_method.includes('email')) score += 0.1;
    
    // Subtract for spam indicators
    score -= spamAnalysis.spam_probability;
    
    return Math.max(0, Math.min(1, score));
  }
}
\`\`\`

### Recency and Urgency Intelligence

\`\`\`typescript
class RecencyIntelligenceEngine {
  calculateRecencyScore(postedTime: Date): number {
    const hoursAgo = (Date.now() - postedTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursAgo < 2) return 1.0;      // Posted within 2 hours - highest priority
    if (hoursAgo < 6) return 0.9;      // Posted within 6 hours - high priority  
    if (hoursAgo < 24) return 0.7;     // Posted within 24 hours - medium priority
    if (hoursAgo < 72) return 0.4;     // Posted within 3 days - lower priority
    
    return 0.1; // Older than 3 days - lowest priority
  }
  
  identifyUrgencyIndicators(lead: Lead): UrgencyAnalysis {
    const urgencyKeywords = [
      'emergency', 'urgent', 'ASAP', 'immediately', 'same day',
      'broken', 'leaking', 'not working', 'flooded', 'no heat'
    ];
    
    const timeFrameKeywords = [
      'today', 'tonight', 'this weekend', 'before Monday',
      'within 24 hours', 'right away'
    ];
    
    const urgencyScore = this.calculateKeywordMatches(lead.description, urgencyKeywords);
    const timeFrameScore = this.calculateKeywordMatches(lead.description, timeFrameKeywords);
    
    return {
      urgency_level: this.categorizeUrgency(urgencyScore + timeFrameScore),
      response_window: this.estimateResponseWindow(urgencyScore, timeFrameScore),
      premium_opportunity: urgencyScore > 0.3 // Urgent jobs often pay premium
    };
  }
}
\`\`\`

### Geographic Market Intelligence

\`\`\`typescript
class GeographicIntelligence {
  async analyzeMarketConditions(serviceArea: ServiceArea): Promise<MarketAnalysis> {
    const agentql = new AgentQLClient();
    
    // Gather competitive intelligence
    const competitorAnalysis = await agentql.query(`
      analyze_competitor_density {
        location: "${serviceArea.center_point}"
        radius: ${serviceArea.radius_miles}
        service_types: ${JSON.stringify(serviceArea.service_categories)}
        
        competitors {
          count
          pricing_tiers
          response_patterns
          service_quality_ratings
        }
      }
    `);
    
    // Analyze demand patterns
    const demandAnalysis = await agentql.query(`
      analyze_service_demand {
        location: "${serviceArea.center_point}"
        timeframe: "last_90_days"
        
        demand_patterns {
          service_category
          request_volume
          seasonal_trends
          average_project_values
          completion_rates
        }
      }
    `);
    
    return this.synthesizeMarketAnalysis(competitorAnalysis, demandAnalysis, serviceArea);
  }
  
  private synthesizeMarketAnalysis(
    competitors: any, 
    demand: any, 
    area: ServiceArea
  ): MarketAnalysis {
    return {
      opportunity_score: this.calculateOpportunityScore(competitors, demand),
      competition_level: this.assessCompetitionLevel(competitors),
      demand_trends: this.identifyDemandTrends(demand),
      pricing_intelligence: this.analyzePricingPatterns(demand),
      recommended_focus: this.recommendServiceFocus(demand, competitors)
    };
  }
}
\`\`\`

### Lead Relevance Scoring Algorithm

\`\`\`typescript
interface LeadScoringWeights {
  quality: 0.40;      // Professional posting, clear requirements, legitimate contact
  recency: 0.30;      // How recently posted - fresher leads have higher conversion
  value: 0.20;        // Project budget and potential profit
  urgency: 0.10;      // Time sensitivity - urgent jobs often pay premium
}

class RexRelevanceEngine {
  scoreLeadRelevance(lead: Lead, contractor: ContractorProfile): number {
    const weights = { quality: 0.40, recency: 0.30, value: 0.20, urgency: 0.10 };
    
    const qualityScore = this.calculateQualityScore(lead);
    const recencyScore = this.calculateRecencyScore(lead.posted_time);
    const valueScore = this.calculateValueScore(lead, contractor);
    const urgencyScore = this.calculateUrgencyScore(lead);
    
    const totalScore = 
      (qualityScore * weights.quality) +
      (recencyScore * weights.recency) +
      (valueScore * weights.value) +
      (urgencyScore * weights.urgency);
    
    return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
  }
  
  async filterTopLeads(leads: Lead[], contractor: ContractorProfile): Promise<Lead[]> {
    // Score all leads
    const scoredLeads = leads.map(lead => ({
      ...lead,
      relevance_score: this.scoreLeadRelevance(lead, contractor)
    }));
    
    // Start with 15 leads, filter to top 10 by relevance
    const sortedLeads = scoredLeads
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, 15); // Get top 15 candidates
    
    // Apply final quality filters to get top 10
    const finalLeads = await this.applyFinalQualityFilters(sortedLeads);
    
    return finalLeads.slice(0, 10); // Return exactly 10 top leads
  }
}
\`\`\`

### Rex Pre-Prompt System

Rex will always provide three strategic pre-prompts after each analysis:

\`\`\`typescript
const rexPrePrompts = [
  "📊 **Analyze lead patterns**: 'Show me which lead sources perform best for my services'",
  "🎯 **Optimize search strategy**: 'How can I find more high-value leads in my area?'",
  "📈 **Track performance metrics**: 'Compare my conversion rates to last month'"
];
\`\`\`

### Integration with Supabase for Lead Storage

\`\`\`typescript
class RexDataPersistence {
  async storeleads(leads: Lead[], execution_id: string): Promise<void> {
    const supabase = createClient();
    
    const leadRecords = leads.map(lead => ({
      execution_id,
      title: lead.title,
      description: lead.description,
      source_platform: lead.platform,
      posted_time: lead.posted_time,
      estimated_value: lead.estimated_value,
      location: lead.location,
      contact_method: lead.contact_method,
      felix_problem_ids: lead.felix_categories,
      relevance_score: lead.relevance_score,
      quality_score: lead.quality_score,
      urgency_level: lead.urgency_level,
      created_at: new Date().toISOString()
    }));
    
    const { error } = await supabase
      .from('contractor_leads')
      .insert(leadRecords);
    
    if (error) {
      throw new Error(`Failed to store leads: ${error.message}`);
    }
  }
  
  async updateExecutionProgress(execution_id: string, progress: number, status: string): Promise<void> {
    const supabase = createClient();
    
    await supabase
      .from('agent_executions')
      .update({
        progress,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', execution_id);
  }
}
\`\`\`

This enhanced Rex engine provides comprehensive, location-aware lead generation with sophisticated quality control and relevance scoring, ensuring contractors receive the highest-value opportunities matching their specific service capabilities and market position.
