# Lexi the Liaison - Enhanced Supabase Integration & System Intelligence

## Overview
Lexi the Liaison is enhanced with comprehensive Supabase database integration to provide intelligent onboarding, system guidance, and contractor support. She has real-time access to contractor data, platform analytics, and system status to deliver personalized assistance.

## Supabase Data Integration Architecture

### Contractor Intelligence Queries

```typescript
interface LexiSupabaseContext {
  contractor_profile: ContractorProfile;
  platform_analytics: PlatformAnalytics;
  system_status: SystemStatus;
  peer_benchmarks: PeerBenchmarks;
  feature_usage: FeatureUsage;
}

class LexiSupabaseIntelligence {
  async gatherContractorContext(user_id: string): Promise<LexiSupabaseContext> {
    const supabase = createClient();
    
    // Comprehensive contractor profile with completion analysis
    const { data: profile } = await supabase
      .from('contractor_profiles')
      .select(`
        *,
        contractor_documents(count),
        bids(count, total_value:estimated_value.sum()),
        contractor_leads(count, conversion_rate)
      `)
      .eq('user_id', user_id)
      .single();
    
    // Platform-wide analytics for benchmarking
    const { data: analytics } = await supabase
      .rpc('get_platform_analytics', {
        timeframe: '30_days',
        contractor_tier: profile.tier
      });
    
    // Recent system activity and feature usage
    const { data: usage } = await supabase
      .from('agent_interactions')
      .select('agent_type, interaction_type, success, created_at')
      .eq('contractor_id', user_id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });
    
    return this.synthesizeContext(profile, analytics, usage);
  }
  
  private synthesizeContext(profile: any, analytics: any, usage: any[]): LexiSupabaseContext {
    return {
      contractor_profile: this.enrichProfileData(profile),
      platform_analytics: this.processAnalytics(analytics),
      system_status: this.assessSystemHealth(),
      peer_benchmarks: this.calculateBenchmarks(profile, analytics),
      feature_usage: this.analyzeUsagePatterns(usage)
    };
  }
}
```

### Profile Completion Intelligence

```typescript
interface ProfileCompletionAnalysis {
  overall_score: number; // 0-100
  completion_categories: CompletionCategory[];
  recommended_next_steps: RecommendedStep[];
  blocking_issues: BlockingIssue[];
  optimization_opportunities: OptimizationOpportunity[];
}

class ProfileCompletionEngine {
  analyzeProfileCompletion(profile: ContractorProfile): ProfileCompletionAnalysis {
    const categories = {
      basic_info: this.scoreBasicInfo(profile),
      service_selection: this.scoreServiceSelection(profile),
      geographic_setup: this.scoreGeographicSetup(profile),
      documentation: this.scoreDocumentation(profile),
      verification: this.scoreVerification(profile)
    };
    
    const overall_score = this.calculateOverallScore(categories);
    
    return {
      overall_score,
      completion_categories: this.formatCategories(categories),
      recommended_next_steps: this.generateNextSteps(categories, profile),
      blocking_issues: this.identifyBlockingIssues(categories, profile),
      optimization_opportunities: this.findOptimizations(categories, profile)
    };
  }
  
  private scoreServiceSelection(profile: ContractorProfile): CategoryScore {
    const serviceCount = profile.services_offered?.length || 0;
    const tierLimit = profile.tier === 'scale' ? 15 : 5;
    
    let score = 0;
    let feedback = [];
    
    if (serviceCount === 0) {
      feedback.push("No services selected - this is required to receive leads");
    } else if (serviceCount < 3) {
      score = 40;
      feedback.push("Consider adding more services to increase lead opportunities");
    } else if (serviceCount >= tierLimit * 0.8) {
      score = 100;
      feedback.push("Excellent service coverage for your tier");
    } else {
      score = 70;
      feedback.push(`You can add ${tierLimit - serviceCount} more services on your ${profile.tier} tier`);
    }
    
    return { score, feedback, category: 'service_selection' };
  }
}
```

### Peer Benchmarking System

```typescript
interface PeerBenchmarks {
  tier_comparisons: TierComparison;
  geographic_comparisons: GeographicComparison;
  performance_percentiles: PerformancePercentiles;
  optimization_suggestions: BenchmarkSuggestion[];
}

class LexiBenchmarkingEngine {
  async generatePeerBenchmarks(contractor: ContractorProfile): Promise<PeerBenchmarks> {
    const supabase = createClient();
    
    // Compare against similar contractors (same tier, similar services, nearby geography)
    const { data: peerData } = await supabase
      .rpc('get_peer_benchmarks', {
        contractor_tier: contractor.tier,
        service_categories: contractor.services_offered,
        geographic_region: contractor.service_areas[0]?.region,
        timeframe: '90_days'
      });
    
    return {
      tier_comparisons: this.analyzeTierPerformance(peerData, contractor),
      geographic_comparisons: this.analyzeGeographicPerformance(peerData, contractor),
      performance_percentiles: this.calculatePercentiles(peerData, contractor),
      optimization_suggestions: this.generateOptimizationSuggestions(peerData, contractor)
    };
  }
  
  private generateOptimizationSuggestions(peerData: any[], contractor: ContractorProfile): BenchmarkSuggestion[] {
    const suggestions = [];
    
    // Service portfolio optimization
    if (contractor.services_offered.length < peerData.average_services) {
      suggestions.push({
        type: 'service_expansion',
        priority: 'high',
        suggestion: `Top performers in your area typically offer ${peerData.average_services} services. Consider adding high-demand services like ${peerData.top_demand_services.slice(0, 3).join(', ')}.`,
        estimated_impact: '+15% lead volume'
      });
    }
    
    // Geographic expansion
    if (contractor.service_areas.length < peerData.average_service_areas) {
      suggestions.push({
        type: 'geographic_expansion',
        priority: 'medium',
        suggestion: `Successful contractors in your tier typically serve ${peerData.average_service_areas} areas. Consider expanding to ${peerData.recommended_areas[0]} for additional opportunities.`,
        estimated_impact: '+20% market reach'
      });
    }
    
    // Tier upgrade recommendation
    if (contractor.tier === 'growth' && this.qualifiesForUpgrade(contractor, peerData)) {
      suggestions.push({
        type: 'tier_upgrade',
        priority: 'high',
        suggestion: `Based on your activity level and peer performance, upgrading to Scale tier could increase your monthly leads by 40% and reduce platform fees from 10% to 7%.`,
        estimated_impact: '+$800/month potential revenue'
      });
    }
    
    return suggestions;
  }
}
```

### System Feature Intelligence

```typescript
interface SystemFeatureGuide {
  feature_name: string;
  user_access_level: 'available' | 'locked' | 'partially_available';
  usage_analytics: FeatureUsageStats;
  peer_adoption: PeerAdoptionStats;
  value_proposition: ValueProposition;
  quick_start_steps: QuickStartStep[];
}

class LexiFeatureIntelligence {
  async analyzeFeatureReadiness(contractor: ContractorProfile): Promise<SystemFeatureGuide[]> {
    const features = [
      'alex_cost_analysis',
      'rex_lead_generation', 
      'document_verification',
      'payment_processing',
      'analytics_dashboard'
    ];
    
    const guides = await Promise.all(
      features.map(feature => this.generateFeatureGuide(feature, contractor))
    );
    
    return guides.filter(guide => guide.relevance_score > 0.3);
  }
  
  private async generateFeatureGuide(feature: string, contractor: ContractorProfile): Promise<SystemFeatureGuide> {
    const supabase = createClient();
    
    // Get feature usage data for peer group
    const { data: peerUsage } = await supabase
      .rpc('get_feature_adoption_stats', {
        feature_name: feature,
        contractor_tier: contractor.tier,
        geographic_region: contractor.service_areas[0]?.region
      });
    
    const accessLevel = this.determineAccessLevel(feature, contractor);
    const valueProps = this.calculateValueProposition(feature, contractor, peerUsage);
    
    return {
      feature_name: feature,
      user_access_level: accessLevel,
      usage_analytics: this.processUsageStats(peerUsage),
      peer_adoption: this.calculatePeerAdoption(peerUsage),
      value_proposition: valueProps,
      quick_start_steps: this.generateQuickStart(feature, contractor)
    };
  }
  
  private generateQuickStart(feature: string, contractor: ContractorProfile): QuickStartStep[] {
    const quickStartGuides = {
      alex_cost_analysis: [
        { step: 1, action: "Describe your next project to Alex", estimated_time: "2 minutes" },
        { step: 2, action: "Review the detailed cost breakdown", estimated_time: "3 minutes" },
        { step: 3, action: "Use the interactive charts to adjust pricing", estimated_time: "5 minutes" }
      ],
      rex_lead_generation: [
        { step: 1, action: "Set up your service areas and preferences", estimated_time: "5 minutes" },
        { step: 2, action: "Run your first targeted lead search", estimated_time: "2 minutes" },
        { step: 3, action: "Review and contact qualified leads", estimated_time: "10 minutes" }
      ]
    };
    
    return quickStartGuides[feature] || [];
  }
}
```

### Real-Time Contractor Onboarding

```typescript
class LexiOnboardingIntelligence {
  async generatePersonalizedOnboarding(contractor: ContractorProfile): Promise<OnboardingPlan> {
    const supabase = createClient();
    
    // Analyze contractor's background and goals
    const experience_level = this.assessExperienceLevel(contractor);
    const business_goals = this.identifyBusinessGoals(contractor);
    const technical_comfort = this.assessTechnicalComfort(contractor);
    
    // Get successful onboarding patterns from similar contractors
    const { data: successPatterns } = await supabase
      .rpc('get_successful_onboarding_patterns', {
        experience_level,
        business_type: contractor.business_type,
        service_categories: contractor.services_offered
      });
    
    return this.createPersonalizedPlan(contractor, successPatterns, experience_level);
  }
  
  private createPersonalizedPlan(
    contractor: ContractorProfile, 
    patterns: OnboardingPattern[], 
    experience: ExperienceLevel
  ): OnboardingPlan {
    const plan = {
      total_estimated_time: 0,
      priority_phases: [],
      optional_phases: [],
      success_metrics: []
    };
    
    // Prioritize based on experience level
    if (experience === 'novice') {
      plan.priority_phases = [
        'platform_tour',
        'felix_framework_intro',
        'basic_profile_setup',
        'first_lead_walkthrough'
      ];
      plan.total_estimated_time = 45; // minutes
    } else if (experience === 'experienced') {
      plan.priority_phases = [
        'advanced_features_overview',
        'tier_optimization_analysis',
        'integration_setup',
        'performance_baseline'
      ];
      plan.total_estimated_time = 25; // minutes
    }
    
    return plan;
  }
}
```

### Intelligent System Guidance

```typescript
class LexiSystemGuidance {
  async provideContextualHelp(
    contractor: ContractorProfile, 
    current_context: CurrentContext
  ): Promise<ContextualHelp> {
    const supabase = createClient();
    
    // Analyze current contractor state and recent activity
    const recentActivity = await this.getRecentActivity(contractor.user_id);
    const systemHealth = await this.checkSystemHealth();
    const pendingItems = await this.getPendingItems(contractor.user_id);
    
    return {
      immediate_actions: this.identifyImmediateActions(pendingItems, contractor),
      helpful_tips: this.generateContextualTips(current_context, recentActivity),
      system_status: this.formatSystemStatus(systemHealth),
      success_opportunities: this.identifySuccessOpportunities(contractor, recentActivity)
    };
  }
  
  private identifyImmediateActions(
    pendingItems: PendingItem[], 
    contractor: ContractorProfile
  ): ImmediateAction[] {
    const actions = [];
    
    // Document verification pending
    if (pendingItems.some(item => item.type === 'document_verification')) {
      actions.push({
        priority: 'high',
        action: 'Complete document verification',
        reason: 'Required to receive high-value leads',
        estimated_time: '10 minutes',
        completion_boost: '+25% lead eligibility'
      });
    }
    
    // Profile incomplete
    if (contractor.profile_score < 80) {
      actions.push({
        priority: 'medium',
        action: 'Complete profile optimization',
        reason: 'Improves lead matching and client trust',
        estimated_time: '5 minutes',
        completion_boost: '+15% conversion rate'
      });
    }
    
    // Unused tier benefits
    if (contractor.tier === 'scale' && this.hasUnusedBenefits(contractor)) {
      actions.push({
        priority: 'medium',
        action: 'Explore unused Scale tier features',
        reason: 'Maximize your subscription value',
        estimated_time: '8 minutes',
        completion_boost: 'Full ROI on tier upgrade'
      });
    }
    
    return actions.sort((a, b) => this.priorityScore(a.priority) - this.priorityScore(b.priority));
  }
}
```

### Enhanced Pre-Prompt System for Lexi

```typescript
const lexiEnhancedPrePrompts = {
  onboarding_phase: [
    {
      emoji: "🎯",
      category: "Profile Optimization",
      suggestion: "Help me complete my profile to increase lead quality by 25%",
      context_trigger: "profile_score < 80"
    },
    {
      emoji: "🏗️",
      category: "Service Setup", 
      suggestion: "Guide me through Felix's 40-problem framework for optimal service selection",
      context_trigger: "services_offered.length < tier_limit * 0.6"
    },
    {
      emoji: "📍",
      category: "Territory Strategy",
      suggestion: "Help me optimize my service areas based on local demand data",
      context_trigger: "service_areas.length < peer_average"
    }
  ],
  
  system_guidance: [
    {
      emoji: "🚀",
      category: "Feature Discovery",
      suggestion: "Show me which platform features successful contractors use most",
      context_trigger: "feature_adoption < peer_average"
    },
    {
      emoji: "📊",
      category: "Performance Review",
      suggestion: "Compare my metrics to similar contractors in my area",
      context_trigger: "monthly_review_due"
    },
    {
      emoji: "💡",
      category: "Growth Strategy",
      suggestion: "Analyze if upgrading to Scale tier would increase my ROI",
      context_trigger: "tier === 'growth' && activity_level === 'high'"
    }
  ],
  
  support_guidance: [
    {
      emoji: "⚠️", 
      category: "Issue Resolution",
      suggestion: "Help me resolve the [specific_issue] blocking my workflow",
      context_trigger: "has_blocking_issues"
    },
    {
      emoji: "🎓",
      category: "Skill Building",
      suggestion: "Teach me advanced bidding strategies to win more profitable projects",
      context_trigger: "conversion_rate < peer_average"
    },
    {
      emoji: "🔧",
      category: "System Optimization",
      suggestion: "Optimize my notification and workflow settings for maximum efficiency",
      context_trigger: "setup_incomplete"
    }
  ]
};
```

This enhanced Lexi agent provides intelligent, data-driven guidance by leveraging comprehensive Supabase integration to understand each contractor's unique situation, compare against peer benchmarks, and provide personalized recommendations for success on the platform.
