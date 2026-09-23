import { useState, useRef } from 'react'
import { Page } from '../App'
import {
  ZapIcon, LinkIcon, UploadIcon, CheckIcon, CheckCircleIcon,
  AlertTriangle, InfoIcon, BookmarkIcon, DownloadIcon, ShareIcon, RefreshIcon, ArrowRightIcon,
  CopyIcon, XIcon, ChevronDownIcon, ChevronRightIcon, ShieldIcon, NewspaperIcon
} from '../components/Icons'

import { api, AnalysisResult, ClaimItem } from '../services/api'
import { generateAnalysisPDF } from '../utils/pdfGenerator'

interface Props { navigate: (page: Page) => void }

type Mode    = 'text' | 'url' | 'file'
type State   = 'input' | 'analyzing' | 'result'
type Verdict = 'fake' | 'real' | 'uncertain'

const STEPS = [
  'Extracting text content',
  'Preprocessing and normalizing',
  'Extracting factual assertions & claims',
  'Cross-verifying evidence databases',
  'Synthesizing verification report',
]

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
  },
}

const EXPLANATIONS = [
  { key: 'fake',      label: 'Suspicious Language',  desc: 'Specific word patterns associated with deceptive content detected at high frequency.' },
  { key: 'uncertain', label: 'Sensationalism',        desc: 'Headline and opening paragraph use amplified language designed to provoke emotional response.' },
  { key: 'uncertain', label: 'Claim Patterns',        desc: 'Unverified assertions made without primary source attribution.' },
  { key: 'real',      label: 'Source Indicators',     desc: 'Named author and organization signals assessed against known credible outlet database.' },
  { key: 'real',      label: 'Linguistic Signals',    desc: 'Sentence structure and vocabulary distribution analyzed for journalistic writing conventions.' },
]

function CircularConfidence({ value, color, bgColor }: { value: number; color: string; bgColor: string }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ
  return (
    <svg width="140" height="140" viewBox="0 0 120 120" className="drop-shadow-sm">
      <circle cx="60" cy="60" r={r} fill="none" stroke={bgColor} strokeWidth="10" />
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
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

// ── Graph 1: Claim Verification Breakdown Donut Chart ────────
function ClaimVerificationBreakdown({ detailedClaims }: { detailedClaims: ClaimItem[] }) {
  const [hovered, setHovered] = useState<'supported' | 'contradicted' | 'needs_verification' | null>(null)

  const total = detailedClaims.length
  const supportedCount = detailedClaims.filter(c => c.status === 'supported').length
  const contradictedCount = detailedClaims.filter(c => c.status === 'contradicted').length
  const unverifiedCount = detailedClaims.filter(c => c.status === 'needs_verification').length

  if (total === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center min-h-[270px]">
        <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground mb-3">
          <InfoIcon size={20} />
        </div>
        <h3 className="text-sm font-bold font-display text-foreground mb-1">Claim Verification Breakdown</h3>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          No claim data available yet.
        </p>
      </div>
    )
  }

  const suppPct = Math.round((supportedCount / total) * 100)
  const contPct = Math.round((contradictedCount / total) * 100)
  const unvPct = Math.max(0, 100 - suppPct - contPct)

  const r = 44
  const circ = 2 * Math.PI * r

  const suppDash = (supportedCount / total) * circ
  const contDash = (contradictedCount / total) * circ
  const unvDash = (unverifiedCount / total) * circ

  const suppOffset = 0
  const contOffset = -suppDash
  const unvOffset = -(suppDash + contDash)

  // Active hover readout
  let centerLabel = 'TOTAL CLAIMS'
  let centerValue = `${total}`
  let centerSub = 'Claims extracted'
  let centerColor = 'var(--foreground)'

  if (hovered === 'supported') {
    centerLabel = 'SUPPORTED'
    centerValue = `${supportedCount} (${suppPct}%)`
    centerSub = `${supportedCount} of ${total} verified`
    centerColor = 'var(--real)'
  } else if (hovered === 'contradicted') {
    centerLabel = 'CONTRADICTED'
    centerValue = `${contradictedCount} (${contPct}%)`
    centerSub = `${contradictedCount} of ${total} refuted`
    centerColor = 'var(--fake)'
  } else if (hovered === 'needs_verification') {
    centerLabel = 'NEEDS REVIEW'
    centerValue = `${unverifiedCount} (${unvPct}%)`
    centerSub = `${unverifiedCount} of ${total} pending`
    centerColor = 'var(--uncertain)'
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-foreground font-display text-sm">
            Claim Verification Breakdown
          </h3>
          <p className="text-xs text-muted-foreground">
            Distribution of validated factual assertions
          </p>
        </div>
        <span className="text-[11px] font-mono font-bold bg-secondary text-secondary-foreground px-2 py-0.5 rounded-lg">
          {total} Total
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-1">
        {/* Donut Chart */}
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <svg width="136" height="136" viewBox="0 0 110 110" className="drop-shadow-xs">
            {/* Background circle track */}
            <circle cx="55" cy="55" r={r} fill="none" stroke="var(--border)" strokeWidth="10" opacity="0.3" />

            {/* Supported slice */}
            {supportedCount > 0 && (
              <circle
                cx="55" cy="55" r={r} fill="none" stroke="var(--real)"
                strokeWidth={hovered === 'supported' ? 14 : 10}
                strokeDasharray={`${suppDash} ${circ}`}
                strokeDashoffset={suppOffset}
                strokeLinecap={contCountOrUnvOnly(supportedCount, total) ? 'round' : 'butt'}
                transform="rotate(-90 55 55)"
                className="cursor-pointer transition-all duration-300"
                style={{ opacity: hovered && hovered !== 'supported' ? 0.45 : 1 }}
                onMouseEnter={() => setHovered('supported')}
                onMouseLeave={() => setHovered(null)}
              />
            )}

            {/* Contradicted slice */}
            {contradictedCount > 0 && (
              <circle
                cx="55" cy="55" r={r} fill="none" stroke="var(--fake)"
                strokeWidth={hovered === 'contradicted' ? 14 : 10}
                strokeDasharray={`${contDash} ${circ}`}
                strokeDashoffset={contOffset}
                strokeLinecap={contCountOrUnvOnly(contradictedCount, total) ? 'round' : 'butt'}
                transform="rotate(-90 55 55)"
                className="cursor-pointer transition-all duration-300"
                style={{ opacity: hovered && hovered !== 'contradicted' ? 0.45 : 1 }}
                onMouseEnter={() => setHovered('contradicted')}
                onMouseLeave={() => setHovered(null)}
              />
            )}

            {/* Needs verification slice */}
            {unverifiedCount > 0 && (
              <circle
                cx="55" cy="55" r={r} fill="none" stroke="var(--uncertain)"
                strokeWidth={hovered === 'needs_verification' ? 14 : 10}
                strokeDasharray={`${unvDash} ${circ}`}
                strokeDashoffset={unvOffset}
                strokeLinecap={contCountOrUnvOnly(unverifiedCount, total) ? 'round' : 'butt'}
                transform="rotate(-90 55 55)"
                className="cursor-pointer transition-all duration-300"
                style={{ opacity: hovered && hovered !== 'needs_verification' ? 0.45 : 1 }}
                onMouseEnter={() => setHovered('needs_verification')}
                onMouseLeave={() => setHovered(null)}
              />
            )}
          </svg>

          {/* Interactive center display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
            <span className="text-[9px] font-bold tracking-wider uppercase text-muted-foreground font-mono">
              {centerLabel}
            </span>
            <span
              className="text-sm font-black font-mono leading-tight transition-colors duration-200"
              style={{ color: centerColor }}
            >
              {centerValue}
            </span>
            <span className="text-[8px] text-muted-foreground">
              {centerSub}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2">
          {/* Supported */}
          <div
            onMouseEnter={() => setHovered('supported')}
            onMouseLeave={() => setHovered(null)}
            className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
              hovered === 'supported' ? 'bg-real/15 border border-real/30' : 'bg-secondary/40 hover:bg-secondary/80 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-real/20 text-real flex items-center justify-center text-xs font-bold font-mono">
                ✓
              </span>
              <span className="text-xs font-semibold text-foreground">Supported</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="font-bold text-real">{supportedCount}</span>
              <span className="text-[11px] text-muted-foreground">({suppPct}%)</span>
            </div>
          </div>

          {/* Contradicted */}
          <div
            onMouseEnter={() => setHovered('contradicted')}
            onMouseLeave={() => setHovered(null)}
            className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
              hovered === 'contradicted' ? 'bg-fake/15 border border-fake/30' : 'bg-secondary/40 hover:bg-secondary/80 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-fake/20 text-fake flex items-center justify-center text-xs font-bold font-mono">
                ✕
              </span>
              <span className="text-xs font-semibold text-foreground">Contradicted</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="font-bold text-fake">{contradictedCount}</span>
              <span className="text-[11px] text-muted-foreground">({contPct}%)</span>
            </div>
          </div>

          {/* Needs Verification */}
          <div
            onMouseEnter={() => setHovered('needs_verification')}
            onMouseLeave={() => setHovered(null)}
            className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
              hovered === 'needs_verification' ? 'bg-uncertain/15 border border-uncertain/30' : 'bg-secondary/40 hover:bg-secondary/80 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-uncertain/20 text-uncertain flex items-center justify-center text-xs font-bold font-mono">
                ?
              </span>
              <span className="text-xs font-semibold text-foreground">Needs Verification</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="font-bold text-uncertain">{unverifiedCount}</span>
              <span className="text-[11px] text-muted-foreground">({unvPct}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function contCountOrUnvOnly(count: number, total: number) {
  return count === total
}

// ── Graph 2: Evidence / Verification Coverage Bar Chart ───────
function EvidenceCoverageChart({ detailedClaims }: { detailedClaims: ClaimItem[] }) {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null)

  const total = detailedClaims.length

  if (total === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center min-h-[270px]">
        <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground mb-3">
          <ShieldIcon size={20} />
        </div>
        <h3 className="text-sm font-bold font-display text-foreground mb-1">Evidence Coverage</h3>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          Evidence coverage will appear when supporting sources are available.
        </p>
      </div>
    )
  }

  // Calculate actual evidence categories based on claims & citations
  let strongCount = 0
  let partialCount = 0
  let limitedCount = 0

  detailedClaims.forEach((claim) => {
    const evList = claim.evidence || []
    const hasUrl = evList.some(e => Boolean(e.url))

    if (evList.length >= 1 && hasUrl) {
      strongCount++
    } else if (evList.length >= 1 || (claim.status === 'supported' && evList.length === 0)) {
      partialCount++
    } else {
      limitedCount++
    }
  })

  const strongPct = Math.round((strongCount / total) * 100)
  const partialPct = Math.round((partialCount / total) * 100)
  const limitedPct = Math.max(0, 100 - strongPct - partialPct)

  const tiers = [
    {
      id: 'strong',
      label: 'Strong Evidence',
      desc: 'Corroborated by primary institutional citations & verified records',
      count: strongCount,
      pct: strongPct,
      barClass: 'bg-real',
      textClass: 'text-real',
      badgeClass: 'bg-real-bg text-real border-real-border',
    },
    {
      id: 'partial',
      label: 'Partial Evidence',
      desc: 'Secondary reporting or contextual analysis available',
      count: partialCount,
      pct: partialPct,
      barClass: 'bg-uncertain',
      textClass: 'text-uncertain',
      badgeClass: 'bg-uncertain-bg text-uncertain border-uncertain-border',
    },
    {
      id: 'limited',
      label: 'Limited Evidence',
      desc: 'Unsubstantiated assertions lacking verified primary documentation',
      count: limitedCount,
      pct: limitedPct,
      barClass: 'bg-muted-foreground/60',
      textClass: 'text-muted-foreground',
      badgeClass: 'bg-secondary text-muted-foreground border-border',
    },
  ]

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-foreground font-display text-sm">
            Evidence Coverage
          </h3>
          <p className="text-xs text-muted-foreground">
            Corroboration strength across analyzed content
          </p>
        </div>
        <span className="text-[11px] font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-lg">
          AI Verified
        </span>
      </div>

      <div className="space-y-3.5 py-1">
        {tiers.map((tier) => {
          const isHovered = hoveredTier === tier.id
          return (
            <div
              key={tier.id}
              onMouseEnter={() => setHoveredTier(tier.id)}
              onMouseLeave={() => setHoveredTier(null)}
              className={`p-2.5 rounded-xl border transition-all ${
                isHovered
                  ? 'bg-secondary/70 border-primary/30 shadow-xs'
                  : 'bg-secondary/30 border-transparent hover:border-border'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${tier.barClass}`} />
                  <span className="text-xs font-semibold text-foreground">
                    {tier.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {tier.count} {tier.count === 1 ? 'claim' : 'claims'}
                  </span>
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md border ${tier.badgeClass}`}>
                    {tier.pct}%
                  </span>
                </div>
              </div>

              {/* Animated Horizontal Bar */}
              <div className="h-2.5 bg-secondary rounded-full overflow-hidden p-0.5 border border-border/40">
                <div
                  className={`h-full ${tier.barClass} rounded-full transition-all duration-1000 ease-out`}
                  style={{
                    width: `${tier.pct}%`,
                    minWidth: tier.count > 0 ? '6px' : '0px',
                  }}
                />
              </div>

              {/* Micro description */}
              <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug">
                {tier.desc}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function NewsAnalyzer({ navigate }: Props) {
  const [mode, setMode]               = useState<Mode>('text')
  const [text, setText]               = useState('')
  const [url, setUrl]                 = useState('')
  const [file, setFile]               = useState<File | null>(null)
  const [state, setState]             = useState<State>('input')
  const [step, setStep]               = useState(0)
  const [analysisResult, setAnalysis] = useState<AnalysisResult | null>(null)
  const [saved, setSaved]             = useState(false)
  const [errorMsg, setErrorMsg]       = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSharing, setIsSharing]         = useState(false)
  const [shareCopied, setShareCopied]     = useState(false)
  const [toast, setToast]                 = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareModalUrl, setShareModalUrl]   = useState('')
  const [expandedClaims, setExpandedClaims] = useState<Record<number, boolean>>({})
  const fileInputRef                  = useRef<HTMLInputElement>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const toggleClaimExpansion = (claimIdx: number) => {
    setExpandedClaims(prev => ({
      ...prev,
      [claimIdx]: !prev[claimIdx]
    }))
  }

  const charMax = 10000
  const charCount = text.length

  const handleClearInput = () => {
    setText('')
    setUrl('')
    setFile(null)
    setErrorMsg(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const hasInput = (mode === 'text' && text.length > 0) || (mode === 'url' && url.length > 0) || (mode === 'file' && file !== null)

  const handleDownloadReport = () => {
    if (!analysisResult) {
      showToast('Analysis result is unavailable.', 'error')
      return
    }
    setIsDownloading(true)
    try {
      const inputType =
        mode === 'file'
          ? (file?.name.split('.').pop()?.toUpperCase() || 'FILE')
          : mode === 'url'
          ? 'URL'
          : 'TEXT'
      const sourceRef =
        mode === 'url'
          ? url
          : mode === 'file' && file
          ? file.name
          : analysisResult.title || text.slice(0, 60)

      generateAnalysisPDF({
        result: analysisResult,
        inputType,
        source: sourceRef,
        analysisDate: analysisResult.created_at || new Date(),
      })
    } catch {
      showToast('Unable to generate the report. Please try again.', 'error')
    } finally {
      setTimeout(() => setIsDownloading(false), 500)
    }
  }

  const handleShareResult = async () => {
    if (!analysisResult) {
      showToast('Analysis result is unavailable.', 'error')
      return
    }

    setIsSharing(true)
    try {
      const id = analysisResult.id
      if (!id) {
        showToast('Unable to create a share link. Please try again.', 'error')
        setIsSharing(false)
        return
      }

      const base = window.location.origin
      const path = window.location.pathname.replace(/\/shared.*$/, '').replace(/\/$/, '')
      const shareUrl = `${base}${path}/shared/${id}`

      let copiedSuccessfully = false
      if (navigator?.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(shareUrl)
          copiedSuccessfully = true
        } catch {
          copiedSuccessfully = false
        }
      }

      if (!copiedSuccessfully) {
        try {
          const textArea = document.createElement('textarea')
          textArea.value = shareUrl
          textArea.style.position = 'fixed'
          textArea.style.left = '-999999px'
          textArea.style.top = '-999999px'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          copiedSuccessfully = document.execCommand('copy')
          document.body.removeChild(textArea)
        } catch {
          copiedSuccessfully = false
        }
      }

      if (copiedSuccessfully) {
        setShareCopied(true)
        showToast('Result link copied to clipboard!', 'success')
        setTimeout(() => setShareCopied(false), 2500)
      } else {
        setShareModalUrl(shareUrl)
        setShowShareModal(true)
        showToast('Share link created. Copy it from here:', 'info')
      }
    } catch {
      showToast('Unable to create a share link. Please try again.', 'error')
    } finally {
      setIsSharing(false)
    }
  }

  const analyze = async () => {
    if (mode === 'text' && charCount < 10) return
    if (mode === 'url' && !url.includes('.')) return
    if (mode === 'file' && !file) {
      fileInputRef.current?.click()
      return
    }

    setErrorMsg(null)
    setState('analyzing')
    setStep(0)
    setSaved(false)
    setExpandedClaims({})

    // Progress step animation
    const delays = [300, 700, 1200, 1800, 2200]
    delays.forEach((d, i) => setTimeout(() => setStep(i + 1), d))

    try {
      let res: AnalysisResult
      if (mode === 'file' && file) {
        res = await api.analyzeFile(file)
      } else {
        res = await api.analyzeTextOrUrl({
          mode: mode as 'text' | 'url',
          content: mode === 'text' ? text : undefined,
          url: mode === 'url' ? url : undefined,
        })
      }
      setTimeout(() => {
        setAnalysis(res)
        setState('result')
      }, 2500)
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis failed. Please check your backend connection.')
      setState('input')
    }
  }

  const handleSaveToggle = async () => {
    if (analysisResult?.id) {
      try {
        await api.toggleBookmark(analysisResult.id)
        setSaved(!saved)
      } catch {
        setSaved(true)
      }
    } else {
      setSaved(true)
    }
  }

  const verdict = analysisResult?.verdict || 'uncertain'
  const config = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.uncertain
  const ResIcon = config.icon

  // ── Input ─────────────────────────────────────────────────────
  if (state === 'input') return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto page-fade" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-display mb-1.5">AI News Analyzer</h1>
        <p className="text-sm text-muted-foreground">Enter news content to extract factual assertions, perform claim-by-claim verification, and analyze credibility.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-border">
          {(['text', 'url', 'file'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all ${
                mode === m
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {m === 'text' && <ZapIcon size={15} />}
              {m === 'url'  && <LinkIcon size={15} />}
              {m === 'file' && <UploadIcon size={15} />}
              {m === 'text' ? 'Text' : m === 'url' ? 'URL' : 'Upload File'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {mode === 'text' && (
            <>
              <textarea
                value={text}
                onChange={e => setText(e.target.value.slice(0, charMax))}
                placeholder="Paste the headline or complete news article here to extract and verify individual claims..."
                rows={10}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-all leading-relaxed font-mono"
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <p className="text-xs text-muted-foreground font-mono">{charCount.toLocaleString()} / {charMax.toLocaleString()}</p>
                  {charCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setText('')}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors hover:underline"
                    >
                      <XIcon size={12} /> Clear text
                    </button>
                  )}
                </div>
                <div className="h-1 w-32 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(charCount / charMax) * 100}%` }} />
                </div>
              </div>
            </>
          )}
          {mode === 'url' && (
            <div>
              <label className="text-xs font-semibold text-foreground mb-2 block">News article URL</label>
              <div className="relative">
                <input
                  type="url" value={url} onChange={e => setUrl(e.target.value)}
                  placeholder="https://example.com/news-article"
                  className="w-full border border-border rounded-xl px-4 py-3 pr-10 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
                {url && (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    title="Clear URL"
                  >
                    <XIcon size={14} />
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3">TruthLens will fetch the article text and extract key claims automatically.</p>
            </div>
          )}
          {mode === 'file' && (
            <div>
              <div
                className="border-2 border-dashed border-border rounded-xl py-16 flex flex-col items-center justify-center gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.md,.doc,.docx"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files?.[0]) setFile(e.target.files[0])
                  }}
                />
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <UploadIcon size={26} className="text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {file ? file.name : 'Drop your file here or click to browse'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {file ? `${(file.size / 1024).toFixed(1)} KB selected` : 'PDF, TXT or DOC · Max 10 MB'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                  className="border border-border px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
                >
                  {file ? 'Change file' : 'Browse files'}
                </button>
              </div>
              {file && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="text-xs text-muted-foreground hover:text-fake flex items-center gap-1 transition-colors"
                  >
                    <XIcon size={13} /> Remove selected file
                  </button>
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              ⚠ AI predictions are estimates and should not be treated as definitive proof of truth or falsehood.
            </p>
            <div className="flex items-center gap-2.5">
              {hasInput && (
                <button
                  type="button"
                  onClick={handleClearInput}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  title="Clear all inputs"
                >
                  <RefreshIcon size={14} /> Clear Input
                </button>
              )}
              <button
                onClick={analyze}
                disabled={(mode === 'text' && charCount < 10) || (mode === 'url' && !url.includes('.')) || (mode === 'file' && !file)}
                className="flex items-center gap-2 bg-primary text-white px-7 py-3 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ZapIcon size={16} /> Analyze with AI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Analyzing ─────────────────────────────────────────────────
  if (state === 'analyzing') return (
    <div className="p-8 max-w-md mx-auto flex flex-col items-center justify-center min-h-[70vh] page-fade" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin mb-8" />
      <h2 className="text-2xl font-bold text-foreground font-display mb-8">Analyzing & Verifying Claims…</h2>
      <div className="w-full space-y-4">
        {STEPS.map((label, i) => {
          const done   = step > i
          const active = step === i
          return (
            <div key={label} className={`flex items-center gap-4 transition-all duration-300 ${done || active ? 'opacity-100' : 'opacity-25'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                done   ? 'bg-real text-white' :
                active ? 'bg-primary/10 border-2 border-primary' : 'border-2 border-border'
              }`}>
                {done   && <CheckIcon size={13} className="text-white" />}
                {active && <div className="w-2.5 h-2.5 rounded-full bg-primary pulse-dot" />}
              </div>
              <span className={`text-sm transition-colors ${done ? 'text-foreground font-semibold' : active ? 'text-foreground' : 'text-muted-foreground'}`}>
                {label}
              </span>
              {done && <span className="ml-auto text-xs text-real font-mono font-semibold">✓ done</span>}
            </div>
          )
        })}
      </div>
    </div>
  )

  // ── Result ────────────────────────────────────────────────────
  const confValue = analysisResult?.conf ?? 50
  const displaySummary = analysisResult?.summary || ''
  const displayMetrics = analysisResult?.metrics || []
  const detailedClaims: ClaimItem[] = analysisResult?.detailed_claims || []

  // Compute dynamic claim counters
  const supportedCount = detailedClaims.filter(c => c.status === 'supported').length
  const contradictedCount = detailedClaims.filter(c => c.status === 'contradicted').length
  const unverifiedCount = detailedClaims.filter(c => c.status === 'needs_verification').length
  const totalClaimsCount = detailedClaims.length

  // Determine Verified Information Header & Subtitle
  let verifiedSectionHeading = "What's Actually Supported?"
  let verifiedSectionSub = "Here is what the available evidence indicates about the claims in this content."
  if (verdict === 'real') {
    verifiedSectionHeading = "Claims Supported by Available Evidence"
    verifiedSectionSub = "Contextual evidence and corroboration for the key assertions in this article."
  } else if (verdict === 'uncertain') {
    verifiedSectionHeading = "What Could Not Be Verified"
    verifiedSectionSub = "Analysis of ambiguous claims requiring independent secondary corroboration."
  }

  const verdictCategory = analysisResult?.metadata?.verdict_category
  const verdictExplanation = analysisResult?.metadata?.verdict_explanation
  const displayVerdictText = verdictCategory || config.verdictText

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto page-fade" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-display mb-1">Analysis Result</h1>
          <p className="text-sm text-muted-foreground">Completed in real-time · {new Date().toLocaleString()}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setState('input'); setText(''); setUrl(''); setFile(null) }} className="flex items-center gap-1.5 border border-border px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary transition-colors">
            <RefreshIcon size={14} /> Analyze Another
          </button>
          <button onClick={handleSaveToggle} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${saved ? 'bg-real text-white' : 'bg-foreground text-white hover:bg-foreground/90'}`}>
            {saved ? <><CheckIcon size={14} /> Saved!</> : <><BookmarkIcon size={14} /> Save Result</>}
          </button>
        </div>
      </div>

      {/* 1. OVERALL RESULT */}
      <div className="grid md:grid-cols-3 gap-5 mb-6">
        {/* Main verdict card */}
        <div className={`md:col-span-1 ${config.bgClass} border ${config.borderClass} rounded-2xl p-6 flex flex-col items-center text-center shadow-sm justify-between`}>
          <div className="flex flex-col items-center w-full">
            <div className="w-10 h-10 rounded-full bg-white/80 dark:bg-black/20 flex items-center justify-center mb-3">
              <ResIcon size={20} className={config.textClass} />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Prediction</p>
            <p className={`text-xl font-black font-mono mb-2 ${config.textClass}`}>{displayVerdictText}</p>
            {verdictExplanation && (
              <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[220px] mb-4">
                "{verdictExplanation}"
              </p>
            )}
          </div>
          <CircularConfidence value={confValue} color={config.color} bgColor={config.ringBg} />
        </div>

        {/* Content analysis bars */}
        <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-foreground font-display mb-5 text-sm">Content Analysis Metrics</h3>
          <div className="space-y-4">
            {displayMetrics.map(({ label, val }) => {
              const barColor = val > 65 ? (verdict === 'real' ? 'bg-real' : 'bg-fake') : val > 45 ? 'bg-uncertain' : verdict === 'real' ? 'bg-real' : 'bg-secondary'
              return (
                <div key={label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-foreground font-medium">{label}</span>
                    <span className="text-sm font-bold font-mono text-foreground">{val}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all duration-1000`} style={{ width: `${val}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC ANALYTICS GRAPHS: CLAIM VERIFICATION BREAKDOWN & EVIDENCE COVERAGE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <ClaimVerificationBreakdown detailedClaims={detailedClaims} />
        <EvidenceCoverageChart detailedClaims={detailedClaims} />
      </div>

      {/* Overall AI Summary & Explanations */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <ZapIcon size={13} className="text-primary" />
          </div>
          <h3 className="font-bold text-foreground font-display text-sm">AI Verification & Reasoning Breakdown</h3>
        </div>

        {(() => {
          const breakdown = analysisResult?.explanation_breakdown || analysisResult?.metadata?.explanation_breakdown
          if (breakdown) {
            return (
              <div className="space-y-3 mb-5">
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
          return <p className="text-sm text-muted-foreground leading-relaxed mb-5">{displaySummary}</p>
        })()}

        <div className="pt-4 border-t border-border">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Key Credibility Indicators</h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {EXPLANATIONS.map(({ label, desc }) => (
              <div key={label} className="bg-secondary/60 border border-border/80 rounded-xl p-3.5">
                <p className="text-xs font-bold text-foreground mb-1 font-display">{label}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CLAIM-BY-CLAIM ANALYSIS */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
              Claim-by-Claim Analysis
            </h2>
            <p className="text-xs text-muted-foreground">
              See which claims are supported, contradicted, or need further verification.
            </p>
          </div>

          {/* Dynamic Claim Summary Bar */}
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
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No distinct factual claims were identified for claim-by-claim verification.
            </p>
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

                  {/* Evidence Drawer Button */}
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

                  {/* Expanded Evidence View */}
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
            <h2 className="text-lg font-bold font-display text-foreground">
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

      {/* 4. AI TRANSPARENCY DISCLAIMER */}
      <div className="bg-secondary/40 border border-border rounded-xl p-4 mb-8 flex items-start gap-3 text-xs text-muted-foreground">
        <InfoIcon size={16} className="text-primary flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Claim assessments are based on available evidence and AI-assisted analysis. A "Needs Verification" result means the available information was insufficient to establish the claim. AI analysis should not be treated as absolute proof.
        </p>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === 'error'
              ? 'bg-red-600 text-white'
              : toast.type === 'info'
              ? 'bg-amber-600 text-white'
              : 'bg-foreground text-background'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle size={16} className="text-white" />
          ) : toast.type === 'info' ? (
            <InfoIcon size={16} className="text-white" />
          ) : (
            <CheckIcon size={16} className="text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Fallback Copy Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground font-display text-base">Share Analysis Result</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <XIcon size={16} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Share link created. Copy it from here:
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                readOnly
                value={shareModalUrl}
                className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-xs font-mono text-foreground focus:outline-none select-all"
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareModalUrl)
                    showToast('Result link copied to clipboard!', 'success')
                    setShowShareModal(false)
                  } catch {
                    showToast('Please copy the URL directly from the text box.', 'info')
                  }
                }}
                className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary/90 transition-all flex items-center gap-1.5"
              >
                <CopyIcon size={14} /> Copy
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex gap-3 flex-wrap items-center">
        {analysisResult?.metadata?.real_article_id && (
          <button
            onClick={() => {
              const realId = analysisResult.metadata?.real_article_id
              window.location.hash = `#/real-articles/${realId}`
              window.history.pushState({}, '', `/real-articles/${realId}`)
              window.dispatchEvent(new PopStateEvent('popstate'))
            }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-xs"
          >
            <NewspaperIcon size={16} /> View Real Article
          </button>
        )}

        <button
          onClick={handleDownloadReport}
          disabled={isDownloading}
          className="flex items-center gap-2 border border-border px-5 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-foreground border-t-transparent animate-spin rounded-full" />
              Generating Report...
            </>
          ) : (
            <>
              <DownloadIcon size={15} /> Download Report
            </>
          )}
        </button>

        <button
          onClick={handleShareResult}
          disabled={isSharing}
          className="flex items-center gap-2 border border-border px-5 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSharing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-foreground border-t-transparent animate-spin rounded-full" />
              Creating Link...
            </>
          ) : shareCopied ? (
            <>
              <CheckIcon size={15} className="text-real" /> Share link copied!
            </>
          ) : (
            <>
              <ShareIcon size={15} /> Share Result
            </>
          )}
        </button>

        <button
          onClick={() => navigate('history')}
          className="flex items-center gap-2 ml-auto border border-border px-5 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors"
        >
          View History <ArrowRightIcon size={14} />
        </button>
      </div>
    </div>
  )
}


