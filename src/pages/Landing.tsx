import { Page } from '../App'
import {
  ShieldIcon, ZapIcon, BrainIcon, CheckCircleIcon, ArrowRightIcon, CheckIcon,
  TrendingUpIcon, InfoIcon, FileTextIcon, SearchIcon, ChevronRightIcon
} from '../components/Icons'

interface Props { navigate: (page: Page) => void }

const FEATURES = [
  { Icon: ZapIcon,        title: 'AI-Powered Analysis',   desc: 'Our ML model processes articles in seconds, identifying linguistic patterns associated with misinformation.' },
  { Icon: BrainIcon,      title: 'NLP-Based Detection',   desc: 'Natural Language Processing extracts key features — sentiment, claim density, sensationalism signals.' },
  { Icon: InfoIcon,       title: 'Explainable Results',   desc: 'Every verdict comes with detailed reasoning. Understand exactly why the AI flagged the content.' },
  { Icon: TrendingUpIcon, title: 'Confidence Score',      desc: 'A precise percentage score reflects the model certainty, with uncertainty zones highlighted clearly.' },
]

const HOW_IT_WORKS_STEPS = [
  {
    step: 'STEP 1',
    title: 'Enter the News',
    desc: 'Paste a news article, headline, claim, or upload a PDF/TXT file.',
    Icon: FileTextIcon,
    tag: 'Input',
  },
  {
    step: 'STEP 2',
    title: 'AI Analysis',
    desc: 'TruthLens AI analyzes the content using AI-powered language and credibility signals.',
    Icon: BrainIcon,
    tag: 'NLP & ML',
  },
  {
    step: 'STEP 3',
    title: 'Check the Evidence',
    desc: 'The system examines relevant information and identifies signals that may indicate misinformation.',
    Icon: SearchIcon,
    tag: 'Verification',
  },
  {
    step: 'STEP 4',
    title: 'Get an Explanation',
    desc: 'Receive a clear result with an understandable explanation instead of just a simple real/fake label.',
    Icon: CheckCircleIcon,
    tag: 'Explainability',
  },
]

const STATS = [
  { value: '94.2%', label: 'Detection accuracy' },
  { value: '50K+',  label: 'Analyses completed' },
  { value: '<2s',   label: 'Average response time' },
  { value: '12',    label: 'NLP feature signals' },
]

export default function Landing({ navigate }: Props) {
  const scrollToHowItWorks = (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    const element = document.getElementById('how-it-works')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShieldIcon size={16} className="text-white" />
            </div>
            <span className="font-bold text-foreground font-display">TruthLens AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </button>
            <a
              href="#how-it-works"
              onClick={scrollToHowItWorks}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('login')}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('signup')}
              className="text-sm font-semibold bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-14">
          {/* Copy */}
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-7 tracking-wide">
              <ShieldIcon size={13} /> AI-Powered Fact Detection
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.08] mb-5 font-display text-foreground tracking-tight">
              Know What's Real.<br />
              <span className="text-primary">Detect What's Fake.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 font-light">
              Use AI and Natural Language Processing to analyze news content and identify potentially misleading information — with full explainability.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => navigate('login')}
                className="flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
              >
                Analyze News <ArrowRightIcon size={16} />
              </button>
              <a
                href="#how-it-works"
                onClick={scrollToHowItWorks}
                className="flex items-center gap-2 border border-border text-foreground px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-secondary transition-colors"
              >
                How It Works
              </a>
            </div>
            <div className="flex flex-wrap gap-5 mt-9">
              {['No credit card', 'Instant results', 'Explainable AI'].map(t => (
                <div key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckIcon size={13} className="text-real" /> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual — analysis preview card */}
          <div className="flex-1 w-full max-w-md">
            <div className="bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
              {/* Card header */}
              <div className="bg-foreground px-5 py-4 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <ShieldIcon size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white font-display">TruthLens Analysis</p>
                  <p className="text-xs text-white/40">Powered by NLP + ML</p>
                </div>
                <div className="ml-auto flex gap-1.5">
                  {['bg-red-500', 'bg-yellow-500', 'bg-green-500'].map(c => (
                    <div key={c} className={`w-2.5 h-2.5 rounded-full ${c} opacity-70`} />
                  ))}
                </div>
              </div>

              {/* Article snippet */}
              <div className="px-5 pt-4 pb-3 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Analyzing article</p>
                <p className="text-sm text-foreground leading-snug line-clamp-2 font-medium">
                  "Scientists confirm new study reveals 5G towers emit radiation that causes DNA damage in humans..."
                </p>
              </div>

              {/* Result */}
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Verdict</p>
                    <span className="inline-flex items-center gap-1.5 bg-fake-bg text-fake border border-fake-border px-3 py-1.5 rounded-full text-xs font-bold">
                      ⚠ LIKELY FAKE
                    </span>
                  </div>
                  {/* Mini confidence ring */}
                  <div className="relative w-14 h-14">
                    <svg width="56" height="56" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="22" fill="none" stroke="#FEE2E2" strokeWidth="6" />
                      <circle cx="28" cy="28" r="22" fill="none" stroke="#DC2626" strokeWidth="6"
                        strokeDasharray="117 138.2" strokeLinecap="round"
                        transform="rotate(-90 28 28)" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-fake font-mono">87%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { label: 'Sensationalism', val: 81, color: 'bg-fake' },
                    { label: 'Emotional Language', val: 72, color: 'bg-uncertain' },
                    { label: 'Source Reliability', val: 34, color: 'bg-real' },
                  ].map(({ label, val, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{label}</span>
                        <span className="font-mono font-semibold text-foreground">{val}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-foreground py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold text-white font-display mb-1">{value}</p>
              <p className="text-sm text-white/50">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <section id="features" className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Core capabilities</p>
          <h2 className="text-4xl font-bold font-display text-foreground">Built for precision</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="group p-6 bg-card rounded-2xl border border-border hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <Icon size={20} className="text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2 text-sm font-display">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section (In-page scroll target) */}
      <section id="how-it-works" className="py-24 px-6 md:px-10 bg-secondary/40 border-y border-border scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1 rounded-full text-xs font-semibold mb-3 tracking-wide">
              Simple 4-Step Process
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-3">
              How TruthLens Works
            </h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Understand how your news is analyzed in just a few steps.
            </p>
          </div>

          {/* 4 Cards Grid with subtle desktop connectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {HOW_IT_WORKS_STEPS.map((stepItem, idx) => {
              const { step, title, desc, Icon, tag } = stepItem
              return (
                <div key={step} className="relative flex flex-col">
                  {/* Subtle connecting line & arrow on desktop */}
                  {idx < HOW_IT_WORKS_STEPS.length - 1 && (
                    <div className="hidden lg:flex items-center absolute -right-3 top-10 z-20 text-muted-foreground/40 pointer-events-none">
                      <ChevronRightIcon size={18} />
                    </div>
                  )}

                  <div className="bg-card border border-border rounded-2xl p-6 h-full flex flex-col justify-between hover:shadow-md hover:border-primary/30 transition-all duration-200">
                    <div>
                      {/* Step Header with Icon & Tag */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                          <Icon size={22} />
                        </div>
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">
                          {step}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-lg font-bold font-display text-foreground mb-2.5">
                        {title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {desc}
                      </p>
                    </div>

                    {/* Bottom sub-indicator */}
                    <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground font-medium">{tag}</span>
                      <div className="w-2 h-2 rounded-full bg-primary/40" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-14 text-center flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <span className="text-sm font-medium text-foreground">Ready to check a claim?</span>
            <button
              onClick={() => navigate('login')}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              Analyze News <ArrowRightIcon size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-primary rounded-3xl p-14 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-4 border-white" />
              <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full border-2 border-white" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-4">Start free</p>
              <h2 className="text-3xl font-bold text-white font-display mb-4">Ready to detect misinformation?</h2>
              <p className="text-sm text-white/70 mb-8 leading-relaxed">
                Join thousands of journalists, researchers, and readers using TruthLens to verify the news they read.
              </p>
              <button
                onClick={() => navigate('signup')}
                className="bg-white text-primary px-10 py-4 rounded-xl text-sm font-bold hover:bg-white/95 transition-colors shadow-xl"
              >
                Get Started — It's Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <ShieldIcon size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold text-foreground font-display">TruthLens AI</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 TruthLens AI. For informational purposes only.</p>
          <div className="flex gap-5 text-xs text-muted-foreground">
            <button className="hover:text-foreground transition-colors">Privacy</button>
            <button className="hover:text-foreground transition-colors">Terms</button>
            <button className="hover:text-foreground transition-colors">API</button>
          </div>
        </div>
      </footer>
    </div>
  )
}

