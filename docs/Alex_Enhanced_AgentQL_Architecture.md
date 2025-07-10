# Alex the Assessor: Enhanced AgentQL Material Research Architecture

## Overview
Alex needs sophisticated AgentQL integration for real-time material research, competitive pricing analysis, and dynamic project scoping across Felix's 40-problem categories and beyond.

## AgentQL Implementation Strategy

### 1. Material Research Queries

\`\`\`typescript
// Dynamic AgentQL queries for material research
const materialResearchQueries = {
  // Home Depot material lookup
  home_depot: {
    url: "https://www.homedepot.com/s/{search_term}?NCNI-5",
    query: `{
      products: [
        {
          name: text,
          price: text,
          rating: text,
          availability: text,
          specifications: text,
          brand: text,
          model_number: text,
          store_availability: text
        }
      ]
    }`,
    context: "Find construction materials with current pricing and availability"
  },
  
  // Lowe's competitive pricing
  lowes: {
    url: "https://www.lowes.com/search?searchTerm={search_term}",
    query: `{
      items: [
        {
          product_name: text,
          current_price: text,
          original_price: text,
          rating: text,
          in_stock: text,
          specifications: text,
          installation_services: text
        }
      ]
    }`,
    context: "Compare prices and availability at Lowe's"
  },
  
  // Menards regional pricing
  menards: {
    url: "https://www.menards.com/main/search.html?search={search_term}",
    query: `{
      products: [
        {
          title: text,
          price: text,
          rebate_info: text,
          stock_status: text,
          product_details: text
        }
      ]
    }`,
    context: "Get regional pricing with rebate information"
  },
  
  // Ferguson for professional supplies
  ferguson: {
    url: "https://www.ferguson.com/search?query={search_term}",
    query: `{
      professional_products: [
        {
          item_name: text,
          contractor_price: text,
          list_price: text,
          availability: text,
          technical_specs: text,
          brand_info: text
        }
      ]
    }`,
    context: "Professional contractor pricing and specifications"
  }
};
\`\`\`

### 2. Dynamic Query Generation by Project Type

\`\`\`typescript
// Felix 40-Problem Mapping to AgentQL Queries
const felixToAgentQLMapping = {
  "toilet_repair": {
    materials: ["toilet_repair_kit", "wax_ring", "toilet_bolts", "toilet_seat"],
    tools: ["plunger", "adjustable_wrench", "screwdriver_set"],
    queries: ["toilet repair parts", "wax ring toilet", "toilet installation kit"]
  },
  
  "kitchen_remodel": {
    materials: ["kitchen_cabinets", "countertops", "backsplash_tile", "kitchen_faucet", "cabinet_hardware"],
    tools: ["tile_saw", "drill", "level", "measuring_tape"],
    queries: ["kitchen cabinets {style}", "quartz countertops", "subway tile backsplash", "kitchen sink faucet"]
  },
  
  "roof_repair": {
    materials: ["roofing_shingles", "roofing_nails", "underlayment", "flashing", "roof_cement"],
    tools: ["roofing_hammer", "nail_gun", "safety_harness", "ladder"],
    queries: ["architectural shingles", "roofing underlayment", "roof flashing", "roofing safety equipment"]
  },
  
  "drywall_repair": {
    materials: ["drywall_sheets", "joint_compound", "drywall_tape", "primer", "paint"],
    tools: ["drywall_saw", "mudding_knife", "sandpaper", "paint_roller"],
    queries: ["drywall 1/2 inch", "joint compound", "drywall repair kit", "primer sealer"]
  },
  
  "electrical_work": {
    materials: ["electrical_wire", "outlets", "circuit_breakers", "wire_nuts", "electrical_box"],
    tools: ["wire_strippers", "voltage_tester", "electrical_pliers", "fish_tape"],
    queries: ["romex wire 12 gauge", "GFCI outlet", "circuit breaker {amperage}", "electrical junction box"]
  }
};

// Dynamic query generation based on project scope
function generateMaterialQueries(projectType: string, specifications: any): string[] {
  const baseMapping = felixToAgentQLMapping[projectType] || {};
  const dynamicQueries = [];
  
  // Generate specific queries based on project details
  if (specifications.square_footage) {
    dynamicQueries.push(`flooring ${specifications.square_footage} sq ft`);
  }
  
  if (specifications.room_type) {
    dynamicQueries.push(`${specifications.room_type} renovation materials`);
  }
  
  if (specifications.style_preference) {
    dynamicQueries.push(`${specifications.style_preference} style ${projectType}`);
  }
  
  return [...(baseMapping.queries || []), ...dynamicQueries];
}
\`\`\`

### 3. Location-Based Pricing Intelligence

\`\`\`typescript
// Geographic pricing variations
const locationPricingQueries = {
  // Regional supplier lookup
  regional_suppliers: (zipCode: string, category: string) => ({
    url: `https://www.google.com/maps/search/construction+supplies+near+${zipCode}`,
    query: `{
      suppliers: [
        {
          business_name: text,
          address: text,
          phone: text,
          rating: text,
          hours: text,
          specialties: text
        }
      ]
    }`,
    context: `Find local ${category} suppliers near ${zipCode}`
  }),
  
  // Labor rate research by location
  labor_rates: (location: string, trade: string) => ({
    url: `https://www.payscale.com/research/US/Job=${trade}/Hourly_Rate/by_City`,
    query: `{
      wage_data: [
        {
          location: text,
          median_rate: text,
          experience_level: text,
          percentile_25: text,
          percentile_75: text
        }
      ]
    }`,
    context: `Research ${trade} labor rates in ${location}`
  })
};
\`\`\`

### 4. Real-Time Market Intelligence

\`\`\`typescript
// Market trend analysis queries
const marketIntelligenceQueries = {
  material_trends: {
    url: "https://www.construction.com/news/construction-material-prices",
    query: `{
      price_trends: [
        {
          material_category: text,
          price_change: text,
          forecast: text,
          factors: text,
          recommendation: text
        }
      ]
    }`,
    context: "Track construction material price trends and forecasts"
  },
  
  permit_requirements: (location: string, projectType: string) => ({
    url: `https://www.{city}.gov/permits/${projectType}`,
    query: `{
      permit_info: [
        {
          permit_type: text,
          cost: text,
          timeline: text,
          requirements: text,
          application_process: text
        }
      ]
    }`,
    context: `Get permit requirements for ${projectType} in ${location}`
  })
};
\`\`\`

## Enhanced Alex Implementation

### 1. AgentQL Integration Layer

\`\`\`typescript
// Enhanced Alex agent with AgentQL material research
class AlexMaterialResearch {
  async conductMaterialResearch(projectDetails: any, contractorLocation: string) {
    const queries = this.generateResearchQueries(projectDetails, contractorLocation);
    const results = await Promise.all(
      queries.map(query => this.executeAgentQLQuery(query))
    );
    
    return this.synthesizeResearchResults(results, projectDetails);
  }
  
  private generateResearchQueries(projectDetails: any, location: string): AgentQLQuery[] {
    const queries = [];
    
    // 1. Base material queries from Felix mapping
    const felixQueries = this.getFelixMaterialQueries(projectDetails.problem_category);
    queries.push(...felixQueries);
    
    // 2. Dynamic project-specific queries
    const dynamicQueries = this.generateDynamicQueries(projectDetails);
    queries.push(...dynamicQueries);
    
    // 3. Location-specific supplier queries
    const locationQueries = this.getLocationQueries(location, projectDetails.trade_type);
    queries.push(...locationQueries);
    
    // 4. Market intelligence queries
    const marketQueries = this.getMarketIntelligenceQueries(projectDetails.category);
    queries.push(...marketQueries);
    
    return queries;
  }
  
  private async executeAgentQLQuery(query: AgentQLQuery): Promise<any> {
    try {
      const response = await fetch('https://api.agentql.com/v1/query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AGENTQL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: query.url,
          query: query.query,
          context: query.context,
          wait_for: 'network_idle',
          timeout: 30000
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('AgentQL query failed:', error);
      return null;
    }
  }
}
\`\`\`

### 2. Enhanced Material Analysis

\`\`\`typescript
// Comprehensive material analysis with competitive intelligence
interface MaterialAnalysis {
  item_name: string;
  suppliers: SupplierPrice[];
  market_average: number;
  price_trend: 'rising' | 'stable' | 'falling';
  availability: 'in_stock' | 'limited' | 'back_order';
  quality_rating: number;
  alternatives: Alternative[];
  professional_discount: number;
}

interface SupplierPrice {
  supplier: string;
  price: number;
  availability: string;
  delivery_time: string;
  professional_pricing: boolean;
}

// Enhanced cost breakdown with market intelligence
function generateEnhancedCostBreakdown(materialResearch: MaterialAnalysis[], projectDetails: any) {
  return {
    project_title: projectDetails.title,
    total_estimate: calculateTotalWithMarketPricing(materialResearch),
    confidence_level: assessConfidenceWithMarketData(materialResearch),
    market_intelligence: {
      price_trends: analyzePriceTrends(materialResearch),
      best_suppliers: identifyBestSuppliers(materialResearch),
      cost_optimization: suggestCostOptimizations(materialResearch)
    },
    breakdown: {
      materials: generateDetailedMaterialBreakdown(materialResearch),
      labor: calculateLaborWithLocalRates(projectDetails.location),
      permits: getPermitCostsForLocation(projectDetails.location, projectDetails.type),
      overhead: calculateOverheadPercentage(),
      profit: calculateOptimalProfitMargin(projectDetails.complexity)
    },
    competitive_analysis: {
      market_position: 'competitive', // based on local rates
      pricing_strategy: 'value_based', // recommended strategy
      win_probability: 0.75 // calculated from historical data
    }
  };
}
\`\`\`

### 3. Real-Time Market Alerts

\`\`\`typescript
// Market condition monitoring
const marketAlerts = {
  material_shortage: (materials: string[]) => 
    `⚠️ Supply chain alert: ${materials.join(', ')} experiencing delays. Consider alternative materials or adjust timeline.`,
  
  price_spike: (material: string, increase: number) => 
    `📈 Price alert: ${material} increased ${increase}% this week. Lock in pricing now or find alternatives.`,
  
  seasonal_demand: (category: string, season: string) => 
    `📅 Seasonal insight: ${category} demand typically ${season === 'high' ? 'increases' : 'decreases'} this time of year. Adjust pricing accordingly.`
};
\`\`\`

This enhanced Alex implementation provides:

1. **Real-time material pricing** from multiple suppliers
2. **Geographic price variations** based on contractor location  
3. **Market trend analysis** for strategic pricing
4. **Dynamic project scoping** beyond Felix's 40 problems
5. **Competitive intelligence** for better bid positioning
6. **Supply chain awareness** for realistic timelines
7. **Professional vs. retail pricing** for accurate margins

The AgentQL queries are structured to be self-healing and adaptable to different website layouts while maintaining consistent data extraction for Alex's analytical engine.
