# Agent JSON Assets Specification

## Overview
Each agent in the FixItForMe platform returns structured JSON responses that include both conversational text and UI assets for generative rendering in the chat interface.

## JSON Assets Count by Agent

### 🤖 Lexi the Liaison (Onboarding Guide)
**Primary UI Assets: 3 types**

1. **`onboarding_checklist`** - Interactive progress tracker
   - Component: `LexiOnboarding`
   - Data: Step completion, progress percentage, next actions
   - Frequency: Every onboarding interaction

2. **`service_selection`** - Felix framework selector
   - Component: `ServiceSelectionGrid`
   - Data: Available services, recommendations, pricing tiers
   - Frequency: During service setup

3. **`profile_summary`** - Completion status dashboard
   - Component: `ProfileCompletionCard`
   - Data: Profile sections, completion status, missing fields
   - Frequency: Profile review sessions

**Total JSON assets per interaction: 1-2 components**

### 📊 Alex the Assessor (Bidding Assistant)
**Primary UI Assets: 4 types**

1. **`cost_breakdown`** - Detailed project analysis
   - Component: `AlexCostBreakdown`
   - Data: Labor, materials, permits, timeline, risks
   - Frequency: Every bid analysis

2. **`material_calculator`** - Interactive calculator
   - Component: `MaterialCalculator`
   - Data: Quantities, unit costs, suppliers, alternatives
   - Frequency: Detailed estimating sessions

3. **`timeline_chart`** - Project scheduling
   - Component: `TimelineChart`
   - Data: Phases, dependencies, critical path, resources
   - Frequency: Timeline planning requests

4. **`competitive_analysis`** - Market positioning
   - Component: `CompetitiveInsights`
   - Data: Market rates, competitor analysis, pricing strategy
   - Frequency: Strategic bidding sessions

**Total JSON assets per interaction: 1-3 components**

### 🔍 Rex the Retriever (Lead Generator)
**Primary UI Assets: 5 types**

1. **`lead_dashboard`** - Performance analytics
   - Component: `RexLeadDashboard`
   - Data: Metrics, conversion rates, geographic breakdown
   - Frequency: Every status request

2. **`geographic_heatmap`** - Territory analysis
   - Component: `GeographicHeatmap`
   - Data: Lead density, competition, opportunity zones
   - Frequency: Market analysis requests

3. **`trending_problems`** - Felix category insights
   - Component: `TrendingProblemsChart`
   - Data: Problem categories, demand levels, seasonal trends
   - Frequency: Market intelligence requests

4. **`lead_quality_metrics`** - Quality scoring
   - Component: `QualityMetricsCard`
   - Data: Source performance, spam detection, value scores
   - Frequency: Quality analysis sessions

5. **`session_usage`** - Tier management
   - Component: `SessionUsageTracker`
   - Data: Usage limits, remaining sessions, tier benefits
   - Frequency: Every interaction (sidebar widget)

**Total JSON assets per interaction: 2-4 components**

## Generative UI Architecture

### Response Structure
\`\`\`typescript
{
  "message": "Conversational response text",
  "ui_assets": {
    "type": "component_type",
    "data": { /* Component-specific data */ },
    "render_hints": {
      "component": "ReactComponentName",
      "priority": "high|medium|low",
      "interactive": true|false
    }
  },
  "actions": [
    {
      "type": "action_type",
      "label": "Button text",
      "style": "primary|secondary|outline"
    }
  ]
}
\`\`\`

### Rendering Logic
- **High Priority**: Renders immediately with full interactivity
- **Medium Priority**: Renders with loading state, then full features
- **Low Priority**: Renders as summary card, expands on click

### Performance Considerations
- Components lazy-load heavy visualizations (D3.js charts)
- Data is cached for repeat interactions
- Animations are reduced on lower-powered devices

## Integration with Enhanced Chat System

The `EnhancedChatWindow.tsx` component handles all JSON asset rendering through the `GenerativeUIRenderer` function, which:

1. Parses the `ui_assets` field from agent responses
2. Maps asset types to React components
3. Passes data and actions to appropriate components
4. Handles unknown asset types gracefully

This ensures a consistent, interactive experience across all agent interactions while maintaining type safety and performance.
