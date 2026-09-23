import { useState, useEffect } from 'react'
import { api, AnalysisResult, ClaimItem } from '../services/api'
import { generateAnalysisPDF } from '../utils/pdfGenerator'
import {
  ShieldIcon, AlertTriangle, CheckCircleIcon, InfoIcon,
  DownloadIcon, ShareIcon, ZapIcon, CheckIcon, CopyIcon, ArrowRightIcon,
  ChevronDownIcon, ChevronRightIcon
} from '../components/Icons'

interface Props {
  shareId: string | number
  onNavigateHome: () => void
}

const VERDICT_CONFIG = {
  fake: {
    verdictText: 'LIKELY FAKE',
    color: '#A84232',
    bgClass: 'bg-fake-bg',
    borderClass: 'border-fake-border',
    textClass: 'text-fake',
    icon: AlertTriangle,
    ringStroke: '#A84232',
    ringBg: 'rgba(168, 66, 50, 0.15)',
    badgeBg: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900',
  },
  real: {
    verdictText: 'LIKELY REAL',
    color: '#557E37',
    bgClass: 'bg-real-bg',
    borderClass: 'border-real-border',
    textClass: 'text-real',
    icon: CheckCircleIcon,
    ringStroke: '#557E37',
    ringBg: 'rgba(85, 126, 55, 0.15)',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900',
  },
  uncertain: {
    verdictText: 'UNCERTAIN',
    color: '#B87A28',
    bgClass: 'bg-uncertain-bg',
    borderClass: 'border-uncertain-border',
    textClass: 'text-uncertain',
    icon: InfoIcon,
    ringStroke: '#B87A28',
    ringBg: 'rgba(184, 122, 40, 0.15)',
    badgeBg: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900',
  },
}

function CircularConfidence({ value, color, bgColor }: { value: number; color: string; bgColor: string }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ
  return (
    <svg width="130" height="130" viewBox="0 0 120 120" className="drop-shadow-sm">
      <circle cx="60" cy="60" r={r} fill="none" stroke={bgColor} strokeWidth="10" />
      <circle
        cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
      />
      <text x="60" y="54" textAnchor="middle" fontSize="22" fontWeight="700" fill={color} fontFamily="JetBrains Mono, monospace">
        {value}%
      </text>
      <text x="60" y="70" textAnchor="middle" fontSize="9" fill="#94A3B8" fontFamily="Inter, sans-serif">
        CONFIDENCE
      </text>
    </svg>
  )
}

export default function SharedResultPage({ shareId, onNavigateHome }: Props) {
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [expandedClaims, setExpandedClaims] = useState<Record<number, boolean>>({})

  useEffect(() => {
    let isMounted = true
    async function fetchResult() {
      setLoading(true)
      setError(null)
      try {
        const data = await api.getAnalysisById(shareId)
        if (isMounted) {
          setResult(data)
          setLoading(false)
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Analysis result is unavailable.')
          setLoading(false)
        }
      }
    }
    fetchResult()
    return () => {
      isMounted = false
    }
  }, [shareId])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const toggleClaimExpansion = (claimIdx: number) => {
    setExpandedClaims(prev => ({
      ...prev,
      [claimIdx]: !prev[claimIdx]
    }))
  }

  const handleDownloadReport = () => {
    if (!result) return
    setDownloading(true)
    try {
      generateAnalysisPDF({
        result,
        inputType: result.input_type || 'Text',
        source: result.source_url || result.title || 'Shared Analysis',
        analysisDate: result.created_at,
      })
    } catch {
      showToast('Unable to generate the report. Please try again.')
    } finally {
      setTimeout(() => setDownloading(false), 500)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      showToast('Result link copied to clipboard!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      showToast('Share link created. Copy it from the browser address bar.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <h2 className="text-xl font-bold text-foreground font-display mb-1">Loading Shared Analysis...</h2>
        <p className="text-xs text-muted-foreground">Retrieving verified report data from TruthLens AI</p>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-foreground font-display mb-2">Analysis Result Unavailable</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          {error || 'The requested analysis result could not be found or has expired.'}
        </p>
        <button
          onClick={onNavigateHome}
          className="bg-primary text-white font-medium px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 text-sm shadow-sm"
        >
          <ZapIcon size={16} /> Analyze News on TruthLens AI
        </button>
      </div>
    )
  }

  const verdict = result.verdict || 'uncertain'
  const config = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.uncertain
  const ResIcon = config.icon
  const confValue = result.conf || 80
  const displaySummary = result.summary || 'No summary available for this analysis.'
  const displayMetrics = result.metrics || []
  const detailedClaims: ClaimItem[] = result.detailed_claims || []
  const formattedDate = result.created_at
    ? new Date(result.created_at).toLocaleString()
    : 'Recently Analyzed'
  const sourceInfo = result.source_url || result.title || 'Submitted news content'

  const supportedCount = detailedClaims.filter(c => c.status === 'supported').length
  const contradictedCount = detailedClaims.filter(c => c.status === 'contradicted').length
  const unverifiedCount = detailedClaims.filter(c => c.status === 'needs_verification').length
  const totalClaimsCount = detailedClaims.length

  let verifiedSectionHeading = "What's Actually Supported?"
  let verifiedSectionSub = "Here is what the available evidence indicates about the claims in this content."
  if (verdict === 'real') {
    verifiedSectionHeading = "Claims Supported by Available Evidence"
    verifiedSectionSub = "Contextual evidence and corroboration for the key assertions in this article."
  } else if (verdict === 'uncertain') {
    verifiedSectionHeading = "What Could Not Be Verified"
    verifiedSectionSub = "Analysis of ambiguous claims requiring independent secondary corroboration."
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-foreground text-background px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckIcon size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onNavigateHome}>
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/20">
              <ShieldIcon size={20} />
            </div>
            <div>
              <span className="font-bold font-display text-base tracking-tight text-foreground">TRUTHLENS</span>
              <span className="text-xs font-semibold text-primary ml-1.5 px-1.5 py-0.5 rounded bg-primary/10">AI</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg border border-border">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> View-Only Report
            </span>
            <button
              onClick={onNavigateHome}
              className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm"
            >
              Analyze Your News <ArrowRightIcon size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8">
        {/* Banner */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">TRUTHLENS AI</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs text-muted-foreground">Shared Analysis Result</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">
              News Credibility Assessment
            </h1>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadReport}
              disabled={downloading}
              className="flex items-center gap-1.5 border border-border px-4 py-2 rounded-xl text-xs font-semibold hover:bg-secondary transition-colors"
            >
              <DownloadIcon size={14} />
              {downloading ? 'Generating Report...' : 'Download Report'}
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 border border-border px-4 py-2 rounded-xl text-xs font-semibold hover:bg-secondary transition-colors"
            >
              {copied ? <CheckIcon size={14} className="text-real" /> : <ShareIcon size={14} />}
              {copied ? 'Link Copied!' : 'Share'}
            </button>
          </div>
        </div>

        {/* Source and Metadata Card */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6 grid sm:grid-cols-3 gap-4 text-xs shadow-xs">
          <div>
            <span className="font-semibold text-muted-foreground block mb-0.5">SOURCE / REFERENCE</span>
            <span className="text-foreground font-medium break-all">{sourceInfo}</span>
          </div>
          <div>
            <span className="font-semibold text-muted-foreground block mb-0.5">INPUT TYPE</span>
            <span className="text-foreground font-medium uppercase">{result.input_type || 'Text'}</span>
          </div>
          <div>
            <span className="font-semibold text-muted-foreground block mb-0.5">ANALYSIS DATE</span>
            <span className="text-foreground font-medium">{formattedDate}</span>
          </div>
        </div>

        {/* 1. Verdict & Metrics Breakdown */}
        <div className="grid md:grid-cols-3 gap-5 mb-6">
          {/* Main Verdict Card */}
          <div className={`md:col-span-1 ${config.bgClass} border ${config.borderClass} rounded-2xl p-6 flex flex-col items-center text-center shadow-sm`}>
            <div className="w-10 h-10 rounded-full bg-white/80 dark:bg-black/20 flex items-center justify-center mb-4">
              <ResIcon size={22} className={config.textClass} />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Verdict</p>
            <p className={`text-xl font-black font-mono mb-5 ${config.textClass}`}>{config.verdictText}</p>
            <CircularConfidence value={confValue} color={config.color} bgColor={config.ringBg} />
          </div>

          {/* Content Analysis Metrics */}
          <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-foreground font-display mb-4 text-sm">Content Analysis Metrics</h3>
            {displayMetrics.length > 0 ? (
              <div className="space-y-3.5">
                {displayMetrics.map(({ label, val }) => {
                  const barColor =
                    val > 65
                      ? verdict === 'real'
                        ? 'bg-real'
                        : 'bg-fake'
                      : val > 45
                      ? 'bg-uncertain'
                      : verdict === 'real'
                      ? 'bg-real'
                      : 'bg-secondary'
                  return (
                    <div key={label}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-foreground font-medium">{label}</span>
                        <span className="text-xs font-bold font-mono text-foreground">{val}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full transition-all duration-1000`} style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Standard credibility signals verified.</p>
            )}
          </div>
        </div>

        {/* AI Summary Card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <ZapIcon size={13} className="text-primary" />
            </div>
            <h3 className="font-bold text-foreground font-display text-sm">AI Verification & Reasoning Breakdown</h3>
          </div>

          {(() => {
            const breakdown = result?.explanation_breakdown || result?.metadata?.explanation_breakdown
            if (breakdown) {
              return (
                <div className="space-y-3">
                  {/* 1. Final Reasoning */}
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <ShieldIcon size={14} className="text-primary" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Final Reasoning & Verdict Synthesis</h4>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">
                      {breakdown.final_reasoning}
                    </p>
                  </div>

                  {/* 2 & 3. Fact-Check Evidence & Linguistic Signals */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-secondary/60 border border-border/80 rounded-xl p-3.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <CheckCircleIcon size={13} className="text-blue-500" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Fact-Check Evidence</h4>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {breakdown.factcheck_evidence}
                      </p>
                    </div>

                    <div className="bg-secondary/60 border border-border/80 rounded-xl p-3.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <ZapIcon size={13} className="text-amber-500" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Linguistic & Rule Signals</h4>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {breakdown.linguistic_signals}
                      </p>
                    </div>
                  </div>
                </div>
              )
            }
            return (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {displaySummary}
              </p>
            )
          })()}
        </div>

        {/* 2. CLAIM-BY-CLAIM ANALYSIS */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
                Claim-by-Claim Analysis
              </h2>
              <p className="text-xs text-muted-foreground">
                See which claims are supported, contradicted, or need further verification.
              </p>
            </div>

            {totalClaimsCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap bg-card border border-border px-3.5 py-1.5 rounded-xl text-xs font-medium">
                <span className="text-muted-foreground font-mono font-semibold">
                  {totalClaimsCount} Claims
                </span>
                <span className="text-border">|</span>
                <span className="inline-flex items-center gap-1 text-real font-semibold font-mono">
                  <span className="w-2 h-2 rounded-full bg-real" /> {supportedCount} Supported
                </span>
                <span className="inline-flex items-center gap-1 text-fake font-semibold font-mono">
                  <span className="w-2 h-2 rounded-full bg-fake" /> {contradictedCount} Contradicted
                </span>
                <span className="inline-flex items-center gap-1 text-uncertain font-semibold font-mono">
                  <span className="w-2 h-2 rounded-full bg-uncertain" /> {unverifiedCount} Needs Verification
                </span>
              </div>
            )}
          </div>

          {totalClaimsCount === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-6 text-center text-xs text-muted-foreground">
              No distinct factual claims were identified for claim-by-claim verification.
            </div>
          ) : (
            <div className="space-y-3.5">
              {detailedClaims.map((item, idx) => {
                const isExpanded = !!expandedClaims[idx]
                const statusCfg =
                  item.status === 'supported'
                    ? { label: 'SUPPORTED', bg: 'bg-real-bg', border: 'border-real-border', text: 'text-real', dot: 'bg-real' }
                    : item.status === 'contradicted'
                    ? { label: 'CONTRADICTED', bg: 'bg-fake-bg', border: 'border-fake-border', text: 'text-fake', dot: 'bg-fake' }
                    : { label: 'NEEDS VERIFICATION', bg: 'bg-uncertain-bg', border: 'border-uncertain-border', text: 'text-uncertain', dot: 'bg-uncertain' }

                return (
                  <div
                    key={idx}
                    className="bg-card border border-border rounded-2xl p-5 shadow-xs transition-all hover:border-primary/30"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2.5">
                      <span className="text-[11px] font-bold font-mono tracking-wider text-muted-foreground uppercase">
                        CLAIM {String(item.claim_number || idx + 1).padStart(2, '0')}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border} px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-foreground leading-snug mb-3">
                      "{item.claim}"
                    </p>

                    <div className="bg-secondary/50 rounded-xl p-3 border border-border/60 mb-3">
                      <p className="text-xs font-semibold text-foreground mb-0.5">Explanation</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.explanation}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {item.evidence && item.evidence.length > 0
                          ? `${item.evidence.length} verified source${item.evidence.length > 1 ? 's' : ''}`
                          : 'No direct primary citation attached'}
                      </span>

                      <button
                        onClick={() => toggleClaimExpansion(idx)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        {isExpanded ? 'Hide Evidence' : 'View Evidence'}
                        {isExpanded ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-border space-y-3 animate-in fade-in duration-200">
                        <h4 className="text-xs font-bold text-foreground font-display">
                          Evidence & Source Verification
                        </h4>

                        {item.evidence && item.evidence.length > 0 ? (
                          item.evidence.map((ev, evIdx) => {
                            const ratingLower = (ev.rating || '').toLowerCase()
                            const isFalseRating = ['false', 'fake', 'incorrect', 'pants on fire', 'misleading', 'hoax', 'debunked', 'unproven'].some(r => ratingLower.includes(r))
                            const isTrueRating = ['true', 'correct', 'verified', 'accurate'].some(r => ratingLower.includes(r))
                            const ratingBadgeClass = isFalseRating
                              ? 'bg-fake-bg text-fake border-fake-border'
                              : isTrueRating
                              ? 'bg-real-bg text-real border-real-border'
                              : 'bg-uncertain-bg text-uncertain border-uncertain-border'

                            return (
                              <div key={evIdx} className="bg-background border border-border rounded-xl p-3.5 space-y-2">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-xs text-foreground font-display">
                                      {ev.source_name}
                                    </span>
                                    {ev.is_live_api && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                        <ShieldIcon size={10} /> Live Fact Check
                                      </span>
                                    )}
                                    {ev.rating && (
                                      <span className={`inline-flex items-center text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${ratingBadgeClass}`}>
                                        Rating: {ev.rating}
                                      </span>
                                    )}
                                  </div>
                                  {ev.date && (
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                      {ev.date}
                                    </span>
                                  )}
                                </div>
                                {ev.claimant && (
                                  <p className="text-[11px] text-muted-foreground">
                                    <span className="font-semibold text-foreground">Claimant:</span> {ev.claimant}
                                  </p>
                                )}
                                {ev.title && (
                                  <p className="text-xs font-medium text-foreground italic">
                                    "{ev.title}"
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {ev.summary}
                                </p>
                                {ev.url ? (
                                  <a
                                    href={ev.url}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline pt-1"
                                  >
                                    Open Source <ArrowRightIcon size={11} />
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground italic block pt-1">
                                    Verified institutional record
                                  </span>
                                )}
                              </div>
                            )
                          })
                        ) : (
                          <div className="bg-secondary/40 border border-border rounded-xl p-3 text-xs text-muted-foreground">
                            No supporting source was found for this specific assertion.
                          </div>
                        )}

                        {item.verified_information && (
                          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                            <p className="text-[11px] font-bold text-primary mb-0.5">Assessment Note</p>
                            <p className="text-xs text-foreground leading-relaxed">
                              {item.verified_information}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 3. VERIFIED INFORMATION SECTION */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldIcon size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-foreground">
                {verifiedSectionHeading}
              </h2>
              <p className="text-xs text-muted-foreground">
                {verifiedSectionSub}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {detailedClaims.length > 0 ? (
              detailedClaims.map((item, i) => (
                <div key={i} className="border-b border-border/80 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-2 mb-1.5">
                    <span className="text-xs mt-0.5 font-bold">
                      {item.status === 'supported' ? '✓' : item.status === 'contradicted' ? '❌' : '🟡'}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-foreground">Article Claim: </span>
                      <span className="text-xs text-foreground italic">"{item.claim}"</span>
                    </div>
                  </div>

                  <div className="ml-5 pl-3 border-l-2 border-primary/30 space-y-1.5 mt-2">
                    <p className="text-xs font-semibold text-primary">Available Information:</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.verified_information || item.explanation}
                    </p>

                    {item.evidence && item.evidence[0] && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] text-muted-foreground">
                          Source: <strong className="text-foreground">{item.evidence[0].source_name}</strong>
                        </span>
                        {item.evidence[0].url && (
                          <a
                            href={item.evidence[0].url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-[11px] text-primary font-semibold hover:underline inline-flex items-center gap-0.5"
                          >
                            [Open Source]
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Available evidence is insufficient to establish specific verified claims.
              </p>
            )}
          </div>
        </div>

        {/* 4. AI Transparency Disclaimer Box */}
        <div className="bg-card border border-border rounded-xl p-4 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <InfoIcon size={16} />
          </div>
          <div>
            <span className="font-semibold text-xs text-foreground block mb-0.5">Assessment Transparency</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Claim assessments are based on available evidence and AI-assisted analysis. A "Needs Verification" result means the available information was insufficient to establish the claim.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground bg-card/40">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} TruthLens AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={onNavigateHome} className="hover:text-foreground transition-colors">
              Analyze New Content
            </button>
            <span>·</span>
            <span>View-Only Shared Report</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

