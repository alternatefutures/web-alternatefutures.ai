'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  fetchQAReportById,
  getPassRate,
  getAverageScore,
  CHECK_TYPE_LABELS,
  STATUS_LABELS,
  type QAReport,
} from '@/lib/qa-api'
import { getCookieValue } from '@/lib/cookies'
import { WaveDivider } from '@/components/admin/ShapeDecoration'
import '../qa-admin.css'

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function QAReportDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [report, setReport] = useState<QAReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const data = await fetchQAReportById(token, id)
        setReport(data)
      } catch {
        // seed data handles it
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const passRate = useMemo(() => {
    if (!report) return 0
    return getPassRate(report.checks)
  }, [report])

  const avgScore = useMemo(() => {
    if (!report) return null
    return getAverageScore(report.checks)
  }, [report])

  if (loading) {
    return (
      <div className="qa-admin-empty">
        <p>Loading report...</p>
      </div>
    )
  }

  if (!report) {
    return (
      <>
        <Link href="/admin/qa" className="qa-detail-back">
          &larr; Back to QA Dashboard
        </Link>
        <div className="qa-admin-empty">
          <h2>Report not found</h2>
          <p>The requested QA report could not be loaded.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Link href="/admin/qa" className="qa-detail-back">
        &larr; Back to QA Dashboard
      </Link>

      <div className="qa-detail-header">
        <div className="qa-detail-title">
          <h1>{report.siteName}</h1>
          <div className="qa-detail-subtitle">
            {report.siteUrl} &middot; Build: {report.buildId} &middot; {formatDate(report.createdAt)}
          </div>
        </div>
        <div className={`qa-detail-badge ${report.overallStatus}`}>
          {STATUS_LABELS[report.overallStatus]}
        </div>
      </div>

      <div className="qa-detail-stats">
        <div className="qa-stat-card">
          <div className={`qa-stat-value ${passRate >= 80 ? 'pass' : passRate >= 60 ? 'warn' : 'fail'}`}>
            {passRate}%
          </div>
          <div className="qa-stat-label">Pass Rate</div>
        </div>
        <div className="qa-stat-card">
          <div className="qa-stat-value ultra">{avgScore !== null ? avgScore : '-'}</div>
          <div className="qa-stat-label">Avg Score</div>
        </div>
        <div className="qa-stat-card">
          <div className="qa-stat-value ultra">{report.checks.length}</div>
          <div className="qa-stat-label">Total Checks</div>
        </div>
        <div className="qa-stat-card">
          <div className="qa-stat-value fail">
            {report.checks.filter((c) => c.status === 'fail').length}
          </div>
          <div className="qa-stat-label">Failures</div>
        </div>
      </div>

      <WaveDivider variant="apricot" />

      <div className="qa-detail-checks">
        {report.checks.map((check) => (
          <div key={check.id} className="qa-detail-check">
            <div className="qa-detail-check-header">
              <div className={`qa-report-status-dot ${check.status}`} />
              <div className="qa-detail-check-type">
                {CHECK_TYPE_LABELS[check.checkType]}
              </div>
              <div className="qa-detail-check-url">{check.pageUrl}</div>
              {check.score !== null && (
                <div className={`qa-detail-check-score ${check.status}`}>
                  {check.score}
                </div>
              )}
            </div>
            <div className="qa-detail-check-result">
              {check.result}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
