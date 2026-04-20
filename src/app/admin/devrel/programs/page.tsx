'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { WaveDivider } from '@/components/admin/ShapeDecoration'
import '../devrel-admin.css'

type Ambassador = {
  id: string
  name: string
  github: string
  tier: 'bronze' | 'silver' | 'gold'
  contributions: number
  joinedAt: string
  status: 'active' | 'inactive'
}

type BetaTester = {
  id: string
  name: string
  email: string
  program: string
  feedbackCount: number
  bugsReported: number
  joinedAt: string
  status: 'active' | 'churned'
}

type SDKMetric = {
  package: string
  version: string
  weeklyDownloads: number
  trend: number
  activeUsers: number
}

type APIKeyMetric = {
  id: string
  name: string
  owner: string
  requestsToday: number
  requestsMonth: number
  lastUsed: string
  status: 'active' | 'rate-limited' | 'revoked'
}

const TIER_STYLES: Record<Ambassador['tier'], { bg: string; color: string; border: string }> = {
  bronze: { bg: '#FEF3C7', color: '#92400E', border: '#D97706' },
  silver: { bg: '#F3F4F6', color: '#374151', border: '#9CA3AF' },
  gold: { bg: '#FEF3C7', color: '#78350F', border: '#F59E0B' },
}

const SAMPLE_AMBASSADORS: Ambassador[] = [
  { id: '1', name: 'Alex Chen', github: 'alexchen', tier: 'gold', contributions: 42, joinedAt: '2025-08-15', status: 'active' },
  { id: '2', name: 'Maria Rodriguez', github: 'mrodriguez', tier: 'silver', contributions: 28, joinedAt: '2025-10-01', status: 'active' },
  { id: '3', name: 'David Kim', github: 'dkim-dev', tier: 'gold', contributions: 56, joinedAt: '2025-07-20', status: 'active' },
  { id: '4', name: 'Sarah Johnson', github: 'sarahj', tier: 'bronze', contributions: 12, joinedAt: '2025-12-05', status: 'active' },
  { id: '5', name: 'James Park', github: 'jpark', tier: 'silver', contributions: 19, joinedAt: '2025-11-10', status: 'inactive' },
  { id: '6', name: 'Elena Vasquez', github: 'evasquez', tier: 'bronze', contributions: 8, joinedAt: '2026-01-15', status: 'active' },
]

const SAMPLE_BETA_TESTERS: BetaTester[] = [
  { id: '1', name: 'Tom Wilson', email: 't.wilson@example.com', program: 'CLI v3 Beta', feedbackCount: 15, bugsReported: 4, joinedAt: '2026-01-10', status: 'active' },
  { id: '2', name: 'Lisa Nguyen', email: 'l.nguyen@example.com', program: 'Functions Beta', feedbackCount: 22, bugsReported: 7, joinedAt: '2025-12-15', status: 'active' },
  { id: '3', name: 'Mark Thompson', email: 'm.thompson@example.com', program: 'CLI v3 Beta', feedbackCount: 8, bugsReported: 2, joinedAt: '2026-01-20', status: 'active' },
  { id: '4', name: 'Anna Lee', email: 'a.lee@example.com', program: 'AI Agents Alpha', feedbackCount: 31, bugsReported: 9, joinedAt: '2025-11-01', status: 'active' },
  { id: '5', name: 'Robert Chen', email: 'r.chen@example.com', program: 'Functions Beta', feedbackCount: 5, bugsReported: 1, joinedAt: '2026-02-01', status: 'churned' },
]

const SAMPLE_SDK_METRICS: SDKMetric[] = [
  { package: '@alternatefutures/sdk', version: '2.4.1', weeklyDownloads: 4200, trend: 12, activeUsers: 890 },
  { package: '@alternatefutures/cli', version: '3.1.0', weeklyDownloads: 2800, trend: 8, activeUsers: 620 },
  { package: '@alternatefutures/next-adapter', version: '1.2.0', weeklyDownloads: 1100, trend: -3, activeUsers: 240 },
  { package: '@alternatefutures/react-hooks', version: '0.8.0', weeklyDownloads: 650, trend: 22, activeUsers: 180 },
]

const SAMPLE_API_KEYS: APIKeyMetric[] = [
  { id: '1', name: 'Production App', owner: 'Acme Corp', requestsToday: 12400, requestsMonth: 342000, lastUsed: '2026-02-15T14:30:00Z', status: 'active' },
  { id: '2', name: 'Staging Environment', owner: 'Acme Corp', requestsToday: 2100, requestsMonth: 58000, lastUsed: '2026-02-15T13:00:00Z', status: 'active' },
  { id: '3', name: 'CI/CD Pipeline', owner: 'DevOps Team', requestsToday: 890, requestsMonth: 24000, lastUsed: '2026-02-15T12:00:00Z', status: 'active' },
  { id: '4', name: 'Load Test Key', owner: 'QA Team', requestsToday: 0, requestsMonth: 180000, lastUsed: '2026-02-10T09:00:00Z', status: 'rate-limited' },
  { id: '5', name: 'Old Integration', owner: 'Legacy App', requestsToday: 0, requestsMonth: 0, lastUsed: '2025-12-01T08:00:00Z', status: 'revoked' },
]

export default function DeveloperPrograms() {
  const [activeTab, setActiveTab] = useState<'ambassadors' | 'beta' | 'sdk' | 'api-keys'>('ambassadors')
  const [ambassadorSearch, setAmbassadorSearch] = useState('')
  const [betaSearch, setBetaSearch] = useState('')

  const ambassadorStats = useMemo(() => ({
    total: SAMPLE_AMBASSADORS.length,
    active: SAMPLE_AMBASSADORS.filter((a) => a.status === 'active').length,
    gold: SAMPLE_AMBASSADORS.filter((a) => a.tier === 'gold').length,
    totalContributions: SAMPLE_AMBASSADORS.reduce((s, a) => s + a.contributions, 0),
  }), [])

  const betaStats = useMemo(() => ({
    total: SAMPLE_BETA_TESTERS.length,
    active: SAMPLE_BETA_TESTERS.filter((t) => t.status === 'active').length,
    totalFeedback: SAMPLE_BETA_TESTERS.reduce((s, t) => s + t.feedbackCount, 0),
    totalBugs: SAMPLE_BETA_TESTERS.reduce((s, t) => s + t.bugsReported, 0),
  }), [])

  const sdkStats = useMemo(() => ({
    totalDownloads: SAMPLE_SDK_METRICS.reduce((s, m) => s + m.weeklyDownloads, 0),
    totalUsers: SAMPLE_SDK_METRICS.reduce((s, m) => s + m.activeUsers, 0),
  }), [])

  const apiStats = useMemo(() => ({
    totalKeys: SAMPLE_API_KEYS.length,
    activeKeys: SAMPLE_API_KEYS.filter((k) => k.status === 'active').length,
    totalRequestsToday: SAMPLE_API_KEYS.reduce((s, k) => s + k.requestsToday, 0),
  }), [])

  const filteredAmbassadors = useMemo(() => {
    if (!ambassadorSearch) return SAMPLE_AMBASSADORS
    const q = ambassadorSearch.toLowerCase()
    return SAMPLE_AMBASSADORS.filter(
      (a) => a.name.toLowerCase().includes(q) || a.github.toLowerCase().includes(q),
    )
  }, [ambassadorSearch])

  const filteredBeta = useMemo(() => {
    if (!betaSearch) return SAMPLE_BETA_TESTERS
    const q = betaSearch.toLowerCase()
    return SAMPLE_BETA_TESTERS.filter(
      (t) => t.name.toLowerCase().includes(q) || t.program.toLowerCase().includes(q),
    )
  }, [betaSearch])

  function formatNumber(n: number) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
    return n.toLocaleString()
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const tabs = [
    { id: 'ambassadors' as const, label: 'Ambassadors', count: ambassadorStats.total },
    { id: 'beta' as const, label: 'Beta Testers', count: betaStats.total },
    { id: 'sdk' as const, label: 'SDK Adoption', count: SAMPLE_SDK_METRICS.length },
    { id: 'api-keys' as const, label: 'API Keys', count: apiStats.totalKeys },
  ]

  return (
    <>
      <div className="devrel-admin-header">
        <div>
          <Link href="/admin/devrel" className="devrel-admin-back">
            &larr; DevRel
          </Link>
          <h1 style={{ marginTop: 8 }}>Developer Programs</h1>
        </div>
      </div>

      {/* Overview stats */}
      <div className="devrel-admin-stats">
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Ambassadors</div>
          <div className="devrel-admin-stat-value">{ambassadorStats.active}</div>
          <div className="devrel-admin-stat-change positive">{ambassadorStats.gold} gold tier</div>
        </div>
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">Beta Testers</div>
          <div className="devrel-admin-stat-value">{betaStats.active}</div>
          <div className="devrel-admin-stat-change positive">{betaStats.totalBugs} bugs filed</div>
        </div>
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">SDK Downloads/wk</div>
          <div className="devrel-admin-stat-value">{formatNumber(sdkStats.totalDownloads)}</div>
          <div className="devrel-admin-stat-change positive">{formatNumber(sdkStats.totalUsers)} active</div>
        </div>
        <div className="devrel-admin-stat-card">
          <div className="devrel-admin-stat-label">API Requests Today</div>
          <div className="devrel-admin-stat-value">{formatNumber(apiStats.totalRequestsToday)}</div>
          <div className="devrel-admin-stat-change positive">{apiStats.activeKeys} active keys</div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      {/* Tab navigation */}
      <div style={{
        display: 'flex',
        gap: 4,
        marginBottom: 24,
        borderBottom: '1px solid var(--color-border, #E5E7EB)',
        paddingBottom: 0,
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              fontFamily: '"Instrument Sans", sans-serif',
              fontSize: 14,
              fontWeight: activeTab === tab.id ? 600 : 400,
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              color: activeTab === tab.id ? 'var(--color-blue, #000AFF)' : 'var(--color-text-gray, #6B7280)',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-blue, #000AFF)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: -1,
            }}
          >
            {tab.label}
            <span style={{
              marginLeft: 6,
              fontSize: 11,
              padding: '2px 6px',
              borderRadius: 50,
              background: activeTab === tab.id ? 'rgba(0, 10, 255, 0.08)' : 'var(--color-bg-light, #F9FAFB)',
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Ambassador Tab */}
      {activeTab === 'ambassadors' && (
        <>
          <div className="devrel-admin-filters">
            <input
              type="text"
              className="devrel-admin-search"
              placeholder="Search ambassadors..."
              value={ambassadorSearch}
              onChange={(e) => setAmbassadorSearch(e.target.value)}
            />
          </div>
          <div className="devrel-admin-table-wrap">
            <table className="devrel-admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>GitHub</th>
                  <th>Tier</th>
                  <th>Contributions</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAmbassadors.map((amb) => {
                  const ts = TIER_STYLES[amb.tier]
                  return (
                    <tr key={amb.id}>
                      <td style={{ fontWeight: 600 }}>{amb.name}</td>
                      <td>
                        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: 'var(--color-text-gray, #6B7280)' }}>
                          @{amb.github}
                        </span>
                      </td>
                      <td>
                        <span
                          className="devrel-type-chip"
                          style={{ background: ts.bg, color: ts.color, textTransform: 'capitalize' }}
                        >
                          {amb.tier}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13 }}>
                          {amb.contributions}
                        </span>
                      </td>
                      <td>{formatDate(amb.joinedAt)}</td>
                      <td>
                        <span
                          className="devrel-type-chip"
                          style={{
                            background: amb.status === 'active' ? '#D1FAE5' : '#F3F4F6',
                            color: amb.status === 'active' ? '#065F46' : '#6B7280',
                            textTransform: 'capitalize',
                          }}
                        >
                          {amb.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Beta Testers Tab */}
      {activeTab === 'beta' && (
        <>
          <div className="devrel-admin-filters">
            <input
              type="text"
              className="devrel-admin-search"
              placeholder="Search beta testers..."
              value={betaSearch}
              onChange={(e) => setBetaSearch(e.target.value)}
            />
          </div>
          <div className="devrel-admin-table-wrap">
            <table className="devrel-admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Program</th>
                  <th>Feedback</th>
                  <th>Bugs Reported</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBeta.map((tester) => (
                  <tr key={tester.id}>
                    <td style={{ fontWeight: 600 }}>{tester.name}</td>
                    <td>
                      <span className="devrel-admin-tag-chip">{tester.program}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13 }}>
                        {tester.feedbackCount}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13 }}>
                        {tester.bugsReported}
                      </span>
                    </td>
                    <td>{formatDate(tester.joinedAt)}</td>
                    <td>
                      <span
                        className="devrel-type-chip"
                        style={{
                          background: tester.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                          color: tester.status === 'active' ? '#065F46' : '#991B1B',
                          textTransform: 'capitalize',
                        }}
                      >
                        {tester.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* SDK Adoption Tab */}
      {activeTab === 'sdk' && (
        <div className="devrel-metrics-grid">
          {SAMPLE_SDK_METRICS.map((sdk) => (
            <div key={sdk.package} className="devrel-metric-card">
              <div className="devrel-metric-card-label" style={{ fontSize: 12 }}>
                {sdk.package}
              </div>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11,
                color: 'var(--color-text-gray, #6B7280)',
                marginBottom: 8,
              }}>
                v{sdk.version}
              </div>
              <div className="devrel-metric-card-value">
                {formatNumber(sdk.weeklyDownloads)}
              </div>
              <div style={{
                fontFamily: '"Instrument Sans", sans-serif',
                fontSize: 12,
                color: 'var(--color-text-gray, #6B7280)',
                marginTop: 2,
              }}>
                downloads/week
              </div>
              <div className={`devrel-metric-card-trend ${sdk.trend >= 0 ? 'positive' : 'negative'}`} style={{
                color: sdk.trend >= 0 ? '#065F46' : '#991B1B',
              }}>
                {sdk.trend >= 0 ? '+' : ''}{sdk.trend}% WoW
              </div>
              <div style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: '1px solid var(--color-border, #E5E7EB)',
                fontFamily: '"Instrument Sans", sans-serif',
                fontSize: 13,
              }}>
                <span style={{ color: 'var(--color-text-gray, #6B7280)' }}>Active users: </span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-dark, #1F2937)' }}>
                  {formatNumber(sdk.activeUsers)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api-keys' && (
        <div className="devrel-admin-table-wrap">
          <table className="devrel-admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Owner</th>
                <th>Requests Today</th>
                <th>Requests/Month</th>
                <th>Last Used</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_API_KEYS.map((key) => (
                <tr key={key.id}>
                  <td style={{ fontWeight: 600 }}>{key.name}</td>
                  <td>{key.owner}</td>
                  <td>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13 }}>
                      {formatNumber(key.requestsToday)}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13 }}>
                      {formatNumber(key.requestsMonth)}
                    </span>
                  </td>
                  <td>{formatDate(key.lastUsed)}</td>
                  <td>
                    <span
                      className="devrel-type-chip"
                      style={{
                        background: key.status === 'active' ? '#D1FAE5' : key.status === 'rate-limited' ? '#FEF3C7' : '#F3F4F6',
                        color: key.status === 'active' ? '#065F46' : key.status === 'rate-limited' ? '#92400E' : '#6B7280',
                      }}
                    >
                      {key.status === 'rate-limited' ? 'Rate Limited' : key.status.charAt(0).toUpperCase() + key.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
