'use client'

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import * as d3 from 'd3'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useResponsiveChart } from '../../hooks/useResponsiveChart'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { cn } from '../../lib/utils'

// Get CSS custom property value utility
function getCSSCustomProperty(property: string): string {
  if (typeof window === 'undefined') return '#1A2E1A' // Fallback for SSR
  const value = getComputedStyle(document.documentElement).getPropertyValue(property).trim()
  return value || '#1A2E1A' // Fallback if property not found
}

// Semantic color palette using CSS variables
const getSemanticColors = () => ({
  primary: getCSSCustomProperty('--primary'), // Felix Gold
  secondary: getCSSCustomProperty('--secondary'), // Forest Green  
  accent: getCSSCustomProperty('--accent'), // Steel Blue
  muted: getCSSCustomProperty('--muted'), // Muted gray
  mutedForeground: getCSSCustomProperty('--muted-foreground'), // Muted text
  foreground: getCSSCustomProperty('--foreground'), // Primary text
  background: getCSSCustomProperty('--background'), // Background
  border: getCSSCustomProperty('--border'), // Border color
  // Gradients for charts using brand colors
  brandGradient: [
    'hsl(var(--secondary))', // Forest Green base
    'hsl(var(--secondary) / 0.8)', // Lighter
    'hsl(var(--accent))', // Steel Blue  
    'hsl(var(--primary))', // Felix Gold
    'hsl(var(--primary) / 0.7)' // Light Felix Gold
  ],
  statusColors: {
    success: 'hsl(var(--success))',
    warning: 'hsl(var(--warning))', 
    destructive: 'hsl(var(--destructive))'
  }
})

// Enhanced Chart Interfaces with better type safety
interface CostBreakdownChartProps {
  data: {
    labor: number
    materials: number
    permits: number
    overhead: number
    profit: number
  }
  totalEstimate: number
  animated?: boolean
  interactive?: boolean
}

export function CostBreakdownChart({ data, totalEstimate, animated = true, interactive = true }: CostBreakdownChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { dimensions, config } = useResponsiveChart('costBreakdown')

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove() // Clear previous render

    const { width, height, margin } = dimensions
    const radius = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom) / 2 - 10

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`)

    // Enhanced color scheme using semantic colors
    const colors = getSemanticColors()
    const color = d3.scaleOrdinal()
      .domain(['Labor', 'Materials', 'Permits', 'Overhead', 'Profit'])
      .range(colors.brandGradient)

    const pie = d3.pie<[string, number]>()
      .value(d => d[1])
      .sort(null) // Maintain order

    const arcGenerator = d3.arc<d3.PieArcDatum<[string, number]>>()
      .innerRadius(radius * 0.4) // Create donut chart
      .outerRadius(radius)

    const chartData: [string, number][] = [
      ['Labor', data.labor],
      ['Materials', data.materials], 
      ['Permits', data.permits],
      ['Overhead', data.overhead],
      ['Profit', data.profit]
    ]

    // Create tooltip
    const tooltip = d3.select('body').selectAll('.d3-tooltip')
      .data([0])
      .join('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000)

    const pieData = pie(chartData)
    const arcs = g.selectAll('.arc')
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', 'arc')

    // Enhanced arc paths with hover effects
    const paths = arcs.append('path')
      .attr('d', arcGenerator)
      .attr('fill', d => color(d.data[0]) as string)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', interactive ? 'pointer' : 'default')

    if (animated) {
      paths
        .transition()
        .duration(1000)
        .attrTween('d', function(d) {
          const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
          return (t) => arcGenerator(interpolate(t)) || ''
        })
    }

    if (interactive) {
      paths
        .on('mouseover', function(event, d) {
          const percentage = ((d.data[1] / totalEstimate) * 100).toFixed(1)
          const amount = d3.format('$,.0f')(d.data[1])
          
          d3.select(this)
            .transition()
            .duration(200)
            .attr('transform', 'scale(1.05)')

          tooltip
            .style('opacity', 1)
            .html(`
              <strong>${d.data[0]}</strong><br/>
              Amount: ${amount}<br/>
              Percentage: ${percentage}%
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('transform', 'scale(1)')

          tooltip.style('opacity', 0)
        })
    }

    // Enhanced center text with total
    const centerGroup = g.append('g')
      .attr('class', 'center-text')

    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .attr('font-size', config.fontSize)
      .attr('font-weight', 'bold')
      .attr('fill', `hsl(var(--muted-foreground))`)
      .text('Total')

    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('font-size', `calc(${config.fontSize} * 1.3)`)
      .attr('font-weight', 'bold')
      .attr('fill', `hsl(var(--foreground))`)
      .text(d3.format('$,.0f')(totalEstimate))

    // Enhanced percentage labels
    arcs.append('text')
      .attr('transform', d => `translate(${arcGenerator.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', `calc(${config.fontSize} * 0.9)`)
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .style('text-shadow', '1px 1px 1px rgba(0,0,0,0.5)')
      .text(d => {
        const percentage = ((d.data[1] / totalEstimate) * 100)
        return percentage > 5 ? `${percentage.toFixed(0)}%` : ''
      })

    // Add legend
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(20, 20)`)

    const legendItems = legend.selectAll('.legend-item')
      .data(chartData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`)

    legendItems.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => color(d[0]) as string)
      .attr('rx', 2)

    legendItems.append('text')
      .attr('x', 18)
      .attr('y', 9)
      .attr('font-size', config.fontSize)
      .attr('fill', `hsl(var(--muted-foreground))`)
      .text(d => d[0])

  }, [data, totalEstimate, animated, interactive, dimensions, config])

  return <svg ref={svgRef}></svg>
}

// Enhanced Lead Distribution Chart for Rex
interface LeadDistributionChartProps {
  data: Array<{
    area: string
    count: number
    avgValue: number
    competition: 'low' | 'medium' | 'high'
  }>
  animated?: boolean
  interactive?: boolean
}

export function LeadDistributionChart({ data, animated = true, interactive = true }: LeadDistributionChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { dimensions, config } = useResponsiveChart('leadDistribution')

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const { width, height, margin } = dimensions

    const x = d3.scaleBand()
      .domain(data.map(d => d.area))
      .range([margin.left, width - margin.right])
      .padding(0.1)

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) || 0])
      .nice()
      .range([height - margin.bottom, margin.top])

    const colors = getSemanticColors()
    const colorScale = d3.scaleOrdinal()
      .domain(['low', 'medium', 'high'])
      .range([colors.statusColors.success, colors.statusColors.warning, colors.statusColors.destructive])

    svg.attr('width', width).attr('height', height)

    // Create tooltip
    const tooltip = d3.select('body').selectAll('.d3-bar-tooltip')
      .data([0])
      .join('div')
      .attr('class', 'd3-bar-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000)

    // Bars
    const bars = svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.area) || 0)
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => y(0) - y(d.count))
      .attr('fill', d => colorScale(d.competition) as string)
      .attr('rx', 4)
      .style('cursor', interactive ? 'pointer' : 'default')

    if (animated) {
      bars
        .attr('height', 0)
        .attr('y', y(0))
        .transition()
        .duration(1000)
        .delay((d, i) => i * 100)
        .attr('height', d => y(0) - y(d.count))
        .attr('y', d => y(d.count))
    }

    if (interactive) {
      bars
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.8)

          tooltip
            .style('opacity', 1)
            .html(`
              <strong>${d.area}</strong><br/>
              Leads: ${d.count}<br/>
              Avg Value: ${d3.format('$,.0f')(d.avgValue)}<br/>
              Competition: ${d.competition}
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 1)

          tooltip.style('opacity', 0)
        })
    }

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(config.tickCount.x))
      .selectAll('text')
      .style('font-size', config.fontSize)
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')

    // Y Axis
    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y).ticks(config.tickCount.y))
      .selectAll('text')
      .style('font-size', config.fontSize)

    // Axis labels
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 15)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', config.fontSize)
      .style('fill', `hsl(var(--muted-foreground))`)
      .text('Lead Count')

    // Value labels on bars
    svg.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => (x(d.area) || 0) + x.bandwidth() / 2)
      .attr('y', d => y(d.count) - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', config.fontSize)
      .attr('font-weight', 'bold')
      .attr('fill', `hsl(var(--muted-foreground))`)
      .text(d => d.count)

  }, [data, animated, interactive, dimensions, config])

  return <svg ref={svgRef}></svg>
}

// Enhanced Timeline Chart for Alex
interface TimelineChartProps {
  phases: Array<{
    name: string
    start: Date
    end: Date
    dependencies?: string[]
    progress?: number
  }>
  animated?: boolean
  interactive?: boolean
}

export function TimelineChart({ phases, animated = true, interactive = true }: TimelineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { dimensions, config } = useResponsiveChart('timeline')

  useEffect(() => {
    if (!svgRef.current || phases.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const { width, margin } = dimensions
    const height = phases.length * 50 + 80

    const startDate = d3.min(phases, d => d.start) || new Date()
    const endDate = d3.max(phases, d => d.end) || new Date()

    const x = d3.scaleTime()
      .domain([startDate, endDate])
      .range([margin.left, width - margin.right])

    const y = d3.scaleBand()
      .domain(phases.map(d => d.name))
      .range([margin.top, height - margin.bottom])
      .padding(0.2)

    svg.attr('width', width).attr('height', height)

    // Create tooltip
    const tooltip = d3.select('body').selectAll('.d3-timeline-tooltip')
      .data([0])
      .join('div')
      .attr('class', 'd3-timeline-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000)    // Background bars (full duration)
    svg.selectAll('.timeline-bg')
      .data(phases)
      .enter()
      .append('rect')
      .attr('class', 'timeline-bg')
      .attr('x', d => x(d.start))
      .attr('y', d => y(d.name) || 0)
      .attr('width', d => x(d.end) - x(d.start))
      .attr('height', y.bandwidth())
      .attr('fill', `hsl(var(--border))`)
      .attr('rx', 4)

    // Progress bars
    const progressBars = svg.selectAll('.timeline-progress')
      .data(phases)
      .enter()
      .append('rect')
      .attr('class', 'timeline-progress')
      .attr('x', d => x(d.start))
      .attr('y', d => y(d.name) || 0)
      .attr('width', d => {
        const totalWidth = x(d.end) - x(d.start)
        const progress = d.progress || 0
        return totalWidth * (progress / 100)
      })
      .attr('height', y.bandwidth())
      .attr('fill', `hsl(var(--secondary))`)
      .attr('rx', 4)
      .style('cursor', interactive ? 'pointer' : 'default')

    if (animated) {
      progressBars
        .attr('width', 0)
        .transition()
        .duration(1500)
        .delay((d, i) => i * 200)
        .attr('width', d => {
          const totalWidth = x(d.end) - x(d.start)
          const progress = d.progress || 0
          return totalWidth * (progress / 100)
        })
    }

    if (interactive) {
      progressBars
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.8)

          const duration = Math.ceil((d.end.getTime() - d.start.getTime()) / (1000 * 60 * 60 * 24))
          
          tooltip
            .style('opacity', 1)
            .html(`
              <strong>${d.name}</strong><br/>
              Start: ${d.start.toLocaleDateString()}<br/>
              End: ${d.end.toLocaleDateString()}<br/>
              Duration: ${duration} days<br/>
              Progress: ${d.progress || 0}%
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 1)

          tooltip.style('opacity', 0)
        })
    }

    // Phase labels
    svg.selectAll('.phase-label')
      .data(phases)
      .enter()
      .append('text')
      .attr('class', 'phase-label')
      .attr('x', margin.left - 10)
      .attr('y', d => (y(d.name) || 0) + y.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', config.fontSize)
      .attr('font-weight', '500')
      .attr('fill', `hsl(var(--muted-foreground))`)
      .text(d => d.name)

    // Progress text on bars
    svg.selectAll('.progress-text')
      .data(phases)
      .enter()
      .append('text')
      .attr('class', 'progress-text')
      .attr('x', d => x(d.start) + (x(d.end) - x(d.start)) / 2)
      .attr('y', d => (y(d.name) || 0) + y.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', `calc(${config.fontSize} * 0.9)`)
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .text(d => `${d.progress || 0}%`)

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(config.tickCount.x).tickFormat((domainValue) => {
        const date = domainValue as Date
        return d3.timeFormat('%m/%d')(date)
      }))
      .selectAll('text')
      .style('font-size', config.fontSize)

  }, [phases, animated, interactive, dimensions, config])

  return <svg ref={svgRef}></svg>
}

// Types for agent chart configurations
interface AgentChartData {
  label: string;
  value: number;
  quality?: number;
  market_avg?: number;
  benchmark?: number;
  timestamp?: string;
}

interface AgentChartConfig {
  colorScheme: string[];
  metrics: string[];
  chartType?: string;
  animations?: {
    duration: number;
    easing: string;
  };
}

interface AgentOptimizedChartProps {
  agent: 'lexi' | 'alex' | 'rex';
  chartType?: string;
  data: AgentChartData[];
  interactive?: boolean;
  realTime?: boolean;
  className?: string;
}

// Agent-specific chart configurations and data processing
const agentChartConfigs: Record<string, Record<string, AgentChartConfig>> = {
  lexi: {
    // Onboarding progress and completion metrics
    progressChart: {
      colorScheme: ['#8B5CF6', '#A78BFA', '#C4B5FD'],
      metrics: ['profile_completion', 'setup_steps', 'first_lead_interaction'],
      animations: {
        duration: 800,
        easing: 'easeInOutCubic'
      }
    },
    
    // Contractor comparison and benchmarking
    benchmarkChart: {
      colorScheme: ['#10B981', '#34D399', '#6EE7B7'],
      metrics: ['conversion_rate', 'response_time', 'customer_satisfaction'],
      chartType: 'radar'
    }
  },

  alex: {
    // Material cost analysis and trends
    costAnalysisChart: {
      colorScheme: ['#059669', '#10B981', '#34D399'],
      metrics: ['material_costs', 'labor_rates', 'profit_margins', 'market_trends'],
      animations: {
        duration: 1000,
        easing: 'easeOutBounce'
      }
    },
    
    // Bidding performance and win rates
    biddingChart: {
      colorScheme: ['#F59E0B', '#FBBF24', '#FCD34D'],
      metrics: ['bid_accuracy', 'win_rate', 'profit_realization'],
      chartType: 'line_with_area'
    },

    // Project timeline analysis
    timelineChart: {
      colorScheme: ['#8B5CF6', '#A78BFA', '#C4B5FD'],
      metrics: ['planned_duration', 'actual_duration', 'efficiency_score'],
      chartType: 'gantt_style'
    }
  },

  rex: {
    // Lead generation performance
    leadPerformanceChart: {
      colorScheme: ['#3B82F6', '#60A5FA', '#93C5FD'],
      metrics: ['leads_found', 'quality_score', 'conversion_potential'],
      animations: {
        duration: 600,
        easing: 'easeInOutQuad'
      }
    },
    
    // Market intelligence and opportunities
    marketChart: {
      colorScheme: ['#EF4444', '#F87171', '#FCA5A5'],
      metrics: ['market_density', 'competition_level', 'opportunity_score'],
      chartType: 'heatmap'
    },

    // Geographic lead distribution
    geoChart: {
      colorScheme: ['#06B6D4', '#22D3EE', '#67E8F9'],
      metrics: ['lead_density', 'travel_time', 'service_area_coverage'],
      chartType: 'choropleth'
    }
  }
};

// Enhanced chart component with agent-specific optimizations
export const AgentOptimizedChart = React.forwardRef<
  HTMLDivElement,
  AgentOptimizedChartProps
>(({ agent, chartType = 'progressChart', data, interactive = true, realTime = false, className, ...props }, ref) => {
  const [chartData, setChartData] = useState(data);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Use media query hooks directly instead of useResponsiveChart for responsive behavior
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  // Get agent-specific configuration with fallback
  const configKey = chartType || 'progressChart';
  const agentConfig = agentChartConfigs[agent];
  const config = agentConfig?.[configKey] || agentConfig?.progressChart || agentChartConfigs.lexi.progressChart;
  
  // Responsive dimensions
  const dimensions = useMemo(() => {
    if (isMobile) return { width: 300, height: 200, margin: { top: 20, right: 20, bottom: 40, left: 40 } };
    if (isTablet) return { width: 500, height: 300, margin: { top: 30, right: 30, bottom: 50, left: 50 } };
    return { width: 700, height: 400, margin: { top: 40, right: 40, bottom: 60, left: 60 } };
  }, [isMobile, isTablet]);

  // Real-time data updates for Rex lead generation
  useEffect(() => {
    if (!realTime || agent !== 'rex') return;

    const interval = setInterval(() => {
      // Simulate real-time lead updates
      setChartData((prevData: AgentChartData[]) => 
        prevData.map((item: AgentChartData) => ({
          ...item,
          value: item.value + (Math.random() - 0.5) * 0.1,
          timestamp: new Date().toISOString()
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [realTime, agent]);

  // Chart rendering functions for different types
  const renderRadarChart = (g: d3.Selection<SVGGElement, unknown, null, undefined>, data: AgentChartData[], width: number, height: number, config: AgentChartConfig) => {
    const radius = Math.min(width, height) / 2;
    const angleSlice = (Math.PI * 2) / data.length;
    
    // Create scales
    const radiusScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 1])
      .range([0, radius]);

    // Draw radar grid
    const gridLevels = 5;
    for (let level = 1; level <= gridLevels; level++) {
      g.append('circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', (radius / gridLevels) * level)
        .attr('fill', 'none')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1);
    }

    // Draw radar lines
    data.forEach((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      g.append('line')
        .attr('x1', width / 2)
        .attr('y1', height / 2)
        .attr('x2', width / 2 + Math.cos(angle) * radius)
        .attr('y2', height / 2 + Math.sin(angle) * radius)
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1);
    });

    // Draw data area
    const lineGenerator = d3.line<AgentChartData>()
      .x((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        return width / 2 + Math.cos(angle) * radiusScale(d.value);
      })
      .y((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        return height / 2 + Math.sin(angle) * radiusScale(d.value);
      })
      .curve(d3.curveLinearClosed);

    g.append('path')
      .datum(data)
      .attr('d', lineGenerator)
      .attr('fill', config.colorScheme[0])
      .attr('fill-opacity', 0.3)
      .attr('stroke', config.colorScheme[0])
      .attr('stroke-width', 2);

    // Add data points
    data.forEach((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = width / 2 + Math.cos(angle) * radiusScale(d.value);
      const y = height / 2 + Math.sin(angle) * radiusScale(d.value);
      
      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 4)
        .attr('fill', config.colorScheme[1])
        .attr('stroke', 'white')
        .attr('stroke-width', 2);

      // Add labels
      const labelX = width / 2 + Math.cos(angle) * (radius + 20);
      const labelY = height / 2 + Math.sin(angle) * (radius + 20);
      
      g.append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#6b7280')
        .text(d.label);
    });
  };

  const renderDefaultChart = (g: d3.Selection<SVGGElement, unknown, null, undefined>, data: AgentChartData[], width: number, height: number, config: AgentChartConfig) => {
    // Default bar chart implementation
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 1])
      .range([height, 0]);

    // Add bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar data-element')
      .attr('x', d => xScale(d.label) || 0)
      .attr('y', d => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d.value))
      .attr('fill', (d, i) => config.colorScheme[i % config.colorScheme.length]);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    g.append('g')
      .call(d3.axisLeft(yScale));
  };

  // Agent-specific chart rendering logic
  const renderChart = useCallback(() => {
    if (!svgRef.current || !chartData.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height, margin } = dimensions;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    switch (config.chartType) {
      case 'radar':
        renderRadarChart(g, chartData, innerWidth, innerHeight, config);
        break;
      case 'line_with_area':
      case 'heatmap':
      case 'choropleth':
      case 'gantt_style':
        // Fallback to default chart for unimplemented types
        renderDefaultChart(g, chartData, innerWidth, innerHeight, config);
        break;
      default:
        renderDefaultChart(g, chartData, innerWidth, innerHeight, config);
    }

    // Add agent-specific interactions
    if (interactive) {
      addAgentSpecificInteractions(svg, agent, chartData);
    }
  }, [chartData, dimensions, config, interactive, agent]);

  const addAgentSpecificInteractions = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, agent: string, data: AgentChartData[]) => {
    // Agent-specific tooltip content
    const getTooltipContent = (d: AgentChartData) => {
      switch (agent) {
        case 'alex':
          return `
            <div class="p-2 bg-white border rounded shadow-lg">
              <div class="font-semibold">${d.label}</div>
              <div class="text-sm text-gray-600">Cost: $${d.value?.toLocaleString()}</div>
              <div class="text-xs text-gray-500">Market avg: $${d.market_avg?.toLocaleString()}</div>
            </div>
          `;
        case 'rex':
          return `
            <div class="p-2 bg-white border rounded shadow-lg">
              <div class="font-semibold">${d.label}</div>
              <div class="text-sm text-gray-600">Leads: ${d.value}</div>
              <div class="text-xs text-gray-500">Quality: ${((d.quality || 0) * 100).toFixed(0)}%</div>
            </div>
          `;
        case 'lexi':
          return `
            <div class="p-2 bg-white border rounded shadow-lg">
              <div class="font-semibold">${d.label}</div>
              <div class="text-sm text-gray-600">Progress: ${(d.value * 100).toFixed(0)}%</div>
              <div class="text-xs text-gray-500">Benchmark: ${d.benchmark?.toFixed(1)}</div>
            </div>
          `;
        default:
          return `<div class="p-2 bg-white border rounded shadow-lg">${d.label}: ${d.value}</div>`;
      }
    };

    // Add hover interactions
    svg.selectAll('circle, rect.data-element, path.data-element')
      .on('mouseover', function(event: MouseEvent, d: unknown) {
        d3.select(this as Element)
          .transition()
          .duration(200)
          .attr('opacity', 0.8)
          .attr('stroke-width', 3);

        // Show tooltip (implement tooltip logic here)
      })
      .on('mouseout', function() {
        d3.select(this as Element)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('stroke-width', 1);
      });
  };

  // Initialize chart
  useEffect(() => {
    renderChart();
  }, [renderChart]);

  return (
    <div ref={ref} className={cn("w-full", `agent-chart-${agent}`, className)} {...props}>
      <svg ref={svgRef} className="w-full h-auto" />
      
      {/* Agent-specific legend */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {config.metrics.map((metric: string, index: number) => (
          <div key={metric} className="flex items-center gap-1 text-xs">
            <div 
              className={`w-3 h-3 rounded-full`}
              data-color={config.colorScheme[index % config.colorScheme.length]}
            />
            <span className="capitalize">{metric.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
