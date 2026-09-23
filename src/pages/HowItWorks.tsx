import { Page } from '../App'
import { ShieldIcon, ArrowRightIcon, ZapIcon, BrainIcon, CheckCircleIcon, TrendingUpIcon, AlertTriangle, InfoIcon } from '../components/Icons'

interface Props { navigate: (page: Page) => void }

const PIPELINE = [
  {
    step: '01',
    label: 'News Input',
    Icon: ZapIcon,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    desc: 'Submit content via any channel — paste raw text, enter a URL, or upload a document (PDF/TXT). TruthLens extracts the article body and strips ads, navigation, and boilerplate.',
    details: ['Plain text paste', 'URL scraping', 'PDF / TXT upload', 'Headline-only mode'],
  },
  {
    step: '02',
    label: 'Text Preprocessing',
    Icon: InfoIcon,
    color: 'text-uncertain',
    bg: 'bg-uncertain-bg',
    border: 'border-uncertain-border',
    desc: 'Raw text is cleaned and normalized before analysis. Tokenization splits sentences into words; stopword removal filters common filler; lemmatization reduces words to their root form.',
    details: ['Tokenization', 'Stopword removal', 'Lemmatization', 'Unicode normalization'],
  },
  {
    step: '03',
    label: 'NLP Feature Extraction',
    Icon: BrainIcon,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    desc: 'Twelve linguistic signals are extracted: sentiment polarity, claim density, passive voice ratio, source citation count, sensationalism vocabulary, and more — each mapped to a numeric feature vector.',
    details: ['Sentiment analysis', 'Claim detection', 'Source citations', 'Sensationalism score'],
  },
  {
    step: '04',
    label: 'ML Classification',
    Icon: TrendingUpIcon,
    color: 'text-real',
    bg: 'bg-real-bg',
    border: 'border-real-border',
    desc: 'A gradient-boosted classifier trained on 50,000+ verified news articles processes the feature vector. An ensemble of three models votes on the final prediction to improve robustness.',
    details: ['50K+ training samples', 'Gradient boosting', '3-model ensemble', 'Cross-validated splits'],
  },
  {
    step: '05',
    label: 'Confidence Calculation',
    Icon: ShieldIcon,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    desc: "The model outputs a probability distribution across three classes: Likely Real, Likely Fake, and Uncertain. The winning class confidence becomes the headline score. Scores below 70% are flagged as Uncertain.",
    details: ['Probability distribution', 'Three-class verdict', 'Uncertainty thresholding', 'Calibrated scores'],
  },
  {
    step: '06',
    label: 'Explainable Result',
    Icon: CheckCircleIcon,
    color: 'text-real',
    bg: 'bg-real-bg',
    border: 'border-real-border',
    desc: 'SHAP (SHapley Additive exPlanations) values surface the top contributing signals for every verdict. You see exactly which words, patterns, and signals drove the decision — no black box.',
    details: ['SHAP value attribution', 'Top signal highlights', 'Per-claim breakdown', 'Human-readable rationale'],
  },
]

const FAQ = [
  { q: 'How accurate is TruthLens AI?',             a: 'Our model achieves 94.2% accuracy on a held-out test set of 10,000 articles, with balanced precision and recall across all three verdict classes.' },
  { q: 'Can it detect satire or opinion pieces?',    a: 'Yes. Satire is typically detected as "Uncertain" with low confidence, and opinion pieces often carry a lower sensationalism-adjusted score than outright fabricated news.' },
  { q: 'Does TruthLens store my submitted articles?', a: 'Analyses are stored in your account history so you can review past verdicts. You can delete individual entries or clear your full history at any time from your Profile.' },
  { q: 'What languages are supported?',              a: 'Currently English only. Multi-language support (Hindi, Spanish, French) is on our roadmap for Q2 2027.' },
  { q: 'Can I integrate TruthLens into my own app?', a: 'Yes — a REST API is available on Pro and Team plans. Documentation is accessible from your account dashboard.' },
]

const SIGNALS = [
  { label: 'Sensationalism',       example: 'Explosive, shocking, secret, cover-up' },
  { label: 'Emotional Language',   example: 'Outrage, scandal, betrayal, horrifying' },
  { label: 'Claim Density',        example: 'Number of verifiable claims per 100 words' },
  { label: 'Source Citations',     example: 'Named experts, data sources, study links' },
  { label: 'Passive Voice Ratio',  example: 'It was reported that / sources say' },
  { label: 'Lexical Diversity',    example: 'Vocabulary range vs. repetitive phrasing' },
]

export default function HowItWorks({ navigate }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Hero */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-6 tracking-wide">
            <ShieldIcon size={13} /> Under the hood
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-4 tracking-tight">
            How TruthLens AI Works
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            A six-stage pipeline turns raw news text into a transparent, explainable verdict — no black boxes.
          </p>
        </div>
      </div>

      {/* Pipeline steps */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-20">
        <div className="relative">
          {/* Vertical connector line (desktop) */}
          <div className="hidden md:block absolute left-[31px] top-8 bottom-8 w-px bg-border" />

          <div className="space-y-10">
            {PIPELINE.map(({ step, label, Icon, color, bg, border, desc, details }, i) => (
              <div key={step} className="relative flex flex-col md:flex-row gap-6">
                {/* Step badge */}
                <div className="flex-shrink-0 relative z-10">
                  <div className={`w-16 h-16 rounded-2xl ${bg} border-2 ${border} flex flex-col items-center justify-center shadow-sm`}>
                    <span className={`text-xs font-mono font-bold ${color} leading-none`}>{step}</span>
                    <Icon size={16} className={`${color} mt-0.5`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-card border border-border rounded-2xl p-6 hover:shadow-sm transition-shadow">
                  <h3 className={`font-bold font-display text-lg mb-2 ${color}`}>{label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{desc}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {details.map(d => (
                      <div key={d} className="flex items-center gap-2 text-xs text-foreground">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${bg.replace('bg-', 'bg-').replace('/10', '')} ${color.replace('text-', 'bg-')}`} />
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NLP Signals */}
      <section className="bg-secondary/50 py-20">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Feature engineering</p>
            <h2 className="text-3xl font-bold font-display text-foreground mb-3">12 NLP Signals Analyzed</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">Each article is scored on these linguistic dimensions. The combination distinguishes credible reporting from misinformation patterns.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SIGNALS.map(({ label, example }, i) => (
              <div key={label} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/20 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-mono font-bold text-primary">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h4 className="font-bold text-foreground text-sm font-display">{label}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{example}</p>
              </div>
            ))}
            {/* +6 more pill */}
            <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 flex items-center justify-center">
              <p className="text-sm font-bold text-primary text-center">+6 additional<br />signals in model</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Questions</p>
            <h2 className="text-3xl font-bold font-display text-foreground">Frequently Asked</h2>
          </div>

          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="bg-card border border-border rounded-2xl p-6">
                <h4 className="font-bold text-foreground font-display mb-2 text-sm">{q}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 md:px-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-foreground rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
              backgroundSize: '32px 32px'
            }} />
            <div className="relative z-10">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">Try it now</p>
              <h2 className="text-3xl font-bold text-white font-display mb-4">See it in action</h2>
              <p className="text-sm text-white/60 mb-8 leading-relaxed max-w-sm mx-auto">
                Paste any news headline and see TruthLens walk through all six stages in under two seconds.
              </p>
              <button
                onClick={() => navigate('analyzer')}
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
              >
                Analyze Now <ArrowRightIcon size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
