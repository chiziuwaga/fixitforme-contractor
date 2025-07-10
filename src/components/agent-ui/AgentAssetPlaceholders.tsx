import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  BarChart,
  Map,
  CheckSquare,
  Wrench,
  DollarSign,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Gauge,
} from "lucide-react"

const Placeholder = ({ name, icon }: { name: string; icon: React.ReactNode }) => (
  <Card className="bg-muted/30 border-dashed">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {name}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-xs text-muted-foreground">Interactive content for this component will be rendered here.</p>
    </CardContent>
  </Card>
)

// Lexi's Components
export const LexiOnboarding = () => <Placeholder name="LexiOnboarding" icon={<CheckSquare className="h-4 w-4" />} />
export const ServiceSelectionGrid = () => (
  <Placeholder name="ServiceSelectionGrid" icon={<Wrench className="h-4 w-4" />} />
)
export const ProfileCompletionCard = () => (
  <Placeholder name="ProfileCompletionCard" icon={<Users className="h-4 w-4" />} />
)

// Alex's Components
export const AlexCostBreakdown = () => (
  <Placeholder name="AlexCostBreakdown" icon={<DollarSign className="h-4 w-4" />} />
)
export const MaterialCalculator = () => <Placeholder name="MaterialCalculator" icon={<Wrench className="h-4 w-4" />} />
export const TimelineChart = () => <Placeholder name="TimelineChart" icon={<Calendar className="h-4 w-4" />} />
export const CompetitiveInsights = () => (
  <Placeholder name="CompetitiveInsights" icon={<BarChart className="h-4 w-4" />} />
)

// Rex's Components
export const RexLeadDashboard = () => <Placeholder name="RexLeadDashboard" icon={<BarChart className="h-4 w-4" />} />
export const GeographicHeatmap = () => <Placeholder name="GeographicHeatmap" icon={<Map className="h-4 w-4" />} />
export const TrendingProblemsChart = () => (
  <Placeholder name="TrendingProblemsChart" icon={<TrendingUp className="h-4 w-4" />} />
)
export const QualityMetricsCard = () => (
  <Placeholder name="QualityMetricsCard" icon={<ShieldCheck className="h-4 w-4" />} />
)
export const SessionUsageTracker = () => <Placeholder name="SessionUsageTracker" icon={<Gauge className="h-4 w-4" />} />
