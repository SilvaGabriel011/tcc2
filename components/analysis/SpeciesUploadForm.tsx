'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AnalysisResult {
  success: boolean
  analysis?: {
    id: string
    name: string
    species: string
    subtype?: string
    [key: string]: unknown
  }
}

interface SpeciesUploadFormProps {
  species: string
  subtype?: string
  projectId?: string
  onAnalysisComplete?: (result: AnalysisResult) => void
}

export function SpeciesUploadForm({ 
  species, 
  subtype, 
  projectId,
  onAnalysisComplete 
}: SpeciesUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [preview, setPreview] = useState<string[][]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    if (!uploadedFile) return

    setFile(uploadedFile)
    
    // Preview das primeiras linhas
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').slice(0, 5)
      setPreview(lines.map(line => line.split(',')))
    }
    reader.readAsText(uploadedFile.slice(0, 1024))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  })

  const handleAnalyze = async () => {
    if (!file) return

    setIsAnalyzing(true)
    const toastId = toast.loading('Analisando arquivo...')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('species', species)
    if (subtype) formData.append('subtype', subtype)
    if (projectId) formData.append('projectId', projectId)

    try {
      const response = await fetch('/api/analysis/multi-species', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success('Análise concluída com sucesso!', { id: toastId })
        onAnalysisComplete?.(result)
      } else {
        throw new Error(result.error || 'Erro na análise')
      }
    } catch (error) {
      console.error('Erro ao analisar:', error)
      toast.error('Erro ao processar arquivo', { id: toastId })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Obter colunas requeridas baseado na espécie
  const getRequiredColumns = () => {
    const base = ['id', 'date']
    
    switch(species) {
      case 'poultry':
        if (subtype === 'broiler') {
          return [...base, 'peso', 'idade', 'mortalidade', 'consumo_racao']
        }
        if (subtype === 'layer') {
          return [...base, 'producao_ovos', 'peso_ovo', 'consumo_racao']
        }
        return [...base, 'peso', 'idade']
        
      case 'bovine':
        if (subtype === 'dairy') {
          return [...base, 'producao_leite', 'gordura_leite', 'proteina_leite', 'celulas_somaticas']
        }
        if (subtype === 'beef') {
          return [...base, 'peso_vivo', 'gpd', 'escore_corporal']
        }
        return [...base, 'peso_vivo']
        
      case 'swine':
        if (subtype === 'finishing') {
          return [...base, 'peso', 'conversao', 'espessura_toucinho']
        }
        if (subtype === 'nursery') {
          return [...base, 'peso_desmame', 'gpd_creche', 'conversao_creche']
        }
        return [...base, 'peso', 'conversao']
        
      case 'sheep':
      case 'goat':
        return [...base, 'peso', 'gpd', 'escore_corporal']
        
      case 'aquaculture':
        return [...base, 'peso', 'conversao_alimentar', 'oxigenio_dissolvido', 'temperatura']
        
      default:
        return base
    }
  }

  const getSpeciesName = () => {
    const names: Record<string, string> = {
      poultry: 'Aves',
      bovine: 'Bovinos',
      swine: 'Suínos',
      sheep: 'Ovinos',
      goat: 'Caprinos',
      aquaculture: 'Piscicultura'
    }
    return names[species] || species
  }

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          dark:bg-gray-900 dark:border-gray-700
          ${isDragActive ? 
            'border-primary bg-primary/5 dark:bg-primary/10' : 
            'border-border hover:border-primary/50 dark:hover:border-primary/50'}
          ${file ? 'bg-green-50 dark:bg-green-950/20 border-green-500 dark:border-green-600' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {file ? (
            <>
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-500" />
              <div>
                <p className="font-medium text-foreground dark:text-gray-200">
                  {file.name}
                </p>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-muted-foreground dark:text-gray-400" />
              <div>
                <p className="font-medium text-foreground dark:text-gray-200">
                  Arraste o arquivo de {getSpeciesName()} ou clique para selecionar
                </p>
                <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                  Formatos aceitos: CSV, XLS, XLSX
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Colunas Requeridas */}
      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-blue-900 dark:text-blue-300">
              Colunas obrigatórias para {getSpeciesName()}
              {subtype && ` - ${subtype}`}:
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
              {getRequiredColumns().join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Preview dos Dados */}
      {preview.length > 0 && (
        <div className="bg-card dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
          <h4 className="font-medium text-foreground dark:text-gray-200 mb-2 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Preview dos Dados
          </h4>
          <table className="text-sm w-full">
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className={i === 0 ? 'font-semibold border-b dark:border-gray-700' : ''}>
                  {row.slice(0, 5).map((cell, j) => (
                    <td key={j} className="px-2 py-1 text-foreground dark:text-gray-200">
                      {cell}
                    </td>
                  ))}
                  {row.length > 5 && (
                    <td className="px-2 py-1 text-muted-foreground dark:text-gray-400">
                      ...
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Botão de Análise */}
      <button
        onClick={handleAnalyze}
        disabled={!file || isAnalyzing}
        className={`
          w-full py-3 px-4 rounded-lg font-medium
          transition-all duration-200
          flex items-center justify-center gap-2
          ${!file || isAnalyzing ? 
            'bg-muted text-muted-foreground cursor-not-allowed dark:bg-gray-800 dark:text-gray-500' : 
            'bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-white dark:hover:bg-primary/90'
          }
        `}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analisando dados de {getSpeciesName()}...
          </>
        ) : (
          <>
            Analisar Dados
          </>
        )}
      </button>
    </div>
  )
}
