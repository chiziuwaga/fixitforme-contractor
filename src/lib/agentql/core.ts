/**
 * FixItForMe AgentQL Core Module
 * Systematic contractor lead generation with recency controls and direct page attributions
 * Based on comprehensive research yielding 60+ contractor leads across Cleveland and Miami
 */

import * as agentql from 'agentql';
import { chromium, Browser, Page, BrowserContext } from 'playwright';

// Core Types
export interface AgentQLConfig {
  apiKey: string;
  timeout?: number;
  headless?: boolean;
  retryAttempts?: number;
}

export interface LeadResult {
  direct_posting_url: string;
  post_id: string;
  title: string;
  location: string;
  compensation: string;
  contact_method: string;
  posted_timestamp: Date;
  project_details: string;
  estimated_value: number;
  recency_score: number;
  source_platform: 'craigslist' | 'sams_gov' | 'municipal' | 'facebook';
  service_category: string;
}

export interface MaterialResult {
  item_name: string;
  supplier: 'home_depot' | 'lowes' | 'local_supplier' | 'other';
  price: number;
  availability: 'in_stock' | 'order_required' | 'out_of_stock';
  product_url: string;
  specifications: string;
  location: string;
  last_updated: Date;
}

export interface ContractorProfile {
  services: string[];
  location: string;
  radius_miles: number;
  experience_years: number;
  certifications: string[];
  preferred_project_types: string[];
  minimum_project_value: number;
}

// Recency Scoring System
export function calculateRecencyScore(postedTime: Date): number {
  const hoursAgo = (Date.now() - postedTime.getTime()) / (1000 * 60 * 60);
  
  if (hoursAgo <= 12) return 10;    // URGENT
  if (hoursAgo <= 48) return 8;     // HOT  
  if (hoursAgo <= 168) return 6;    // WARM (7 days)
  if (hoursAgo <= 720) return 3;    // COLD (30 days)
  return 1;                         // STALE
}

// Geographic targeting based on research
export const GEOGRAPHIC_CLUSTERS = {
  cleveland_radius: [
    "Cleveland", "Akron", "Canton", "Elyria", "Lorain", "Mentor", 
    "Sandusky", "Warren", "Youngstown", "Lakewood", "Cleveland Heights",
    "Shaker Heights", "Parma", "Westlake", "Rocky River", "Bay Village",
    "Beachwood", "Solon", "Hudson", "Stow", "Cuyahoga Falls", "Medina",
    "Brunswick", "Milan", "Jefferson", "Orrville", "Windsor", "Uniontown"
  ],
  miami_radius: [
    "Miami", "Fort Lauderdale", "Hollywood", "Pompano Beach", "Coral Springs",
    "Plantation", "Sunrise", "Davie", "Pembroke Pines", "Miramar", 
    "Boca Raton", "Delray Beach", "Boynton Beach", "West Palm Beach",
    "Miami Beach", "Coral Gables", "Aventura", "North Miami", "Kendall",
    "Doral", "Hialeah", "Palmetto Bay", "Pinecrest", "Homestead"
  ]
};

// Value thresholds based on market research
export const VALUE_THRESHOLDS = {
  cleveland_area: {
    minimum: 3000,
    preferred: 5000,
    high_value: 15000
  },
  miami_area: {
    minimum: 7000,
    preferred: 10000,
    high_value: 25000
  }
};

// Core AgentQL Client
export class AgentQLCore {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: any = null; // AgentQL-wrapped page or regular Playwright page
  private config: AgentQLConfig;
  private isInitialized = false;

  constructor(config: AgentQLConfig) {
    this.config = {
      timeout: 30000,
      headless: true,
      retryAttempts: 3,
      ...config
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Launch browser with optimal settings
      this.browser = await chromium.launch({ 
        headless: this.config.headless,
        timeout: this.config.timeout,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      this.context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      });

      this.page = await this.context.newPage();
      
      // Configure AgentQL
      if (this.config.apiKey) {
        await agentql.configure({ apiKey: this.config.apiKey });
        this.page = await agentql.wrap(this.page);
      }

      this.isInitialized = true;
      console.log('[AgentQL Core] Successfully initialized');
    } catch (error) {
      console.error('[AgentQL Core] Initialization failed:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      this.isInitialized = false;
      console.log('[AgentQL Core] Successfully cleaned up');
    } catch (error) {
      console.error('[AgentQL Core] Cleanup failed:', error);
    }
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts!; attempt++) {
      try {
        console.log(`[AgentQL Core] ${operationName} - Attempt ${attempt}`);
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`[AgentQL Core] ${operationName} failed on attempt ${attempt}:`, error);
        
        if (attempt < this.config.retryAttempts!) {
          await this.delay(1000 * attempt); // Exponential backoff
        }
      }
    }
    
    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getPage(): any { // Returns AgentQL-wrapped page or regular Playwright page
    if (!this.page || !this.isInitialized) {
      throw new Error('AgentQL Core not initialized. Call initialize() first.');
    }
    return this.page;
  }

  isReady(): boolean {
    return this.isInitialized && this.page !== null;
  }
}

// Export default factory function
export function createAgentQLCore(config: AgentQLConfig): AgentQLCore {
  return new AgentQLCore(config);
}
