'use client'

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface RadarMetricsChartProps {
  data: Array<{ metric: string; value: number; fullMark: number }>
  title?: string
  color?: string
}

export function RadarMetricsChart({
  data,
  title,
  color = '#10B981',
}: RadarMetricsChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h4 className="text-lg font-semibold text-foreground mb-4">{title}</h4>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: 'hsl(var(--foreground))' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: 'hsl(var(--foreground))' }}
          />
          <Radar
            name="Performance"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.6}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              color: 'hsl(var(--foreground))',
            }}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
