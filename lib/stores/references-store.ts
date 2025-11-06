import { create } from 'zustand'

interface Reference {
  id: string
  title: string
  authors: string[]
  year: number
  abstract?: string
  journal?: string
  doi?: string
  url?: string
  keywords?: string[]
  source: string
  createdAt: string
}

interface ReferencesState {
  references: Reference[]
  searchResults: Reference[]
  isSearching: boolean
  isLoading: boolean
  error: string | null
  setReferences: (references: Reference[]) => void
  setSearchResults: (results: Reference[]) => void
  addReference: (reference: Reference) => void
  removeReference: (id: string) => void
  setSearching: (searching: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  clearSearchResults: () => void
}

export const useReferencesStore = create<ReferencesState>((set) => ({
  references: [],
  searchResults: [],
  isSearching: false,
  isLoading: false,
  error: null,
  setReferences: (references) => set({ references }),
  setSearchResults: (results) => set({ searchResults: results }),
  addReference: (reference) =>
    set((state) => ({ references: [reference, ...state.references] })),
  removeReference: (id) =>
    set((state) => ({
      references: state.references.filter((r) => r.id !== id),
    })),
  setSearching: (searching) => set({ isSearching: searching }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  clearSearchResults: () => set({ searchResults: [] }),
}))
