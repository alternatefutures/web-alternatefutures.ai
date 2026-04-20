const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ServiceCategory =
  | 'CONSULTATION'
  | 'COACHING'
  | 'TRAINING'
  | 'CREATIVE'
  | 'TECHNICAL'

export type ServiceType = 'IN_PERSON' | 'VIDEO' | 'HYBRID'

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'RESCHEDULED'

export type PaymentPolicy =
  | 'FULL_UPFRONT'
  | 'DEPOSIT_REQUIRED'
  | 'PAY_AFTER'
  | 'FREE'

export type VideoProvider = 'ZOOM' | 'GOOGLE_MEET' | 'TEAMS' | 'CUSTOM'

export interface ServiceLocation {
  id: string
  name: string
  address: string | null
  city: string
  country: string
  timezone: string
  isVirtual: boolean
  capacity: number | null
  amenities: string[]
  createdAt: string
  updatedAt: string
}

export interface ServiceProvider {
  id: string
  personId: string | null
  name: string
  bio: string | null
  photoUrl: string | null
  title: string
  specializations: string[]
  timezone: string
  weeklySchedule: WeeklySchedule
  maxDailyBookings: number
  videoMeetingLink: string | null
  locationIds: string[]
  createdAt: string
  updatedAt: string
}

export interface WeeklySchedule {
  monday: TimeSlot[] | null
  tuesday: TimeSlot[] | null
  wednesday: TimeSlot[] | null
  thursday: TimeSlot[] | null
  friday: TimeSlot[] | null
  saturday: TimeSlot[] | null
  sunday: TimeSlot[] | null
}

export interface TimeSlot {
  start: string // HH:MM
  end: string // HH:MM
}

export interface Service {
  id: string
  name: string
  slug: string
  description: string
  category: ServiceCategory
  duration: number // minutes
  bufferBefore: number // minutes
  bufferAfter: number // minutes
  price: number // cents
  currency: string
  deposit: number // cents, 0 if none
  paymentPolicy: PaymentPolicy
  cancellationPolicy: string
  cancellationDeadlineHours: number
  noShowFee: number // cents
  tipEnabled: boolean
  serviceType: ServiceType
  videoProvider: VideoProvider | null
  locationId: string | null
  providerId: string
  maxGroupSize: number
  images: string[]
  tags: string[]
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT'
  createdAt: string
  updatedAt: string
}

export interface ServiceBooking {
  id: string
  serviceId: string
  providerId: string
  locationId: string | null
  personId: string | null
  email: string
  name: string
  phone: string | null
  bookingDate: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  timezone: string
  status: BookingStatus
  serviceType: ServiceType
  videoJoinUrl: string | null
  amountPaid: number // cents
  tipAmount: number // cents
  depositPaid: number // cents
  cancellationReason: string | null
  cancelledAt: string | null
  rescheduledFrom: string | null
  notes: string | null
  feedbackScore: number | null // 1-5
  feedbackComment: string | null
  bookedAt: string
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface BookingStats {
  totalBookings: number
  upcoming: number
  completed: number
  cancelled: number
  revenue: number
  avgFeedbackScore: number
}

export interface CreateServiceInput {
  name: string
  slug: string
  description: string
  category: ServiceCategory
  duration: number
  bufferBefore?: number
  bufferAfter?: number
  price: number
  currency?: string
  deposit?: number
  paymentPolicy?: PaymentPolicy
  cancellationPolicy?: string
  cancellationDeadlineHours?: number
  noShowFee?: number
  tipEnabled?: boolean
  serviceType: ServiceType
  videoProvider?: VideoProvider
  locationId?: string
  providerId: string
  maxGroupSize?: number
  images?: string[]
  tags?: string[]
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT'
}

export interface UpdateServiceInput {
  name?: string
  slug?: string
  description?: string
  category?: ServiceCategory
  duration?: number
  bufferBefore?: number
  bufferAfter?: number
  price?: number
  currency?: string
  deposit?: number
  paymentPolicy?: PaymentPolicy
  cancellationPolicy?: string
  cancellationDeadlineHours?: number
  noShowFee?: number
  tipEnabled?: boolean
  serviceType?: ServiceType
  videoProvider?: VideoProvider | null
  locationId?: string | null
  providerId?: string
  maxGroupSize?: number
  images?: string[]
  tags?: string[]
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT'
}

export interface CreateBookingInput {
  serviceId: string
  providerId: string
  locationId?: string
  personId?: string
  email: string
  name: string
  phone?: string
  bookingDate: string
  startTime: string
  endTime: string
  timezone: string
  serviceType: ServiceType
  videoJoinUrl?: string
  amountPaid: number
  tipAmount?: number
  depositPaid?: number
  notes?: string
}

export interface UpdateBookingInput {
  bookingDate?: string
  startTime?: string
  endTime?: string
  timezone?: string
  status?: BookingStatus
  serviceType?: ServiceType
  videoJoinUrl?: string | null
  amountPaid?: number
  tipAmount?: number
  depositPaid?: number
  notes?: string | null
  feedbackScore?: number | null
  feedbackComment?: string | null
}

export interface FetchServicesOpts {
  category?: ServiceCategory
  serviceType?: ServiceType
  providerId?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT'
  query?: string
  limit?: number
  offset?: number
}

export interface FetchBookingsOpts {
  serviceId?: string
  providerId?: string
  personId?: string
  status?: BookingStatus
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}

// ---------------------------------------------------------------------------
// Seed data -- used in development when the GraphQL API is unreachable
// ---------------------------------------------------------------------------

const SEED_LOCATIONS: ServiceLocation[] = [
  {
    id: 'seed-location-1',
    name: 'AF HQ - Virtual Studio',
    address: null,
    city: 'San Francisco',
    country: 'US',
    timezone: 'America/Los_Angeles',
    isVirtual: true,
    capacity: null,
    amenities: [],
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-01T00:00:00Z',
  },
  {
    id: 'seed-location-2',
    name: 'WeWork Yerevan',
    address: '4 Amiryan St, Yerevan 0010',
    city: 'Yerevan',
    country: 'AM',
    timezone: 'Asia/Yerevan',
    isVirtual: false,
    capacity: 8,
    amenities: ['whiteboard', 'projector', 'coffee'],
    createdAt: '2025-10-15T00:00:00Z',
    updatedAt: '2025-10-15T00:00:00Z',
  },
]

const SEED_PROVIDERS: ServiceProvider[] = [
  {
    id: 'seed-provider-1',
    personId: 'seed-person-1',
    name: 'Josh H.',
    bio: 'CEO & Founder of AlternateFutures. 10+ years building decentralized infrastructure, Web3 strategy, and fundraising.',
    photoUrl: 'https://placehold.co/100x100/6366F1/FFFFFF?text=JH',
    title: 'CEO / Founder',
    specializations: ['strategy', 'architecture', 'Web3', 'fundraising'],
    timezone: 'America/Los_Angeles',
    weeklySchedule: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: null,
      sunday: null,
    },
    maxDailyBookings: 4,
    videoMeetingLink: 'https://zoom.us/j/af-josh-consult',
    locationIds: ['seed-location-1'],
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-01T00:00:00Z',
  },
  {
    id: 'seed-provider-2',
    personId: 'seed-person-2',
    name: 'Dev Team Lead',
    bio: 'CTO-level engineering leadership. Expert in distributed systems, Akash deployments, and code review.',
    photoUrl: 'https://placehold.co/100x100/10B981/FFFFFF?text=DT',
    title: 'CTO / Dev Team Lead',
    specializations: ['technical-architecture', 'code-review', 'DevOps', 'Akash'],
    timezone: 'America/New_York',
    weeklySchedule: {
      monday: [{ start: '10:00', end: '18:00' }],
      tuesday: [{ start: '10:00', end: '18:00' }],
      wednesday: [{ start: '10:00', end: '18:00' }],
      thursday: [{ start: '10:00', end: '18:00' }],
      friday: null,
      saturday: null,
      sunday: null,
    },
    maxDailyBookings: 3,
    videoMeetingLink: null,
    locationIds: ['seed-location-1'],
    createdAt: '2025-10-05T00:00:00Z',
    updatedAt: '2025-10-05T00:00:00Z',
  },
  {
    id: 'seed-provider-3',
    personId: 'seed-person-3',
    name: 'Growth Advisor',
    bio: 'Marketing and growth expert specializing in go-to-market strategy, community building, and content-driven growth.',
    photoUrl: 'https://placehold.co/100x100/EC4899/FFFFFF?text=GA',
    title: 'Growth Advisor',
    specializations: ['go-to-market', 'growth-hacking', 'community', 'content-strategy'],
    timezone: 'Europe/London',
    weeklySchedule: {
      monday: [{ start: '09:00', end: '16:00' }],
      tuesday: [{ start: '09:00', end: '16:00' }],
      wednesday: [{ start: '09:00', end: '16:00' }],
      thursday: [{ start: '09:00', end: '16:00' }],
      friday: [{ start: '09:00', end: '16:00' }],
      saturday: null,
      sunday: null,
    },
    maxDailyBookings: 5,
    videoMeetingLink: null,
    locationIds: ['seed-location-1', 'seed-location-2'],
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2025-11-01T00:00:00Z',
  },
]

const SEED_SERVICES: Service[] = [
  {
    id: 'seed-service-1',
    name: 'Platform Architecture Consultation',
    slug: 'platform-architecture-consultation',
    description:
      'One-on-one session with the CEO to discuss platform architecture, Web3 strategy, infrastructure decisions, and technical roadmap planning.',
    category: 'CONSULTATION',
    duration: 60,
    bufferBefore: 5,
    bufferAfter: 10,
    price: 25000,
    currency: 'USD',
    deposit: 5000,
    paymentPolicy: 'DEPOSIT_REQUIRED',
    cancellationPolicy: 'Full refund if cancelled 24 hours before the session. No refund for late cancellations.',
    cancellationDeadlineHours: 24,
    noShowFee: 12500,
    tipEnabled: false,
    serviceType: 'VIDEO',
    videoProvider: 'ZOOM',
    locationId: 'seed-location-1',
    providerId: 'seed-provider-1',
    maxGroupSize: 1,
    images: [],
    tags: ['architecture', 'strategy', 'web3', '1-on-1'],
    status: 'ACTIVE',
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2025-11-01T00:00:00Z',
  },
  {
    id: 'seed-service-2',
    name: 'Technical Coaching Session',
    slug: 'technical-coaching-session',
    description:
      'Hands-on technical coaching covering code review, DevOps best practices, Akash deployment patterns, and distributed systems design.',
    category: 'COACHING',
    duration: 45,
    bufferBefore: 5,
    bufferAfter: 5,
    price: 15000,
    currency: 'USD',
    deposit: 0,
    paymentPolicy: 'FULL_UPFRONT',
    cancellationPolicy: 'Full refund if cancelled 12 hours before the session.',
    cancellationDeadlineHours: 12,
    noShowFee: 7500,
    tipEnabled: true,
    serviceType: 'VIDEO',
    videoProvider: 'GOOGLE_MEET',
    locationId: 'seed-location-1',
    providerId: 'seed-provider-2',
    maxGroupSize: 1,
    images: [],
    tags: ['coaching', 'code-review', 'devops', 'akash'],
    status: 'ACTIVE',
    createdAt: '2025-11-05T00:00:00Z',
    updatedAt: '2025-11-05T00:00:00Z',
  },
  {
    id: 'seed-service-3',
    name: 'Web3 Developer Training Workshop',
    slug: 'web3-developer-training-workshop',
    description:
      'Group workshop covering IPFS/Arweave storage, smart contract integration, decentralized hosting patterns, and building on AlternateFutures platform.',
    category: 'TRAINING',
    duration: 120,
    bufferBefore: 15,
    bufferAfter: 15,
    price: 50000,
    currency: 'USD',
    deposit: 10000,
    paymentPolicy: 'DEPOSIT_REQUIRED',
    cancellationPolicy: 'Full refund if cancelled 48 hours before. 50% refund within 48 hours. No refund within 12 hours.',
    cancellationDeadlineHours: 48,
    noShowFee: 25000,
    tipEnabled: false,
    serviceType: 'HYBRID',
    videoProvider: 'ZOOM',
    locationId: 'seed-location-2',
    providerId: 'seed-provider-1',
    maxGroupSize: 12,
    images: [],
    tags: ['workshop', 'web3', 'training', 'group', 'ipfs', 'arweave'],
    status: 'ACTIVE',
    createdAt: '2025-11-10T00:00:00Z',
    updatedAt: '2025-11-10T00:00:00Z',
  },
  {
    id: 'seed-service-4',
    name: 'Brand & Content Strategy Session',
    slug: 'brand-content-strategy-session',
    description:
      'Quick strategy session focused on brand positioning, content calendar planning, community growth tactics, and go-to-market execution.',
    category: 'CREATIVE',
    duration: 30,
    bufferBefore: 5,
    bufferAfter: 5,
    price: 10000,
    currency: 'USD',
    deposit: 0,
    paymentPolicy: 'FULL_UPFRONT',
    cancellationPolicy: 'Full refund if cancelled 6 hours before the session.',
    cancellationDeadlineHours: 6,
    noShowFee: 5000,
    tipEnabled: true,
    serviceType: 'VIDEO',
    videoProvider: 'GOOGLE_MEET',
    locationId: null,
    providerId: 'seed-provider-3',
    maxGroupSize: 1,
    images: [],
    tags: ['brand', 'content', 'strategy', 'marketing'],
    status: 'ACTIVE',
    createdAt: '2025-11-15T00:00:00Z',
    updatedAt: '2025-11-15T00:00:00Z',
  },
  {
    id: 'seed-service-5',
    name: 'Migration & Deployment Support',
    slug: 'migration-deployment-support',
    description:
      'Guided support session for migrating existing projects to AlternateFutures, configuring Akash deployments, CI/CD pipelines, and troubleshooting.',
    category: 'TECHNICAL',
    duration: 90,
    bufferBefore: 10,
    bufferAfter: 10,
    price: 20000,
    currency: 'USD',
    deposit: 5000,
    paymentPolicy: 'DEPOSIT_REQUIRED',
    cancellationPolicy: 'Full refund if cancelled 24 hours before. No refund for late cancellations.',
    cancellationDeadlineHours: 24,
    noShowFee: 10000,
    tipEnabled: true,
    serviceType: 'VIDEO',
    videoProvider: 'ZOOM',
    locationId: 'seed-location-1',
    providerId: 'seed-provider-2',
    maxGroupSize: 1,
    images: [],
    tags: ['migration', 'deployment', 'akash', 'ci-cd', 'support'],
    status: 'ACTIVE',
    createdAt: '2025-11-20T00:00:00Z',
    updatedAt: '2025-11-20T00:00:00Z',
  },
]

const SEED_BOOKINGS: ServiceBooking[] = [
  // --- 4 CONFIRMED (upcoming) ---
  {
    id: 'seed-booking-1',
    serviceId: 'seed-service-1',
    providerId: 'seed-provider-1',
    locationId: 'seed-location-1',
    personId: 'seed-person-5',
    email: 'david@techventures.io',
    name: 'David Park',
    phone: '+1-415-555-0101',
    bookingDate: '2026-02-18',
    startTime: '10:00',
    endTime: '11:00',
    timezone: 'America/Los_Angeles',
    status: 'CONFIRMED',
    serviceType: 'VIDEO',
    videoJoinUrl: 'https://zoom.us/j/af-josh-consult?pwd=abc123',
    amountPaid: 5000,
    tipAmount: 0,
    depositPaid: 5000,
    cancellationReason: null,
    cancelledAt: null,
    rescheduledFrom: null,
    notes: 'Wants to discuss migrating a portfolio of 12 sites to AF.',
    feedbackScore: null,
    feedbackComment: null,
    bookedAt: '2026-02-10T14:30:00Z',
    completedAt: null,
    createdAt: '2026-02-10T14:30:00Z',
    updatedAt: '2026-02-10T14:30:00Z',
  },
  {
    id: 'seed-booking-2',
    serviceId: 'seed-service-2',
    providerId: 'seed-provider-2',
    locationId: 'seed-location-1',
    personId: 'seed-person-6',
    email: 'nina@codeforge.dev',
    name: 'Nina Petrova',
    phone: null,
    bookingDate: '2026-02-19',
    startTime: '14:00',
    endTime: '14:45',
    timezone: 'America/New_York',
    status: 'CONFIRMED',
    serviceType: 'VIDEO',
    videoJoinUrl: 'https://meet.google.com/abc-defg-hij',
    amountPaid: 15000,
    tipAmount: 0,
    depositPaid: 0,
    cancellationReason: null,
    cancelledAt: null,
    rescheduledFrom: null,
    notes: 'Focus on Akash deployment optimization.',
    feedbackScore: null,
    feedbackComment: null,
    bookedAt: '2026-02-11T09:15:00Z',
    completedAt: null,
    createdAt: '2026-02-11T09:15:00Z',
    updatedAt: '2026-02-11T09:15:00Z',
  },
  {
    id: 'seed-booking-3',
    serviceId: 'seed-service-4',
    providerId: 'seed-provider-3',
    locationId: null,
    personId: 'seed-person-7',
    email: 'omar@startupstudio.co',
    name: 'Omar Hassan',
    phone: '+44-20-7946-0958',
    bookingDate: '2026-02-20',
    startTime: '11:00',
    endTime: '11:30',
    timezone: 'Europe/London',
    status: 'CONFIRMED',
    serviceType: 'VIDEO',
    videoJoinUrl: 'https://meet.google.com/xyz-abcd-efg',
    amountPaid: 10000,
    tipAmount: 0,
    depositPaid: 0,
    cancellationReason: null,
    cancelledAt: null,
    rescheduledFrom: null,
    notes: 'Pre-launch content strategy review.',
    feedbackScore: null,
    feedbackComment: null,
    bookedAt: '2026-02-12T16:00:00Z',
    completedAt: null,
    createdAt: '2026-02-12T16:00:00Z',
    updatedAt: '2026-02-12T16:00:00Z',
  },
  {
    id: 'seed-booking-4',
    serviceId: 'seed-service-5',
    providerId: 'seed-provider-2',
    locationId: 'seed-location-1',
    personId: 'seed-person-8',
    email: 'lena@nodeworks.xyz',
    name: 'Lena Kowalski',
    phone: null,
    bookingDate: '2026-02-21',
    startTime: '10:00',
    endTime: '11:30',
    timezone: 'America/New_York',
    status: 'CONFIRMED',
    serviceType: 'VIDEO',
    videoJoinUrl: 'https://zoom.us/j/af-migration-support',
    amountPaid: 5000,
    tipAmount: 0,
    depositPaid: 5000,
    cancellationReason: null,
    cancelledAt: null,
    rescheduledFrom: null,
    notes: 'Migrating Next.js app from Vercel to AF + Akash.',
    feedbackScore: null,
    feedbackComment: null,
    bookedAt: '2026-02-13T11:00:00Z',
    completedAt: null,
    createdAt: '2026-02-13T11:00:00Z',
    updatedAt: '2026-02-13T11:00:00Z',
  },
  // --- 3 PENDING ---
  {
    id: 'seed-booking-5',
    serviceId: 'seed-service-1',
    providerId: 'seed-provider-1',
    locationId: 'seed-location-1',
    personId: 'seed-person-9',
    email: 'raj@blockinfra.io',
    name: 'Raj Patel',
    phone: '+91-98765-43210',
    bookingDate: '2026-02-22',
    startTime: '09:00',
    endTime: '10:00',
    timezone: 'America/Los_Angeles',
    status: 'PENDING',
    serviceType: 'VIDEO',
    videoJoinUrl: null,
    amountPaid: 0,
    tipAmount: 0,
    depositPaid: 0,
    cancellationReason: null,
    cancelledAt: null,
    rescheduledFrom: null,
    notes: 'Enterprise architecture review for multi-tenant SaaS.',
    feedbackScore: null,
    feedbackComment: null,
    bookedAt: '2026-02-14T08:00:00Z',
    completedAt: null,
    createdAt: '2026-02-14T08:00:00Z',
    updatedAt: '2026-02-14T08:00:00Z',
  },
  {
    id: 'seed-booking-6',
    serviceId: 'seed-service-3',
    providerId: 'seed-provider-1',
    locationId: 'seed-location-2',
    personId: 'seed-person-10',
    email: 'sona@yerevantech.am',
    name: 'Sona Grigoryan',
    phone: '+374-10-555-123',
    bookingDate: '2026-02-25',
    startTime: '10:00',
    endTime: '12:00',
    timezone: 'Asia/Yerevan',
    status: 'PENDING',
    serviceType: 'HYBRID',
    videoJoinUrl: null,
    amountPaid: 0,
    tipAmount: 0,
    depositPaid: 0,
    cancellationReason: null,
    cancelledAt: null,
    rescheduledFrom: null,
    notes: 'Group workshop for local dev team (5 people attending in-person).',
    feedbackScore: null,
    feedbackComment: null,
    bookedAt: '2026-02-14T12:00:00Z',
    completedAt: null,
    createdAt: '2026-02-14T12:00:00Z',
    updatedAt: '2026-02-14T12:00:00Z',
  },
  {
    id: 'seed-booking-7',
    serviceId: 'seed-service-4',
    providerId: 'seed-provider-3',
    locationId: null,
    personId: 'seed-person-11',
    email: 'chris@launchpad.vc',
    name: 'Chris Nguyen',
    phone: null,
    bookingDate: '2026-02-24',
    startTime: '15:00',
    endTime: '15:30',
    timezone: 'Europe/London',
    status: 'PENDING',
    serviceType: 'VIDEO',
    videoJoinUrl: null,
    amountPaid: 0,
    tipAmount: 0,
    depositPaid: 0,
    cancellationReason: null,
    cancelledAt: null,
    rescheduledFrom: null,
    notes: 'Brand audit and community launch strategy.',
    feedbackScore: null,
    feedbackComment: null,
    bookedAt: '2026-02-15T07:30:00Z',
    completedAt: null,
    createdAt: '2026-02-15T07:30:00Z',
    updatedAt: '2026-02-15T07:30:00Z',
  },
  // --- 8 COMPLETED (with feedback) ---
  {
    id: 'seed-booking-8',
    serviceId: 'seed-service-1',
    providerId: 'seed-provider-1',
    locationId: 'seed-location-1',
    personId: 'seed-person-1',
    email: 'alice@example.com',
    name: 'Alice Chen',
    phone: null,
    bookingDate: '2026-01-10',
    startTime: '10:00',
    endTime: '11:00',
    timezone: 'America/Los_Angeles',
    status: 'COMPLETED',
    serviceType: 'VIDEO',
    videoJoinUrl: 'https://zoom.us/j/af-josh-consult?pwd=session1',
    amountPaid: 25000,
    tipAmount: 0,
    depositPaid: 5000,
    cancellationReason: null,
    cancelledAt: null,
    rescheduledFrom: null,
    notes: 'Discussed IPFS pinning strategy and multi-gateway architecture.',
    feedbackScore: 5,
    feedbackComment: 'Incredibly insightful session. Josh helped us redesign our entire storage layer.',
    bookedAt: '2026-01-05T09:00:00Z',
    completedAt: '2026-01-10T11:05:00Z',
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-01-10T11:05:00Z',
  },
  {
    id: 'seed-booking-9',
    serviceId: 'seed-service-2',
    providerId: 'seed-provider-2',
    locationId: 'seed-location-1',
    personId: 'seed-person-2',
    email: 'marcus@devstudio.io',
    name: 'Marcus Rivera',
    phone: null,
    bookingDate: '2026-01-14',
    startTime: '11:00',
    endTime: '11:45',
    timezone: 'America/New_York',
    status: 'COMPLETED',
    serviceType: 'VIDEO',
    videoJoinUrl: 'https://meet.google.com/session-marcus-1',
    amountPaid: 15000,
    tipAmount: 2000,
    depositPaid: 0,
    cancellationReason: null,
    cancelledAt: null,
    rescheduledFrom: null,
    notes: 'Code review of Akash SDL files and deployment pipeline.',
    feedbackScore: 4,
    feedbackComment: 'Great technical depth. Would have liked more time to cover CI/CD topics.',
    bookedAt: '2026-01-08T10:00:00Z',
    completedAt: '2026-01-14T11:50:00Z',
    createdAt: '2026-01-08T10:00:00Z',
    updatedAt: '2026-01-14T11:50:00Z',
  },
  {
    id: 'seed-booking-10',
    serviceId: 'seed-service-4',
    providerId: 'seed-provider-3',
    locationId: null,
    personId: 'seed-person-3',
    email: 'yuki@builds.dev',
    name: 'Yuki Tanaka',
    phone: null,
    bookingDate: '2026-01-16',
    startTime: '09:00',
    endTime: '09:30',
    timezone: 'Europe/London',
    status: 'COMPLETED',
    serviceType: 'VIDEO',
    videoJoinUrl: 'https://meet.google.com/session-yuki-1',
    amountPaid: 10000,
    tipAmount: 0,
    depositPaid: 0,
    cancellationReason: null,
    cancelledAt: null,
    rescheduledFrom: null,
    notes: 'Content strategy for Japanese developer community outreach.',
    feedbackScore: 5,
    feedbackComment: 'Perfect. Exactly what I needed for planning our regional content push.',
    bookedAt: '2026-01-12T14:00:00Z',
    completedAt: '2026-01-16T09:35:00Z',
    createdAt: '2026-01-12T14:00:00Z',
    updatedAt: '2026-01-16T09:35:00Z',
  },
  {
    id: 'seed-booking-11',
    serviceId: 'seed-service-5',
    providerId: 'seed-provider-2',
    locationId: 'seed-location-1',
    personId: 'seed-person-12',
    email: 'frank@webmasters.co',
    name: 'Frank Mueller',
    phone: '+49-30-555-0199',
    bookingDate: '2026-01-20',
    startTime: '14:00',
    endTime: '15:30',
    timezone: 'America/New_York',
    status: 'COMPLETED',
    serviceType: 'VIDEO',
    videoJoinUrl: 'https://zoom.us/j/af-migration-frank',
    amountPaid: 20000,
    tipAmount: 3000,
    depositPaid: 5000,
    cancellationReason: null,
    cancelledAt: null,
    rescheduledFrom: null,
    notes: 'Full migration of Hugo static site from Netlify to AF.',
    feedbackScore: 4,
    feedbackComment: 'Migration went smoothly. Build times are noticeably faster on Akash.',
    bookedAt: '2026-01-15T08:00:00Z',
    completedAt: '2026-01-20T15:35:00Z',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-20T15:35:00Z',
  },
  {
    id: 'seed-booking-12',
    serviceId: 'seed-service-1',
    providerId: 'seed-provider-1',
    locationId: 'seed-location-1',
    personId: 'seed-person-13',
    email: 'maria@daohub.org',
    name: 'Maria Santos',
    phone: null,
    bookingDate: '2026-01-24',
    startTime: '13:00',
    endTime: '14:00',
    timezone: 'America/Los_Angeles',
    status: 'COMPLETED',
    serviceType: 'VIDEO',
    videoJoinUrl: 'https://zoom.us/j/af-josh-consult?pwd=maria',
    amountPaid: 25000,
    tipAmount: 0,
    depositPaid: 5000,
    cancellationReason: null,
    cancelledAt: null,
    rescheduledFrom: null,
    notes: 'DAO governance platform architecture on decentralized infra.',
    feedbackScore: 5,
    feedbackComment: 'Josh deeply understands the DAO tooling space. Invaluable guidance on our architecture.',
    bookedAt: '2026-01-18T11:00:00Z',
    completedAt: '2026-01-24T14:10:00Z',
    createdAt: '2026-01-18T11:00:00Z',
    updatedAt: '2026-01-24T14:10:00Z',
  },
  {
    id: 'seed-booking-13',
    serviceId: 'seed-service-2',
    providerId: 'seed-provider-2',
    locationId: 'seed-location-1',
    personId: 'seed-person-14',
    email: 'alex@cloudspin.dev',
    name: 'Alex Kim',
    phone: null,
    bookingDate: '2026-01-28',
    startTime: '10:00',
    endTime: '10:45',
    timezone: 'America/New_York',
    status: 'COMPLETED',
    serviceType: 'VIDEO',
    videoJoinUrl: 'https://meet.google.com/session-alex-1',
    amountPaid: 15000,
    tipAmount: 1500,
    depositPaid: 0,
    cancellationReason: null,
    cancelledAt: null,
    rescheduledFrom: null,
    notes: 'Kubernetes to Akash migration strategy.',
    feedbackScore: 3,
    feedbackComment: 'Good overview but I was hoping for more hands-on pair programming.',
    bookedAt: '2026-01-22T15:00:00Z',
    completedAt: '2026-01-28T10:50:00Z',
    createdAt: '2026-01-22T15:00:00Z',
    updatedAt: '2026-01-28T10:50:00Z',
  },
  {
    id: 'seed-booking-14',
    serviceId: 'seed-service-4',
    providerId: 'seed-provider-3',
    locationId: null,
    personId: 'seed-person-15',
    email: 'jessica@growthlab.io',
    name: 'Jessica Wright',
    phone: '+1-212-555-0173',
    bookingDate: '2026-02-03',
    startTime: '10:00',
    endTime: '10:30',
    timezone: 'Europe/London',
    status: 'COMPLETED',
    serviceType: 'VIDEO',
    videoJoinUrl: 'https://meet.google.com/session-jessica-1',
    amountPaid: 10000,
    tipAmount: 2000,
    depositPaid: 0,
    cancellationReason: null,
    cancelledAt: null,
    rescheduledFrom: null,
    notes: 'Developer advocate program design and content calendar.',
    feedbackScore: 5,
    feedbackComment: 'Best strategy session I have had in years. Walked away with a complete 90-day plan.',
    bookedAt: '2026-01-28T09:00:00Z',
    completedAt: '2026-02-03T10:35:00Z',
    createdAt: '2026-01-28T09:00:00Z',
    updatedAt: '2026-02-03T10:35:00Z',
  },
  {
    id: 'seed-booking-15',
    serviceId: 'seed-service-5',
    providerId: 'seed-provider-2',
    locationId: 'seed-location-1',
    personId: 'seed-person-16',
    email: 'tom@serverlessguru.com',
    name: 'Tom Anderson',
    phone: null,
    bookingDate: '2026-02-07',
    startTime: '11:00',
    endTime: '12:30',
    timezone: 'America/New_York',
    status: 'COMPLETED',
    serviceType: 'VIDEO',
    videoJoinUrl: 'https://zoom.us/j/af-migration-tom',
    amountPaid: 20000,
    tipAmount: 0,
    depositPaid: 5000,
    cancellationReason: null,
    cancelledAt: null,
    rescheduledFrom: null,
    notes: 'Serverless functions migration from AWS Lambda to AF functions.',
    feedbackScore: 4,
    feedbackComment: 'Solid session. The cold-start comparison data was really helpful for our decision.',
    bookedAt: '2026-02-01T13:00:00Z',
    completedAt: '2026-02-07T12:35:00Z',
    createdAt: '2026-02-01T13:00:00Z',
    updatedAt: '2026-02-07T12:35:00Z',
  },
  // --- 2 CANCELLED ---
  {
    id: 'seed-booking-16',
    serviceId: 'seed-service-1',
    providerId: 'seed-provider-1',
    locationId: 'seed-location-1',
    personId: 'seed-person-17',
    email: 'ben@protocollabs.xyz',
    name: 'Ben Taylor',
    phone: null,
    bookingDate: '2026-01-30',
    startTime: '15:00',
    endTime: '16:00',
    timezone: 'America/Los_Angeles',
    status: 'CANCELLED',
    serviceType: 'VIDEO',
    videoJoinUrl: null,
    amountPaid: 5000,
    tipAmount: 0,
    depositPaid: 5000,
    cancellationReason: 'Team priorities shifted. Need to postpone until Q2.',
    cancelledAt: '2026-01-28T10:00:00Z',
    rescheduledFrom: null,
    notes: null,
    feedbackScore: null,
    feedbackComment: null,
    bookedAt: '2026-01-20T16:00:00Z',
    completedAt: null,
    createdAt: '2026-01-20T16:00:00Z',
    updatedAt: '2026-01-28T10:00:00Z',
  },
  {
    id: 'seed-booking-17',
    serviceId: 'seed-service-3',
    providerId: 'seed-provider-1',
    locationId: 'seed-location-2',
    personId: 'seed-person-18',
    email: 'anna@devacademy.am',
    name: 'Anna Harutyunyan',
    phone: '+374-77-555-456',
    bookingDate: '2026-02-10',
    startTime: '10:00',
    endTime: '12:00',
    timezone: 'Asia/Yerevan',
    status: 'CANCELLED',
    serviceType: 'HYBRID',
    videoJoinUrl: null,
    amountPaid: 10000,
    tipAmount: 0,
    depositPaid: 10000,
    cancellationReason: 'Venue unavailable due to renovation. Will rebook when WeWork Yerevan reopens.',
    cancelledAt: '2026-02-06T08:00:00Z',
    rescheduledFrom: null,
    notes: 'Workshop for 8 junior devs.',
    feedbackScore: null,
    feedbackComment: null,
    bookedAt: '2026-01-25T12:00:00Z',
    completedAt: null,
    createdAt: '2026-01-25T12:00:00Z',
    updatedAt: '2026-02-06T08:00:00Z',
  },
  // --- 1 NO_SHOW ---
  {
    id: 'seed-booking-18',
    serviceId: 'seed-service-2',
    providerId: 'seed-provider-2',
    locationId: 'seed-location-1',
    personId: 'seed-person-19',
    email: 'kevin@flybynight.io',
    name: 'Kevin Drake',
    phone: null,
    bookingDate: '2026-02-05',
    startTime: '16:00',
    endTime: '16:45',
    timezone: 'America/New_York',
    status: 'NO_SHOW',
    serviceType: 'VIDEO',
    videoJoinUrl: 'https://meet.google.com/session-kevin-1',
    amountPaid: 15000,
    tipAmount: 0,
    depositPaid: 0,
    cancellationReason: null,
    cancelledAt: null,
    rescheduledFrom: null,
    notes: 'No-show. Sent follow-up email. No response after 48 hours.',
    feedbackScore: null,
    feedbackComment: null,
    bookedAt: '2026-01-30T09:00:00Z',
    completedAt: null,
    createdAt: '2026-01-30T09:00:00Z',
    updatedAt: '2026-02-05T17:00:00Z',
  },
  // --- 2 RESCHEDULED ---
  {
    id: 'seed-booking-19',
    serviceId: 'seed-service-1',
    providerId: 'seed-provider-1',
    locationId: 'seed-location-1',
    personId: 'seed-person-4',
    email: 'sarah@blockhorizon.xyz',
    name: "Sarah O'Brien",
    phone: null,
    bookingDate: '2026-02-17',
    startTime: '11:00',
    endTime: '12:00',
    timezone: 'America/Los_Angeles',
    status: 'RESCHEDULED',
    serviceType: 'VIDEO',
    videoJoinUrl: 'https://zoom.us/j/af-josh-consult?pwd=sarah-resched',
    amountPaid: 5000,
    tipAmount: 0,
    depositPaid: 5000,
    cancellationReason: null,
    cancelledAt: null,
    rescheduledFrom: 'seed-booking-16',
    notes: 'Rescheduled from Jan 30 cancelled booking. Partnership architecture discussion.',
    feedbackScore: null,
    feedbackComment: null,
    bookedAt: '2026-02-10T10:00:00Z',
    completedAt: null,
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 'seed-booking-20',
    serviceId: 'seed-service-5',
    providerId: 'seed-provider-2',
    locationId: 'seed-location-1',
    personId: 'seed-person-20',
    email: 'elena@distributed.systems',
    name: 'Elena Vasquez',
    phone: '+1-305-555-0234',
    bookingDate: '2026-02-26',
    startTime: '13:00',
    endTime: '14:30',
    timezone: 'America/New_York',
    status: 'RESCHEDULED',
    serviceType: 'VIDEO',
    videoJoinUrl: 'https://zoom.us/j/af-migration-elena',
    amountPaid: 5000,
    tipAmount: 0,
    depositPaid: 5000,
    cancellationReason: null,
    cancelledAt: null,
    rescheduledFrom: 'seed-booking-15',
    notes: 'Rescheduled from Feb 7. Continuing serverless migration discussion.',
    feedbackScore: null,
    feedbackComment: null,
    bookedAt: '2026-02-12T08:30:00Z',
    completedAt: null,
    createdAt: '2026-02-12T08:30:00Z',
    updatedAt: '2026-02-12T08:30:00Z',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function useSeedData(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
  )
}

// ---------------------------------------------------------------------------
// GraphQL queries & mutations
// ---------------------------------------------------------------------------

const SERVICE_FIELDS = `
  id name slug description category duration bufferBefore bufferAfter
  price currency deposit paymentPolicy cancellationPolicy cancellationDeadlineHours
  noShowFee tipEnabled serviceType videoProvider locationId providerId
  maxGroupSize images tags status createdAt updatedAt
`

const PROVIDER_FIELDS = `
  id personId name bio photoUrl title specializations timezone
  weeklySchedule { monday { start end } tuesday { start end } wednesday { start end }
    thursday { start end } friday { start end } saturday { start end } sunday { start end } }
  maxDailyBookings videoMeetingLink locationIds createdAt updatedAt
`

const LOCATION_FIELDS = `
  id name address city country timezone isVirtual capacity amenities createdAt updatedAt
`

const BOOKING_FIELDS = `
  id serviceId providerId locationId personId email name phone
  bookingDate startTime endTime timezone status serviceType videoJoinUrl
  amountPaid tipAmount depositPaid cancellationReason cancelledAt rescheduledFrom
  notes feedbackScore feedbackComment bookedAt completedAt createdAt updatedAt
`

const SERVICES_QUERY = `
  query Services($category: ServiceCategory, $serviceType: ServiceType, $providerId: ID, $status: String, $query: String, $limit: Int, $offset: Int) {
    services(category: $category, serviceType: $serviceType, providerId: $providerId, status: $status, query: $query, limit: $limit, offset: $offset) {
      ${SERVICE_FIELDS}
    }
  }
`

const SERVICE_BY_ID_QUERY = `
  query ServiceById($id: ID!) {
    serviceById(id: $id) {
      ${SERVICE_FIELDS}
    }
  }
`

const CREATE_SERVICE_MUTATION = `
  mutation CreateService($input: CreateServiceInput!) {
    createService(input: $input) {
      ${SERVICE_FIELDS}
    }
  }
`

const UPDATE_SERVICE_MUTATION = `
  mutation UpdateService($id: ID!, $input: UpdateServiceInput!) {
    updateService(id: $id, input: $input) {
      ${SERVICE_FIELDS}
    }
  }
`

const PROVIDERS_QUERY = `
  query ServiceProviders {
    serviceProviders {
      ${PROVIDER_FIELDS}
    }
  }
`

const LOCATIONS_QUERY = `
  query ServiceLocations {
    serviceLocations {
      ${LOCATION_FIELDS}
    }
  }
`

const BOOKINGS_QUERY = `
  query ServiceBookings($serviceId: ID, $providerId: ID, $personId: ID, $status: BookingStatus, $dateFrom: String, $dateTo: String, $limit: Int, $offset: Int) {
    serviceBookings(serviceId: $serviceId, providerId: $providerId, personId: $personId, status: $status, dateFrom: $dateFrom, dateTo: $dateTo, limit: $limit, offset: $offset) {
      ${BOOKING_FIELDS}
    }
  }
`

const BOOKING_BY_ID_QUERY = `
  query ServiceBookingById($id: ID!) {
    serviceBookingById(id: $id) {
      ${BOOKING_FIELDS}
    }
  }
`

const CREATE_BOOKING_MUTATION = `
  mutation CreateServiceBooking($input: CreateServiceBookingInput!) {
    createServiceBooking(input: $input) {
      ${BOOKING_FIELDS}
    }
  }
`

const UPDATE_BOOKING_MUTATION = `
  mutation UpdateServiceBooking($id: ID!, $input: UpdateServiceBookingInput!) {
    updateServiceBooking(id: $id, input: $input) {
      ${BOOKING_FIELDS}
    }
  }
`

const CANCEL_BOOKING_MUTATION = `
  mutation CancelServiceBooking($id: ID!, $reason: String!) {
    cancelServiceBooking(id: $id, reason: $reason) {
      ${BOOKING_FIELDS}
    }
  }
`

const PROVIDER_AVAILABILITY_QUERY = `
  query ProviderAvailability($providerId: ID!, $date: String!) {
    providerAvailability(providerId: $providerId, date: $date) {
      start end
    }
  }
`

const BOOKING_STATS_QUERY = `
  query BookingStats {
    bookingStats {
      totalBookings upcoming completed cancelled revenue avgFeedbackScore
    }
  }
`

// ---------------------------------------------------------------------------
// GraphQL client (authenticated)
// ---------------------------------------------------------------------------

async function authGraphqlFetch<T>(
  query: string,
  variables: object,
  token: string,
): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status}`)
  }

  const json = await res.json()
  if (json.errors?.length) {
    throw new Error(json.errors[0].message)
  }
  return json.data
}

// ---------------------------------------------------------------------------
// In-memory mock stores for dev/seed mode
// ---------------------------------------------------------------------------

let mockLocations = [...SEED_LOCATIONS]
let mockProviders = [...SEED_PROVIDERS]
let mockServices = [...SEED_SERVICES]
let mockBookings = [...SEED_BOOKINGS]

// ---------------------------------------------------------------------------
// CRUD functions -- Service
// ---------------------------------------------------------------------------

export async function fetchServices(
  token: string,
  opts: FetchServicesOpts = {},
): Promise<Service[]> {
  try {
    const data = await authGraphqlFetch<{ services: Service[] }>(
      SERVICES_QUERY,
      opts,
      token,
    )
    return data.services
  } catch {
    if (useSeedData()) {
      let result = [...mockServices]
      if (opts.category) {
        result = result.filter((s) => s.category === opts.category)
      }
      if (opts.serviceType) {
        result = result.filter((s) => s.serviceType === opts.serviceType)
      }
      if (opts.providerId) {
        result = result.filter((s) => s.providerId === opts.providerId)
      }
      if (opts.status) {
        result = result.filter((s) => s.status === opts.status)
      }
      if (opts.query) {
        const q = opts.query.toLowerCase()
        result = result.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.tags.some((t) => t.toLowerCase().includes(q)),
        )
      }
      const offset = opts.offset ?? 0
      const limit = opts.limit ?? 100
      return result.slice(offset, offset + limit)
    }
    return []
  }
}

export async function fetchServiceById(
  token: string,
  id: string,
): Promise<Service | null> {
  try {
    const data = await authGraphqlFetch<{ serviceById: Service }>(
      SERVICE_BY_ID_QUERY,
      { id },
      token,
    )
    return data.serviceById
  } catch {
    if (useSeedData()) return mockServices.find((s) => s.id === id) || null
    return null
  }
}

export async function createService(
  token: string,
  input: CreateServiceInput,
): Promise<Service> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const service: Service = {
      id: `seed-service-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: input.name,
      slug: input.slug,
      description: input.description,
      category: input.category,
      duration: input.duration,
      bufferBefore: input.bufferBefore ?? 5,
      bufferAfter: input.bufferAfter ?? 5,
      price: input.price,
      currency: input.currency ?? 'USD',
      deposit: input.deposit ?? 0,
      paymentPolicy: input.paymentPolicy ?? 'FULL_UPFRONT',
      cancellationPolicy: input.cancellationPolicy ?? 'Full refund if cancelled 24 hours before.',
      cancellationDeadlineHours: input.cancellationDeadlineHours ?? 24,
      noShowFee: input.noShowFee ?? 0,
      tipEnabled: input.tipEnabled ?? false,
      serviceType: input.serviceType,
      videoProvider: input.videoProvider ?? null,
      locationId: input.locationId ?? null,
      providerId: input.providerId,
      maxGroupSize: input.maxGroupSize ?? 1,
      images: input.images ?? [],
      tags: input.tags ?? [],
      status: input.status ?? 'DRAFT',
      createdAt: now,
      updatedAt: now,
    }
    mockServices = [service, ...mockServices]
    return service
  }

  const data = await authGraphqlFetch<{ createService: Service }>(
    CREATE_SERVICE_MUTATION,
    { input },
    token,
  )
  return data.createService
}

export async function updateService(
  token: string,
  id: string,
  input: UpdateServiceInput,
): Promise<Service> {
  if (useSeedData()) {
    const idx = mockServices.findIndex((s) => s.id === id)
    if (idx === -1) throw new Error('Service not found')
    const existing = mockServices[idx]
    const updated: Service = {
      ...existing,
      name: input.name ?? existing.name,
      slug: input.slug ?? existing.slug,
      description: input.description ?? existing.description,
      category: input.category ?? existing.category,
      duration: input.duration ?? existing.duration,
      bufferBefore: input.bufferBefore ?? existing.bufferBefore,
      bufferAfter: input.bufferAfter ?? existing.bufferAfter,
      price: input.price ?? existing.price,
      currency: input.currency ?? existing.currency,
      deposit: input.deposit ?? existing.deposit,
      paymentPolicy: input.paymentPolicy ?? existing.paymentPolicy,
      cancellationPolicy: input.cancellationPolicy ?? existing.cancellationPolicy,
      cancellationDeadlineHours: input.cancellationDeadlineHours ?? existing.cancellationDeadlineHours,
      noShowFee: input.noShowFee ?? existing.noShowFee,
      tipEnabled: input.tipEnabled ?? existing.tipEnabled,
      serviceType: input.serviceType ?? existing.serviceType,
      videoProvider: input.videoProvider !== undefined ? input.videoProvider : existing.videoProvider,
      locationId: input.locationId !== undefined ? input.locationId : existing.locationId,
      providerId: input.providerId ?? existing.providerId,
      maxGroupSize: input.maxGroupSize ?? existing.maxGroupSize,
      images: input.images ?? existing.images,
      tags: input.tags ?? existing.tags,
      status: input.status ?? existing.status,
      updatedAt: new Date().toISOString(),
    }
    mockServices[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateService: Service }>(
    UPDATE_SERVICE_MUTATION,
    { id, input },
    token,
  )
  return data.updateService
}

// ---------------------------------------------------------------------------
// CRUD functions -- Provider & Location
// ---------------------------------------------------------------------------

export async function fetchProviders(
  token: string,
): Promise<ServiceProvider[]> {
  try {
    const data = await authGraphqlFetch<{ serviceProviders: ServiceProvider[] }>(
      PROVIDERS_QUERY,
      {},
      token,
    )
    return data.serviceProviders
  } catch {
    if (useSeedData()) return [...mockProviders]
    return []
  }
}

export async function fetchLocations(
  token: string,
): Promise<ServiceLocation[]> {
  try {
    const data = await authGraphqlFetch<{ serviceLocations: ServiceLocation[] }>(
      LOCATIONS_QUERY,
      {},
      token,
    )
    return data.serviceLocations
  } catch {
    if (useSeedData()) return [...mockLocations]
    return []
  }
}

// ---------------------------------------------------------------------------
// CRUD functions -- Booking
// ---------------------------------------------------------------------------

export async function fetchBookings(
  token: string,
  opts: FetchBookingsOpts = {},
): Promise<ServiceBooking[]> {
  try {
    const data = await authGraphqlFetch<{ serviceBookings: ServiceBooking[] }>(
      BOOKINGS_QUERY,
      opts,
      token,
    )
    return data.serviceBookings
  } catch {
    if (useSeedData()) {
      let result = [...mockBookings]
      if (opts.serviceId) {
        result = result.filter((b) => b.serviceId === opts.serviceId)
      }
      if (opts.providerId) {
        result = result.filter((b) => b.providerId === opts.providerId)
      }
      if (opts.personId) {
        result = result.filter((b) => b.personId === opts.personId)
      }
      if (opts.status) {
        result = result.filter((b) => b.status === opts.status)
      }
      if (opts.dateFrom) {
        result = result.filter((b) => b.bookingDate >= opts.dateFrom!)
      }
      if (opts.dateTo) {
        result = result.filter((b) => b.bookingDate <= opts.dateTo!)
      }
      result.sort(
        (a, b) =>
          new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime(),
      )
      const offset = opts.offset ?? 0
      const limit = opts.limit ?? 100
      return result.slice(offset, offset + limit)
    }
    return []
  }
}

export async function fetchBookingById(
  token: string,
  id: string,
): Promise<ServiceBooking | null> {
  try {
    const data = await authGraphqlFetch<{ serviceBookingById: ServiceBooking }>(
      BOOKING_BY_ID_QUERY,
      { id },
      token,
    )
    return data.serviceBookingById
  } catch {
    if (useSeedData()) return mockBookings.find((b) => b.id === id) || null
    return null
  }
}

export async function createBooking(
  token: string,
  input: CreateBookingInput,
): Promise<ServiceBooking> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const booking: ServiceBooking = {
      id: `seed-booking-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      serviceId: input.serviceId,
      providerId: input.providerId,
      locationId: input.locationId ?? null,
      personId: input.personId ?? null,
      email: input.email,
      name: input.name,
      phone: input.phone ?? null,
      bookingDate: input.bookingDate,
      startTime: input.startTime,
      endTime: input.endTime,
      timezone: input.timezone,
      status: 'PENDING',
      serviceType: input.serviceType,
      videoJoinUrl: input.videoJoinUrl ?? null,
      amountPaid: input.amountPaid,
      tipAmount: input.tipAmount ?? 0,
      depositPaid: input.depositPaid ?? 0,
      cancellationReason: null,
      cancelledAt: null,
      rescheduledFrom: null,
      notes: input.notes ?? null,
      feedbackScore: null,
      feedbackComment: null,
      bookedAt: now,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    }
    mockBookings = [booking, ...mockBookings]
    return booking
  }

  const data = await authGraphqlFetch<{ createServiceBooking: ServiceBooking }>(
    CREATE_BOOKING_MUTATION,
    { input },
    token,
  )
  return data.createServiceBooking
}

export async function updateBooking(
  token: string,
  id: string,
  input: UpdateBookingInput,
): Promise<ServiceBooking> {
  if (useSeedData()) {
    const idx = mockBookings.findIndex((b) => b.id === id)
    if (idx === -1) throw new Error('Booking not found')
    const existing = mockBookings[idx]
    const updated: ServiceBooking = {
      ...existing,
      bookingDate: input.bookingDate ?? existing.bookingDate,
      startTime: input.startTime ?? existing.startTime,
      endTime: input.endTime ?? existing.endTime,
      timezone: input.timezone ?? existing.timezone,
      status: input.status ?? existing.status,
      serviceType: input.serviceType ?? existing.serviceType,
      videoJoinUrl: input.videoJoinUrl !== undefined ? input.videoJoinUrl : existing.videoJoinUrl,
      amountPaid: input.amountPaid ?? existing.amountPaid,
      tipAmount: input.tipAmount ?? existing.tipAmount,
      depositPaid: input.depositPaid ?? existing.depositPaid,
      notes: input.notes !== undefined ? input.notes : existing.notes,
      feedbackScore: input.feedbackScore !== undefined ? input.feedbackScore : existing.feedbackScore,
      feedbackComment: input.feedbackComment !== undefined ? input.feedbackComment : existing.feedbackComment,
      completedAt: input.status === 'COMPLETED' && !existing.completedAt ? new Date().toISOString() : existing.completedAt,
      updatedAt: new Date().toISOString(),
    }
    mockBookings[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateServiceBooking: ServiceBooking }>(
    UPDATE_BOOKING_MUTATION,
    { id, input },
    token,
  )
  return data.updateServiceBooking
}

export async function cancelBooking(
  token: string,
  id: string,
  reason: string,
): Promise<ServiceBooking> {
  if (useSeedData()) {
    const idx = mockBookings.findIndex((b) => b.id === id)
    if (idx === -1) throw new Error('Booking not found')
    const now = new Date().toISOString()
    const updated: ServiceBooking = {
      ...mockBookings[idx],
      status: 'CANCELLED',
      cancellationReason: reason,
      cancelledAt: now,
      updatedAt: now,
    }
    mockBookings[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ cancelServiceBooking: ServiceBooking }>(
    CANCEL_BOOKING_MUTATION,
    { id, reason },
    token,
  )
  return data.cancelServiceBooking
}

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------

export async function fetchProviderAvailability(
  token: string,
  providerId: string,
  date: string,
): Promise<TimeSlot[]> {
  try {
    const data = await authGraphqlFetch<{ providerAvailability: TimeSlot[] }>(
      PROVIDER_AVAILABILITY_QUERY,
      { providerId, date },
      token,
    )
    return data.providerAvailability
  } catch {
    if (useSeedData()) {
      const provider = mockProviders.find((p) => p.id === providerId)
      if (!provider) return []

      const dayOfWeek = new Date(date)
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase() as keyof WeeklySchedule
      const daySlots = provider.weeklySchedule[dayOfWeek]
      if (!daySlots) return []

      // Filter out times that already have bookings
      const dayBookings = mockBookings.filter(
        (b) =>
          b.providerId === providerId &&
          b.bookingDate === date &&
          b.status !== 'CANCELLED' &&
          b.status !== 'NO_SHOW',
      )

      // Return available slots (simplified: return the schedule slots minus booked times)
      const available: TimeSlot[] = []
      for (const slot of daySlots) {
        const isBooked = dayBookings.some(
          (b) => b.startTime < slot.end && b.endTime > slot.start,
        )
        if (!isBooked) {
          available.push(slot)
        }
      }
      return available
    }
    return []
  }
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export async function fetchBookingStats(
  token: string,
): Promise<BookingStats> {
  try {
    const data = await authGraphqlFetch<{ bookingStats: BookingStats }>(
      BOOKING_STATS_QUERY,
      {},
      token,
    )
    return data.bookingStats
  } catch {
    if (useSeedData()) {
      const all = mockBookings
      const completed = all.filter((b) => b.status === 'COMPLETED')
      const upcoming = all.filter(
        (b) => b.status === 'CONFIRMED' || b.status === 'PENDING',
      )
      const cancelled = all.filter((b) => b.status === 'CANCELLED')
      const revenue = completed.reduce(
        (sum, b) => sum + b.amountPaid + b.tipAmount,
        0,
      )
      const feedbackScores = completed
        .filter((b) => b.feedbackScore !== null)
        .map((b) => b.feedbackScore!)
      const avgFeedbackScore =
        feedbackScores.length > 0
          ? feedbackScores.reduce((sum, s) => sum + s, 0) / feedbackScores.length
          : 0

      return {
        totalBookings: all.length,
        upcoming: upcoming.length,
        completed: completed.length,
        cancelled: cancelled.length,
        revenue,
        avgFeedbackScore: Math.round(avgFeedbackScore * 100) / 100,
      }
    }
    return {
      totalBookings: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0,
      revenue: 0,
      avgFeedbackScore: 0,
    }
  }
}

// ---------------------------------------------------------------------------
// SMS Integration Types & Seed Data
// ---------------------------------------------------------------------------

export type SMSProvider = 'TWILIO' | 'MESSAGEBIRD'
export type SMSComplianceStatus = 'COMPLIANT' | 'PENDING_REVIEW' | 'NON_COMPLIANT'
export type SMSCampaignStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED' | 'CANCELLED'
export type SMSDeliveryStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'UNDELIVERED'

export interface SMSProviderConfig {
  id: string
  provider: SMSProvider
  accountSid: string
  authToken: string
  messagingServiceSid: string | null
  defaultFromNumber: string
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR'
  connectedAt: string | null
  lastTestedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SMSPhoneNumber {
  id: string
  number: string
  friendlyName: string
  capabilities: ('sms' | 'mms' | 'voice')[]
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  providerId: string
  monthlyMessages: number
  createdAt: string
}

export interface SMSOptRecord {
  id: string
  phoneNumber: string
  status: 'OPTED_IN' | 'OPTED_OUT'
  optedInAt: string | null
  optedOutAt: string | null
  method: 'KEYWORD' | 'WEB_FORM' | 'API' | 'MANUAL'
  campaignId: string | null
}

export interface SMSCampaign {
  id: string
  name: string
  message: string
  fromNumber: string
  recipientCount: number
  sentCount: number
  deliveredCount: number
  failedCount: number
  scheduledAt: string | null
  sentAt: string | null
  status: SMSCampaignStatus
  complianceStatus: SMSComplianceStatus
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface SMSDeliveryReport {
  id: string
  campaignId: string
  to: string
  from: string
  status: SMSDeliveryStatus
  errorCode: string | null
  errorMessage: string | null
  sentAt: string
  deliveredAt: string | null
  price: number | null
  currency: string
}

export interface SMSIntegrationStats {
  totalCampaigns: number
  totalMessagesSent: number
  deliveryRate: number
  optInCount: number
  optOutCount: number
  activeNumbers: number
  monthlySpend: number
}

const SEED_SMS_PROVIDERS: SMSProviderConfig[] = [
  {
    id: 'seed-sms-provider-1',
    provider: 'TWILIO',
    accountSid: 'AC••••••••••••••••••••••••••••••d4',
    authToken: '••••••••••••••••••••••••••••••a1',
    messagingServiceSid: 'MG••••••••••••••••••••••••••••••f2',
    defaultFromNumber: '+14155551234',
    status: 'CONNECTED',
    connectedAt: '2026-01-15T09:30:00Z',
    lastTestedAt: '2026-02-14T11:00:00Z',
    createdAt: '2026-01-15T09:30:00Z',
    updatedAt: '2026-02-14T11:00:00Z',
  },
]

const SEED_SMS_PHONE_NUMBERS: SMSPhoneNumber[] = [
  {
    id: 'seed-sms-num-1',
    number: '+14155551234',
    friendlyName: 'AF Notifications',
    capabilities: ['sms', 'mms'],
    status: 'ACTIVE',
    providerId: 'seed-sms-provider-1',
    monthlyMessages: 1247,
    createdAt: '2026-01-15T09:30:00Z',
  },
  {
    id: 'seed-sms-num-2',
    number: '+14155559876',
    friendlyName: 'AF Marketing',
    capabilities: ['sms'],
    status: 'ACTIVE',
    providerId: 'seed-sms-provider-1',
    monthlyMessages: 834,
    createdAt: '2026-01-20T14:00:00Z',
  },
  {
    id: 'seed-sms-num-3',
    number: '+442071234567',
    friendlyName: 'AF UK Support',
    capabilities: ['sms', 'mms', 'voice'],
    status: 'INACTIVE',
    providerId: 'seed-sms-provider-1',
    monthlyMessages: 0,
    createdAt: '2026-02-01T10:00:00Z',
  },
]

const SEED_SMS_OPT_RECORDS: SMSOptRecord[] = [
  { id: 'seed-opt-1', phoneNumber: '+14085551001', status: 'OPTED_IN', optedInAt: '2026-01-20T10:00:00Z', optedOutAt: null, method: 'WEB_FORM', campaignId: null },
  { id: 'seed-opt-2', phoneNumber: '+14085551002', status: 'OPTED_IN', optedInAt: '2026-01-21T14:30:00Z', optedOutAt: null, method: 'KEYWORD', campaignId: 'seed-sms-campaign-1' },
  { id: 'seed-opt-3', phoneNumber: '+14085551003', status: 'OPTED_OUT', optedInAt: '2026-01-18T08:00:00Z', optedOutAt: '2026-02-05T16:00:00Z', method: 'KEYWORD', campaignId: null },
  { id: 'seed-opt-4', phoneNumber: '+14085551004', status: 'OPTED_IN', optedInAt: '2026-02-01T09:00:00Z', optedOutAt: null, method: 'API', campaignId: null },
  { id: 'seed-opt-5', phoneNumber: '+442079876543', status: 'OPTED_IN', optedInAt: '2026-02-10T12:00:00Z', optedOutAt: null, method: 'WEB_FORM', campaignId: null },
]

const SEED_SMS_CAMPAIGNS: SMSCampaign[] = [
  {
    id: 'seed-sms-campaign-1',
    name: 'Launch Week Reminder',
    message: 'AlternateFutures Launch Week starts Monday! Join us for live demos, workshops, and AMAs. Details: af.ai/launch-week',
    fromNumber: '+14155551234',
    recipientCount: 342,
    sentCount: 342,
    deliveredCount: 328,
    failedCount: 14,
    scheduledAt: '2026-02-03T09:00:00Z',
    sentAt: '2026-02-03T09:00:12Z',
    status: 'SENT',
    complianceStatus: 'COMPLIANT',
    tags: ['launch', 'event'],
    createdAt: '2026-02-01T15:00:00Z',
    updatedAt: '2026-02-03T09:05:00Z',
  },
  {
    id: 'seed-sms-campaign-2',
    name: 'Booking Confirmation Follow-up',
    message: 'Your consultation with AF is confirmed for {{date}} at {{time}}. Add to calendar: {{link}}',
    fromNumber: '+14155551234',
    recipientCount: 47,
    sentCount: 47,
    deliveredCount: 46,
    failedCount: 1,
    scheduledAt: null,
    sentAt: '2026-02-10T14:00:00Z',
    status: 'SENT',
    complianceStatus: 'COMPLIANT',
    tags: ['booking', 'transactional'],
    createdAt: '2026-02-10T13:30:00Z',
    updatedAt: '2026-02-10T14:02:00Z',
  },
  {
    id: 'seed-sms-campaign-3',
    name: 'February Newsletter SMS',
    message: 'New on AF: Edge Functions are live! Deploy serverless at the edge with zero cold starts. Try it: af.ai/edge',
    fromNumber: '+14155559876',
    recipientCount: 520,
    sentCount: 0,
    deliveredCount: 0,
    failedCount: 0,
    scheduledAt: '2026-02-20T10:00:00Z',
    sentAt: null,
    status: 'SCHEDULED',
    complianceStatus: 'COMPLIANT',
    tags: ['newsletter', 'product'],
    createdAt: '2026-02-14T11:00:00Z',
    updatedAt: '2026-02-14T11:00:00Z',
  },
  {
    id: 'seed-sms-campaign-4',
    name: 'Workshop RSVP Blast',
    message: 'Web3 Dev Workshop — Feb 25, Yerevan. 5 spots left! Register: af.ai/workshop-yerevan',
    fromNumber: '+14155551234',
    recipientCount: 150,
    sentCount: 0,
    deliveredCount: 0,
    failedCount: 0,
    scheduledAt: null,
    sentAt: null,
    status: 'DRAFT',
    complianceStatus: 'PENDING_REVIEW',
    tags: ['workshop', 'event'],
    createdAt: '2026-02-15T08:00:00Z',
    updatedAt: '2026-02-15T08:00:00Z',
  },
]

const SEED_SMS_DELIVERY_REPORTS: SMSDeliveryReport[] = [
  { id: 'seed-sms-del-1', campaignId: 'seed-sms-campaign-1', to: '+14085551001', from: '+14155551234', status: 'DELIVERED', errorCode: null, errorMessage: null, sentAt: '2026-02-03T09:00:12Z', deliveredAt: '2026-02-03T09:00:15Z', price: 0.0075, currency: 'USD' },
  { id: 'seed-sms-del-2', campaignId: 'seed-sms-campaign-1', to: '+14085551002', from: '+14155551234', status: 'DELIVERED', errorCode: null, errorMessage: null, sentAt: '2026-02-03T09:00:13Z', deliveredAt: '2026-02-03T09:00:18Z', price: 0.0075, currency: 'USD' },
  { id: 'seed-sms-del-3', campaignId: 'seed-sms-campaign-1', to: '+14085551003', from: '+14155551234', status: 'FAILED', errorCode: '30003', errorMessage: 'Unreachable destination handset', sentAt: '2026-02-03T09:00:14Z', deliveredAt: null, price: 0.0075, currency: 'USD' },
  { id: 'seed-sms-del-4', campaignId: 'seed-sms-campaign-2', to: '+14085551004', from: '+14155551234', status: 'DELIVERED', errorCode: null, errorMessage: null, sentAt: '2026-02-10T14:00:05Z', deliveredAt: '2026-02-10T14:00:08Z', price: 0.0075, currency: 'USD' },
  { id: 'seed-sms-del-5', campaignId: 'seed-sms-campaign-2', to: '+442079876543', from: '+14155551234', status: 'UNDELIVERED', errorCode: '30006', errorMessage: 'Landline or unreachable carrier', sentAt: '2026-02-10T14:00:06Z', deliveredAt: null, price: 0.04, currency: 'USD' },
]

export async function fetchSMSProviders(_token: string): Promise<SMSProviderConfig[]> {
  if (useSeedData()) return [...SEED_SMS_PROVIDERS]
  return []
}

export async function fetchSMSPhoneNumbers(_token: string): Promise<SMSPhoneNumber[]> {
  if (useSeedData()) return [...SEED_SMS_PHONE_NUMBERS]
  return []
}

export async function fetchSMSOptRecords(_token: string): Promise<SMSOptRecord[]> {
  if (useSeedData()) return [...SEED_SMS_OPT_RECORDS]
  return []
}

export async function fetchSMSCampaigns(_token: string): Promise<SMSCampaign[]> {
  if (useSeedData()) return [...SEED_SMS_CAMPAIGNS]
  return []
}

export async function fetchSMSDeliveryReports(_token: string, campaignId: string): Promise<SMSDeliveryReport[]> {
  if (useSeedData()) return SEED_SMS_DELIVERY_REPORTS.filter((r) => r.campaignId === campaignId)
  return []
}

export async function fetchSMSStats(_token: string): Promise<SMSIntegrationStats> {
  if (useSeedData()) {
    const optedIn = SEED_SMS_OPT_RECORDS.filter((r) => r.status === 'OPTED_IN').length
    const optedOut = SEED_SMS_OPT_RECORDS.filter((r) => r.status === 'OPTED_OUT').length
    const activeNums = SEED_SMS_PHONE_NUMBERS.filter((n) => n.status === 'ACTIVE').length
    const totalSent = SEED_SMS_CAMPAIGNS.reduce((sum, c) => sum + c.sentCount, 0)
    const totalDelivered = SEED_SMS_CAMPAIGNS.reduce((sum, c) => sum + c.deliveredCount, 0)
    return {
      totalCampaigns: SEED_SMS_CAMPAIGNS.length,
      totalMessagesSent: totalSent,
      deliveryRate: totalSent > 0 ? Math.round((totalDelivered / totalSent) * 10000) / 100 : 0,
      optInCount: optedIn,
      optOutCount: optedOut,
      activeNumbers: activeNums,
      monthlySpend: 18.42,
    }
  }
  return { totalCampaigns: 0, totalMessagesSent: 0, deliveryRate: 0, optInCount: 0, optOutCount: 0, activeNumbers: 0, monthlySpend: 0 }
}

export async function connectSMSProvider(_token: string, config: Partial<SMSProviderConfig>): Promise<SMSProviderConfig> {
  const now = new Date().toISOString()
  const provider: SMSProviderConfig = {
    id: `sms-provider-${Date.now()}`,
    provider: config.provider ?? 'TWILIO',
    accountSid: config.accountSid ?? '',
    authToken: config.authToken ?? '',
    messagingServiceSid: config.messagingServiceSid ?? null,
    defaultFromNumber: config.defaultFromNumber ?? '',
    status: 'CONNECTED',
    connectedAt: now,
    lastTestedAt: now,
    createdAt: now,
    updatedAt: now,
  }
  SEED_SMS_PROVIDERS.push(provider)
  return provider
}

export async function disconnectSMSProvider(_token: string, id: string): Promise<void> {
  const idx = SEED_SMS_PROVIDERS.findIndex((p) => p.id === id)
  if (idx !== -1) SEED_SMS_PROVIDERS.splice(idx, 1)
}

// ---------------------------------------------------------------------------
// Slack Integration Types & Seed Data
// ---------------------------------------------------------------------------

export type SlackConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED' | 'ERROR'
export type SlackPostStatus = 'DRAFT' | 'SCHEDULED' | 'SENT' | 'FAILED' | 'CANCELLED'

export interface SlackWorkspace {
  id: string
  teamId: string
  teamName: string
  botToken: string
  botUserId: string
  installedBy: string
  status: SlackConnectionStatus
  connectedAt: string | null
  scopes: string[]
  createdAt: string
  updatedAt: string
}

export interface SlackChannel {
  id: string
  workspaceId: string
  channelId: string
  channelName: string
  isPrivate: boolean
  memberCount: number
  isMapped: boolean
  mappedTo: string | null
  createdAt: string
}

export interface SlackScheduledPost {
  id: string
  workspaceId: string
  channelId: string
  channelName: string
  message: string
  scheduledAt: string
  sentAt: string | null
  status: SlackPostStatus
  templateId: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface SlackMessageTemplate {
  id: string
  name: string
  body: string
  variables: string[]
  category: 'ANNOUNCEMENT' | 'UPDATE' | 'ALERT' | 'DIGEST' | 'CUSTOM'
  usageCount: number
  createdAt: string
  updatedAt: string
}

export interface SlackIntegrationStats {
  workspaces: number
  mappedChannels: number
  scheduledPosts: number
  sentPosts: number
  activeTemplates: number
}

const SEED_SLACK_WORKSPACES: SlackWorkspace[] = [
  {
    id: 'seed-slack-ws-1',
    teamId: 'T06ABC123',
    teamName: 'AlternateFutures',
    botToken: 'xoxb-••••••••••••-••••••••••••-••••••••••••••••••••••••',
    botUserId: 'U06BOT001',
    installedBy: 'Josh H.',
    status: 'CONNECTED',
    connectedAt: '2026-01-10T08:00:00Z',
    scopes: ['chat:write', 'channels:read', 'channels:join', 'chat:write.customize', 'users:read'],
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-02-14T12:00:00Z',
  },
]

const SEED_SLACK_CHANNELS: SlackChannel[] = [
  { id: 'seed-slack-ch-1', workspaceId: 'seed-slack-ws-1', channelId: 'C06GEN001', channelName: '#general', isPrivate: false, memberCount: 48, isMapped: true, mappedTo: 'announcements', createdAt: '2026-01-10T08:00:00Z' },
  { id: 'seed-slack-ch-2', workspaceId: 'seed-slack-ws-1', channelId: 'C06MKT001', channelName: '#marketing', isPrivate: false, memberCount: 12, isMapped: true, mappedTo: 'campaigns', createdAt: '2026-01-10T08:00:00Z' },
  { id: 'seed-slack-ch-3', workspaceId: 'seed-slack-ws-1', channelId: 'C06ENG001', channelName: '#engineering', isPrivate: false, memberCount: 22, isMapped: true, mappedTo: 'deploys', createdAt: '2026-01-10T08:00:00Z' },
  { id: 'seed-slack-ch-4', workspaceId: 'seed-slack-ws-1', channelId: 'C06DEV001', channelName: '#devrel', isPrivate: false, memberCount: 8, isMapped: false, mappedTo: null, createdAt: '2026-01-10T08:00:00Z' },
  { id: 'seed-slack-ch-5', workspaceId: 'seed-slack-ws-1', channelId: 'C06PRI001', channelName: '#leadership', isPrivate: true, memberCount: 4, isMapped: true, mappedTo: 'executive-updates', createdAt: '2026-01-10T08:00:00Z' },
]

const SEED_SLACK_SCHEDULED_POSTS: SlackScheduledPost[] = [
  {
    id: 'seed-slack-post-1',
    workspaceId: 'seed-slack-ws-1',
    channelId: 'C06GEN001',
    channelName: '#general',
    message: 'Good morning team! Quick reminder: weekly standup at 10am PST today. Agenda: Launch Week debrief, Q1 roadmap priorities.',
    scheduledAt: '2026-02-17T09:00:00Z',
    sentAt: null,
    status: 'SCHEDULED',
    templateId: null,
    createdBy: 'Josh H.',
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'seed-slack-post-2',
    workspaceId: 'seed-slack-ws-1',
    channelId: 'C06MKT001',
    channelName: '#marketing',
    message: 'New blog post published: "Edge Functions on AlternateFutures — Zero Cold Starts, Full Decentralization". Share link: af.ai/blog/edge-functions',
    scheduledAt: '2026-02-18T15:00:00Z',
    sentAt: null,
    status: 'SCHEDULED',
    templateId: 'seed-slack-tpl-1',
    createdBy: 'Growth Advisor',
    createdAt: '2026-02-14T16:00:00Z',
    updatedAt: '2026-02-14T16:00:00Z',
  },
  {
    id: 'seed-slack-post-3',
    workspaceId: 'seed-slack-ws-1',
    channelId: 'C06ENG001',
    channelName: '#engineering',
    message: 'Deploy notification: Auth Service v2.4.1 rolled out to production. Changelog: improved token refresh handling, added PKCE support.',
    scheduledAt: '2026-02-12T18:00:00Z',
    sentAt: '2026-02-12T18:00:03Z',
    status: 'SENT',
    templateId: 'seed-slack-tpl-2',
    createdBy: 'Dev Team Lead',
    createdAt: '2026-02-12T17:30:00Z',
    updatedAt: '2026-02-12T18:00:03Z',
  },
  {
    id: 'seed-slack-post-4',
    workspaceId: 'seed-slack-ws-1',
    channelId: 'C06PRI001',
    channelName: '#leadership',
    message: 'Weekly KPI digest: MRR $2.4K (+12%), New signups: 47, Churn: 2 accounts. Full report: af.ai/admin/dashboard',
    scheduledAt: '2026-02-10T08:00:00Z',
    sentAt: '2026-02-10T08:00:02Z',
    status: 'SENT',
    templateId: 'seed-slack-tpl-3',
    createdBy: 'Josh H.',
    createdAt: '2026-02-09T22:00:00Z',
    updatedAt: '2026-02-10T08:00:02Z',
  },
  {
    id: 'seed-slack-post-5',
    workspaceId: 'seed-slack-ws-1',
    channelId: 'C06GEN001',
    channelName: '#general',
    message: 'Failed to send: network timeout after 3 retries.',
    scheduledAt: '2026-02-08T09:00:00Z',
    sentAt: null,
    status: 'FAILED',
    templateId: null,
    createdBy: 'Growth Advisor',
    createdAt: '2026-02-07T20:00:00Z',
    updatedAt: '2026-02-08T09:05:00Z',
  },
]

const SEED_SLACK_TEMPLATES: SlackMessageTemplate[] = [
  {
    id: 'seed-slack-tpl-1',
    name: 'Blog Post Announcement',
    body: 'New blog post published: "{{title}}". {{summary}} Share link: {{url}}',
    variables: ['title', 'summary', 'url'],
    category: 'ANNOUNCEMENT',
    usageCount: 8,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-02-14T16:00:00Z',
  },
  {
    id: 'seed-slack-tpl-2',
    name: 'Deploy Notification',
    body: 'Deploy notification: {{service}} {{version}} rolled out to {{environment}}. Changelog: {{changes}}',
    variables: ['service', 'version', 'environment', 'changes'],
    category: 'UPDATE',
    usageCount: 23,
    createdAt: '2026-01-12T09:00:00Z',
    updatedAt: '2026-02-12T17:30:00Z',
  },
  {
    id: 'seed-slack-tpl-3',
    name: 'Weekly KPI Digest',
    body: 'Weekly KPI digest: MRR {{mrr}} ({{mrr_change}}), New signups: {{signups}}, Churn: {{churn}}. Full report: {{report_url}}',
    variables: ['mrr', 'mrr_change', 'signups', 'churn', 'report_url'],
    category: 'DIGEST',
    usageCount: 6,
    createdAt: '2026-01-18T14:00:00Z',
    updatedAt: '2026-02-09T22:00:00Z',
  },
  {
    id: 'seed-slack-tpl-4',
    name: 'Incident Alert',
    body: 'ALERT: {{severity}} — {{service}} is experiencing {{issue}}. Status page: {{status_url}} | On-call: {{oncall}}',
    variables: ['severity', 'service', 'issue', 'status_url', 'oncall'],
    category: 'ALERT',
    usageCount: 2,
    createdAt: '2026-01-20T16:00:00Z',
    updatedAt: '2026-01-28T11:00:00Z',
  },
]

export async function fetchSlackWorkspaces(_token: string): Promise<SlackWorkspace[]> {
  if (useSeedData()) return [...SEED_SLACK_WORKSPACES]
  return []
}

export async function fetchSlackChannels(_token: string, workspaceId?: string): Promise<SlackChannel[]> {
  if (useSeedData()) {
    if (workspaceId) return SEED_SLACK_CHANNELS.filter((c) => c.workspaceId === workspaceId)
    return [...SEED_SLACK_CHANNELS]
  }
  return []
}

export async function fetchSlackScheduledPosts(_token: string): Promise<SlackScheduledPost[]> {
  if (useSeedData()) return [...SEED_SLACK_SCHEDULED_POSTS]
  return []
}

export async function fetchSlackTemplates(_token: string): Promise<SlackMessageTemplate[]> {
  if (useSeedData()) return [...SEED_SLACK_TEMPLATES]
  return []
}

export async function fetchSlackStats(_token: string): Promise<SlackIntegrationStats> {
  if (useSeedData()) {
    return {
      workspaces: SEED_SLACK_WORKSPACES.length,
      mappedChannels: SEED_SLACK_CHANNELS.filter((c) => c.isMapped).length,
      scheduledPosts: SEED_SLACK_SCHEDULED_POSTS.filter((p) => p.status === 'SCHEDULED').length,
      sentPosts: SEED_SLACK_SCHEDULED_POSTS.filter((p) => p.status === 'SENT').length,
      activeTemplates: SEED_SLACK_TEMPLATES.length,
    }
  }
  return { workspaces: 0, mappedChannels: 0, scheduledPosts: 0, sentPosts: 0, activeTemplates: 0 }
}

export async function connectSlackWorkspace(_token: string, botToken: string): Promise<SlackWorkspace> {
  const now = new Date().toISOString()
  const ws: SlackWorkspace = {
    id: `slack-ws-${Date.now()}`,
    teamId: `T${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    teamName: 'New Workspace',
    botToken: botToken,
    botUserId: `U${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    installedBy: 'Admin',
    status: 'CONNECTED',
    connectedAt: now,
    scopes: ['chat:write', 'channels:read'],
    createdAt: now,
    updatedAt: now,
  }
  SEED_SLACK_WORKSPACES.push(ws)
  return ws
}

export async function disconnectSlackWorkspace(_token: string, id: string): Promise<void> {
  const idx = SEED_SLACK_WORKSPACES.findIndex((w) => w.id === id)
  if (idx !== -1) SEED_SLACK_WORKSPACES.splice(idx, 1)
}

export async function updateSlackChannelMapping(_token: string, channelId: string, mappedTo: string | null): Promise<SlackChannel> {
  const idx = SEED_SLACK_CHANNELS.findIndex((c) => c.id === channelId)
  if (idx === -1) throw new Error('Channel not found')
  SEED_SLACK_CHANNELS[idx] = {
    ...SEED_SLACK_CHANNELS[idx],
    isMapped: mappedTo !== null,
    mappedTo,
  }
  return SEED_SLACK_CHANNELS[idx]
}

// ---------------------------------------------------------------------------
// Re-export seed data for use in mock mode
// ---------------------------------------------------------------------------

export {
  SEED_LOCATIONS, SEED_PROVIDERS, SEED_SERVICES, SEED_BOOKINGS,
  SEED_SMS_PROVIDERS, SEED_SMS_PHONE_NUMBERS, SEED_SMS_OPT_RECORDS,
  SEED_SMS_CAMPAIGNS, SEED_SMS_DELIVERY_REPORTS,
  SEED_SLACK_WORKSPACES, SEED_SLACK_CHANNELS, SEED_SLACK_SCHEDULED_POSTS,
  SEED_SLACK_TEMPLATES,
}
