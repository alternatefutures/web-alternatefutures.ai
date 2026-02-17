'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PiWaveformBold,
  PiChatCircleDotsBold,
  PiNewspaperBold,
  PiChartBarBold,
  PiWarningBold,
  PiArrowsClockwiseBold,
  PiMagnifyingGlassBold,
  PiTrendUpBold,
  PiTrendDownBold,
  PiHashBold,
} from 'react-icons/pi'
import {
  fetchIntelEntries,
  getMarketTrends,
  type IntelEntry,
  type IntelSentiment,
} from '@/lib/intel-api'
import '../intel-admin.css'

// ---------------------------------------------------------------------------
// Types — Signal Detection
// ---------------------------------------------------------------------------

type SignalSource = 'social' | 'news' | 'forums' | 'blogs' | 'reports'
type AnomalyType = 'volume_spike' | 'sentiment_shift' | 'new_topic' | 'competitor_mention'

interface SocialSignal {
  id: string
  source: SignalSource
  platform: string
  content: string
  author: string
  sentiment: IntelSentiment
  engagementScore: number
  url: string
  publishedAt: string
  tags: string[]
}

interface NewsItem {
  id: string
  headline: string
  source: string
  summary: string
  sentiment: IntelSentiment
  relevanceScore: number
  url: string
  publishedAt: string
  category: string
}

interface SentimentData {
  date: string
  positive: number
  neutral: number
  negative: number
  volume: number
}

interface Anomaly {
  id: string
  type: AnomalyType
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  detectedAt: string
  relatedSignals: string[]
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_SOCIAL: SocialSignal[] = [
  { id: 'sig-001', source: 'social', platform: 'Twitter/X', content: 'Just deployed my app on decentralized hosting. 60% cheaper than Vercel and censorship-resistant. The future is here.', author: '@web3builder', sentiment: 'positive', engagementScore: 245, url: '#', publishedAt: '2026-02-15T14:00:00Z', tags: ['decentralized', 'hosting', 'cost'] },
  { id: 'sig-002', source: 'social', platform: 'Twitter/X', content: 'Got hit with a $3,800 Vercel bill this month. I have 2,000 monthly users. How is this possible?', author: '@indiedev42', sentiment: 'negative', engagementScore: 1820, url: '#', publishedAt: '2026-02-15T11:00:00Z', tags: ['vercel', 'pricing', 'bill-shock'] },
  { id: 'sig-003', source: 'social', platform: 'Reddit', content: 'Comparison: Self-hosted vs PaaS vs Decentralized hosting for a mid-size SaaS. Decentralized is surprisingly competitive.', author: 'u/cloudnative_dev', sentiment: 'positive', engagementScore: 420, url: '#', publishedAt: '2026-02-15T09:00:00Z', tags: ['comparison', 'decentralized', 'saas'] },
  { id: 'sig-004', source: 'forums', platform: 'Hacker News', content: 'Ask HN: Has anyone used Akash Network for production workloads? Looking for real-world performance data.', author: 'akash_curious', sentiment: 'neutral', engagementScore: 89, url: '#', publishedAt: '2026-02-14T22:00:00Z', tags: ['akash', 'production', 'performance'] },
  { id: 'sig-005', source: 'social', platform: 'Twitter/X', content: 'The Jamstack is dead, long live the Jamstack. Netlify layoffs signal the end of an era. What comes next?', author: '@techcritic', sentiment: 'negative', engagementScore: 3200, url: '#', publishedAt: '2026-02-14T16:00:00Z', tags: ['netlify', 'jamstack', 'layoffs'] },
  { id: 'sig-006', source: 'blogs', platform: 'Dev.to', content: 'I migrated 12 projects from Netlify to decentralized hosting in a weekend. Here\'s my guide and cost breakdown.', author: 'migration_guide', sentiment: 'positive', engagementScore: 680, url: '#', publishedAt: '2026-02-14T10:00:00Z', tags: ['migration', 'netlify', 'guide'] },
  { id: 'sig-007', source: 'social', platform: 'LinkedIn', content: 'Excited to join the decentralized cloud movement. After 5 years at AWS, I believe the next paradigm shift is happening now.', author: 'Sarah Chen', sentiment: 'positive', engagementScore: 156, url: '#', publishedAt: '2026-02-13T14:00:00Z', tags: ['talent', 'decentralized', 'aws'] },
  { id: 'sig-008', source: 'news', platform: 'TechCrunch', content: 'The rise of decentralized compute: Why developers are leaving traditional cloud providers behind.', author: 'TechCrunch Staff', sentiment: 'positive', engagementScore: 4500, url: '#', publishedAt: '2026-02-13T09:00:00Z', tags: ['decentralized', 'cloud', 'trend'] },
  { id: 'sig-009', source: 'forums', platform: 'Reddit r/devops', content: 'Hot take: Heroku\'s K8s migration is 5 years too late. Railway and Fly.io already own the developer-friendly PaaS space.', author: 'u/devops_vet', sentiment: 'negative', engagementScore: 310, url: '#', publishedAt: '2026-02-12T20:00:00Z', tags: ['heroku', 'kubernetes', 'late'] },
  { id: 'sig-010', source: 'reports', platform: 'Gartner', content: 'Decentralized infrastructure is moving from "Innovation Trigger" to "Peak of Inflated Expectations" on the Hype Cycle.', author: 'Gartner Research', sentiment: 'neutral', engagementScore: 890, url: '#', publishedAt: '2026-02-12T08:00:00Z', tags: ['gartner', 'hype-cycle', 'depin'] },
]

const SEED_NEWS: NewsItem[] = [
  { id: 'news-001', headline: 'Cloudflare Workers AI Reaches GA with 300+ Edge Locations', source: 'The Register', summary: 'Cloudflare launches serverless GPU inference at the edge.', sentiment: 'neutral', relevanceScore: 85, url: '#', publishedAt: '2026-02-15T06:00:00Z', category: 'technology' },
  { id: 'news-002', headline: 'PaaS Market Expected to Reach $230B by 2028', source: 'Gartner', summary: 'Edge compute and AI workloads are fastest-growing segments.', sentiment: 'positive', relevanceScore: 92, url: '#', publishedAt: '2026-02-14T09:00:00Z', category: 'market' },
  { id: 'news-003', headline: 'Netlify Reduces Workforce by 15% Amid Market Shift', source: 'Bloomberg', summary: 'Netlify refocuses on enterprise amid increasing competition.', sentiment: 'negative', relevanceScore: 90, url: '#', publishedAt: '2026-02-14T12:00:00Z', category: 'competitor' },
  { id: 'news-004', headline: 'IPFS 3.0 Promises 10x Faster Content Discovery', source: 'Protocol Labs', summary: 'Accelerated DHT and improved NAT traversal.', sentiment: 'positive', relevanceScore: 88, url: '#', publishedAt: '2026-02-14T15:00:00Z', category: 'technology' },
  { id: 'news-005', headline: 'Web3 Developer Ecosystem Grows 45% in 2025', source: 'Coinbase Research', summary: 'DePIN and AI-crypto intersection lead growth.', sentiment: 'positive', relevanceScore: 84, url: '#', publishedAt: '2026-02-14T09:00:00Z', category: 'market' },
  { id: 'news-006', headline: 'Render Exploring IPO at $2-3B Valuation', source: 'Bloomberg', summary: 'Cloud platform in early talks with investment banks.', sentiment: 'neutral', relevanceScore: 80, url: '#', publishedAt: '2026-02-13T08:00:00Z', category: 'competitor' },
]

const SEED_SENTIMENT: SentimentData[] = [
  { date: '2026-02-09', positive: 34, neutral: 48, negative: 18, volume: 120 },
  { date: '2026-02-10', positive: 28, neutral: 42, negative: 30, volume: 185 },
  { date: '2026-02-11', positive: 42, neutral: 40, negative: 18, volume: 145 },
  { date: '2026-02-12', positive: 38, neutral: 44, negative: 18, volume: 155 },
  { date: '2026-02-13', positive: 52, neutral: 32, negative: 16, volume: 210 },
  { date: '2026-02-14', positive: 45, neutral: 35, negative: 20, volume: 240 },
  { date: '2026-02-15', positive: 48, neutral: 36, negative: 16, volume: 195 },
]

const SEED_ANOMALIES: Anomaly[] = [
  { id: 'anom-001', type: 'volume_spike', title: 'Social Volume Spike — Netlify Layoffs', description: 'Social mentions of Netlify increased 340% in 24h following layoff announcement.', severity: 'high', detectedAt: '2026-02-14T13:00:00Z', relatedSignals: ['sig-005'] },
  { id: 'anom-002', type: 'sentiment_shift', title: 'Vercel Sentiment Turn Negative', description: 'Vercel sentiment shifted from 60% positive to 45% negative over 7 days, driven by pricing complaints.', severity: 'medium', detectedAt: '2026-02-13T10:00:00Z', relatedSignals: ['sig-002'] },
  { id: 'anom-003', type: 'new_topic', title: 'Emerging Topic: "Decentralized Hosting"', description: 'Mentions of "decentralized hosting" up 180% week-over-week across tracked platforms.', severity: 'medium', detectedAt: '2026-02-12T08:00:00Z', relatedSignals: ['sig-001', 'sig-003', 'sig-008'] },
  { id: 'anom-004', type: 'competitor_mention', title: 'Akash Network Mention Surge', description: 'Akash Network mentions increased 220% following a16z decentralized compute thesis publication.', severity: 'low', detectedAt: '2026-02-11T09:00:00Z', relatedSignals: ['sig-004'] },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function IntelSignalsPage() {
  const [signals] = useState<SocialSignal[]>(SEED_SOCIAL)
  const [news] = useState<NewsItem[]>(SEED_NEWS)
  const [sentimentData] = useState<SentimentData[]>(SEED_SENTIMENT)
  const [anomalies] = useState<Anomaly[]>(SEED_ANOMALIES)
  const [entries, setEntries] = useState<IntelEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'social' | 'news' | 'anomalies'>('social')
  const [sourceFilter, setSourceFilter] = useState<SignalSource | 'all'>('all')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const e = await fetchIntelEntries(50)
      setEntries(e)
      setLoading(false)
    }
    load()
  }, [])

  const filteredSignals = sourceFilter === 'all'
    ? signals
    : signals.filter((s) => s.source === sourceFilter)

  const totalEngagement = signals.reduce((acc, s) => acc + s.engagementScore, 0)
  const avgSentiment = sentimentData.length > 0
    ? sentimentData[sentimentData.length - 1]
    : { positive: 0, neutral: 0, negative: 0, volume: 0 }

  const maxVolume = Math.max(...sentimentData.map((d) => d.volume))

  return (
    <>
      <div className="intel-header">
        <h1>Signal Detection</h1>
        <button className="intel-btn" onClick={() => window.location.reload()} disabled={loading}>
          <PiArrowsClockwiseBold /> Refresh
        </button>
      </div>

      <div className="intel-subnav">
        <Link href="/admin/intel">Overview</Link>
        <Link href="/admin/intel/competitors">Competitors</Link>
        <Link href="/admin/intel/alerts">Alerts</Link>
        <Link href="/admin/intel/signals" className="active">Signals</Link>
        <Link href="/admin/intel/predictions">Predictions</Link>
      </div>

      {/* Stats */}
      <div className="intel-stats">
        <div className="intel-stat-card">
          <div className="intel-stat-icon"><PiWaveformBold /></div>
          <div className="intel-stat-info">
            <div className="intel-stat-value">{signals.length}</div>
            <div className="intel-stat-label">Tracked Signals</div>
          </div>
        </div>
        <div className="intel-stat-card">
          <div className="intel-stat-icon" style={{ background: 'color-mix(in srgb, var(--af-terra) 10%, white)', color: 'var(--af-terra)' }}>
            <PiChatCircleDotsBold />
          </div>
          <div className="intel-stat-info">
            <div className="intel-stat-value">{totalEngagement.toLocaleString()}</div>
            <div className="intel-stat-label">Total Engagement</div>
          </div>
        </div>
        <div className="intel-stat-card">
          <div className="intel-stat-icon" style={{ background: 'color-mix(in srgb, var(--af-signal-go) 10%, white)', color: 'var(--af-signal-go)' }}>
            <PiTrendUpBold />
          </div>
          <div className="intel-stat-info">
            <div className="intel-stat-value">{avgSentiment.positive}%</div>
            <div className="intel-stat-label">Positive Sentiment</div>
          </div>
        </div>
        <div className="intel-stat-card">
          <div className="intel-stat-icon" style={{ background: 'color-mix(in srgb, var(--af-signal-stop) 10%, white)', color: 'var(--af-signal-stop)' }}>
            <PiWarningBold />
          </div>
          <div className="intel-stat-info">
            <div className="intel-stat-value">{anomalies.length}</div>
            <div className="intel-stat-label">Anomalies</div>
          </div>
        </div>
      </div>

      {/* Sentiment Tracker */}
      <div className="intel-section" style={{ marginBottom: 20 }}>
        <div className="intel-section-header">
          <h3 className="intel-section-title">
            <PiChartBarBold style={{ marginRight: 6, verticalAlign: -2 }} />
            7-Day Sentiment Tracker
          </h3>
        </div>
        <div className="intel-section-body">
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120 }}>
            {sentimentData.map((day) => (
              <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1, height: `${(day.volume / maxVolume) * 100}px` }}>
                  <div style={{ flex: day.positive, background: 'var(--af-signal-go)', borderRadius: '3px 3px 0 0', minHeight: 2 }} />
                  <div style={{ flex: day.neutral, background: 'var(--af-stone-300)', minHeight: 2 }} />
                  <div style={{ flex: day.negative, background: 'var(--af-signal-stop)', borderRadius: '0 0 3px 3px', minHeight: 2 }} />
                </div>
                <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 10, color: 'var(--af-stone-400)' }}>
                  {day.date.split('-')[2]}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--af-font-architect)', fontSize: 11, color: 'var(--af-stone-500)' }}>
              <span style={{ width: 10, height: 10, background: 'var(--af-signal-go)', borderRadius: 2 }} /> Positive
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--af-font-architect)', fontSize: 11, color: 'var(--af-stone-500)' }}>
              <span style={{ width: 10, height: 10, background: 'var(--af-stone-300)', borderRadius: 2 }} /> Neutral
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--af-font-architect)', fontSize: 11, color: 'var(--af-stone-500)' }}>
              <span style={{ width: 10, height: 10, background: 'var(--af-signal-stop)', borderRadius: 2 }} /> Negative
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <button className={`intel-chip${activeTab === 'social' ? ' active' : ''}`} onClick={() => setActiveTab('social')}>
          Social Listening
        </button>
        <button className={`intel-chip${activeTab === 'news' ? ' active' : ''}`} onClick={() => setActiveTab('news')}>
          News Aggregation
        </button>
        <button className={`intel-chip${activeTab === 'anomalies' ? ' active' : ''}`} onClick={() => setActiveTab('anomalies')}>
          Anomaly Detection ({anomalies.length})
        </button>
      </div>

      {activeTab === 'social' && (
        <>
          {/* Source filters */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {(['all', 'social', 'news', 'forums', 'blogs', 'reports'] as const).map((s) => (
              <button
                key={s}
                className={`intel-chip${sourceFilter === s ? ' active' : ''}`}
                onClick={() => setSourceFilter(s)}
              >
                {s === 'all' ? 'All Sources' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="intel-timeline">
            {filteredSignals.map((signal) => (
              <div key={signal.id} className="intel-timeline-item">
                <div className={`intel-timeline-dot ${signal.sentiment === 'positive' ? 'market' : signal.sentiment === 'negative' ? 'pricing' : 'technology'}`} />
                <div className="intel-timeline-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--af-font-architect)', fontSize: 11, fontWeight: 600, color: 'var(--af-ultra)' }}>
                      {signal.platform}
                    </span>
                    <span style={{ fontFamily: 'var(--af-font-machine)', fontSize: 11, color: 'var(--af-stone-400)' }}>
                      @{signal.author}
                    </span>
                  </div>
                  <p className="intel-timeline-summary" style={{ marginBottom: 6 }}>{signal.content}</p>
                  <div className="intel-timeline-meta">
                    <span className={`intel-sentiment ${signal.sentiment}`}>{signal.sentiment}</span>
                    <span>{signal.engagementScore.toLocaleString()} engagement</span>
                    <span>{new Date(signal.publishedAt).toLocaleDateString()}</span>
                    {signal.tags.map((tag) => (
                      <span key={tag} style={{ color: 'var(--af-ultra)' }}>#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'news' && (
        <div className="intel-timeline">
          {news.map((item) => (
            <div key={item.id} className="intel-timeline-item">
              <div className={`intel-timeline-dot ${item.category === 'technology' ? 'technology' : item.category === 'market' ? 'market' : 'competitor'}`} />
              <div className="intel-timeline-content">
                <h4 className="intel-timeline-title">{item.headline}</h4>
                <p className="intel-timeline-summary">{item.summary}</p>
                <div className="intel-timeline-meta">
                  <span>{item.source}</span>
                  <span className={`intel-sentiment ${item.sentiment}`}>{item.sentiment}</span>
                  <span>{item.relevanceScore}% relevance</span>
                  <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'anomalies' && (
        <div className="intel-timeline">
          {anomalies.map((anom) => (
            <div
              key={anom.id}
              className="intel-timeline-item"
              style={{
                borderLeftWidth: 3,
                borderLeftColor: anom.severity === 'high' ? 'var(--af-signal-stop)' : anom.severity === 'medium' ? 'var(--af-signal-wait)' : 'var(--af-stone-400)',
              }}
            >
              <div style={{ flexShrink: 0, marginTop: 2 }}>
                <PiWarningBold style={{ color: anom.severity === 'high' ? 'var(--af-signal-stop)' : 'var(--af-signal-wait)' }} />
              </div>
              <div className="intel-timeline-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h4 className="intel-timeline-title" style={{ margin: 0 }}>{anom.title}</h4>
                  <span className={`intel-sentiment ${anom.severity === 'high' ? 'negative' : 'neutral'}`} style={{ fontSize: 10 }}>
                    {anom.severity}
                  </span>
                </div>
                <p className="intel-timeline-summary">{anom.description}</p>
                <div className="intel-timeline-meta">
                  <span>{anom.type.replace(/_/g, ' ')}</span>
                  <span>{new Date(anom.detectedAt).toLocaleDateString()}</span>
                  <span>{anom.relatedSignals.length} related signals</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
