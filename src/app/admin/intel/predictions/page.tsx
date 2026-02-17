'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PiChartLineUpBold,
  PiTrendUpBold,
  PiTrendDownBold,
  PiTargetBold,
  PiLightningBold,
  PiArrowsClockwiseBold,
  PiBrainBold,
  PiEyeBold,
  PiRocketBold,
} from 'react-icons/pi'
import {
  fetchIntelEntries,
  fetchCompetitorProfiles,
  getMarketTrends,
  type IntelEntry,
  type CompetitorProfile,
} from '@/lib/intel-api'
import '../intel-admin.css'

// ---------------------------------------------------------------------------
// Types — Prediction Engine
// ---------------------------------------------------------------------------

type TrendDirection = 'rising' | 'stable' | 'declining'
type ConfidenceLevel = 'high' | 'medium' | 'low'

interface Prediction {
  id: string
  title: string
  description: string
  category: string
  direction: TrendDirection
  confidence: number
  confidenceLevel: ConfidenceLevel
  timeframe: string
  signals: string[]
  impact: string
  generatedAt: string
}

interface EmergingOpportunity {
  id: string
  title: string
  description: string
  signalStrength: number
  sources: string[]
  actionItems: string[]
  detectedAt: string
}

// ---------------------------------------------------------------------------
// Seed data — Predictions
// ---------------------------------------------------------------------------

const SEED_PREDICTIONS: Prediction[] = [
  {
    id: 'pred-001',
    title: 'PaaS Market Consolidation Accelerating',
    description: 'Top 3 players (Vercel, Cloudflare, Netlify) will control 55%+ of static hosting by Q3 2026. Mid-tier providers face margin pressure.',
    category: 'market',
    direction: 'rising',
    confidence: 87,
    confidenceLevel: 'high',
    timeframe: 'Q3 2026',
    signals: ['Vercel 25% market share', 'Netlify layoffs', 'Cloudflare Pages growth 50% YoY', 'Railway price increases'],
    impact: 'Positioning window narrowing — differentiation on decentralization is increasingly critical',
    generatedAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'pred-002',
    title: 'Decentralized Compute Adoption Inflection Point',
    description: 'DePIN compute networks will cross $1B cumulative revenue by Q4 2026, triggering mainstream enterprise interest.',
    category: 'depin',
    direction: 'rising',
    confidence: 78,
    confidenceLevel: 'medium',
    timeframe: 'Q4 2026',
    signals: ['340% YoY DePIN revenue growth', 'a16z investment thesis', 'Kelsey Hightower endorsement', '62% developer interest in survey'],
    impact: 'AF should prepare enterprise GTM and compliance posture for the incoming wave',
    generatedAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'pred-003',
    title: 'AI Workload Hosting — New Battleground',
    description: 'Every major PaaS will ship AI model deployment features by mid-2026. Late movers will lose significant developer mindshare.',
    category: 'technology',
    direction: 'rising',
    confidence: 92,
    confidenceLevel: 'high',
    timeframe: 'Q2 2026',
    signals: ['Cloudflare Workers AI GA', 'Render AI Deploy', 'Fly.io GPU expansion', 'Vercel AI SDK growth'],
    impact: 'AI agent hosting on Akash GPU network is a strong differentiator — accelerate this roadmap',
    generatedAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'pred-004',
    title: 'Bill Shock Backlash Driving Migration',
    description: 'Unpredictable pricing from Vercel/Netlify creating sustained migration wave. Cost-transparent platforms will capture 5-8% migration share.',
    category: 'pricing',
    direction: 'rising',
    confidence: 74,
    confidenceLevel: 'medium',
    timeframe: 'Ongoing',
    signals: ['Viral HN bill shock post', 'Netlify adds spending caps', 'Reddit cost discussions', 'Railway price increase backlash'],
    impact: 'On-chain pricing transparency is a key differentiator — double down on cost messaging',
    generatedAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'pred-005',
    title: 'IPFS 3.0 Will Boost Content Delivery Speed',
    description: 'IPFS 3.0 Accelerated DHT will make IPFS-hosted sites competitive with traditional CDN performance, removing a major objection.',
    category: 'technology',
    direction: 'rising',
    confidence: 82,
    confidenceLevel: 'high',
    timeframe: 'Q3 2026',
    signals: ['IPFS 3.0 announcement', '10x routing improvement', 'Protocol Labs investment', 'Growing IPFS node count'],
    impact: 'Upgrade hosting infrastructure as soon as IPFS 3.0 releases — performance parity is a game-changer',
    generatedAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'pred-006',
    title: 'Render IPO Could Reshape Competitive Landscape',
    description: 'If Render IPOs at $2-3B, increased marketing spend and enterprise sales motion will intensify competition in mid-market.',
    category: 'competitor',
    direction: 'stable',
    confidence: 58,
    confidenceLevel: 'low',
    timeframe: 'Q4 2026',
    signals: ['Bloomberg IPO report', 'Render revenue growth', 'AI Deploy feature launch', 'Mid-market positioning'],
    impact: 'Monitor closely — AF should establish mid-market presence before Render IPO marketing blitz',
    generatedAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'pred-007',
    title: 'Heroku Reboot May Recapture Enterprise Segment',
    description: 'Heroku Next-Gen on Kubernetes could revive their enterprise value prop. Salesforce backing gives them deep pockets.',
    category: 'competitor',
    direction: 'stable',
    confidence: 45,
    confidenceLevel: 'low',
    timeframe: 'Q3 2026',
    signals: ['Heroku K8s rebuild', 'Salesforce integration', 'Enterprise customer base', 'Container support'],
    impact: 'Low confidence — Heroku track record of slow execution. Monitor but do not pivot strategy.',
    generatedAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'pred-008',
    title: 'Web3 Developer Pool Growing Rapidly',
    description: 'Web3 developer ecosystem will exceed 35K monthly active contributors by end of 2026, creating larger addressable market for AF.',
    category: 'market',
    direction: 'rising',
    confidence: 80,
    confidenceLevel: 'high',
    timeframe: '2026',
    signals: ['Coinbase: 45% developer growth', 'Electric Capital: Akash 1,200+ devs', 'DePIN 120% dev growth', 'Web3 bootcamp expansion'],
    impact: 'Developer advocacy and DevRel investment will yield higher returns as pool grows',
    generatedAt: '2026-02-15T08:00:00Z',
  },
]

const SEED_OPPORTUNITIES: EmergingOpportunity[] = [
  {
    id: 'opp-001',
    title: 'Vercel Bill Shock Migration Wave',
    description: 'Developers leaving Vercel due to unpredictable pricing. Create targeted migration guides and pricing comparison tools.',
    signalStrength: 88,
    sources: ['Hacker News', 'Reddit r/webdev', 'Twitter/X'],
    actionItems: ['Create Vercel→AF migration guide', 'Build pricing calculator widget', 'Target bill shock discussions with content'],
    detectedAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 'opp-002',
    title: 'Netlify Developer Diaspora',
    description: 'Netlify layoffs creating uncertainty. Displaced DevRel and community members may champion alternative platforms.',
    signalStrength: 76,
    sources: ['The Verge', 'LinkedIn', 'Twitter/X'],
    actionItems: ['Reach out to displaced Netlify DevRels', 'Publish "Welcome Netlify developers" content', 'Offer migration credits'],
    detectedAt: '2026-02-14T13:00:00Z',
  },
  {
    id: 'opp-003',
    title: 'AI Agent Hosting Gap',
    description: 'No platform offers seamless AI agent deployment on decentralized compute. First mover advantage is available.',
    signalStrength: 92,
    sources: ['a16z thesis', 'Developer surveys', 'Competitor feature gaps'],
    actionItems: ['Ship AI agent deployment templates', 'Create GPU compute marketplace integration', 'Partner with AI framework authors'],
    detectedAt: '2026-02-13T08:00:00Z',
  },
  {
    id: 'opp-004',
    title: 'IPFS Performance Narrative Shift',
    description: 'IPFS 3.0 can flip the "IPFS is slow" narrative. First platform to integrate gains trust advantage.',
    signalStrength: 72,
    sources: ['IPFS Blog', 'Protocol Labs', 'Developer forums'],
    actionItems: ['Begin IPFS 3.0 integration planning', 'Prepare benchmark comparisons', 'Draft "IPFS is fast now" content'],
    detectedAt: '2026-02-14T16:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function IntelPredictionsPage() {
  const [predictions] = useState<Prediction[]>(SEED_PREDICTIONS)
  const [opportunities] = useState<EmergingOpportunity[]>(SEED_OPPORTUNITIES)
  const [entries, setEntries] = useState<IntelEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const e = await fetchIntelEntries(50)
      setEntries(e)
      setLoading(false)
    }
    load()
  }, [])

  const trends = getMarketTrends(entries)

  function confidenceColor(level: ConfidenceLevel): string {
    if (level === 'high') return 'var(--af-signal-go)'
    if (level === 'medium') return 'var(--af-signal-wait)'
    return 'var(--af-stone-400)'
  }

  function directionIcon(d: TrendDirection) {
    if (d === 'rising') return <PiTrendUpBold style={{ color: 'var(--af-signal-go)' }} />
    if (d === 'declining') return <PiTrendDownBold style={{ color: 'var(--af-signal-stop)' }} />
    return <span style={{ color: 'var(--af-stone-400)', fontFamily: 'var(--af-font-machine)', fontSize: 12 }}>—</span>
  }

  return (
    <>
      <div className="intel-header">
        <h1>Trend Predictions</h1>
        <button className="intel-btn" onClick={() => window.location.reload()} disabled={loading}>
          <PiArrowsClockwiseBold /> Refresh
        </button>
      </div>

      <div className="intel-subnav">
        <Link href="/admin/intel">Overview</Link>
        <Link href="/admin/intel/competitors">Competitors</Link>
        <Link href="/admin/intel/alerts">Alerts</Link>
        <Link href="/admin/intel/signals">Signals</Link>
        <Link href="/admin/intel/predictions" className="active">Predictions</Link>
      </div>

      {/* Stats */}
      <div className="intel-stats">
        <div className="intel-stat-card">
          <div className="intel-stat-icon"><PiBrainBold /></div>
          <div className="intel-stat-info">
            <div className="intel-stat-value">{predictions.length}</div>
            <div className="intel-stat-label">Active Predictions</div>
          </div>
        </div>
        <div className="intel-stat-card">
          <div className="intel-stat-icon" style={{ background: 'color-mix(in srgb, var(--af-signal-go) 10%, white)', color: 'var(--af-signal-go)' }}>
            <PiTrendUpBold />
          </div>
          <div className="intel-stat-info">
            <div className="intel-stat-value">{predictions.filter((p) => p.confidenceLevel === 'high').length}</div>
            <div className="intel-stat-label">High Confidence</div>
          </div>
        </div>
        <div className="intel-stat-card">
          <div className="intel-stat-icon" style={{ background: 'color-mix(in srgb, var(--af-terra) 10%, white)', color: 'var(--af-terra)' }}>
            <PiRocketBold />
          </div>
          <div className="intel-stat-info">
            <div className="intel-stat-value">{opportunities.length}</div>
            <div className="intel-stat-label">Opportunities</div>
          </div>
        </div>
        <div className="intel-stat-card">
          <div className="intel-stat-icon" style={{ background: 'color-mix(in srgb, var(--af-patina) 10%, white)', color: 'var(--af-patina)' }}>
            <PiTargetBold />
          </div>
          <div className="intel-stat-info">
            <div className="intel-stat-value">{Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length)}%</div>
            <div className="intel-stat-label">Avg Confidence</div>
          </div>
        </div>
      </div>

      <div className="intel-grid">
        {/* Predictions List */}
        <div className="intel-section">
          <div className="intel-section-header">
            <h3 className="intel-section-title">
              <PiBrainBold style={{ marginRight: 6, verticalAlign: -2 }} />
              ML-Powered Forecasts
            </h3>
          </div>
          <div className="intel-section-body">
            <div className="intel-timeline">
              {predictions.map((pred) => (
                <div
                  key={pred.id}
                  className="intel-timeline-item"
                  style={{ cursor: 'pointer', borderLeftWidth: 3, borderLeftColor: confidenceColor(pred.confidenceLevel) }}
                  onClick={() => setSelectedPrediction(selectedPrediction?.id === pred.id ? null : pred)}
                >
                  <div style={{ flexShrink: 0, marginTop: 2 }}>{directionIcon(pred.direction)}</div>
                  <div className="intel-timeline-content">
                    <h4 className="intel-timeline-title">{pred.title}</h4>
                    <p className="intel-timeline-summary">{pred.description}</p>
                    <div className="intel-timeline-meta">
                      <span className={`intel-sentiment ${pred.confidenceLevel === 'high' ? 'positive' : pred.confidenceLevel === 'medium' ? 'neutral' : 'negative'}`}>
                        {pred.confidence}% confidence
                      </span>
                      <span>{pred.category}</span>
                      <span>{pred.timeframe}</span>
                    </div>

                    {selectedPrediction?.id === pred.id && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--af-stone-200)' }}>
                        <div style={{ marginBottom: 8 }}>
                          <span style={{ fontFamily: 'var(--af-font-architect)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--af-stone-500)' }}>
                            Supporting Signals
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                            {pred.signals.map((s) => (
                              <span key={s} className="intel-sentiment neutral" style={{ fontSize: 10, padding: '2px 8px' }}>{s}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontFamily: 'var(--af-font-architect)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--af-stone-500)' }}>
                            Impact Assessment
                          </span>
                          <p style={{ fontFamily: 'var(--af-font-architect)', fontSize: 13, color: 'var(--af-stone-600)', margin: '4px 0 0', lineHeight: 1.5 }}>
                            {pred.impact}
                          </p>
                        </div>
                        {/* Confidence bar */}
                        <div style={{ marginTop: 8 }}>
                          <div className="intel-market-share-bar" style={{ height: 12 }}>
                            <div
                              className="intel-market-share-fill"
                              style={{
                                width: `${pred.confidence}%`,
                                background: confidenceColor(pred.confidenceLevel),
                                fontSize: 9,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emerging Opportunities + Trending Tags */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Emerging Opportunities */}
          <div className="intel-section">
            <div className="intel-section-header">
              <h3 className="intel-section-title">
                <PiRocketBold style={{ marginRight: 6, verticalAlign: -2 }} />
                Emerging Opportunities
              </h3>
            </div>
            <div className="intel-section-body">
              {opportunities.map((opp) => (
                <div key={opp.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--af-stone-100)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h4 style={{ fontFamily: 'var(--af-font-architect)', fontSize: 14, fontWeight: 600, color: 'var(--af-stone-800)', margin: 0 }}>
                      {opp.title}
                    </h4>
                    <span className="intel-sentiment positive" style={{ fontSize: 10 }}>
                      {opp.signalStrength}% signal
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--af-font-architect)', fontSize: 13, color: 'var(--af-stone-500)', margin: '0 0 8px', lineHeight: 1.4 }}>
                    {opp.description}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {opp.actionItems.map((item) => (
                      <span key={item} style={{ fontFamily: 'var(--af-font-architect)', fontSize: 12, color: 'var(--af-stone-600)' }}>
                        • {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signal Heatmap */}
          <div className="intel-section">
            <div className="intel-section-header">
              <h3 className="intel-section-title">
                <PiEyeBold style={{ marginRight: 6, verticalAlign: -2 }} />
                Trend Signals
              </h3>
            </div>
            <div className="intel-section-body">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {trends.slice(0, 15).map((trend) => (
                  <span
                    key={trend.trend}
                    className={`intel-sentiment ${trend.sentiment}`}
                    style={{
                      padding: '4px 12px',
                      fontSize: 12,
                      cursor: 'default',
                    }}
                  >
                    {trend.trend} ({trend.count})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
