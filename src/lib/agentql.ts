/**
 * FixItForMe AgentQL Integration Library
 * Production implementation for contractor lead generation and material research
 */

import FixItForMeAgentQL, { felixToSearchTerms } from './agentql/index';

// Export types directly from the classes and interfaces
export interface AgentQLConfig {
  apiKey: string;
  timeout: number;
  headless: boolean;
  retryAttempts: number;
}

export interface ContractorProfile {
  id: string;
  services_offered?: number[];
  service_areas?: string[];
  tier?: 'growth' | 'scale';
  location?: {
    city: string;
    state: string;
    radius_miles: number;
  };
  certifications?: string[];
  specialties?: string[];
}

export interface LeadResult {
  id: string;
  title: string;
  description: string;
  source: 'craigslist' | 'sams.gov' | 'facebook' | 'nextdoor' | 'thumbtack' | 'angies' | 'homeadvisor';
  quality_score: number;
  estimated_value: number;
  location: string;
  contact_info?: string;
  posted_date: Date;
  urgency: 'low' | 'medium' | 'high';
  direct_url: string;
  search_terms_matched: string[];
  felix_category?: number;
}

export interface MaterialResult {
  id: string;
  name: string;
  supplier: 'home_depot' | 'lowes' | 'menards' | 'ferguson' | 'build_com' | 'floor_decor' | '84_lumber';
  price_range: string;
  current_price?: number;
  availability: 'in_stock' | 'limited' | 'order_required' | 'out_of_stock';
  location: string;
  product_url: string;
  delivery_available: boolean;
  delivery_cost?: number;
  pickup_available: boolean;
  last_updated: Date;
  specifications?: Record<string, any>;
}

export interface DocumentAnalysis {
  services: string[];
  specialties: string[];
  certifications: string[];
  experience_areas: string[];
  project_types: string[];
  geographic_focus: string[];
}

export interface LeadGenerationProgress {
  currentPlatform: string;
  platformProgress: number;
  totalProgress: number;
  leadsFound: number;
  stage: string;
  status: 'searching' | 'filtering' | 'scoring' | 'complete' | 'error';
  quality_score?: number;
  estimated_time_remaining?: number;
}

export interface MaterialSearchProgress {
  currentSupplier: string;
  supplierProgress: number;
  totalProgress: number;
  materialsFound: number;
  stage: string;
  status: 'searching' | 'pricing' | 'availability' | 'complete' | 'error';
  estimated_time_remaining?: number;
}

// Factory function for creating AgentQL client
export function createAgentQLClient(apiKey?: string): FixItForMeAgentQL {
  const config: AgentQLConfig = {
    apiKey: apiKey || process.env.AGENTQL_API_KEY || '',
    timeout: 30000,
    headless: true,
    retryAttempts: 3
  };

  if (!config.apiKey) {
    console.warn('[AgentQL] No API key provided. Using simulation mode.');
  }

  return new FixItForMeAgentQL(config);
}

// Re-export main class and utilities
export { FixItForMeAgentQL, felixToSearchTerms };

// Default export for backward compatibility
export default FixItForMeAgentQL;
