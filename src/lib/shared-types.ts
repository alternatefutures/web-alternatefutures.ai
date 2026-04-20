// ---------------------------------------------------------------------------
// shared-types.ts — Cross-module type re-exports
//
// Foundation types used by multiple pages across the marketing admin platform.
// Import from here instead of reaching into individual API modules when a type
// is genuinely shared across feature boundaries.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// KPI types — used by Executive Dashboard, Brand Health, Growth Scorecard
// ---------------------------------------------------------------------------

export type {
  KPICategory,
  KPITrend,
  KPISnapshot,
  KPIDefinition,
  KPITimeSeries,
  CreateKPISnapshotInput,
  TrendResult,
  SparklineData,
} from './kpi-api'

// ---------------------------------------------------------------------------
// Person & Identity types — used by Community, Partnerships, Workshops,
// Scheduling, and any feature that references people
// ---------------------------------------------------------------------------

export type {
  Person,
  PlatformIdentity,
  PersonActivity,
  PersonNote,
  Organization,
  IdentityPlatform,
  LifecycleStage,
  ActivityType,
  Sentiment,
  OrgType,
  CreatePersonInput,
  UpdatePersonInput,
  LinkIdentityInput,
  PersonSearchParams,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  IdentityMergeSuggestion,
  MergeSuggestionStatus,
} from './identity-api'

// ---------------------------------------------------------------------------
// Agent Task types — used by Task Queue, Agent Dashboard, Orchestrator
// ---------------------------------------------------------------------------

export type {
  AgentId,
  AgentTask,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  CreateAgentTaskInput,
  UpdateAgentTaskInput,
  AgentTaskStats,
} from './agent-tasks-api'

// ---------------------------------------------------------------------------
// Common utility types used across features
// ---------------------------------------------------------------------------

/** ISO 8601 date-time string (e.g. '2026-02-15T10:30:00Z') */
export type ISODateString = string

/** Pagination params used by list endpoints */
export interface PaginationParams {
  limit?: number
  offset?: number
}

/** Standard API list response shape */
export interface PaginatedResult<T> {
  items: T[]
  total: number
  hasMore: boolean
}

/** Status indicator for dashboard cards */
export type HealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN'

/** Common filter shape for list views */
export interface DateRangeFilter {
  startDate: string
  endDate: string
}
