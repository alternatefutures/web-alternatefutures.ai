'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PiMegaphoneBold } from 'react-icons/pi'
import {
  fetchAllCampaigns,
  CAMPAIGN_STATUS_STYLES,
  type Campaign,
} from '@/lib/campaign-api'
import { fetchAllSocialPosts, type SocialMediaPost } from '@/lib/social-api'
import '../social-admin.css'
import { getCookieValue } from '@/lib/cookies'
import './campaigns.css'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [allPosts, setAllPosts] = useState<SocialMediaPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const token = getCookieValue('af_access_token')
      const [campaignsData, postsData] = await Promise.all([
        fetchAllCampaigns(token),
        fetchAllSocialPosts(token),
      ])
      setCampaigns(campaignsData)
      setAllPosts(postsData)
      setLoading(false)
    }
    load()
  }, [])

  function getPostsForCampaign(campaign: Campaign): SocialMediaPost[] {
    return allPosts.filter((p) => campaign.postIds.includes(p.id))
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <>
        <div className="campaigns-header">
          <h1>Campaigns</h1>
        </div>
        <div className="campaigns-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="campaign-card" style={{ pointerEvents: 'none' }}>
              <div className="skeleton-block" style={{ width: '60%', height: 18, marginBottom: 12, animationDelay: `${i * 0.1}s` }} />
              <div className="skeleton-block" style={{ width: '90%', height: 12, marginBottom: 8, animationDelay: `${i * 0.15}s` }} />
              <div className="skeleton-block" style={{ width: '100%', height: 4, marginBottom: 12, animationDelay: `${i * 0.2}s` }} />
              <div style={{ display: 'flex', gap: 16 }}>
                <div className="skeleton-block" style={{ width: 60, height: 12, animationDelay: `${i * 0.25}s` }} />
                <div className="skeleton-block" style={{ width: 80, height: 12, animationDelay: `${i * 0.3}s` }} />
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="campaigns-header">
        <h1>Campaigns</h1>
        <Link href="/admin/social/composer" className="social-admin-new-btn">
          + New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="campaigns-empty">
          <div className="social-admin-empty-icon">
            <PiMegaphoneBold />
          </div>
          <h2>No campaigns yet</h2>
          <p>Create your first campaign in the Composer to get started.</p>
        </div>
      ) : (
        <div className="campaigns-grid">
          {campaigns.map((campaign) => {
            const posts = getPostsForCampaign(campaign)
            const published = posts.filter((p) => p.status === 'PUBLISHED').length
            const total = posts.length
            const progress = total > 0 ? (published / total) * 100 : 0
            const st = CAMPAIGN_STATUS_STYLES[campaign.status]

            return (
              <Link
                key={campaign.id}
                href={`/admin/social/campaigns/${campaign.id}`}
                className="campaign-card"
              >
                <div className="campaign-card-header">
                  <h3 className="campaign-card-name">{campaign.name}</h3>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: '50px',
                    fontSize: '11px',
                    fontWeight: 600,
                    fontFamily: '"Instrument Sans", sans-serif',
                    background: st.bg,
                    color: st.color,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    {st.label}
                  </span>
                </div>

                {campaign.description && (
                  <p className="campaign-card-desc">{campaign.description}</p>
                )}

                <div className="campaign-progress-bar">
                  <div
                    className="campaign-progress-fill"
                    style={{
                      width: `${progress}%`,
                      background: progress === 100 ? '#10B981' : 'var(--color-blue, #000AFF)',
                    }}
                  />
                </div>

                <div className="campaign-card-stats">
                  <span className="campaign-card-stat">
                    <strong>{total}</strong> posts
                  </span>
                  <span className="campaign-card-stat">
                    <strong>{published}</strong> published
                  </span>
                  <span className="campaign-card-stat">
                    {formatDate(campaign.createdAt)}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
