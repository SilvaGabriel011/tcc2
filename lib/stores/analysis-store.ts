import { create } from 'zustand'

interface Analysis {
  id: string
  name: string
  filename: string
  species?: string
  subtype?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  metadata?: Record<string, unknown>
}

interface AnalysisState {
  analyses: Analysis[]
  currentAnalysis: Analysis | null
  isLoading: boolean
  error: string | null
  setAnalyses: (analyses: Analysis[]) => void
  setCurrentAnalysis: (analysis: Analysis | null) => void
  addAnalysis: (analysis: Analysis) => void
  updateAnalysis: (id: string, updates: Partial<Analysis>) => void
  removeAnalysis: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  analyses: [],
  currentAnalysis: null,
  isLoading: false,
  error: null,
  setAnalyses: (analyses) => set({ analyses }),
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  addAnalysis: (analysis) =>
    set((state) => ({ analyses: [analysis, ...state.analyses] })),
  updateAnalysis: (id, updates) =>
    set((state) => ({
      analyses: state.analyses.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
      currentAnalysis:
        state.currentAnalysis?.id === id
          ? { ...state.currentAnalysis, ...updates }
          : state.currentAnalysis,
    })),
  removeAnalysis: (id) =>
    set((state) => ({
      analyses: state.analyses.filter((a) => a.id !== id),
      currentAnalysis:
        state.currentAnalysis?.id === id ? null : state.currentAnalysis,
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))
