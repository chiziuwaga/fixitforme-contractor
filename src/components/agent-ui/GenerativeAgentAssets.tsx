"use client"

import type React from "react"
import {
  LexiOnboarding,
  ServiceSelectionGrid,
  ProfileCompletionCard,
  AlexCostBreakdown,
  MaterialCalculator,
  TimelineChart,
  CompetitiveInsights,
  RexLeadDashboard,
  GeographicHeatmap,
  TrendingProblemsChart,
  QualityMetricsCard,
  SessionUsageTracker,
} from "./AgentAssetPlaceholders"

interface GenerativeUIRendererProps {
  asset: {
    type: string
    data: any
    render_hints?: {
      component: string
    }
  }
}

const componentMap: { [key: string]: React.ComponentType<any> } = {
  // Lexi
  onboarding_checklist: LexiOnboarding,
  service_selection: ServiceSelectionGrid,
  profile_summary: ProfileCompletionCard,
  // Alex
  cost_breakdown: AlexCostBreakdown,
  material_calculator: MaterialCalculator,
  timeline_chart: TimelineChart,
  competitive_analysis: CompetitiveInsights,
  // Rex
  lead_dashboard: RexLeadDashboard,
  geographic_heatmap: GeographicHeatmap,
  trending_problems: TrendingProblemsChart,
  lead_quality_metrics: QualityMetricsCard,
  session_usage: SessionUsageTracker,
}

export function GenerativeUIRenderer({ asset }: GenerativeUIRendererProps) {
  if (!asset || !asset.type) return null

  const Component = componentMap[asset.type]

  if (!Component) {
    console.warn(`No component found for asset type: ${asset.type}`)
    return (
      <div className="p-2 text-xs text-amber-500 bg-amber-500/10 rounded-md">
        Warning: UI component for "{asset.type}" is not implemented.
      </div>
    )
  }

  return <Component {...asset.data} />
}

interface GenerativeAgentAssetsProps {
  ui_assets?: {
    type: string
    data: any
    render_hints?: {
      component: string
    }
  }
}

export function GenerativeAgentAssets({ ui_assets }: GenerativeAgentAssetsProps) {
  if (!ui_assets) {
    return null
  }

  return (
    <div className="mt-2">
      <GenerativeUIRenderer asset={ui_assets} />
    </div>
  )
}
