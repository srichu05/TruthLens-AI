import { useState, useEffect } from 'react'
import { Page } from '../App'
import {
  NewspaperIcon, SearchIcon, ExternalLinkIcon, ZapIcon,
  ArrowRightIcon, CheckCircleIcon, AlertTriangle, InfoIcon
} from '../components/Icons'
import { api, RealArticleItem } from '../services/api'

interface Props {
  navigate: (page: Page) => void
  onSelectArticle?: (id: number) => void
}

const verdictConfig = {
  fake:      { label: 'LIKELY FAKE',          bg: 'bg-fake-bg',      border: 'border-fake-border',      text: 'text-fake',      dot: 'bg-fake' },
  uncertain: { label: 'MIXED / MISLEADING',    bg: 'bg-uncertain-bg', border: 'border-uncertain-border', text: 'text-uncertain', dot: 'bg-uncertain' },
  real:      { label: 'LIKELY REAL',          bg: 'bg-real-bg',      border: 'border-real-border',      text: 'text-real',      dot: 'bg-real' },
}

export default function RealArticles({ navigate, onSelectArticle }: Props) {
  const [articles, setArticles] = useState<RealArticleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'fake' | 'uncertain'>('all')

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const data = await api.getRealArticles({
        search: search.trim() || undefined,
        verdict: filter !== 'all' ? filter : undefined
      })
      setArticles(data)
    } catch {
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [filter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchArticles()
  }

  const handleOpenAnalysis = (analysisId?: number) => {
    if (analysisId) {
      window.location.hash = `#/shared/${analysisId}`
      window.history.pushState({}, '', `/shared/${analysisId}`)
      window.dispatchEvent(new PopStateEvent('popstate'))
    } else {
      navigate('analyzer')
    }
  }

  const handleOpenDetail = (article: RealArticleItem) => {
    if (onSelectArticle) {
      onSelectArticle(article.id)
    } else {
      window.location.hash = `#/real-articles/${article.id}`
      window.history.pushState({}, '', `/real-articles/${article.id}`)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto page-fade" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <NewspaperIcon size={18} />
          </div>
          <h1 className="text-3xl font-bold text-foreground font-display">Real Articles</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Verified information and reliable sources related to the news analyzed by TruthLens.
        </p>
      </div>

      {/* Controls: Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search original headline, claim, or source..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </form>

        <div className="flex items-center gap-1.5 p-1 bg-card border border-border rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('fake')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'fake'
                ? 'bg-fake text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Fake
          </button>
          <button
            onClick={() => setFilter('uncertain')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'uncertain'
                ? 'bg-uncertain text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mixed / Misleading
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-xs text-muted-foreground">Loading verified real articles...</p>
        </div>
      ) : articles.length === 0 ? (
        /* Empty State */
        <div className="bg-card border border-border rounded-2xl p-12 text-center my-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <NewspaperIcon size={30} />
          </div>
          <h3 className="text-lg font-bold text-foreground font-display mb-1.5">No Real Articles Yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6 leading-relaxed">
            Analyze a news article with TruthLens and verified information will appear here.
          </p>
          <button
            onClick={() => navigate('analyzer')}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-sm"
          >
            <ZapIcon size={14} /> Start New Analysis
          </button>
        </div>
      ) : (
        /* Article Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {articles.map((item) => {
            const vKey = item.original_verdict as keyof typeof verdictConfig
            const vCfg = verdictConfig[vKey] || verdictConfig.fake
            const displayDate = item.created_at
              ? new Date(item.created_at).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              : 'Recent'

            return (
              <div
                key={item.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 ${vCfg.bg} ${vCfg.text} border ${vCfg.border} px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${vCfg.dot}`} />
                      {vCfg.label}
                    </span>

                    <span className="text-[10px] font-mono uppercase bg-secondary text-muted-foreground px-2 py-0.5 rounded-md border border-border/60">
                      {item.input_type || 'Text'}
                    </span>
                  </div>

                  {/* Original Article / Claim */}
                  <div className="mb-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 font-mono">
                      Original Headline / Claim
                    </p>
                    <h3 className="text-sm font-bold text-foreground font-display leading-snug line-clamp-2">
                      "{item.original_title || item.original_claim}"
                    </h3>
                  </div>

                  {/* What Actually Happened */}
                  <div className="bg-secondary/60 rounded-xl p-3 border border-border/80 mb-4 space-y-1">
                    <p className="text-[11px] font-bold text-primary font-display flex items-center gap-1">
                      <CheckCircleIcon size={13} /> What Actually Happened
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {item.what_actually_happened}
                    </p>
                  </div>

                  {/* Meta: Source & Date */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 mb-4 border-t border-border/60">
                    <div className="truncate max-w-[60%]">
                      <span className="text-[11px]">Verified Source: </span>
                      <strong className="text-foreground text-[11px]">{item.verified_source_name}</strong>
                    </div>
                    <span className="text-[11px] font-mono">{displayDate}</span>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex items-center gap-2.5 pt-2">
                  {item.verified_source_url ? (
                    <a
                      href={item.verified_source_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex-1 flex items-center justify-center gap-1.5 bg-primary/10 border border-primary/25 text-primary text-xs font-bold py-2 rounded-xl hover:bg-primary/20 transition-colors"
                    >
                      View Real Article <ExternalLinkIcon size={13} />
                    </a>
                  ) : (
                    <button
                      onClick={() => handleOpenDetail(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-primary/10 border border-primary/25 text-primary text-xs font-bold py-2 rounded-xl hover:bg-primary/20 transition-colors"
                    >
                      View Real Article <ArrowRightIcon size={13} />
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenDetail(item)}
                    className="flex-1 flex items-center justify-center gap-1 border border-border text-foreground text-xs font-medium py-2 rounded-xl hover:bg-secondary transition-colors"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => handleOpenAnalysis(item.analysis_id)}
                    title="View Original Analysis"
                    className="px-3 py-2 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl text-xs font-medium transition-colors"
                  >
                    Analysis
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
