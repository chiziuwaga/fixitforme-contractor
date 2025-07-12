/**
 * Craigslist Lead Generation Module
 * Tier 1 Platform - Highest Success Rate (70% from Labor Gigs, 60% from Skilled Trades)
 * Direct posting URL extraction with recency controls
 */

import { AgentQLCore, LeadResult, ContractorProfile, calculateRecencyScore, GEOGRAPHIC_CLUSTERS } from './core';

// Craigslist-specific types
interface CraigslistQuery {
  city: string;
  section: 'ggg' | 'lbg' | 'trd' | 'rej'; // Gigs, Labor Gigs, Skilled Trades, Real Estate Jobs
  searchTerms: string[];
  maxAge: number; // hours
}

interface CraigslistListing {
  url: string;
  id: string;
  title: string;
  price: string;
  location: string;
  datetime: string;
  description: string;
}

// Service category mapping based on research
export const SERVICE_CATEGORIES = {
  primary: {
    roofing: [
      'roofing contractor needed',
      'roofer wanted', 
      'roof repair contractor',
      'roofing crew needed',
      'metal roofing contractor',
      'commercial roofing contractor'
    ],
    drywall: [
      'drywall contractor needed',
      'drywall finisher wanted',
      'drywall expert needed',
      'drywall installer required',
      'drywall repair contractor'
    ]
  },
  secondary: {
    electrical: ['electrical contractor needed', 'electrician wanted'],
    plumbing: ['plumbing contractor wanted', 'plumber needed'],
    hvac: ['HVAC contractor required', 'heating cooling contractor'],
    painting: ['painting contractor needed', 'painter wanted'],
    flooring: ['flooring contractor wanted', 'flooring installer'],
    general: ['general contractor needed', 'GC wanted'],
    handyman: ['handyman contractor required', 'handyman services'],
    concrete: ['concrete contractor needed', 'concrete work']
  }
};

// Quality control patterns based on research
const SPAM_FILTERS = {
  exclude_titles: ['$500 bonus', 'same day cash', 'www.rentatech.org'],
  exclude_descriptions: ['you are paid in cash same day', '18337368835'],
  exclude_patterns: /\$\d+\s+(bonus|cash)\s+(same\s+day|immediately)/i
};

export class CraigslistScraper {
  private core: AgentQLCore;

  constructor(core: AgentQLCore) {
    this.core = core;
  }

  /**
   * Search for contractor opportunities in specified city
   */
  async searchLeads(
    city: string, 
    profile: ContractorProfile,
    maxResults: number = 20
  ): Promise<LeadResult[]> {
    if (!this.core.isReady()) {
      throw new Error('AgentQL Core not ready. Call initialize() first.');
    }

    const results: LeadResult[] = [];
    const page = this.core.getPage();

    try {
      // Build search queries based on contractor profile
      const queries = this.buildSearchQueries(city, profile);
      
      for (const query of queries) {
        console.log(`[Craigslist] Searching ${city} ${query.section} for: ${query.searchTerms.join(', ')}`);
        
        const listings = await this.core.executeWithRetry(
          () => this.executeSearch(page, query),
          `Craigslist search: ${city} ${query.section}`
        );

        // Process and filter listings
        const processedLeads = await this.processListings(listings, profile);
        results.push(...processedLeads);

        if (results.length >= maxResults) break;
      }

      // Sort by recency score and estimated value
      return results
        .sort((a, b) => (b.recency_score * 100 + b.estimated_value) - (a.recency_score * 100 + a.estimated_value))
        .slice(0, maxResults);

    } catch (error) {
      console.error(`[Craigslist] Search failed for ${city}:`, error);
      throw error;
    }
  }

  /**
   * Build targeted search queries based on contractor profile
   */
  private buildSearchQueries(city: string, profile: ContractorProfile): CraigslistQuery[] {
    const queries: CraigslistQuery[] = [];
    
    // Primary categories (40% allocation) - Roofing & Drywall
    if (profile.services.some(s => s.toLowerCase().includes('roof'))) {
      queries.push({
        city,
        section: 'lbg', // Labor Gigs - 70% success rate
        searchTerms: SERVICE_CATEGORIES.primary.roofing,
        maxAge: 48
      });
    }

    if (profile.services.some(s => s.toLowerCase().includes('drywall'))) {
      queries.push({
        city,
        section: 'lbg',
        searchTerms: SERVICE_CATEGORIES.primary.drywall,
        maxAge: 48
      });
    }

    // Secondary categories (60% allocation)
    queries.push({
      city,
      section: 'trd', // Skilled Trades - 60% success rate
      searchTerms: [
        ...SERVICE_CATEGORIES.secondary.electrical,
        ...SERVICE_CATEGORIES.secondary.plumbing,
        ...SERVICE_CATEGORIES.secondary.hvac
      ],
      maxAge: 72
    });

    queries.push({
      city,
      section: 'ggg', // General Gigs
      searchTerms: [
        ...SERVICE_CATEGORIES.secondary.general,
        ...SERVICE_CATEGORIES.secondary.handyman
      ],
      maxAge: 96
    });

    return queries;
  }

  /**
   * Execute search query on Craigslist
   */
  private async executeSearch(page: any, query: CraigslistQuery): Promise<CraigslistListing[]> {
    const baseUrl = `https://${query.city.toLowerCase()}.craigslist.org`;
    const searchUrl = `${baseUrl}/search/${query.section}?query=${encodeURIComponent(query.searchTerms[0])}`;
    
    await page.goto(searchUrl, { waitUntil: 'networkidle' });

    // AgentQL query to extract listings
    const queryObject = {
      listings: [{
        url: "LINK_TO_INDIVIDUAL_POSTING", // Critical: individual posting URL, not search URL
        id: "POST_ID",
        title: "POST_TITLE",
        price: "PRICE_OR_COMPENSATION",
        location: "LOCATION",
        datetime: "POSTING_TIME",
      }]
    };

    const response = await page.queryData(queryObject);
    
    if (!response?.listings) {
      console.warn(`[Craigslist] No listings found for query: ${query.searchTerms[0]}`);
      return [];
    }

    return response.listings.filter((listing: any) => 
      listing.url && 
      listing.url.includes('craigslist.org') &&
      !listing.url.includes('/search/') // Ensure individual posting URLs only
    );
  }

  /**
   * Process listings into LeadResult format with quality filtering
   */
  private async processListings(
    listings: CraigslistListing[], 
    profile: ContractorProfile
  ): Promise<LeadResult[]> {
    const results: LeadResult[] = [];

    for (const listing of listings) {
      try {
        // Quality control filters
        if (this.isSpam(listing)) {
          console.log(`[Craigslist] Filtered spam: ${listing.title}`);
          continue;
        }

        // Extract detailed information
        const detailedLead = await this.extractLeadDetails(listing, profile);
        
        if (detailedLead && this.meetsValueThreshold(detailedLead, profile)) {
          results.push(detailedLead);
        }
      } catch (error) {
        console.warn(`[Craigslist] Failed to process listing ${listing.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Extract detailed lead information from individual posting
   */
  private async extractLeadDetails(
    listing: CraigslistListing, 
    profile: ContractorProfile
  ): Promise<LeadResult | null> {
    const page = this.core.getPage();
    
    try {
      await page.goto(listing.url, { waitUntil: 'networkidle' });

      // Extract comprehensive details
      const detailQuery = {
        contact_info: "PHONE_NUMBER_OR_EMAIL",
        full_description: "COMPLETE_PROJECT_DESCRIPTION",
        location_details: "SPECIFIC_LOCATION",
        compensation_details: "DETAILED_COMPENSATION",
        project_timeline: "TIMELINE_OR_URGENCY",
        contact_method: "CONTACT_METHOD_TYPE"
      };

      const details = await page.queryData(detailQuery);
      
      // Parse posting time
      const postedTime = this.parsePostingTime(listing.datetime);
      
      // Estimate project value
      const estimatedValue = this.estimateProjectValue(
        listing.title + ' ' + (details.full_description || ''),
        listing.price || details.compensation_details
      );

      return {
        direct_posting_url: listing.url,
        post_id: listing.id,
        title: listing.title,
        location: details.location_details || listing.location,
        compensation: details.compensation_details || listing.price || 'Not specified',
        contact_method: this.extractContactMethod(details),
        posted_timestamp: postedTime,
        project_details: details.full_description || '',
        estimated_value: estimatedValue,
        recency_score: calculateRecencyScore(postedTime),
        source_platform: 'craigslist',
        service_category: this.categorizeService(listing.title)
      };

    } catch (error) {
      console.error(`[Craigslist] Failed to extract details from ${listing.url}:`, error);
      return null;
    }
  }

  /**
   * Quality control: Check if listing is spam
   */
  private isSpam(listing: CraigslistListing): boolean {
    const title = listing.title.toLowerCase();
    const description = listing.description?.toLowerCase() || '';

    // Check exclude patterns
    for (const pattern of SPAM_FILTERS.exclude_titles) {
      if (title.includes(pattern.toLowerCase())) return true;
    }

    for (const pattern of SPAM_FILTERS.exclude_descriptions) {
      if (description.includes(pattern.toLowerCase())) return true;
    }

    if (SPAM_FILTERS.exclude_patterns.test(title + ' ' + description)) return true;

    return false;
  }

  /**
   * Check if lead meets minimum value threshold
   */
  private meetsValueThreshold(lead: LeadResult, profile: ContractorProfile): boolean {
    const location = profile.location.toLowerCase();
    let threshold = 3000; // Default

    if (location.includes('miami') || location.includes('florida')) {
      threshold = 7000;
    } else if (location.includes('cleveland') || location.includes('ohio')) {
      threshold = 3000;
    }

    return lead.estimated_value >= Math.min(threshold, profile.minimum_project_value);
  }

  /**
   * Parse Craigslist posting time to Date object
   */
  private parsePostingTime(datetime: string): Date {
    try {
      // Craigslist uses relative times like "2 hours ago" or absolute dates
      if (datetime.includes('ago')) {
        const now = new Date();
        const hours = this.extractHoursAgo(datetime);
        return new Date(now.getTime() - (hours * 60 * 60 * 1000));
      }
      return new Date(datetime);
    } catch {
      return new Date(); // Default to now if parsing fails
    }
  }

  private extractHoursAgo(timeString: string): number {
    const match = timeString.match(/(\d+)\s*(hour|day|minute)/);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'minute': return value / 60;
      case 'hour': return value;
      case 'day': return value * 24;
      default: return 0;
    }
  }

  /**
   * Estimate project value from description and compensation
   */
  private estimateProjectValue(description: string, compensation: string): number {
    // Extract dollar amounts
    const dollarMatch = compensation.match(/\$[\d,]+/);
    if (dollarMatch) {
      const amount = parseInt(dollarMatch[0].replace(/[$,]/g, ''));
      if (amount > 500) return amount;
    }

    // Estimate based on project type and description length
    const desc = description.toLowerCase();
    let baseValue = 5000; // Default

    if (desc.includes('roof')) baseValue = 12000;
    else if (desc.includes('kitchen')) baseValue = 15000;
    else if (desc.includes('bathroom')) baseValue = 8000;
    else if (desc.includes('drywall')) baseValue = 4000;
    else if (desc.includes('commercial')) baseValue = 25000;

    // Adjust based on project scope indicators
    if (desc.includes('large') || desc.includes('big')) baseValue *= 1.5;
    if (desc.includes('small') || desc.includes('minor')) baseValue *= 0.6;
    if (desc.includes('emergency') || desc.includes('urgent')) baseValue *= 1.2;

    return Math.round(baseValue);
  }

  /**
   * Extract contact method from details
   */
  private extractContactMethod(details: any): string {
    if (details.contact_info) {
      if (details.contact_info.includes('@')) return `Email: ${details.contact_info}`;
      if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(details.contact_info)) {
        return `Phone: ${details.contact_info}`;
      }
    }
    return 'Craigslist reply button';
  }

  /**
   * Categorize service type from title
   */
  private categorizeService(title: string): string {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('roof')) return 'roofing';
    if (titleLower.includes('drywall')) return 'drywall';
    if (titleLower.includes('electrical')) return 'electrical';
    if (titleLower.includes('plumb')) return 'plumbing';
    if (titleLower.includes('hvac') || titleLower.includes('heating')) return 'hvac';
    if (titleLower.includes('paint')) return 'painting';
    if (titleLower.includes('floor')) return 'flooring';
    if (titleLower.includes('concrete')) return 'concrete';
    
    return 'general';
  }
}
