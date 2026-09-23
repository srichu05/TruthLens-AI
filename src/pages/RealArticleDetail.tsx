import { useState, useEffect } from 'react'
import { Page } from '../App'
import {
  NewspaperIcon, ArrowRightIcon, ExternalLinkIcon, CheckCircleIcon,
  AlertTriangle, ShieldIcon, LinkIcon
} from '../components/Icons'
import { api, RealArticleItem } from '../services/api'

interface Props {
  articleId: number | string
  navigate: (page: Page) => void
  onBack: () => void
}

const verdictConfig = {
  fake:      { label: 'LIKELY FAKE',          bg: 'bg-fake-bg',      border: 'border-fake-border',      text: 'text-fake',      dot: 'bg-fake' },
  uncertain: { label: 'MIXED / MISLEADING',    bg: 'bg-uncertain-bg', border: 'border-uncertain-border', text: 'text-uncertain', dot: 'bg-uncertain' },
  real:      { label: 'LIKELY REAL',          bg: 'bg-real-bg',      border: 'border-real-border',      text: 'text-real',      dot: 'bg-real' },
}

export default function RealArticleDetail({ articleId, navigate, onBack }: Props) {
  const [article, setArticle] = useState<RealArticleItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await api.getRealArticleById(articleId)
        setArticle(data)
      } catch (err: any) {
        setError(err.message || 'Real article details not found.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [articleId])

  const handleOpenAnalysis = () => {
    if (article?.analysis_id) {
      window.location.hash = `#/shared/${article.analysis_id}`
      window.history.pushState({}, '', `/shared/${article.analysis_id}`)
      window.dispatchEvent(new PopStateEvent('popstate'))
    } else {
      navigate('analyzer')
    }
  }

  if (loading) {
    return (
      <div className="p-12 max-w-4xl mx-auto text-center page-fade" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-xs text-muted-foreground">Loading verified real article details...</p>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center page-fade" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="w-14 h-14 rounded-2xl bg-fake-bg text-fake flex items-center justify-center mx-auto mb-3">
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-xl font-bold text-foreground font-display mb-2">Verified Information Not Found</h2>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          {error || 'This real article record could not be loaded.'}
        </p>
        <button
          onClick={onBack}
          className="bg-primary text-primary-foreground text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all"
        >
          Back to Real Articles
        </button>
      </div>
    )
  }

  const vKey = article.original_verdict as keyof typeof verdictConfig
  const vCfg = verdictConfig[vKey] || verdictConfig.fake
  const formattedDate = article.created_at
    ? new Date(article.created_at).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'Recently Analyzed'

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto page-fade" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
        >
          ← Back to Real Articles
        </button>

        <div className="flex items-center gap-2">
          {article.verified_source_url && (
            <a
              href={article.verified_source_url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-all shadow-xs"
            >
              Open Primary Source <ExternalLinkIcon size={13} />
            </a>
          )}
          <button
            onClick={handleOpenAnalysis}
            className="inline-flex items-center gap-1.5 text-xs font-semibold border border-border text-foreground px-4 py-2 rounded-xl hover:bg-secondary transition-colors"
          >
            View Full Analysis <ArrowRightIcon size={13} />
          </button>
        </div>
      </div>

      {/* Main Title Header */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-primary font-mono">
            VERIFIED INFORMATION RECORD
          </span>
          <span className="text-muted-foreground text-xs">•</span>
          <span className="text-xs text-muted-foreground font-mono">{formattedDate}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground leading-tight mb-4">
          {article.original_title}
        </h1>

        <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-border">
          <span className={`inline-flex items-center gap-1.5 ${vCfg.bg} ${vCfg.text} border ${vCfg.border} px-2.5 py-0.5 rounded-full text-xs font-bold font-mono`}>
            <span className={`w-1.5 h-1.5 rounded-full ${vCfg.dot}`} />
            Original Verdict: {vCfg.label}
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            Confidence: <strong className="text-foreground">{article.confidence}%</strong>
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            Input Type: <strong className="text-foreground uppercase">{article.input_type}</strong>
          </span>
        </div>
      </div>

      {/* 1. ORIGINAL CLAIM / ARTICLE */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 font-mono">
          ORIGINAL CLAIM / ARTICLE
        </h2>
        <div className="p-4 bg-secondary/50 rounded-xl border border-border/70 text-sm font-medium text-foreground leading-relaxed italic">
          "{article.original_claim}"
        </div>
      </div>

      {/* 2. WHAT WAS WRONG? */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-fake-bg text-fake flex items-center justify-center">
            <AlertTriangle size={15} />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-display">
            WHAT WAS WRONG?
          </h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {article.what_was_wrong}
        </p>
      </div>

      {/* 3. WHAT ACTUALLY HAPPENED? */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-real-bg text-real flex items-center justify-center">
            <CheckCircleIcon size={16} />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-display">
            WHAT ACTUALLY HAPPENED?
          </h2>
        </div>
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-foreground leading-relaxed whitespace-pre-line">
          {article.what_actually_happened}
        </div>
      </div>

      {/* 4. VERIFIED SOURCES */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <ShieldIcon size={16} />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-display">
            VERIFIED SOURCES
          </h2>
        </div>

        {article.sources && article.sources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {article.sources.map((src, i) => (
              <div key={i} className="bg-background border border-border rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3 className="text-xs font-bold text-foreground font-display">
                      {src.source_name}
                    </h3>
                    {src.date && (
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {src.date}
                      </span>
                    )}
                  </div>
                  {src.title && (
                    <p className="text-xs italic text-foreground mb-1.5">
                      "{src.title}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    {src.summary}
                  </p>
                </div>

                {src.url ? (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-1"
                  >
                    Open Source ↗
                  </a>
                ) : (
                  <span className="text-[11px] text-muted-foreground italic">
                    Verified institutional domain record
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-secondary/40 rounded-xl text-xs text-muted-foreground">
            Source record: <strong className="text-foreground">{article.verified_source_name}</strong>
          </div>
        )}
      </div>

      {/* 5. TRUTHLENS ANALYSIS CTA CARD */}
      <div className="bg-secondary/40 border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-display mb-0.5">
            TruthLens Analysis Record
          </h3>
          <p className="text-xs text-muted-foreground">
            View full linguistic score breakdown, confidence meters, and claim extraction.
          </p>
        </div>
        <button
          onClick={handleOpenAnalysis}
          className="bg-foreground text-background text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-foreground/90 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          View Full Analysis <ArrowRightIcon size={13} />
        </button>
      </div>
    </div>
  )
}
