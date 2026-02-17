'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PiUsersBold } from 'react-icons/pi'
import './people-admin.css'

// --- Types ---

interface PersonSummary {
  id: string
  name: string
  handle: string
  avatar: { initials: string; color: string }
  loveScore: number
  orbitScore: number
  platforms: string[]
}

// --- Mock Data (replace with API) ---

const MOCK_PEOPLE: PersonSummary[] = [
  {
    id: 'p1',
    name: 'Alex Rivera',
    handle: '@arivera',
    avatar: { initials: 'AR', color: '#BE4200' },
    loveScore: 87,
    orbitScore: 4,
    platforms: ['X', 'GitHub', 'Discord'],
  },
  {
    id: 'p2',
    name: 'Jordan Chen',
    handle: '@jchen_dev',
    avatar: { initials: 'JC', color: '#000AFF' },
    loveScore: 92,
    orbitScore: 3,
    platforms: ['X', 'LinkedIn', 'GitHub'],
  },
  {
    id: 'p3',
    name: 'Sam Nakamura',
    handle: '@sam_naka',
    avatar: { initials: 'SN', color: '#5C7A6B' },
    loveScore: 65,
    orbitScore: 5,
    platforms: ['Discord', 'Telegram'],
  },
  {
    id: 'p4',
    name: 'Morgan Blake',
    handle: '@mblake',
    avatar: { initials: 'MB', color: '#C9A84C' },
    loveScore: 78,
    orbitScore: 4,
    platforms: ['X', 'Bluesky', 'LinkedIn'],
  },
  {
    id: 'p5',
    name: 'Casey Orozco',
    handle: '@corozco',
    avatar: { initials: 'CO', color: '#4E8CA8' },
    loveScore: 95,
    orbitScore: 2,
    platforms: ['GitHub', 'Discord', 'X', 'LinkedIn'],
  },
  {
    id: 'p6',
    name: 'Taylor Kim',
    handle: '@tkim',
    avatar: { initials: 'TK', color: '#264348' },
    loveScore: 55,
    orbitScore: 6,
    platforms: ['Telegram'],
  },
]

// --- Component ---

export default function PeoplePage() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_PEOPLE
    const q = search.toLowerCase()
    return MOCK_PEOPLE.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q) ||
        p.platforms.some((pl) => pl.toLowerCase().includes(q)),
    )
  }, [search])

  return (
    <>
      <div className="people-admin-header">
        <h1>People</h1>
      </div>

      <div className="people-admin-filters">
        <input
          type="text"
          className="people-admin-search"
          placeholder="Search people..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="people-admin-grid">
        {filtered.map((person) => (
          <Link
            key={person.id}
            href={`/admin/people/${person.id}`}
            className="people-admin-card"
          >
            <div className="people-card-top">
              <div
                className="people-card-avatar"
                style={{ background: person.avatar.color }}
              >
                {person.avatar.initials}
              </div>
              <div className="people-card-info">
                <div className="people-card-name">{person.name}</div>
                <div className="people-card-handle">{person.handle}</div>
              </div>
              <div className="people-card-scores">
                <div className="people-card-score">
                  <div className="people-card-score-value love">{person.loveScore}</div>
                  <div className="people-card-score-label">Love</div>
                </div>
                <div className="people-card-score">
                  <div className="people-card-score-value orbit">{person.orbitScore}</div>
                  <div className="people-card-score-label">Orbit</div>
                </div>
              </div>
            </div>
            <div className="people-card-platforms">
              {person.platforms.map((pl) => (
                <span key={pl} className="people-platform-chip">{pl}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="okr-empty" style={{ marginTop: 'var(--af-space-arm)' }}>
          <h2>No people found</h2>
          <p>Try adjusting your search terms.</p>
        </div>
      )}
    </>
  )
}
