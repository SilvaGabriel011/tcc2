'use client'

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface TimeSeriesChartProps {
  data: Array<Record<string, unknown>>
  xKey: string
  yKeys: string[]
  title?: string
  type?: 'line' | 'area'
  colors?: string[]
}

const DEFAULT_COLORS = [
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#F59E0B',
  '#EF4444',
]

export function TimeSeriesChart({
  data,
  xKey,
  yKeys,
  title,
  type = 'line',
  colors = DEFAULT_COLORS,
}: TimeSeriesChartProps) {
  const ChartComponent = type === 'area' ? AreaChart : LineChart

  return (
    <div className="w-full">
      {title && (
        <h4 className="text-lg font-semibold text-foreground mb-4">{title}</h4>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent data={data}>
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
          {yKeys.map((key, index) => {
            const color = colors[index % colors.length]
            return type === 'area' ? (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                fill={color}
                fillOpacity={0.6}
                name={key}
              />
            ) : (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                name={key}
                dot={{ fill: color }}
              />
            )
          })}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  )
}
