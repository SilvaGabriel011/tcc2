'use client'

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface MetricConfig {
  key: string
  type: 'line' | 'bar'
  color: string
  name?: string
}

interface ComposedMetricsChartProps {
  data: Array<Record<string, unknown>>
  xKey: string
  metrics: MetricConfig[]
  title?: string
}

export function ComposedMetricsChart({
  data,
  xKey,
  metrics,
  title,
}: ComposedMetricsChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h4 className="text-lg font-semibold text-foreground mb-4">{title}</h4>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xKey}
            tick={{ fill: 'hsl(var(--foreground))' }}
            stroke="hsl(var(--border))"
          />
          <YAxis
            tick={{ fill: 'hsl(var(--foreground))' }}
            stroke="hsl(var(--border))"
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
          {metrics.map((metric) =>
            metric.type === 'bar' ? (
              <Bar
                key={metric.key}
                dataKey={metric.key}
                fill={metric.color}
                name={metric.name || metric.key}
              />
            ) : (
              <Line
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                stroke={metric.color}
                strokeWidth={2}
                name={metric.name || metric.key}
                dot={{ fill: metric.color }}
              />
            )
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
