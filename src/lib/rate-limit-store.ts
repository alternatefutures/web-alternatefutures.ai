import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

// ---------------------------------------------------------------------------
// Persistent JSON file-based rate limit and usage tracking
// ---------------------------------------------------------------------------
// Survives serverless cold starts by writing state to disk.
// File lives at .data/rate-limits.json (gitignored).
// ---------------------------------------------------------------------------

const DATA_DIR = join(process.cwd(), '.data')
const STORE_PATH = join(DATA_DIR, 'rate-limits.json')

interface RateLimitData {
  // Per-platform sliding window timestamps (unix ms)
  platformWindows: Record<string, number[]>
  // X monthly usage tracking
  xMonthly: { month: string; count: number }
}

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readStore(): RateLimitData {
  try {
    if (existsSync(STORE_PATH)) {
      const raw = readFileSync(STORE_PATH, 'utf-8')
      return JSON.parse(raw) as RateLimitData
    }
  } catch {
    // Corrupted file — start fresh
  }
  return { platformWindows: {}, xMonthly: { month: '', count: 0 } }
}

function writeStore(data: RateLimitData): void {
  ensureDataDir()
  writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

// ---------------------------------------------------------------------------
// Sliding window rate limiting (per-platform)
// ---------------------------------------------------------------------------

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

export function checkRateLimit(
  platform: string,
  config: RateLimitConfig,
): { allowed: boolean; retryAfterMs: number } {
  const store = readStore()
  const now = Date.now()
  const timestamps = (store.platformWindows[platform] || []).filter(
    (t) => now - t < config.windowMs,
  )

  if (timestamps.length >= config.maxRequests) {
    const oldest = timestamps[0]
    const retryAfterMs = config.windowMs - (now - oldest)
    // Write back pruned timestamps
    store.platformWindows[platform] = timestamps
    writeStore(store)
    return { allowed: false, retryAfterMs }
  }

  timestamps.push(now)
  store.platformWindows[platform] = timestamps
  writeStore(store)
  return { allowed: true, retryAfterMs: 0 }
}

// ---------------------------------------------------------------------------
// X (Twitter) Free tier monthly tracking — 50 posts/month
// ---------------------------------------------------------------------------

const X_FREE_MONTHLY_LIMIT = 50

export function trackXPost(): { allowed: boolean; remaining: number } {
  const store = readStore()
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

  if (store.xMonthly.month !== currentMonth) {
    store.xMonthly = { month: currentMonth, count: 0 }
  }

  if (store.xMonthly.count >= X_FREE_MONTHLY_LIMIT) {
    writeStore(store)
    return { allowed: false, remaining: 0 }
  }

  store.xMonthly.count++
  writeStore(store)
  return { allowed: true, remaining: X_FREE_MONTHLY_LIMIT - store.xMonthly.count }
}

export function getXMonthlyUsage(): { used: number; limit: number; remaining: number } {
  const store = readStore()
  const currentMonth = new Date().toISOString().slice(0, 7)

  if (store.xMonthly.month !== currentMonth) {
    return { used: 0, limit: X_FREE_MONTHLY_LIMIT, remaining: X_FREE_MONTHLY_LIMIT }
  }
  return {
    used: store.xMonthly.count,
    limit: X_FREE_MONTHLY_LIMIT,
    remaining: X_FREE_MONTHLY_LIMIT - store.xMonthly.count,
  }
}
