'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Sprout,
  ArrowLeft,
  Search,
  BookOpen,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Loader2,
  Calendar,
  User,
  FileText,
  FileDown,
  Tag,
  Hash,
  Quote,
  Pencil,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { ReferencesLoadingSkeleton } from '@/components/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface Article {
  id: string
  title: string
  authors: string[]
  abstract: string
  year: number
  journal: string
  url: string
  source: 'scholar' | 'pubmed' | 'crossref'
  saved?: boolean
  doi?: string
  // Campos expandidos
  issn?: string
  volume?: string
  issue?: string
  pages?: string
  keywords?: string[]
  language?: string
  pdfUrl?: string
  citationsCount?: number
  publishedDate?: string
}

export default function ReferenciasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [articles, setArticles] = useState<Article[]>([])
  const [savedArticles, setSavedArticles] = useState<Article[]>([])
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search')
  const [selectedSource, setSelectedSource] = useState<'all' | 'scholar' | 'pubmed' | 'crossref'>(
    'all'
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [addByUrlInput, setAddByUrlInput] = useState('')
  const [isAddingByUrl, setIsAddingByUrl] = useState(false)
  const [addByUrlMessage, setAddByUrlMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // State for loading saved articles
  const [isLoadingSavedArticles, setIsLoadingSavedArticles] = useState(true)

  // State for save article dialog with rename option
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [articleToSave, setArticleToSave] = useState<Article | null>(null)
  const [customTitle, setCustomTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isFromUrlPreview, setIsFromUrlPreview] = useState(false)

  // State for delete article dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // State for search metadata (query pipeline feedback)
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null)
  const [suggestedTerms, setSuggestedTerms] = useState<string[]>([])
  const [providerStatus, setProviderStatus] = useState<
    Array<{ name: string; ok: boolean; resultCount: number; error?: string }>
  >([])
  const [usedAIEnhancement, setUsedAIEnhancement] = useState(false)
  const [usedLocalExpansion, setUsedLocalExpansion] = useState(false)
  const [englishKeywords, setEnglishKeywords] = useState<string[]>([])

  useEffect(() => {
    if (session) {
      void loadSavedArticles()
    }
  }, [session])

  const loadSavedArticles = async () => {
    setIsLoadingSavedArticles(true)
    try {
      const response = await fetch('/api/referencias/saved')
      const data = await response.json()
      setSavedArticles(data.articles || [])
    } catch (error) {
      console.error('Erro ao carregar artigos salvos:', error)
    } finally {
      setIsLoadingSavedArticles(false)
    }
  }

  const handleSearch = async (resetPage = true) => {
    if (!searchTerm.trim()) {
      return
    }

    const pageToLoad = resetPage ? 1 : currentPage
    setIsSearching(true)

    if (resetPage) {
      setArticles([])
      setCurrentPage(1)
    }

    try {
      const response = await fetch('/api/referencias/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchTerm,
          source: selectedSource,
          page: pageToLoad,
          pageSize: 10,
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Marcar artigos já salvos
        const articlesWithSavedStatus = data.articles.map((article: Article) => ({
          ...article,
          saved: savedArticles.some((saved) => saved.url === article.url),
        }))

        if (resetPage) {
          setArticles(articlesWithSavedStatus)
        } else {
          setArticles([...articles, ...articlesWithSavedStatus])
        }

        setHasMore(data.hasMore)
        setCurrentPage(pageToLoad)

        // Update search metadata from query pipeline
        if (data.searchFeedback) {
          setSearchFeedback(data.searchFeedback)
        }
        if (data.suggestedTerms) {
          setSuggestedTerms(data.suggestedTerms)
        }
        if (data.providerStatus) {
          setProviderStatus(data.providerStatus)
        }
        setUsedAIEnhancement(data.usedAIEnhancement || false)
        setUsedLocalExpansion(data.usedLocalExpansion || false)
        if (data.englishKeywords) {
          setEnglishKeywords(data.englishKeywords)
        }
      }
    } catch (error) {
      console.error('Erro na pesquisa:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    const nextPage = currentPage + 1

    try {
      const response = await fetch('/api/referencias/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchTerm,
          source: selectedSource,
          page: nextPage,
          pageSize: 10,
        }),
      })

      const data = await response.json()
      if (data.success) {
        const articlesWithSavedStatus = data.articles.map((article: Article) => ({
          ...article,
          saved: savedArticles.some((saved) => saved.url === article.url),
        }))

        setArticles([...articles, ...articlesWithSavedStatus])
        setHasMore(data.hasMore)
        setCurrentPage(nextPage) // Atualizar apenas após sucesso
      }
    } catch (error) {
      console.error('Erro ao carregar mais:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleAddByUrl = async () => {
    if (!addByUrlInput.trim()) {
      return
    }

    setIsAddingByUrl(true)
    setAddByUrlMessage(null)

    try {
      // First, fetch preview to get metadata and validate URL
      const response = await fetch('/api/referencias/add-by-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: addByUrlInput, preview: true }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Open save dialog with preview data
        const previewArticle: Article = {
          ...data.article,
          authors: Array.isArray(data.article.authors)
            ? data.article.authors
            : [data.article.authors],
        }
        setArticleToSave(previewArticle)
        setCustomTitle(previewArticle.title)
        setIsFromUrlPreview(true)
        setSaveDialogOpen(true)
        setAddByUrlMessage({ type: 'success', text: data.message })
      } else {
        setAddByUrlMessage({ type: 'error', text: data.error })
      }
    } catch {
      setAddByUrlMessage({ type: 'error', text: 'Erro ao adicionar artigo. Tente novamente.' })
    } finally {
      setIsAddingByUrl(false)
      // Limpar mensagem após 5 segundos
      setTimeout(() => setAddByUrlMessage(null), 5000)
    }
  }

  // Open save dialog with article info and editable title
  const openSaveDialog = (article: Article) => {
    setArticleToSave(article)
    setCustomTitle(article.title)
    setIsFromUrlPreview(false)
    setSaveDialogOpen(true)
  }

  // Actually save the article with the custom title
  const handleConfirmSave = async () => {
    if (!articleToSave) {
      return
    }

    setIsSaving(true)
    try {
      const finalTitle = customTitle.trim() || articleToSave.title

      let response: Response

      if (isFromUrlPreview) {
        // For URL preview, call add-by-url API with custom title
        response = await fetch('/api/referencias/add-by-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: articleToSave.url,
            customTitle: finalTitle,
          }),
        })
      } else {
        // For search results, call save API
        const articleWithCustomTitle = {
          ...articleToSave,
          title: finalTitle,
        }
        response = await fetch('/api/referencias/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(articleWithCustomTitle),
        })
      }

      if (response.ok) {
        // Atualizar estado local
        if (!isFromUrlPreview) {
          setArticles(articles.map((a) => (a.id === articleToSave.id ? { ...a, saved: true } : a)))
        }
        const savedArticle = { ...articleToSave, title: finalTitle, saved: true }
        setSavedArticles([...savedArticles, savedArticle])
        setSaveDialogOpen(false)
        setArticleToSave(null)
        setCustomTitle('')
        setIsFromUrlPreview(false)
        // Clear URL input if it was from URL preview
        if (isFromUrlPreview) {
          setAddByUrlInput('')
          await loadSavedArticles()
        }
      }
    } catch (error) {
      console.error('Erro ao salvar artigo:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Legacy function kept for compatibility - now opens dialog
  const handleSaveArticle = (article: Article) => {
    openSaveDialog(article)
  }

  // Open delete confirmation dialog
  const openDeleteDialog = (article: Article) => {
    setArticleToDelete(article)
    setDeleteDialogOpen(true)
  }

  // Actually delete the article (called from dialog confirmation)
  const handleConfirmDelete = async () => {
    if (!articleToDelete) {
      return
    }

    const articleUrl = articleToDelete.url
    setIsDeleting(true)

    try {
      const response = await fetch('/api/referencias/unsave', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: articleUrl }),
      })

      if (response.ok) {
        // Atualizar estado local
        setArticles(articles.map((a) => (a.url === articleUrl ? { ...a, saved: false } : a)))
        setSavedArticles(savedArticles.filter((a) => a.url !== articleUrl))
      }
    } catch (error) {
      console.error('Erro ao remover artigo:', error)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setArticleToDelete(null)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <Sprout className="h-8 w-8 text-green-600 mr-2" />
                <span className="text-xl font-bold text-foreground">AgroInsight</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-foreground/80">
                Bem-vindo, <span className="font-semibold text-primary">{session.user.name}</span>
              </span>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Referências Científicas</h1>
          <p className="text-muted-foreground mb-8">
            Pesquise artigos científicos no Google Scholar, PubMed e Crossref para suas pesquisas
          </p>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('search')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'search'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-muted-foreground hover:text-foreground/80 hover:border'
                  }`}
                >
                  <Search className="h-4 w-4 inline mr-2" />
                  Pesquisar Artigos
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'saved'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-muted-foreground hover:text-foreground/80 hover:border'
                  }`}
                >
                  <BookmarkCheck className="h-4 w-4 inline mr-2" />
                  Artigos Salvos ({savedArticles.length})
                </button>
              </nav>
            </div>
          </div>

          {activeTab === 'search' ? (
            <div className="space-y-6">
              {/* Search Form */}
              <div className="bg-card shadow rounded-lg p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-foreground/80 mb-2">
                      Termo de Pesquisa
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          void handleSearch()
                        }
                      }}
                      className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="Ex: zootecnia, bovinos, nutrição animal..."
                    />
                  </div>

                  <div className="md:w-48">
                    <label className="block text-sm font-medium text-foreground/80 mb-2">
                      Fonte
                    </label>
                    <select
                      value={selectedSource}
                      onChange={(e) =>
                        setSelectedSource(
                          e.target.value as 'all' | 'scholar' | 'pubmed' | 'crossref'
                        )
                      }
                      className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">Todas as fontes</option>
                      <option value="scholar">Google Scholar</option>
                      <option value="pubmed">PubMed</option>
                      <option value="crossref">Crossref</option>
                    </select>
                  </div>

                  <div className="md:w-32 flex items-end">
                    <button
                      onClick={() => {
                        void handleSearch(true)
                      }}
                      disabled={isSearching || !searchTerm.trim()}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center"
                    >
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Pesquisar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Feedback Section */}
              {!isSearching && (searchFeedback || providerStatus.length > 0) && (
                <div className="bg-card shadow rounded-lg p-4 space-y-3">
                  {/* Search Feedback - What was searched */}
                  {searchFeedback && (
                    <div className="flex items-start gap-2">
                      <Search className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{searchFeedback}</p>
                    </div>
                  )}

                  {/* Provider Status */}
                  {providerStatus.length > 0 && (
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-muted-foreground">Fontes:</span>
                      {providerStatus.map((provider) => (
                        <div
                          key={provider.name}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                            provider.ok
                              ? 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {provider.ok ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          <span className="capitalize">{provider.name}</span>
                          {provider.ok && (
                            <span className="text-xs opacity-75">({provider.resultCount})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI Enhancement Badge */}
                  {usedAIEnhancement && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
                        <Sparkles className="h-3 w-3" />
                        Busca aprimorada com IA
                      </span>
                    </div>
                  )}

                  {/* Local Expansion Badge (when AI not used but dictionary was) */}
                  {!usedAIEnhancement && usedLocalExpansion && englishKeywords.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                        <AlertCircle className="h-3 w-3" />
                        Tradução automática aplicada
                      </span>
                    </div>
                  )}

                  {/* Suggested Terms Chips */}
                  {suggestedTerms.length > 0 && (
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground mt-1">
                        Termos relacionados:
                      </span>
                      {suggestedTerms.slice(0, 6).map((term, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchTerm(term)
                            void handleSearch(true)
                          }}
                          className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Loading Skeleton */}
              {isSearching && articles.length === 0 && <ReferencesLoadingSkeleton />}

              {/* Search Results - Artigos */}
              {articles.length > 0 && (
                <div className="bg-card shadow rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    📄 Artigos Científicos ({articles.length} encontrados)
                  </h3>
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <div
                        key={article.id}
                        className="border border rounded-lg p-4 hover:bg-muted/50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-medium text-foreground flex-1 mr-4">
                            {article.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                article.source === 'scholar'
                                  ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300'
                                  : article.source === 'pubmed'
                                    ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300'
                                    : 'bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300'
                              }`}
                            >
                              {article.source === 'scholar'
                                ? 'Google Scholar'
                                : article.source === 'pubmed'
                                  ? 'PubMed'
                                  : 'Crossref'}
                            </span>
                            <button
                              onClick={() => {
                                if (article.saved) {
                                  openDeleteDialog(article)
                                } else {
                                  handleSaveArticle(article)
                                }
                              }}
                              className={`p-1 rounded ${
                                article.saved
                                  ? 'text-green-600 hover:text-green-700'
                                  : 'text-muted-foreground hover:text-muted-foreground'
                              }`}
                            >
                              {article.saved ? (
                                <BookmarkCheck className="h-5 w-5" />
                              ) : (
                                <Bookmark className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground mb-2 space-x-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {Array.isArray(article.authors)
                              ? article.authors.slice(0, 3).join(', ')
                              : article.authors}
                            {Array.isArray(article.authors) &&
                              article.authors.length > 3 &&
                              ` et al.`}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {article.year}
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {article.journal}
                          </div>
                        </div>

                        <p className="text-foreground/80 text-sm mb-3 line-clamp-3">
                          {article.abstract}
                        </p>

                        {/* Keywords */}
                        {article.keywords && article.keywords.length > 0 && (
                          <div className="flex items-start gap-2 mb-3">
                            <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex flex-wrap gap-1">
                              {article.keywords.slice(0, 5).map((keyword, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 text-xs bg-muted rounded-full text-muted-foreground"
                                >
                                  {keyword}
                                </span>
                              ))}
                              {article.keywords.length > 5 && (
                                <span className="px-2 py-0.5 text-xs text-muted-foreground">
                                  +{article.keywords.length - 5}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              Acessar artigo
                              <ExternalLink className="h-4 w-4 ml-1" />
                            </a>
                            {article.pdfUrl && (
                              <a
                                href={article.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                <FileDown className="h-4 w-4 mr-1" />
                                PDF
                              </a>
                            )}
                            {article.doi && (
                              <a
                                href={`https://doi.org/${article.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-xs"
                              >
                                DOI: {article.doi}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botão Ver Mais */}
                  {hasMore && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => {
                          void handleLoadMore()
                        }}
                        disabled={isLoadingMore}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md font-medium inline-flex items-center"
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Carregando...
                          </>
                        ) : (
                          'Ver mais artigos'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State - Enhanced with search explanation */}
              {!isSearching && articles.length === 0 && searchTerm && (
                <div className="bg-card shadow rounded-lg p-8 text-center">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhum artigo encontrado
                  </h3>

                  {/* Show what was searched */}
                  {searchFeedback && (
                    <p className="text-sm text-muted-foreground mb-4">{searchFeedback}</p>
                  )}

                  {/* Show provider status if any failed */}
                  {providerStatus.some((p) => !p.ok) && (
                    <div className="mb-4">
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        Algumas fontes não responderam. Tente novamente em alguns instantes.
                      </p>
                    </div>
                  )}

                  <p className="text-muted-foreground mb-4">
                    Tente usar termos diferentes ou mais específicos para sua pesquisa.
                  </p>

                  {/* Suggestions */}
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Sugestões:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>
                        Use termos em inglês (ex: &quot;milk production&quot; em vez de
                        &quot;produção de leite&quot;)
                      </li>
                      <li>Tente termos mais específicos ou mais gerais</li>
                      <li>Verifique a ortografia dos termos</li>
                    </ul>
                  </div>

                  {/* Suggested terms if available */}
                  {suggestedTerms.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm text-muted-foreground mb-2">Termos relacionados:</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {suggestedTerms.slice(0, 6).map((term, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSearchTerm(term)
                              void handleSearch(true)
                            }}
                            className="text-sm px-3 py-1 rounded-full bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Saved Articles Tab */
            <div className="space-y-6">
              {/* Adicionar por URL/DOI */}
              <div className="bg-card shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  🔗 Adicionar Artigo por Link/DOI
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Cole a URL de qualquer artigo (SciELO, PubMed, sites acadêmicos, etc.) para
                  adicioná-lo diretamente à sua biblioteca. Se a URL contiver um DOI, buscaremos
                  automaticamente os metadados completos do artigo.
                </p>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={addByUrlInput}
                    onChange={(e) => setAddByUrlInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        void handleAddByUrl()
                      }
                    }}
                    className="flex-1 px-3 py-2 border border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="https://doi.org/10.xxxx/xxxx ou https://..."
                  />
                  <button
                    onClick={() => {
                      void handleAddByUrl()
                    }}
                    disabled={isAddingByUrl || !addByUrlInput.trim()}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md font-medium inline-flex items-center"
                  >
                    {isAddingByUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar'}
                  </button>
                </div>

                {addByUrlMessage && (
                  <div
                    className={`mt-3 p-3 rounded-md ${
                      addByUrlMessage.type === 'success'
                        ? 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-900'
                        : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900'
                    }`}
                  >
                    {addByUrlMessage.text}
                  </div>
                )}
              </div>

              {isLoadingSavedArticles ? (
                <div className="bg-card shadow rounded-lg p-8 text-center">
                  <Loader2 className="mx-auto h-12 w-12 text-green-600 animate-spin mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Carregando artigos salvos...
                  </h3>
                  <p className="text-muted-foreground">Aguarde enquanto buscamos sua biblioteca.</p>
                </div>
              ) : savedArticles.length > 0 ? (
                <div className="bg-card shadow rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Sua Biblioteca ({savedArticles.length} artigos salvos)
                  </h3>
                  <div className="space-y-4">
                    {savedArticles.map((article) => (
                      <div key={article.id} className="border border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-medium text-foreground flex-1 mr-4">
                            {article.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                article.source === 'scholar'
                                  ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300'
                                  : article.source === 'pubmed'
                                    ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300'
                                    : 'bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300'
                              }`}
                            >
                              {article.source === 'scholar'
                                ? 'Google Scholar'
                                : article.source === 'pubmed'
                                  ? 'PubMed'
                                  : 'Crossref'}
                            </span>
                            <button
                              onClick={() => openDeleteDialog(article)}
                              className="p-1 rounded text-red-600 hover:text-red-700"
                            >
                              <BookmarkCheck className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground mb-2 space-x-4 flex-wrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {Array.isArray(article.authors)
                              ? article.authors.slice(0, 3).join(', ')
                              : article.authors}
                            {Array.isArray(article.authors) &&
                              article.authors.length > 3 &&
                              ` et al.`}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {article.year}
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {article.journal}
                          </div>
                          {article.volume && (
                            <div className="flex items-center text-xs">
                              Vol. {article.volume}
                              {article.issue && `, Nº ${article.issue}`}
                            </div>
                          )}
                          {article.issn && (
                            <div className="flex items-center text-xs">
                              <Hash className="h-3 w-3 mr-1" />
                              ISSN: {article.issn}
                            </div>
                          )}
                          {article.citationsCount !== undefined && article.citationsCount > 0 && (
                            <div className="flex items-center text-xs font-semibold text-green-600">
                              <Quote className="h-3 w-3 mr-1" />
                              {article.citationsCount} citações
                            </div>
                          )}
                        </div>

                        <p className="text-foreground/80 text-sm mb-3 line-clamp-3">
                          {article.abstract}
                        </p>

                        {/* Keywords */}
                        {article.keywords && article.keywords.length > 0 && (
                          <div className="flex items-start gap-2 mb-3">
                            <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex flex-wrap gap-1">
                              {article.keywords.slice(0, 5).map((keyword, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 text-xs bg-muted rounded-full text-muted-foreground"
                                >
                                  {keyword}
                                </span>
                              ))}
                              {article.keywords.length > 5 && (
                                <span className="px-2 py-0.5 text-xs text-muted-foreground">
                                  +{article.keywords.length - 5}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Ler artigo completo
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </a>
                          {article.pdfUrl && (
                            <div className="inline-flex items-center gap-1">
                              <a
                                href={article.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                <FileDown className="h-4 w-4 mr-1" />
                                PDF
                              </a>
                              <span className="px-1.5 py-0.5 text-xs bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded">
                                Arquivo
                              </span>
                            </div>
                          )}
                          {article.doi && (
                            <a
                              href={`https://doi.org/${article.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-xs"
                            >
                              DOI: {article.doi}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-card shadow rounded-lg p-8 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhum artigo salvo</h3>
                  <p className="text-muted-foreground mb-6">
                    Você ainda não salvou nenhum artigo. Use a pesquisa para encontrar e salvar
                    artigos interessantes.
                  </p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Pesquisar Artigos
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save Article Dialog with Rename Option */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-green-600" />
              Salvar Artigo na Biblioteca
            </DialogTitle>
            <DialogDescription>
              Revise o título do artigo antes de salvar. Você pode editá-lo para facilitar a
              identificação na sua biblioteca.
            </DialogDescription>
          </DialogHeader>

          {articleToSave && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  Título do Artigo
                  <Pencil className="h-3 w-3 text-muted-foreground" />
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="Digite o título do artigo..."
                />
                {customTitle !== articleToSave.title && (
                  <p className="text-xs text-muted-foreground">
                    Título original: {articleToSave.title.substring(0, 100)}
                    {articleToSave.title.length > 100 && '...'}
                  </p>
                )}
              </div>

              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-2" />
                  {Array.isArray(articleToSave.authors)
                    ? articleToSave.authors.slice(0, 2).join(', ')
                    : articleToSave.authors}
                  {Array.isArray(articleToSave.authors) &&
                    articleToSave.authors.length > 2 &&
                    ' et al.'}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {articleToSave.year}
                  </span>
                  <span className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {articleToSave.journal}
                  </span>
                </div>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    articleToSave.source === 'scholar'
                      ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300'
                      : articleToSave.source === 'pubmed'
                        ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300'
                        : 'bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300'
                  }`}
                >
                  {articleToSave.source === 'scholar'
                    ? 'Google Scholar'
                    : articleToSave.source === 'pubmed'
                      ? 'PubMed'
                      : 'Crossref'}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => {
                setSaveDialogOpen(false)
                setArticleToSave(null)
                setCustomTitle('')
              }}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border rounded-md"
            >
              Cancelar
            </button>
            <button
              onClick={() => void handleConfirmSave()}
              disabled={isSaving || !customTitle.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 rounded-md flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <BookmarkCheck className="h-4 w-4" />
                  Salvar na Biblioteca
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Article Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) {
            setArticleToDelete(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Remover artigo da biblioteca</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover
              {articleToDelete ? ` "${articleToDelete.title}"` : ' este artigo'} da sua biblioteca?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => {
                setDeleteDialogOpen(false)
                setArticleToDelete(null)
              }}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border rounded-md"
            >
              Cancelar
            </button>
            <button
              onClick={() => void handleConfirmDelete()}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 rounded-md flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                'OK'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
