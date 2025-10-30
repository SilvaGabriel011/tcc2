'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Sprout, 
  ArrowLeft,
  Download,
  BarChart3,
  PieChart,
  TrendingUp,
  FileText,
  Printer,
  Activity,
  Info
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  BoxPlotChart,
  PieChartComponent,
  ScatterPlotChart,
  HistogramChart,
  StatsTable,
  StatCard
} from '@/components/AdvancedCharts'
import { VariableType } from '@/lib/dataAnalysis'
import { AnalysisLoadingSkeleton } from '@/components/skeleton'

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280']

// Função auxiliar para obter label do tipo de variável
function getVariableTypeLabel(type: VariableType): string {
  const labels: Record<VariableType, string> = {
    [VariableType.QUANTITATIVE_CONTINUOUS]: 'Quantitativa Contínua',
    [VariableType.QUANTITATIVE_DISCRETE]: 'Quantitativa Discreta',
    [VariableType.QUALITATIVE_NOMINAL]: 'Qualitativa Nominal',
    [VariableType.QUALITATIVE_ORDINAL]: 'Qualitativa Ordinal',
    [VariableType.TEMPORAL]: 'Temporal',
    [VariableType.IDENTIFIER]: 'Identificador'
  }
  return labels[type] || type
}

export default function ResultadosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analyses, setAnalyses] = useState<any[]>([])
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [diagnostico, setDiagnostico] = useState<any>(null)
  const [loadingDiagnostico, setLoadingDiagnostico] = useState(false)
  const [showDiagnostico, setShowDiagnostico] = useState(false)

  useEffect(() => {
    if (session) {
      fetchAnalyses()
    }
  }, [session])

  const fetchAnalyses = async () => {
    try {
      const response = await fetch('/api/analise/resultados')
      const data = await response.json()
      setAnalyses(data.analyses || [])
      if (data.analyses && data.analyses.length > 0) {
        setSelectedAnalysis(data.analyses[0])
      }
    } catch (error) {
      console.error('Erro ao carregar análises:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCSV = async () => {
    if (!selectedAnalysis) return
    
    try {
      const response = await fetch(`/api/analise/download/${selectedAnalysis.id}?format=csv`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${selectedAnalysis.name.replace(/[^a-z0-9]/gi, '_')}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao baixar CSV:', error)
      alert('Erro ao baixar arquivo CSV')
    }
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  const handleGerarDiagnostico = async () => {
    if (!selectedAnalysis) return
    
    setLoadingDiagnostico(true)
    try {
      const response = await fetch(`/api/analise/diagnostico/${selectedAnalysis.id}`)
      const data = await response.json()
      
      if (data.success) {
        setDiagnostico(data.diagnostico)
        setShowDiagnostico(true)
      } else {
        alert('Erro ao gerar diagnóstico')
      }
    } catch (error) {
      console.error('Erro ao gerar diagnóstico:', error)
      alert('Erro ao gerar diagnóstico. Tente novamente.')
    } finally {
      setLoadingDiagnostico(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="bg-card shadow-sm print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Sprout className="h-8 w-8 text-green-600 mr-2" />
                <span className="text-xl font-bold text-foreground">AgroInsight</span>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <AnalysisLoadingSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  // Parse e compatibilidade com formato antigo
  const analysisData = selectedAnalysis ? (() => {
    const parsed = JSON.parse(selectedAnalysis.data)
    // Compatibilidade: converter formato antigo para novo
    if (parsed.statistics && !parsed.numericStats) {
      parsed.numericStats = parsed.statistics
    }
    if (parsed.categoricalAnalysis && !parsed.categoricalStats) {
      parsed.categoricalStats = parsed.categoricalAnalysis
    }
    return parsed
  })() : null
  
  const metadata = selectedAnalysis ? JSON.parse(selectedAnalysis.metadata) : null

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <Sprout className="h-8 w-8 text-green-600 mr-2" />
                <span className="text-xl font-bold text-foreground">AgroInsight</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-foreground/80">Bem-vindo, {session.user.name}</span>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="text-muted-foreground hover:text-foreground/80"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Resultados das Análises</h1>
              <p className="text-muted-foreground mt-2">
                Visualize e exporte os resultados das suas análises zootécnicas
              </p>
            </div>
            
            {selectedAnalysis && (
              <div className="flex space-x-3 print:hidden">
                <button
                  onClick={handleGerarDiagnostico}
                  disabled={loadingDiagnostico}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md"
                >
                  {loadingDiagnostico ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4 mr-2" />
                      Diagnóstico IA
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="inline-flex items-center px-4 py-2 border border text-foreground/80 bg-card hover:bg-background rounded-md"
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </button>
              </div>
            )}
          </div>

          {analyses.length === 0 ? (
            <div className="bg-card shadow rounded-lg p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma análise encontrada</h3>
              <p className="text-muted-foreground mb-6">
                Você ainda não realizou nenhuma análise de dados. Comece fazendo upload de um arquivo CSV.
              </p>
              <Link
                href="/dashboard/analise"
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Fazer Nova Análise
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Lista de Análises */}
              <div className="lg:col-span-1 print:hidden">
                <div className="bg-card shadow rounded-lg p-4">
                  <h3 className="text-lg font-medium text-foreground mb-4">Análises Realizadas</h3>
                  <div className="space-y-2">
                    {analyses.map((analysis) => (
                      <button
                        key={analysis.id}
                        onClick={() => setSelectedAnalysis(analysis)}
                        className={`w-full text-left p-3 rounded-md transition-colors ${
                          selectedAnalysis?.id === analysis.id
                            ? 'bg-green-100 border-green-300 border'
                            : 'hover:bg-background border border'
                        }`}
                      >
                        <div className="font-medium text-sm text-foreground truncate">
                          {analysis.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(analysis.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resultados Detalhados */}
              <div className="lg:col-span-3">
                {selectedAnalysis && analysisData && metadata ? (
                  <div className="space-y-6">
                    {/* Resumo Geral */}
                    <div className="bg-card shadow rounded-lg p-6">
                      <h2 className="text-xl font-semibold text-foreground mb-4">
                        Resumo da Análise: {selectedAnalysis.name}
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <StatCard
                          title="Total de Registros"
                          value={metadata.totalRows}
                          color="gray"
                        />
                        <StatCard
                          title="Colunas"
                          value={metadata.totalColumns}
                          color="gray"
                        />
                        <StatCard
                          title="Registros Válidos"
                          value={metadata.validRows}
                          color="green"
                        />
                        <StatCard
                          title="Variáveis Zootécnicas"
                          value={metadata.zootechnicalCount || analysisData.zootechnicalVariables?.length || 0}
                          color="blue"
                        />
                      </div>
                    </div>

                    {/* Diagnóstico Zootécnico com IA */}
                    {showDiagnostico && diagnostico && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg rounded-lg p-6 border-l-4 border-blue-600">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <Activity className="h-6 w-6 text-blue-600 mr-2" />
                            <h3 className="text-xl font-bold text-foreground">Diagnóstico Zootécnico - Análise Especializada por IA</h3>
                          </div>
                          <button
                            onClick={() => setShowDiagnostico(false)}
                            className="text-muted-foreground hover:text-foreground/80"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Resumo Executivo */}
                        <div className="bg-card rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                            📋 Resumo Executivo
                          </h4>
                          <p className="text-foreground/80 leading-relaxed">{diagnostico.resumoExecutivo}</p>
                        </div>

                        {/* Análises Numéricas */}
                        {diagnostico.analiseNumericas && diagnostico.analiseNumericas.length > 0 && (
                          <div className="bg-card rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                              📊 Análise das Variáveis Numéricas
                            </h4>
                            <div className="space-y-3">
                              {diagnostico.analiseNumericas.map((analise: any, idx: number) => (
                                <div key={idx} className="border-l-2 border pl-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-foreground">{analise.variavel}</span>
                                    <span className={`px-2 py-1 text-xs rounded ${
                                      analise.status === 'Excelente' ? 'bg-green-100 text-green-800' :
                                      analise.status === 'Bom' ? 'bg-blue-100 text-blue-800' :
                                      analise.status === 'Regular' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {analise.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground/80 mb-1">{analise.interpretacao}</p>
                                  {analise.comparacaoLiteratura && (
                                    <p className="text-xs text-muted-foreground italic">📚 {analise.comparacaoLiteratura}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pontos Fortes */}
                        {diagnostico.pontosFortes && diagnostico.pontosFortes.length > 0 && (
                          <div className="bg-card rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                              ✅ Pontos Fortes
                            </h4>
                            <ul className="space-y-2">
                              {diagnostico.pontosFortes.map((ponto: string, idx: number) => (
                                <li key={idx} className="flex items-start text-sm text-foreground/80">
                                  <span className="text-green-600 mr-2">▸</span>
                                  {ponto}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Pontos de Atenção */}
                        {diagnostico.pontosAtencao && diagnostico.pontosAtencao.length > 0 && (
                          <div className="bg-card rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                              ⚠️ Pontos de Atenção
                            </h4>
                            <ul className="space-y-2">
                              {diagnostico.pontosAtencao.map((ponto: string, idx: number) => (
                                <li key={idx} className="flex items-start text-sm text-foreground/80">
                                  <span className="text-orange-600 mr-2">▸</span>
                                  {ponto}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Recomendações Prioritárias */}
                        {diagnostico.recomendacoesPrioritarias && diagnostico.recomendacoesPrioritarias.length > 0 && (
                          <div className="bg-card rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                              🎯 Recomendações Prioritárias
                            </h4>
                            <div className="space-y-3">
                              {diagnostico.recomendacoesPrioritarias.map((rec: any, idx: number) => (
                                <div key={idx} className="border border-purple-200 rounded p-3">
                                  <div className="flex items-center mb-1">
                                    <span className="bg-purple-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mr-2">
                                      {rec.prioridade}
                                    </span>
                                    <span className="font-semibold text-foreground">{rec.titulo}</span>
                                  </div>
                                  <p className="text-sm text-foreground/80 ml-8 mb-1">{rec.descricao}</p>
                                  <p className="text-xs text-muted-foreground italic ml-8">💡 {rec.justificativa}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Conclusão */}
                        {diagnostico.conclusao && (
                          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                              🎓 Conclusão e Perspectivas
                            </h4>
                            <p className="text-foreground leading-relaxed">{diagnostico.conclusao}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Informações sobre Tipos de Variáveis */}
                    {analysisData.variablesInfo && Object.keys(analysisData.variablesInfo).length > 0 && (
                      <div className="bg-card shadow rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <Info className="h-5 w-5 text-blue-600 mr-2" />
                          <h3 className="text-lg font-semibold text-foreground">Classificação das Variáveis</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(analysisData.variablesInfo).map(([variable, info]: [string, any]) => (
                            <div key={variable} className="border border rounded-lg p-3">
                              <div className="font-medium text-foreground text-sm mb-1">{variable}</div>
                              <div className="text-xs text-muted-foreground mb-1">
                                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                  {getVariableTypeLabel(info.type)}
                                </span>
                              </div>
                              {info.isZootechnical && (
                                <div className="text-xs text-green-600 font-medium">✓ Zootécnica</div>
                              )}
                              {info.description && (
                                <div className="text-xs text-muted-foreground mt-1">{info.description}</div>
                              )}
                              {info.unit && (
                                <div className="text-xs text-muted-foreground">Unidade: {info.unit}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Estatísticas Descritivas - Tabela Detalhada */}
                    {analysisData.numericStats && Object.keys(analysisData.numericStats).length > 0 && (
                      <div className="bg-card shadow rounded-lg p-6">
                        <StatsTable 
                          stats={analysisData.numericStats} 
                          title="Estatísticas Descritivas - Variáveis Numéricas"
                        />
                      </div>
                    )}

                    {/* BoxPlot - Distribuição das Variáveis */}
                    {analysisData.numericStats && Object.keys(analysisData.numericStats).length > 0 && (
                      <div className="bg-card shadow rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <Activity className="h-5 w-5 text-green-600 mr-2" />
                          <h3 className="text-lg font-semibold text-foreground">Distribuição das Variáveis (BoxPlot)</h3>
                        </div>
                        <BoxPlotChart 
                          data={analysisData.numericStats}
                        />
                      </div>
                    )}

                    {/* Histogramas */}
                    {analysisData.numericStats && Object.keys(analysisData.numericStats).length > 0 && analysisData.rawData && (
                      <div className="bg-card shadow rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-6">Distribuição de Frequências</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {Object.keys(analysisData.numericStats).slice(0, 4).map((variable) => {
                            const values = analysisData.rawData
                              .map((row: any) => parseFloat(row[variable]))
                              .filter((v: number) => !isNaN(v))
                            
                            return values.length > 0 ? (
                              <HistogramChart
                                key={variable}
                                data={values}
                                variableName={variable}
                                title={`Histograma - ${variable}`}
                                bins={10}
                              />
                            ) : null
                          })}
                        </div>
                      </div>
                    )}

                    {/* Gráficos de Pizza para Variáveis Categóricas */}
                    {analysisData.categoricalStats && Object.keys(analysisData.categoricalStats).length > 0 && (
                      <div className="bg-card shadow rounded-lg p-6">
                        <div className="flex items-center mb-6">
                          <PieChart className="h-5 w-5 text-purple-600 mr-2" />
                          <h3 className="text-lg font-semibold text-foreground">Distribuição de Variáveis Categóricas</h3>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {Object.entries(analysisData.categoricalStats).map(([variable, stats]: [string, any]) => (
                            <PieChartComponent
                              key={variable}
                              data={stats}
                              title={variable}
                              maxSlices={8}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Análise Categórica Detalhada */}
                    {analysisData.categoricalStats && Object.keys(analysisData.categoricalStats).length > 0 && (
                      <div className="bg-card shadow rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Estatísticas das Variáveis Categóricas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {Object.entries(analysisData.categoricalStats).map(([variable, stats]: [string, any]) => (
                            <div key={variable} className="border border rounded-lg p-4">
                              <h4 className="font-medium text-foreground mb-3">{variable}</h4>
                              <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Valores únicos:</span>
                                  <span className="font-medium">{stats.uniqueValues}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Mais comum:</span>
                                  <span className="font-medium text-green-600">{stats.mostCommon}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Valores válidos:</span>
                                  <span className="font-medium">{stats.validCount}</span>
                                </div>
                                {stats.entropy !== undefined && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Entropia:</span>
                                    <span className="font-medium">{stats.entropy.toFixed(4)}</span>
                                  </div>
                                )}
                              </div>
                              <div className="border-t pt-3">
                                <div className="text-sm font-medium text-foreground/80 mb-2">Distribuição:</div>
                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                  {Object.entries(stats.distribution)
                                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                                    .map(([value, count]: [string, any]) => (
                                      <div key={value} className="flex justify-between text-sm">
                                        <span className="text-foreground/80 truncate mr-2">{value}</span>
                                        <span className="font-medium whitespace-nowrap">
                                          {count} ({stats.frequencies[value]}%)
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gráficos de Dispersão (se houver pelo menos 2 variáveis numéricas) */}
                    {analysisData.numericStats && 
                     Object.keys(analysisData.numericStats).length >= 2 && 
                     analysisData.rawData && (
                      <div className="bg-card shadow rounded-lg p-6">
                        <div className="flex items-center mb-6">
                          <TrendingUp className="h-5 w-5 text-orange-600 mr-2" />
                          <h3 className="text-lg font-semibold text-foreground">Análise de Correlação (Dispersão)</h3>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {(() => {
                            const numericVars = Object.keys(analysisData.numericStats)
                            const pairs: Array<[string, string]> = []
                            
                            // Criar pares de variáveis (limitado a 4 gráficos)
                            for (let i = 0; i < Math.min(2, numericVars.length - 1); i++) {
                              for (let j = i + 1; j < Math.min(i + 3, numericVars.length); j++) {
                                if (pairs.length < 4) {
                                  pairs.push([numericVars[i], numericVars[j]])
                                }
                              }
                            }
                            
                            return pairs.map(([xVar, yVar]) => (
                              <ScatterPlotChart
                                key={`${xVar}-${yVar}`}
                                data={analysisData.rawData}
                                xKey={xVar}
                                yKey={yVar}
                                title={`${xVar} vs ${yVar}`}
                              />
                            ))
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-card shadow rounded-lg p-8 text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Selecione uma análise</h3>
                    <p className="text-muted-foreground">
                      Escolha uma análise da lista ao lado para visualizar os resultados detalhados.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
