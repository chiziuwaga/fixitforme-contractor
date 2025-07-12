/**
 * Government Contracts Module (SAMs.gov)
 * Tier 1 Platform - High Value, Lower Volume
 * Federal contracting opportunities with NAICS code targeting
 */

import { AgentQLCore, LeadResult, ContractorProfile, GEOGRAPHIC_CLUSTERS, VALUE_THRESHOLDS } from './core';

// Government contract specific types
interface GovernmentContract {
  notice_id: string;
  direct_sam_url: string;
  title: string;
  contracting_officer_email: string;
  estimated_value: number;
  award_date: string;
  submission_deadline: string;
  location: string;
  naics_codes: string[];
  set_aside_codes: string[];
  description: string;
}

// NAICS codes based on research
export const NAICS_CODES_PRIORITY = {
  "238160": "Roofing Contractors",           // Primary
  "238310": "Drywall and Insulation",       // Primary  
  "238320": "Painting and Wall Covering",   // Secondary
  "238330": "Flooring Contractors",         // Secondary
  "238390": "Other Building Finishing",     // Secondary
  "238210": "Electrical Contractors",       // Secondary
  "238220": "Plumbing, Heating, Air Conditioning", // Secondary
  "236220": "Commercial Building Construction" // High Value
};

export const SET_ASIDE_CODES = ["SBA", "8A", "HUBZONE", "SDVOSB", "WOSB"];

export class GovernmentContractsScraper {
  private core: AgentQLCore;

  constructor(core: AgentQLCore) {
    this.core = core;
  }

  /**
   * Search for government contracting opportunities
   */
  async searchContracts(
    profile: ContractorProfile,
    maxResults: number = 10
  ): Promise<LeadResult[]> {
    if (!this.core.isReady()) {
      throw new Error('AgentQL Core not ready. Call initialize() first.');
    }

    const results: LeadResult[] = [];
    const page = this.core.getPage();

    try {
      console.log('[SAMs.gov] Searching for government contracts...');

      // Search SAMs.gov with targeted parameters
      await page.goto('https://sam.gov/search/?index=opp', { waitUntil: 'networkidle' });

      // Apply filters based on contractor profile
      await this.applySearchFilters(page, profile);

      // Extract contract opportunities
      const contracts = await this.core.executeWithRetry(
        () => this.extractContracts(page),
        'SAMs.gov contract extraction'
      );

      // Process contracts into LeadResult format
      for (const contract of contracts) {
        const lead = await this.processContract(contract, profile);
        if (lead) {
          results.push(lead);
        }
        if (results.length >= maxResults) break;
      }

      return results.sort((a, b) => b.estimated_value - a.estimated_value);

    } catch (error) {
      console.error('[SAMs.gov] Search failed:', error);
      throw error;
    }
  }

  /**
   * Apply search filters to SAMs.gov interface
   */
  private async applySearchFilters(page: any, profile: ContractorProfile): Promise<void> {
    try {
      // Filter by NAICS codes
      const relevantNaics = this.getRelevantNaicsCodes(profile);
      for (const naics of relevantNaics) {
        // Add NAICS code filter
        console.log(`[SAMs.gov] Adding NAICS filter: ${naics}`);
      }

      // Filter by location (state-level)
      const states = this.extractStatesFromLocation(profile.location);
      for (const state of states) {
        console.log(`[SAMs.gov] Adding location filter: ${state}`);
      }

      // Filter by minimum value
      const threshold = this.getValueThreshold(profile.location);
      console.log(`[SAMs.gov] Setting minimum value: $${threshold}`);

      // Filter by opportunity status (active only)
      console.log('[SAMs.gov] Filtering for active opportunities only');

    } catch (error) {
      console.error('[SAMs.gov] Failed to apply filters:', error);
    }
  }

  /**
   * Extract contract opportunities from search results
   */
  private async extractContracts(page: any): Promise<GovernmentContract[]> {
    // Note: This would need to be updated with actual AgentQL query syntax
    // Placeholder for AgentQL contract extraction
    console.log('[SAMs.gov] Extracting contract data...');
    
    // Return mock data for now - would be replaced with actual AgentQL extraction
    return [];
  }

  /**
   * Process government contract into LeadResult format
   */
  private async processContract(
    contract: GovernmentContract, 
    profile: ContractorProfile
  ): Promise<LeadResult | null> {
    try {
      // Calculate recency based on posting date
      const postedTime = new Date(contract.award_date);
      
      return {
        direct_posting_url: contract.direct_sam_url,
        post_id: contract.notice_id,
        title: contract.title,
        location: contract.location,
        compensation: `$${contract.estimated_value.toLocaleString()}`,
        contact_method: `Email: ${contract.contracting_officer_email}`,
        posted_timestamp: postedTime,
        project_details: contract.description,
        estimated_value: contract.estimated_value,
        recency_score: this.calculateContractRecency(postedTime, contract.submission_deadline),
        source_platform: 'sams_gov',
        service_category: this.categorizeFromNaics(contract.naics_codes)
      };

    } catch (error) {
      console.error(`[SAMs.gov] Failed to process contract ${contract.notice_id}:`, error);
      return null;
    }
  }

  /**
   * Get relevant NAICS codes based on contractor services
   */
  private getRelevantNaicsCodes(profile: ContractorProfile): string[] {
    const codes: string[] = [];
    
    profile.services.forEach(service => {
      const serviceLower = service.toLowerCase();
      if (serviceLower.includes('roof')) codes.push('238160');
      if (serviceLower.includes('drywall')) codes.push('238310');
      if (serviceLower.includes('paint')) codes.push('238320');
      if (serviceLower.includes('floor')) codes.push('238330');
      if (serviceLower.includes('electrical')) codes.push('238210');
      if (serviceLower.includes('plumb') || serviceLower.includes('hvac')) codes.push('238220');
    });

    // Always include general building finishing
    codes.push('238390');
    
    return [...new Set(codes)]; // Remove duplicates
  }

  /**
   * Extract states from contractor location
   */
  private extractStatesFromLocation(location: string): string[] {
    const locationLower = location.toLowerCase();
    const states: string[] = [];
    
    if (locationLower.includes('ohio') || locationLower.includes('cleveland')) {
      states.push('OH');
    }
    if (locationLower.includes('florida') || locationLower.includes('miami')) {
      states.push('FL');
    }
    
    return states.length > 0 ? states : ['OH', 'FL']; // Default to research states
  }

  /**
   * Get value threshold based on location
   */
  private getValueThreshold(location: string): number {
    const locationLower = location.toLowerCase();
    
    if (locationLower.includes('miami') || locationLower.includes('florida')) {
      return VALUE_THRESHOLDS.miami_area.minimum;
    }
    if (locationLower.includes('cleveland') || locationLower.includes('ohio')) {
      return VALUE_THRESHOLDS.cleveland_area.minimum;
    }
    
    return 10000; // Default federal minimum
  }

  /**
   * Calculate recency score for government contracts
   */
  private calculateContractRecency(postedDate: Date, deadline: string): number {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    // Government contracts scored by deadline proximity
    if (daysUntilDeadline <= 7) return 9;   // Very urgent
    if (daysUntilDeadline <= 14) return 7;  // Urgent
    if (daysUntilDeadline <= 30) return 5;  // Good timing
    if (daysUntilDeadline <= 60) return 3;  // Plan ahead
    return 1; // Long-term planning
  }

  /**
   * Categorize service from NAICS codes
   */
  private categorizeFromNaics(naicsCodes: string[]): string {
    if (naicsCodes.includes('238160')) return 'roofing';
    if (naicsCodes.includes('238310')) return 'drywall';
    if (naicsCodes.includes('238210')) return 'electrical';
    if (naicsCodes.includes('238220')) return 'plumbing';
    if (naicsCodes.includes('238320')) return 'painting';
    if (naicsCodes.includes('238330')) return 'flooring';
    
    return 'general';
  }
}
