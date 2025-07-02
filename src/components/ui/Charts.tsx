'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { BaseCard } from './BaseComponents'
import { useResponsiveChart } from '../../hooks/useResponsiveChart'

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

// Wrapper components with BaseCard - Design System Integration
export function CostBreakdownCard({ 
  data, 
  totalEstimate, 
  title = "Cost Breakdown Analysis",
  animated = true,
  interactive = true 
}: CostBreakdownChartProps & { title?: string }) {
  return (
    <BaseCard title={title}>
      <div className="flex flex-col items-center">
        <CostBreakdownChart 
          data={data} 
          totalEstimate={totalEstimate} 
          animated={animated}
          interactive={interactive}
        />
        <div className="mt-4 grid grid-cols-2 gap-4 w-full text-sm">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="capitalize font-medium">{key}:</span>
              <span className="font-semibold text-success-foreground">${value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </BaseCard>
  )
}

export function LeadDistributionCard({ 
  data, 
  title = "Lead Distribution by Area",
  animated = true,
  interactive = true
}: LeadDistributionChartProps & { title?: string }) {
  return (
    <BaseCard title={title}>
      <div className="flex flex-col items-center">
        <LeadDistributionChart 
          data={data} 
          animated={animated}
          interactive={interactive}
        />
        <div className="mt-4 grid grid-cols-1 gap-2 w-full text-xs">
          {data.map((item) => (
            <div key={item.area} className="flex justify-between items-center p-2 bg-muted rounded">
              <span className="font-medium">{item.area}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{item.count} leads</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.competition === 'high' ? 'bg-destructive/10 text-destructive-foreground' :
                  item.competition === 'medium' ? 'bg-warning/10 text-warning-foreground' :
                  'bg-success/10 text-success-foreground'
                }`}>
                  {item.competition}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseCard>
  )
}

export function TimelineCard({ 
  phases, 
  title = "Project Timeline",
  animated = true,
  interactive = true
}: TimelineChartProps & { title?: string }) {
  return (
    <BaseCard title={title}>
      <div className="flex flex-col items-center">
        <TimelineChart 
          phases={phases} 
          animated={animated}
          interactive={interactive}
        />
      </div>
    </BaseCard>
  )
}

// Quick Metrics Chart for dashboards
interface QuickMetricsProps {
  metrics: Array<{
    label: string
    value: number
    format: 'currency' | 'percentage' | 'number'
    trend?: 'up' | 'down' | 'neutral'
    color?: string
  }>
}

export function QuickMetricsChart({ metrics }: QuickMetricsProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = 400
    const height = 120
    const margin = { top: 20, right: 20, bottom: 20, left: 20 }

    svg.attr('width', width).attr('height', height)

    const cardWidth = (width - margin.left - margin.right) / metrics.length
    
    const metricGroups = svg.selectAll('.metric-group')
      .data(metrics)
      .enter()
      .append('g')
      .attr('class', 'metric-group')
      .attr('transform', (d, i) => `translate(${margin.left + i * cardWidth}, ${margin.top})`)

    // Background cards
    metricGroups.append('rect')
      .attr('width', cardWidth - 10)
      .attr('height', height - margin.top - margin.bottom)
      .attr('fill', `hsl(var(--background))`)
      .attr('stroke', `hsl(var(--border))`)
      .attr('rx', 6)

    // Value text
    metricGroups.append('text')
      .attr('x', (cardWidth - 10) / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', d => d.color || `hsl(var(--foreground))`)
      .text(d => {
        switch (d.format) {
          case 'currency':
            return d3.format('$,.0f')(d.value)
          case 'percentage':
            return d3.format('.1%')(d.value)
          default:
            return d3.format(',.0f')(d.value)
        }
      })

    // Label text
    metricGroups.append('text')
      .attr('x', (cardWidth - 10) / 2)
      .attr('y', 55)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', `hsl(var(--muted-foreground))`)
      .text(d => d.label)

  }, [metrics])

  return <svg ref={svgRef}></svg>
}
