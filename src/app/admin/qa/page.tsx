'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  fetchQAReports,
  getPassRate,
  getAverageScore,
  CHECK_TYPE_LABELS,
  type QAReport,
  type QACheckType,
} from '@/lib/qa-api'
import { getCookieValue } from '@/lib/cookies'
import { WaveDivider } from '@/components/admin/ShapeDecoration'
import './qa-admin.css'

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function QADashboardPage() {
  const [reports, setReports] = useState<QAReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = getCookieValue('af_access_token')
        const data = await fetchQAReports(token)
        setReports(data)
      } catch {
        // seed data handles it
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Stats
  const allChecks = useMemo(() => reports.flatMap((r) => r.checks), [reports])
  const passRate = useMemo(() => getPassRate(allChecks), [allChecks])
  const avgScore = useMemo(() => getAverageScore(allChecks), [allChecks])
  const failCount = useMemo(() => allChecks.filter((c) => c.status === 'fail').length, [allChecks])
  const warnCount = useMemo(() => allChecks.filter((c) => c.status === 'warning').length, [allChecks])

  if (loading) {
    return (
      <div className="qa-admin-empty">
        <p>Loading QA reports...</p>
      </div>
    )
  }

  return (
    <>
      <div className="qa-admin-header">
        <h1>QA Dashboard</h1>
      </div>

      <div className="qa-admin-stats">
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
          <div className="qa-stat-value fail">{failCount}</div>
          <div className="qa-stat-label">Failures</div>
        </div>
        <div className="qa-stat-card">
          <div className="qa-stat-value warn">{warnCount}</div>
          <div className="qa-stat-label">Warnings</div>
        </div>
      </div>

      <WaveDivider variant="sky" />

      <div className="qa-admin-reports">
        {reports.length === 0 ? (
          <div className="qa-admin-empty">
            <h2>No QA reports yet</h2>
            <p>QA reports will appear here after automated checks run.</p>
          </div>
        ) : (
          reports.map((report) => {
            const reportPassRate = getPassRate(report.checks)
            const checkSummary = report.checks.reduce(
              (acc, c) => {
                acc[c.status] = (acc[c.status] || 0) + 1
                return acc
              },
              {} as Record<string, number>,
            )

            return (
              <Link
                key={report.id}
                href={`/admin/qa/${report.id}`}
                className="qa-report-card"
              >
                <div className="qa-report-top">
                  <div className={`qa-report-status-dot ${report.overallStatus}`} />
                  <div className="qa-report-info">
                    <div className="qa-report-name">{report.siteName}</div>
                    <div className="qa-report-url">{report.siteUrl}</div>
                  </div>
                  <div className="qa-report-time">{formatDate(report.createdAt)}</div>
                </div>
                <div className="qa-report-checks">
                  {checkSummary.pass && (
                    <span className="qa-check-chip pass">{checkSummary.pass} passed</span>
                  )}
                  {checkSummary.warning && (
                    <span className="qa-check-chip warning">{checkSummary.warning} warnings</span>
                  )}
                  {checkSummary.fail && (
                    <span className="qa-check-chip fail">{checkSummary.fail} failed</span>
                  )}
                  <span className="qa-check-chip pass" style={{ marginLeft: 'auto' }}>
                    {reportPassRate}% pass rate
                  </span>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </>
  )
}
