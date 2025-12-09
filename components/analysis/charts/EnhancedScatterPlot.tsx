'use client'

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface EnhancedScatterPlotProps {
  data: Array<{ x: number; y: number }>
  xLabel: string
  yLabel: string
  correlation: number
  pValue: number
  category: string
  relevanceScore: number
  title?: string
  showTrendLine?: boolean
}

/**
 * Enhanced Scatter Plot with Trend Line and Statistics
 */
export function EnhancedScatterPlot({
  data,
  xLabel,
  yLabel,
  correlation,
  pValue,
  category,
  relevanceScore,
  title,
  showTrendLine = true,
}: EnhancedScatterPlotProps) {
  const { slope, intercept, rSquared } = calculateLinearRegression(data)

  const xMin = Math.min(...data.map((p) => p.x))
  const xMax = Math.max(...data.map((p) => p.x))
  const trendLineData = [
    { x: xMin, y: slope * xMin + intercept, trend: true },
    { x: xMax, y: slope * xMax + intercept, trend: true },
  ]

  const getColor = () => {
    const abs = Math.abs(correlation)
    if (correlation > 0) {
      if (abs >= 0.7) {
        return '#065F46'
      } // Dark green
      if (abs >= 0.5) {
        return '#10B981'
      } // Green
      return '#6EE7B7' // Light green
    } else {
      if (abs >= 0.7) {
        return '#991B1B'
      } // Dark red
      if (abs >= 0.5) {
        return '#EF4444'
      } // Red
      return '#FCA5A5' // Light red
    }
  }

  const getCategoryColor = () => {
    const colors: Record<string, string> = {
      Crescimento: '#3B82F6',
      Morfometria: '#10B981',
      Performance: '#8B5CF6',
      Eficiência: '#F59E0B',
      Produção: '#EC4899',
      Desenvolvimento: '#06B6D4',
      Qualidade: '#84CC16',
      Condição: '#F97316',
      Carcaça: '#6366F1',
      Reprodução: '#EF4444',
      Estrutura: '#14B8A6',
      Maturidade: '#A855F7',
      Manejo: '#F59E0B',
      'Qualidade Água': '#0EA5E9',
      Outros: '#6B7280',
    }
    return colors[category] || '#6B7280'
  }

  const color = getColor()
  const categoryColor = getCategoryColor()

  return (
    <div className="w-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-md p-4 mb-6 overflow-hidden">
      {title && (
        <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
            <span
              className="px-3 py-1.5 rounded-lg text-white font-semibold shadow-sm"
              style={{ backgroundColor: categoryColor }}
            >
              {category}
            </span>
            <span className="text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              r = {correlation.toFixed(3)}
            </span>
            <span className="text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              R² = {rSquared.toFixed(3)}
            </span>
            <span className="text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              p = {pValue.toFixed(4)}
            </span>
            <span className="text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              Relevância: {relevanceScore}/10
            </span>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            type="number"
            dataKey="x"
            name={xLabel}
            label={{
              value: xLabel,
              position: 'bottom',
              offset: 40,
              style: { fontSize: 14, fill: '#374151' },
            }}
            stroke="#6B7280"
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yLabel}
            label={{
              value: yLabel,
              angle: -90,
              position: 'left',
              offset: 40,
              style: { fontSize: 14, fill: '#374151' },
            }}
            stroke="#6B7280"
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload?.[0]) {
                const point = payload[0].payload
                if (point.trend) {
                  return null
                }

                return (
                  <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {xLabel}: {point.x.toFixed(2)}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {yLabel}: {point.y.toFixed(2)}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend />

          {/* Data points */}
          <Scatter
            name="Dados"
            data={data}
            fill={color}
            fillOpacity={0.6}
            stroke={color}
            strokeWidth={1}
          />

          {/* Trend line */}
          {showTrendLine && (
            <Scatter
              name="Linha de Tendência"
              data={trendLineData}
              fill="none"
              stroke={color}
              strokeWidth={2}
              line
              shape="circle"
              isAnimationActive={false}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>

      {/* Statistics summary */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase truncate">N</div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{data.length}</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase truncate">
              Correlação
            </div>
            <div className="text-xl font-bold" style={{ color }}>
              {correlation.toFixed(3)}
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase truncate">R²</div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {(rSquared * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase truncate">
              Equação
            </div>
            <div className="text-sm font-mono text-gray-900 dark:text-gray-100 mt-1 break-all">
              y = {slope.toFixed(3)}x + {intercept.toFixed(3)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Calculate linear regression
 */
function calculateLinearRegression(data: Array<{ x: number; y: number }>) {
  const n = data.length
  const sumX = data.reduce((sum, p) => sum + p.x, 0)
  const sumY = data.reduce((sum, p) => sum + p.y, 0)
  const sumXY = data.reduce((sum, p) => sum + p.x * p.y, 0)
  const sumX2 = data.reduce((sum, p) => sum + p.x * p.x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const meanY = sumY / n
  const ssTotal = data.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0)
  const ssResidual = data.reduce((sum, p) => {
    const predicted = slope * p.x + intercept
    return sum + Math.pow(p.y - predicted, 2)
  }, 0)
  const rSquared = 1 - ssResidual / ssTotal

  return { slope, intercept, rSquared }
}
