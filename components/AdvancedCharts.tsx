'use client'

import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'
import { NumericStats, CategoricalStats } from '@/lib/dataAnalysis'
import { useThemeColors, formatNumber } from '@/lib/ui/theme'

interface BoxPlotData {
  name: string
  fullName: string
  min: number
  q1: number
  median: number
  q3: number
  max: number
  mean: number
  outliers?: number[]
}

/**
 * Gráfico BoxPlot para variáveis numéricas
 */
export function BoxPlotChart({
  data,
  title,
}: {
  data: Record<string, NumericStats>
  title?: string
}) {
  const colors = useThemeColors()
  const boxPlotData: BoxPlotData[] = Object.entries(data).map(([name, stats]) => ({
    name: name.length > 15 ? `${name.substring(0, 15)}...` : name,
    fullName: name,
    min: stats.min,
    q1: stats.q1,
    median: stats.median,
    q3: stats.q3,
    max: stats.max,
    mean: stats.mean,
    outliers: stats.outliers,
  }))

  return (
    <div>
      {title && <h4 className="text-md font-medium text-foreground mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={boxPlotData}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
          <XAxis dataKey="name" stroke={colors.mutedForeground} />
          <YAxis stroke={colors.mutedForeground} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload?.[0]) {
                const data = payload[0].payload as BoxPlotData
                return (
                  <div className="bg-card border border-border rounded shadow-lg p-3">
                    <p className="font-semibold text-foreground">{data.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      Máximo: {formatNumber(data.max)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Q3 (75%): {formatNumber(data.q3)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mediana: {formatNumber(data.median)}
                    </p>
                    <p className="text-sm font-medium" style={{ color: colors.success }}>
                      Média: {formatNumber(data.mean)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Q1 (25%): {formatNumber(data.q1)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mínimo: {formatNumber(data.min)}
                    </p>
                    {data.outliers && data.outliers.length > 0 && (
                      <p className="text-sm mt-1" style={{ color: colors.destructive }}>
                        Outliers: {data.outliers.length}
                      </p>
                    )}
                  </div>
                )
              }
              return null
            }}
          />
          <Legend />
          {/* Representa o box plot usando áreas empilhadas com cores distintas */}
          <Bar dataKey="min" stackId="a" fill={colors.muted} name="Mínimo" />
          <Bar
            dataKey={(d: BoxPlotData) => d.q1 - d.min}
            stackId="a"
            fill={colors.chart2}
            opacity={0.7}
            name="Q1"
          />
          <Bar
            dataKey={(d: BoxPlotData) => d.median - d.q1}
            stackId="a"
            fill={colors.chart1}
            name="Mediana"
          />
          <Bar
            dataKey={(d: BoxPlotData) => d.q3 - d.median}
            stackId="a"
            fill={colors.chart3}
            opacity={0.7}
            name="Q3"
          />
          <Bar
            dataKey={(d: BoxPlotData) => d.max - d.q3}
            stackId="a"
            fill={colors.muted}
            opacity={0.8}
            name="Máximo"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Gráfico de Pizza para variáveis categóricas
 */
export function PieChartComponent({
  data,
  title,
  maxSlices = 8,
}: {
  data: CategoricalStats
  title?: string
  maxSlices?: number
}) {
  const colors = useThemeColors()
  const chartColors = [
    colors.chart1,
    colors.chart2,
    colors.chart3,
    colors.chart4,
    colors.chart5,
    colors.chart6,
    colors.chart7,
    colors.chart8,
  ]

  const sortedData = Object.entries(data.distribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxSlices)

  const others = Object.entries(data.distribution)
    .slice(maxSlices)
    .reduce((sum, [, count]) => sum + count, 0)

  const chartData = sortedData.map(([name, value]) => ({ name, value }))

  if (others > 0) {
    chartData.push({ name: 'Outros', value: others })
  }

  return (
    <div>
      {title && <h4 className="text-md font-medium text-foreground mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={(entry) => `${entry.name}: ${entry.value}`}
            outerRadius={120}
            fill={colors.primary}
            dataKey="value"
          >
            {chartData.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={chartColors[chartData.indexOf(entry) % chartColors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.375rem',
              color: colors.foreground,
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Gráfico de Dispersão (Scatter) para correlação entre duas variáveis
 */
export function ScatterPlotChart({
  data,
  xKey,
  yKey,
  title,
}: {
  data: Record<string, unknown>[]
  xKey: string
  yKey: string
  title?: string
}) {
  const colors = useThemeColors()
  const scatterData = data
    .map((row) => ({
      x: parseFloat(row[xKey] as string),
      y: parseFloat(row[yKey] as string),
    }))
    .filter((point) => !isNaN(point.x) && !isNaN(point.y))

  return (
    <div>
      {title && <h4 className="text-md font-medium text-foreground mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
          <XAxis type="number" dataKey="x" name={xKey} stroke={colors.mutedForeground} />
          <YAxis type="number" dataKey="y" name={yKey} stroke={colors.mutedForeground} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.375rem',
              color: colors.foreground,
            }}
          />
          <Legend />
          <Scatter name={`${xKey} vs ${yKey}`} data={scatterData} fill={colors.primary} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Histograma para distribuição de variável numérica
 */
export function HistogramChart({
  data,
  variableName,
  title,
  bins = 10,
}: {
  data: number[]
  variableName: string
  title?: string
  bins?: number
}) {
  const colors = useThemeColors()
  const cleanData = data.filter((v) => !isNaN(v) && v !== null)
  const min = Math.min(...cleanData)
  const max = Math.max(...cleanData)
  const binWidth = (max - min) / bins

  const histogram: { bin: string; count: number; range: string }[] = []

  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binWidth
    const binEnd = min + (i + 1) * binWidth
    const count = cleanData.filter(
      (v) => v >= binStart && (i === bins - 1 ? v <= binEnd : v < binEnd)
    ).length

    histogram.push({
      bin: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
      range: `${binStart.toFixed(2)} a ${binEnd.toFixed(2)}`,
      count,
    })
  }

  return (
    <div>
      {title && <h4 className="text-md font-medium text-foreground mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={histogram}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
          <XAxis dataKey="bin" stroke={colors.mutedForeground} />
          <YAxis stroke={colors.mutedForeground} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload?.[0]) {
                const data = payload[0].payload
                return (
                  <div className="bg-card border border-border rounded shadow-lg p-3">
                    <p className="font-semibold text-foreground">{data.range}</p>
                    <p className="text-sm text-muted-foreground">Frequência: {data.count}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend />
          <Bar dataKey="count" fill={colors.primary} name={variableName} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Gráfico de Barras Horizontal para estatísticas comparativas
 */
export function HorizontalBarChart({
  data,
  title,
}: {
  data: { name: string; value: number; unit?: string }[]
  title?: string
}) {
  const colors = useThemeColors()

  return (
    <div>
      {title && <h4 className="text-md font-medium text-foreground mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={Math.max(300, data.length * 40)}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
          <XAxis type="number" stroke={colors.mutedForeground} />
          <YAxis dataKey="name" type="category" width={150} stroke={colors.mutedForeground} />
          <Tooltip
            contentStyle={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.375rem',
              color: colors.foreground,
            }}
          />
          <Legend />
          <Bar dataKey="value" fill={colors.primary} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Card de Estatística Resumida
 */
export function StatCard({
  title,
  value,
  unit,
  description,
  color = 'gray',
}: {
  title: string
  value: number | string
  unit?: string
  description?: string
  color?: 'gray' | 'green' | 'blue' | 'red' | 'yellow'
}) {
  const colors = useThemeColors()

  const accentColors = {
    gray: colors.mutedForeground,
    green: colors.success,
    blue: colors.secondary,
    red: colors.destructive,
    yellow: colors.warning,
  }

  return (
    <div
      className="bg-card border border-border rounded-lg p-4 border-l-4 transition-shadow hover:shadow-md"
      style={{ borderLeftColor: accentColors[color] }}
    >
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className="text-2xl font-bold text-foreground mt-1">
        {typeof value === 'number' ? formatNumber(value, 0) : value}
        {unit && <span className="text-lg ml-1 text-muted-foreground">{unit}</span>}
      </div>
      {description && <div className="text-xs mt-1 text-muted-foreground">{description}</div>}
    </div>
  )
}

/**
 * Tabela de Estatísticas Detalhadas
 */
export function StatsTable({
  stats,
  title,
}: {
  stats: Record<string, NumericStats>
  title?: string
}) {
  return (
    <div>
      {title && <h4 className="text-lg font-semibold text-foreground mb-4">{title}</h4>}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase sticky left-0 bg-muted z-10">
                Variável
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                N
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                Média
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                Mediana
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                DP
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                CV%
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                Min
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                Max
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                Q1
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                Q3
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {Object.entries(stats).map(([variable, stat]) => (
              <tr key={variable} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-foreground sticky left-0 bg-card">
                  {variable}
                </td>
                <td className="px-4 py-3 text-sm text-foreground/80 text-right tabular-nums">
                  {stat.validCount}
                </td>
                <td className="px-4 py-3 text-sm text-foreground/80 text-right tabular-nums">
                  {formatNumber(stat.mean)}
                </td>
                <td className="px-4 py-3 text-sm text-foreground/80 text-right tabular-nums">
                  {formatNumber(stat.median)}
                </td>
                <td className="px-4 py-3 text-sm text-foreground/80 text-right tabular-nums">
                  {formatNumber(stat.stdDev)}
                </td>
                <td className="px-4 py-3 text-sm text-foreground/80 text-right tabular-nums">
                  {formatNumber(stat.cv)}%
                </td>
                <td className="px-4 py-3 text-sm text-foreground/80 text-right tabular-nums">
                  {formatNumber(stat.min)}
                </td>
                <td className="px-4 py-3 text-sm text-foreground/80 text-right tabular-nums">
                  {formatNumber(stat.max)}
                </td>
                <td className="px-4 py-3 text-sm text-foreground/80 text-right tabular-nums">
                  {formatNumber(stat.q1)}
                </td>
                <td className="px-4 py-3 text-sm text-foreground/80 text-right tabular-nums">
                  {formatNumber(stat.q3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
