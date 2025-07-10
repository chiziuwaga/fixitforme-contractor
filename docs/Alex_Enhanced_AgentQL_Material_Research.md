# Alex the Assessor - Enhanced AgentQL Integration for Material Research

## Overview
Alex the Assessor is enhanced with comprehensive AgentQL-powered material research capabilities, enabling real-time cost analysis across major home improvement retailers. This document outlines the architecture for intelligent material sourcing and pricing optimization.

## AgentQL Material Research Architecture

### Core Material Research Queries

\`\`\`typescript
// AgentQL queries for major retailers
const materialQueries = {
  homedepot: {
    search_box: "search-field",
    product_cards: "product-tile",
    price_selector: "[data-testid='price']",
    stock_indicator: ".product-availability",
    store_locator: "[data-automation-id='store-locator']"
  },
  lowes: {
    search_input: "#header-search-input",
    product_grid: ".product-grid-item",
    price_display: ".sr-price",
    availability: ".availability-text",
    zip_code_input: "[placeholder='ZIP code']"
  },
  menards: {
    search_field: "#search-text",
    product_items: ".product-item",
    pricing: ".price-display",
    stock_status: ".stock-message"
  }
};
\`\`\`

### Dynamic Query Generation System

\`\`\`typescript
interface MaterialSearchContext {
  project_type: 'kitchen' | 'bathroom' | 'electrical' | 'plumbing' | 'hvac' | 'roofing' | 'drywall' | 'flooring';
  location: {
    zip_code: string;
    city: string;
    state: string;
  };
  felix_problem_id: number; // Maps to Felix 40-problem framework
  contractor_profile: {
    preferred_suppliers: string[];
    volume_discounts: boolean;
    pro_account_status: boolean;
  };
}

// Dynamic AgentQL query builder for material research
function buildMaterialQuery(context: MaterialSearchContext): AgentQLQuery {
  const baseQuery = `
    search_materials {
      search_input
      product_results {
        title
        price
        sku
        availability
        reviews {
          rating
          count
        }
        specifications {
          dimensions
          material_type
          brand
          model
        }
      }
      store_location {
        distance
        stock_level
        pickup_availability
      }
    }
  `;
  
  return generateLocationAwareQuery(baseQuery, context);
}
\`\`\`

### Felix Problem-Specific Material Templates

\`\`\`typescript
const felixMaterialMappings = {
  // Felix Problem #1: Running toilet won't stop
  1: {
    primary_materials: [
      "toilet flapper", "toilet chain", "toilet fill valve", 
      "toilet flush valve", "toilet tank parts kit"
    ],
    search_terms: ["toilet repair kit", "flapper valve", "fill valve"],
    typical_cost_range: [15, 75],
    labor_time_hours: 0.5
  },
  
  // Felix Problem #5: Kitchen cabinet door won't close
  5: {
    primary_materials: [
      "cabinet hinges", "cabinet door bumpers", "hinge screws",
      "door catch", "magnetic cabinet latch"
    ],
    search_terms: ["cabinet hinges", "cabinet hardware", "door latch"],
    typical_cost_range: [8, 45],
    labor_time_hours: 0.25
  },
  
  // Felix Problem #12: Drywall hole repair
  12: {
    primary_materials: [
      "drywall patch kit", "joint compound", "mesh tape",
      "sandpaper", "primer", "paint"
    ],
    search_terms: ["drywall repair kit", "spackle", "mesh patch"],
    typical_cost_range: [12, 35],
    labor_time_hours: 1.5
  },
  
  // Complex projects requiring multiple material categories
  25: { // Kitchen remodel
    primary_materials: [
      "kitchen cabinets", "countertops", "backsplash tile",
      "kitchen sink", "faucet", "cabinet hardware"
    ],
    search_terms: ["kitchen renovation materials", "cabinet packages", "countertop materials"],
    typical_cost_range: [2500, 15000],
    labor_time_hours: 40
  }
};
\`\`\`

### Location-Aware Pricing Strategy

\`\`\`typescript
interface LocationPricingContext {
  contractor_zip: string;
  project_zip: string;
  market_tier: 'budget' | 'mid_tier' | 'premium';
  local_suppliers: LocalSupplier[];
  travel_distance: number;
}

class LocationAwarePricing {
  async getOptimalSuppliers(materials: Material[], context: LocationPricingContext) {
    const queries = await Promise.all([
      this.queryHomeDepot(materials, context.project_zip),
      this.queryLowes(materials, context.project_zip),
      this.queryLocalSuppliers(materials, context.local_suppliers)
    ]);
    
    return this.optimizeByDeliveryAndCost(queries, context);
  }
  
  private async queryHomeDepot(materials: Material[], zip: string) {
    const agentql = new AgentQLClient();
    
    for (const material of materials) {
      const query = `
        navigate_to_store_with_zip("${zip}") {
          search("${material.search_term}") {
            products {
              name
              price
              availability
              pickup_date
              delivery_options {
                cost
                timeframe
              }
            }
          }
        }
      `;
      
      const results = await agentql.execute(query);
      material.suppliers.homedepot = this.processResults(results);
    }
  }
}
\`\`\`

### Real-Time Cost Analysis Integration

\`\`\`typescript
interface AlexCostAnalysis {
  materials: MaterialCostBreakdown;
  labor: LaborCostBreakdown;
  overhead: OverheadCosts;
  profit_margin: ProfitAnalysis;
  competitive_analysis: CompetitiveIntelligence;
  risk_factors: RiskAssessment[];
}

class EnhancedAlexAgent {
  async analyzeMaterialCosts(project: ProjectDetails): Promise<AlexCostAnalysis> {
    // Step 1: Map project to Felix problems
    const felixMapping = this.mapProjectToFelix(project);
    
    // Step 2: Generate material requirements
    const materialList = this.generateMaterialList(felixMapping);
    
    // Step 3: Execute AgentQL material research
    const pricingData = await this.agentqlMaterialResearch(materialList, project.location);
    
    // Step 4: Apply local market adjustments
    const adjustedPricing = this.applyMarketAdjustments(pricingData, project.location);
    
    // Step 5: Generate comprehensive cost analysis
    return this.generateCostAnalysis(adjustedPricing, project);
  }
  
  private async agentqlMaterialResearch(materials: Material[], location: Location) {
    const agentql = new AgentQLClient();
    const results = {};
    
    for (const material of materials) {
      // Multi-supplier comparison
      const suppliers = await Promise.all([
        agentql.query(this.buildHomeDepotQuery(material, location)),
        agentql.query(this.buildLowesQuery(material, location)),
        agentql.query(this.buildMenardsQuery(material, location))
      ]);
      
      results[material.id] = this.analyzePricing(suppliers);
    }
    
    return results;
  }
}
\`\`\`

### Quality and Availability Intelligence

\`\`\`typescript
interface MaterialIntelligence {
  price_trends: PriceTrend[];
  availability_forecast: AvailabilityForecast;
  quality_ratings: QualityMetrics;
  contractor_reviews: ContractorReview[];
  seasonal_pricing: SeasonalPricing;
}

class MaterialIntelligenceEngine {
  async gatherIntelligence(material: Material): Promise<MaterialIntelligence> {
    const agentql = new AgentQLClient();
    
    // Query multiple data sources
    const reviews = await agentql.query(`
      search_contractor_reviews("${material.name}") {
        reviews {
          rating
          comment
          verified_purchase
          contractor_type
          usage_context
        }
      }
    `);
    
    const pricing = await agentql.query(`
      price_history("${material.sku}") {
        historical_prices {
          date
          price
          supplier
          availability
        }
      }
    `);
    
    return this.synthesizeIntelligence(reviews, pricing, material);
  }
}
\`\`\`

## Integration with Alex's Bidding Strategy

### Automated Material List Generation

\`\`\`typescript
class AlexBiddingEngine {
  async generateMaterialList(project: ProjectDetails): Promise<MaterialList> {
    // Felix problem identification
    const felixProblems = await this.identifyFelixProblems(project.description);
    
    // Template-based material generation
    let materials: Material[] = [];
    
    for (const problemId of felixProblems) {
      const template = felixMaterialMappings[problemId];
      const expandedMaterials = await this.expandMaterialTemplate(template, project);
      materials = materials.concat(expandedMaterials);
    }
    
    // AgentQL-powered cost research
    const costData = await this.researchMaterialCosts(materials, project.location);
    
    return this.compileMaterialList(materials, costData);
  }
  
  private async expandMaterialTemplate(template: FelixTemplate, project: ProjectDetails) {
    // Use AgentQL to find specific products matching template requirements
    const agentql = new AgentQLClient();
    
    const specificProducts = await agentql.query(`
      find_products_matching_requirements {
        category: "${template.category}"
        price_range: [${template.typical_cost_range[0]}, ${template.typical_cost_range[1]}]
        location: "${project.location.zip_code}"
        quality_threshold: 4.0
        availability: "in_stock"
      }
    `);
    
    return this.processProductResults(specificProducts, template);
  }
}
\`\`\`

### Pre-Prompt System Integration

Alex will always provide three pre-prompts after each analysis:

\`\`\`typescript
const alexPrePrompts = [
  "🔍 **Research deeper materials**: 'Find alternative suppliers for [specific material]'",
  "📊 **Analyze project phases**: 'Break down this project into manageable phases'", 
  "💰 **Optimize pricing strategy**: 'How can I improve my profit margin on this bid?'"
];
\`\`\`

## Location-Specific Optimizations

### Regional Pricing Intelligence

\`\`\`typescript
const regionalSupplierStrategy = {
  northeast: {
    primary_suppliers: ["Home Depot", "Lowes", "84 Lumber"],
    premium_suppliers: ["Emser Tile", "Ferguson"],
    cost_multiplier: 1.15, // Higher costs due to labor/transport
    delivery_considerations: "Winter weather delays"
  },
  southeast: {
    primary_suppliers: ["Home Depot", "Lowes", "Menards"],
    regional_suppliers: ["Floor & Decor", "Build First"],
    cost_multiplier: 0.95, // Lower regional costs
    delivery_considerations: "Hurricane season impacts"
  },
  west_coast: {
    primary_suppliers: ["Home Depot", "Lowes"],
    premium_suppliers: ["Orchard Supply", "McCoy's"],
    cost_multiplier: 1.25, // Higher costs, strict regulations
    delivery_considerations: "Earthquake/wildfire disruptions"
  }
};
\`\`\`

This enhanced Alex agent will provide contractors with real-time, location-aware material research, comprehensive cost analysis, and strategic bidding intelligence powered by AgentQL's web automation capabilities.
