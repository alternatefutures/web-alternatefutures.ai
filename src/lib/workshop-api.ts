const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WorkshopStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'CANCELLED'

export type WorkshopFormat = 'ONLINE' | 'IN_PERSON' | 'HYBRID'

export type SessionRecurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'

export type RegistrationStatus =
  | 'REGISTERED'
  | 'WAITLISTED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'ATTENDED'
  | 'NO_SHOW'

export type CertificateStatus = 'ISSUED' | 'REVOKED'

export interface Instructor {
  id: string
  name: string
  bio: string | null
  photoUrl: string | null
  title: string
  specializations: string[]
  email: string
  createdAt: string
  updatedAt: string
}

export interface Workshop {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  instructorId: string
  capacity: number
  enrolledCount: number
  waitlistCount: number
  duration: number // total minutes
  price: number // cents
  currency: string
  format: WorkshopFormat
  tags: string[]
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  prerequisites: string[]
  learningOutcomes: string[]
  thumbnailUrl: string | null
  status: WorkshopStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  workshopId: string
  title: string
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  timezone: string
  recurrence: SessionRecurrence
  venue: string | null
  onlineLink: string | null
  format: WorkshopFormat
  maxAttendees: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface Registration {
  id: string
  workshopId: string
  personId: string | null
  name: string
  email: string
  phone: string | null
  status: RegistrationStatus
  amountPaid: number // cents
  refundAmount: number // cents
  registeredAt: string
  cancelledAt: string | null
  cancellationReason: string | null
  attendanceCheckedIn: boolean
  completionPercentage: number // 0-100
  feedbackScore: number | null // 1-5
  feedbackComment: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface Certificate {
  id: string
  certificateId: string // public-facing ID e.g. "AF-WS-2026-0001"
  workshopId: string
  registrationId: string
  recipientName: string
  recipientEmail: string
  courseTitle: string
  completionDate: string
  templateName: string
  status: CertificateStatus
  issuedAt: string
  revokedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface WorkshopAnalytics {
  totalWorkshops: number
  publishedWorkshops: number
  totalEnrollments: number
  totalRevenue: number
  avgCompletionRate: number
  avgSatisfactionScore: number
  waitlistTotal: number
  certificatesIssued: number
}

export interface CreateWorkshopInput {
  title: string
  slug: string
  description: string
  shortDescription: string
  instructorId: string
  capacity: number
  duration: number
  price: number
  currency?: string
  format: WorkshopFormat
  tags?: string[]
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  prerequisites?: string[]
  learningOutcomes?: string[]
  thumbnailUrl?: string
  status?: WorkshopStatus
}

export interface UpdateWorkshopInput {
  title?: string
  slug?: string
  description?: string
  shortDescription?: string
  instructorId?: string
  capacity?: number
  duration?: number
  price?: number
  currency?: string
  format?: WorkshopFormat
  tags?: string[]
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  prerequisites?: string[]
  learningOutcomes?: string[]
  thumbnailUrl?: string | null
  status?: WorkshopStatus
}

export interface CreateSessionInput {
  workshopId: string
  title: string
  date: string
  startTime: string
  endTime: string
  timezone: string
  recurrence?: SessionRecurrence
  venue?: string
  onlineLink?: string
  format: WorkshopFormat
  maxAttendees?: number
  notes?: string
}

export interface CreateRegistrationInput {
  workshopId: string
  personId?: string
  name: string
  email: string
  phone?: string
  amountPaid: number
  notes?: string
}

export interface FetchWorkshopsOpts {
  status?: WorkshopStatus
  format?: WorkshopFormat
  instructorId?: string
  query?: string
  timeframe?: 'upcoming' | 'past' | 'draft'
  limit?: number
  offset?: number
}

// ---------------------------------------------------------------------------
// Seed data -- used in development when the GraphQL API is unreachable
// ---------------------------------------------------------------------------

const SEED_INSTRUCTORS: Instructor[] = [
  {
    id: 'seed-instructor-1',
    name: 'Josh H.',
    bio: 'CEO & Founder of AlternateFutures. Expert in decentralized infrastructure, Web3 strategy, and platform architecture.',
    photoUrl: 'https://placehold.co/100x100/6366F1/FFFFFF?text=JH',
    title: 'CEO / Founder',
    specializations: ['web3', 'architecture', 'strategy', 'ipfs'],
    email: 'josh@alternatefutures.ai',
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-01T00:00:00Z',
  },
  {
    id: 'seed-instructor-2',
    name: 'Dev Team Lead',
    bio: 'CTO-level engineering leadership. Expert in distributed systems, Akash deployments, and modern DevOps.',
    photoUrl: 'https://placehold.co/100x100/10B981/FFFFFF?text=DT',
    title: 'CTO / Dev Lead',
    specializations: ['devops', 'akash', 'distributed-systems', 'typescript'],
    email: 'dev@alternatefutures.ai',
    createdAt: '2025-10-05T00:00:00Z',
    updatedAt: '2025-10-05T00:00:00Z',
  },
  {
    id: 'seed-instructor-3',
    name: 'Growth Advisor',
    bio: 'Marketing and growth expert specializing in developer community building and go-to-market strategy.',
    photoUrl: 'https://placehold.co/100x100/EC4899/FFFFFF?text=GA',
    title: 'Growth Advisor',
    specializations: ['marketing', 'community', 'content-strategy', 'devrel'],
    email: 'growth@alternatefutures.ai',
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2025-11-01T00:00:00Z',
  },
]

const SEED_WORKSHOPS: Workshop[] = [
  {
    id: 'seed-workshop-1',
    title: 'Decentralized Hosting Masterclass',
    slug: 'decentralized-hosting-masterclass',
    description:
      'A comprehensive workshop covering IPFS, Arweave, and Filecoin storage patterns. Learn how to deploy static sites, dynamic apps, and serverless functions on decentralized infrastructure. Includes hands-on labs deploying to AlternateFutures and Akash Network.',
    shortDescription: 'Master decentralized hosting with IPFS, Arweave, and Akash deployments.',
    instructorId: 'seed-instructor-1',
    capacity: 30,
    enrolledCount: 24,
    waitlistCount: 3,
    duration: 360,
    price: 29900,
    currency: 'USD',
    format: 'ONLINE',
    tags: ['ipfs', 'arweave', 'akash', 'hosting', 'web3'],
    level: 'INTERMEDIATE',
    prerequisites: ['Basic understanding of web development', 'Familiarity with command line'],
    learningOutcomes: [
      'Deploy sites to IPFS and Arweave',
      'Configure Akash SDL files',
      'Set up CI/CD for decentralized deployments',
      'Implement content addressing patterns',
    ],
    thumbnailUrl: null,
    status: 'PUBLISHED',
    publishedAt: '2025-12-15T00:00:00Z',
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'seed-workshop-2',
    title: 'Web3 Developer Bootcamp',
    slug: 'web3-developer-bootcamp',
    description:
      'An intensive 2-day bootcamp for developers transitioning from traditional web to Web3. Covers smart contract basics, decentralized storage integration, wallet authentication (SIWE), and building dApps on the AlternateFutures platform.',
    shortDescription: 'Intensive 2-day bootcamp for Web3 development fundamentals.',
    instructorId: 'seed-instructor-2',
    capacity: 20,
    enrolledCount: 18,
    waitlistCount: 5,
    duration: 960,
    price: 49900,
    currency: 'USD',
    format: 'HYBRID',
    tags: ['web3', 'bootcamp', 'smart-contracts', 'dapps', 'siwe'],
    level: 'BEGINNER',
    prerequisites: ['JavaScript/TypeScript proficiency', 'Basic React or Svelte experience'],
    learningOutcomes: [
      'Build and deploy a dApp from scratch',
      'Implement wallet-based authentication',
      'Interact with smart contracts',
      'Use decentralized storage APIs',
    ],
    thumbnailUrl: null,
    status: 'PUBLISHED',
    publishedAt: '2026-01-10T00:00:00Z',
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 'seed-workshop-3',
    title: 'Akash Network Deep Dive',
    slug: 'akash-network-deep-dive',
    description:
      'Advanced workshop on deploying and managing production workloads on Akash Network. Covers SDL authoring, provider selection, GPU deployments, persistent storage, and cost optimization strategies.',
    shortDescription: 'Production-ready Akash deployments and cost optimization.',
    instructorId: 'seed-instructor-2',
    capacity: 15,
    enrolledCount: 12,
    waitlistCount: 0,
    duration: 240,
    price: 19900,
    currency: 'USD',
    format: 'ONLINE',
    tags: ['akash', 'devops', 'infrastructure', 'gpu', 'deployment'],
    level: 'ADVANCED',
    prerequisites: ['Docker/container experience', 'Basic Kubernetes concepts', 'CLI proficiency'],
    learningOutcomes: [
      'Author production-grade SDL files',
      'Optimize provider selection and bidding',
      'Configure persistent storage and GPUs',
      'Implement monitoring and auto-scaling patterns',
    ],
    thumbnailUrl: null,
    status: 'PUBLISHED',
    publishedAt: '2026-01-20T00:00:00Z',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'seed-workshop-4',
    title: 'Developer Relations & Community Building',
    slug: 'developer-relations-community-building',
    description:
      'Learn how to build and scale a developer community from zero. Covers content strategy, community management, DevRel metrics, event planning, and developer advocacy programs.',
    shortDescription: 'Build thriving developer communities with proven DevRel strategies.',
    instructorId: 'seed-instructor-3',
    capacity: 40,
    enrolledCount: 15,
    waitlistCount: 0,
    duration: 180,
    price: 14900,
    currency: 'USD',
    format: 'ONLINE',
    tags: ['devrel', 'community', 'marketing', 'content', 'events'],
    level: 'BEGINNER',
    prerequisites: [],
    learningOutcomes: [
      'Design a developer advocacy program',
      'Create technical content calendars',
      'Measure DevRel impact with KPIs',
      'Run successful developer events',
    ],
    thumbnailUrl: null,
    status: 'PUBLISHED',
    publishedAt: '2026-02-01T00:00:00Z',
    createdAt: '2026-01-25T00:00:00Z',
    updatedAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'seed-workshop-5',
    title: 'Platform Migration Workshop',
    slug: 'platform-migration-workshop',
    description:
      'Step-by-step guide to migrating existing projects from centralized platforms (Vercel, Netlify, AWS) to AlternateFutures. Covers DNS configuration, CI/CD setup, environment variables, and performance benchmarking.',
    shortDescription: 'Migrate from Vercel/Netlify/AWS to decentralized hosting.',
    instructorId: 'seed-instructor-1',
    capacity: 25,
    enrolledCount: 0,
    waitlistCount: 0,
    duration: 120,
    price: 0,
    currency: 'USD',
    format: 'ONLINE',
    tags: ['migration', 'vercel', 'netlify', 'devops', 'free'],
    level: 'INTERMEDIATE',
    prerequisites: ['Active project on a centralized platform'],
    learningOutcomes: [
      'Complete migration of a production site',
      'Configure custom domains and SSL',
      'Set up automated deployments',
      'Compare performance metrics pre/post migration',
    ],
    thumbnailUrl: null,
    status: 'DRAFT',
    publishedAt: null,
    createdAt: '2026-02-10T00:00:00Z',
    updatedAt: '2026-02-14T00:00:00Z',
  },
  {
    id: 'seed-workshop-6',
    title: 'AI Agent Deployment on Akash',
    slug: 'ai-agent-deployment-akash',
    description:
      'Learn to deploy AI agents and LLM-powered applications on Akash Network GPU instances. Covers model serving, inference optimization, cost management, and building production-ready AI workflows.',
    shortDescription: 'Deploy AI agents on Akash GPU instances.',
    instructorId: 'seed-instructor-2',
    capacity: 20,
    enrolledCount: 0,
    waitlistCount: 0,
    duration: 300,
    price: 39900,
    currency: 'USD',
    format: 'ONLINE',
    tags: ['ai', 'gpu', 'akash', 'llm', 'agents', 'ml'],
    level: 'ADVANCED',
    prerequisites: ['Python or TypeScript', 'Basic ML concepts', 'Docker experience'],
    learningOutcomes: [
      'Deploy LLM models on Akash GPU instances',
      'Build AI agent workflows',
      'Optimize inference costs',
      'Implement monitoring and scaling',
    ],
    thumbnailUrl: null,
    status: 'DRAFT',
    publishedAt: null,
    createdAt: '2026-02-12T00:00:00Z',
    updatedAt: '2026-02-14T00:00:00Z',
  },
]

const SEED_SESSIONS: Session[] = [
  // Workshop 1 sessions
  {
    id: 'seed-session-1',
    workshopId: 'seed-workshop-1',
    title: 'IPFS Fundamentals & Pinning',
    date: '2026-03-01',
    startTime: '10:00',
    endTime: '12:00',
    timezone: 'America/Los_Angeles',
    recurrence: 'NONE',
    venue: null,
    onlineLink: 'https://zoom.us/j/af-ws-hosting-1',
    format: 'ONLINE',
    maxAttendees: 30,
    notes: 'Bring a project to deploy during the hands-on section.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-session-2',
    workshopId: 'seed-workshop-1',
    title: 'Arweave & Permanent Storage',
    date: '2026-03-08',
    startTime: '10:00',
    endTime: '12:00',
    timezone: 'America/Los_Angeles',
    recurrence: 'NONE',
    venue: null,
    onlineLink: 'https://zoom.us/j/af-ws-hosting-2',
    format: 'ONLINE',
    maxAttendees: 30,
    notes: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-session-3',
    workshopId: 'seed-workshop-1',
    title: 'Akash Deployments & CI/CD',
    date: '2026-03-15',
    startTime: '10:00',
    endTime: '12:00',
    timezone: 'America/Los_Angeles',
    recurrence: 'NONE',
    venue: null,
    onlineLink: 'https://zoom.us/j/af-ws-hosting-3',
    format: 'ONLINE',
    maxAttendees: 30,
    notes: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  // Workshop 2 sessions
  {
    id: 'seed-session-4',
    workshopId: 'seed-workshop-2',
    title: 'Day 1: Web3 Foundations & Wallets',
    date: '2026-03-10',
    startTime: '09:00',
    endTime: '17:00',
    timezone: 'America/New_York',
    recurrence: 'NONE',
    venue: 'WeWork Yerevan, 4 Amiryan St',
    onlineLink: 'https://zoom.us/j/af-ws-bootcamp-1',
    format: 'HYBRID',
    maxAttendees: 20,
    notes: 'Lunch provided for in-person attendees.',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'seed-session-5',
    workshopId: 'seed-workshop-2',
    title: 'Day 2: Building & Deploying dApps',
    date: '2026-03-11',
    startTime: '09:00',
    endTime: '17:00',
    timezone: 'America/New_York',
    recurrence: 'NONE',
    venue: 'WeWork Yerevan, 4 Amiryan St',
    onlineLink: 'https://zoom.us/j/af-ws-bootcamp-2',
    format: 'HYBRID',
    maxAttendees: 20,
    notes: null,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  // Workshop 3 sessions
  {
    id: 'seed-session-6',
    workshopId: 'seed-workshop-3',
    title: 'SDL Authoring & Provider Selection',
    date: '2026-03-20',
    startTime: '14:00',
    endTime: '16:00',
    timezone: 'America/Los_Angeles',
    recurrence: 'NONE',
    venue: null,
    onlineLink: 'https://zoom.us/j/af-ws-akash-1',
    format: 'ONLINE',
    maxAttendees: 15,
    notes: null,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'seed-session-7',
    workshopId: 'seed-workshop-3',
    title: 'GPU Deployments & Cost Optimization',
    date: '2026-03-27',
    startTime: '14:00',
    endTime: '16:00',
    timezone: 'America/Los_Angeles',
    recurrence: 'NONE',
    venue: null,
    onlineLink: 'https://zoom.us/j/af-ws-akash-2',
    format: 'ONLINE',
    maxAttendees: 15,
    notes: null,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
  // Workshop 4 sessions
  {
    id: 'seed-session-8',
    workshopId: 'seed-workshop-4',
    title: 'DevRel Strategy & Community Foundations',
    date: '2026-03-05',
    startTime: '11:00',
    endTime: '14:00',
    timezone: 'Europe/London',
    recurrence: 'NONE',
    venue: null,
    onlineLink: 'https://meet.google.com/af-ws-devrel-1',
    format: 'ONLINE',
    maxAttendees: 40,
    notes: null,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
]

const SEED_REGISTRATIONS: Registration[] = [
  // Workshop 1 registrations
  {
    id: 'seed-reg-1',
    workshopId: 'seed-workshop-1',
    personId: 'seed-person-5',
    name: 'David Park',
    email: 'david@techventures.io',
    phone: '+1-415-555-0101',
    status: 'REGISTERED',
    amountPaid: 29900,
    refundAmount: 0,
    registeredAt: '2026-01-02T10:00:00Z',
    cancelledAt: null,
    cancellationReason: null,
    attendanceCheckedIn: false,
    completionPercentage: 0,
    feedbackScore: null,
    feedbackComment: null,
    notes: null,
    createdAt: '2026-01-02T10:00:00Z',
    updatedAt: '2026-01-02T10:00:00Z',
  },
  {
    id: 'seed-reg-2',
    workshopId: 'seed-workshop-1',
    personId: 'seed-person-6',
    name: 'Nina Petrova',
    email: 'nina@codeforge.dev',
    phone: null,
    status: 'REGISTERED',
    amountPaid: 29900,
    refundAmount: 0,
    registeredAt: '2026-01-03T14:30:00Z',
    cancelledAt: null,
    cancellationReason: null,
    attendanceCheckedIn: false,
    completionPercentage: 0,
    feedbackScore: null,
    feedbackComment: null,
    notes: 'Interested in Arweave section specifically.',
    createdAt: '2026-01-03T14:30:00Z',
    updatedAt: '2026-01-03T14:30:00Z',
  },
  {
    id: 'seed-reg-3',
    workshopId: 'seed-workshop-1',
    personId: 'seed-person-7',
    name: 'Omar Hassan',
    email: 'omar@startupstudio.co',
    phone: '+44-20-7946-0958',
    status: 'ATTENDED',
    amountPaid: 29900,
    refundAmount: 0,
    registeredAt: '2026-01-05T09:00:00Z',
    cancelledAt: null,
    cancellationReason: null,
    attendanceCheckedIn: true,
    completionPercentage: 100,
    feedbackScore: 5,
    feedbackComment: 'Excellent workshop. Hands-on labs were the highlight.',
    notes: null,
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-02-01T12:00:00Z',
  },
  {
    id: 'seed-reg-4',
    workshopId: 'seed-workshop-1',
    personId: null,
    name: 'Lena Kowalski',
    email: 'lena@nodeworks.xyz',
    phone: null,
    status: 'WAITLISTED',
    amountPaid: 0,
    refundAmount: 0,
    registeredAt: '2026-01-20T16:00:00Z',
    cancelledAt: null,
    cancellationReason: null,
    attendanceCheckedIn: false,
    completionPercentage: 0,
    feedbackScore: null,
    feedbackComment: null,
    notes: 'On waitlist — capacity full.',
    createdAt: '2026-01-20T16:00:00Z',
    updatedAt: '2026-01-20T16:00:00Z',
  },
  {
    id: 'seed-reg-5',
    workshopId: 'seed-workshop-1',
    personId: 'seed-person-9',
    name: 'Raj Patel',
    email: 'raj@blockinfra.io',
    phone: '+91-98765-43210',
    status: 'CANCELLED',
    amountPaid: 29900,
    refundAmount: 29900,
    registeredAt: '2026-01-08T11:00:00Z',
    cancelledAt: '2026-01-25T08:00:00Z',
    cancellationReason: 'Schedule conflict with company offsite.',
    attendanceCheckedIn: false,
    completionPercentage: 0,
    feedbackScore: null,
    feedbackComment: null,
    notes: null,
    createdAt: '2026-01-08T11:00:00Z',
    updatedAt: '2026-01-25T08:00:00Z',
  },
  // Workshop 2 registrations
  {
    id: 'seed-reg-6',
    workshopId: 'seed-workshop-2',
    personId: 'seed-person-1',
    name: 'Alice Chen',
    email: 'alice@example.com',
    phone: null,
    status: 'REGISTERED',
    amountPaid: 49900,
    refundAmount: 0,
    registeredAt: '2026-01-15T10:00:00Z',
    cancelledAt: null,
    cancellationReason: null,
    attendanceCheckedIn: false,
    completionPercentage: 0,
    feedbackScore: null,
    feedbackComment: null,
    notes: null,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'seed-reg-7',
    workshopId: 'seed-workshop-2',
    personId: 'seed-person-2',
    name: 'Marcus Rivera',
    email: 'marcus@devstudio.io',
    phone: null,
    status: 'REGISTERED',
    amountPaid: 49900,
    refundAmount: 0,
    registeredAt: '2026-01-16T08:30:00Z',
    cancelledAt: null,
    cancellationReason: null,
    attendanceCheckedIn: false,
    completionPercentage: 0,
    feedbackScore: null,
    feedbackComment: null,
    notes: 'Wants focus on SIWE integration.',
    createdAt: '2026-01-16T08:30:00Z',
    updatedAt: '2026-01-16T08:30:00Z',
  },
  {
    id: 'seed-reg-8',
    workshopId: 'seed-workshop-2',
    personId: null,
    name: 'Sona Grigoryan',
    email: 'sona@yerevantech.am',
    phone: '+374-10-555-123',
    status: 'WAITLISTED',
    amountPaid: 0,
    refundAmount: 0,
    registeredAt: '2026-02-01T12:00:00Z',
    cancelledAt: null,
    cancellationReason: null,
    attendanceCheckedIn: false,
    completionPercentage: 0,
    feedbackScore: null,
    feedbackComment: null,
    notes: 'Attending with team of 3 from Yerevan.',
    createdAt: '2026-02-01T12:00:00Z',
    updatedAt: '2026-02-01T12:00:00Z',
  },
  // Workshop 3 registrations
  {
    id: 'seed-reg-9',
    workshopId: 'seed-workshop-3',
    personId: 'seed-person-12',
    name: 'Frank Mueller',
    email: 'frank@webmasters.co',
    phone: '+49-30-555-0199',
    status: 'ATTENDED',
    amountPaid: 19900,
    refundAmount: 0,
    registeredAt: '2026-01-22T14:00:00Z',
    cancelledAt: null,
    cancellationReason: null,
    attendanceCheckedIn: true,
    completionPercentage: 100,
    feedbackScore: 4,
    feedbackComment: 'Great depth on SDL authoring. Would like more on GPU workloads.',
    notes: null,
    createdAt: '2026-01-22T14:00:00Z',
    updatedAt: '2026-02-05T15:00:00Z',
  },
  {
    id: 'seed-reg-10',
    workshopId: 'seed-workshop-3',
    personId: 'seed-person-13',
    name: 'Maria Santos',
    email: 'maria@daohub.org',
    phone: null,
    status: 'ATTENDED',
    amountPaid: 19900,
    refundAmount: 0,
    registeredAt: '2026-01-23T09:00:00Z',
    cancelledAt: null,
    cancellationReason: null,
    attendanceCheckedIn: true,
    completionPercentage: 75,
    feedbackScore: 5,
    feedbackComment: 'Exactly what our team needed for our Akash migration.',
    notes: null,
    createdAt: '2026-01-23T09:00:00Z',
    updatedAt: '2026-02-05T15:00:00Z',
  },
  // Workshop 4 registrations
  {
    id: 'seed-reg-11',
    workshopId: 'seed-workshop-4',
    personId: 'seed-person-15',
    name: 'Jessica Wright',
    email: 'jessica@growthlab.io',
    phone: '+1-212-555-0173',
    status: 'REGISTERED',
    amountPaid: 14900,
    refundAmount: 0,
    registeredAt: '2026-02-05T10:00:00Z',
    cancelledAt: null,
    cancellationReason: null,
    attendanceCheckedIn: false,
    completionPercentage: 0,
    feedbackScore: null,
    feedbackComment: null,
    notes: 'Building DevRel program for a new Web3 startup.',
    createdAt: '2026-02-05T10:00:00Z',
    updatedAt: '2026-02-05T10:00:00Z',
  },
  {
    id: 'seed-reg-12',
    workshopId: 'seed-workshop-4',
    personId: 'seed-person-3',
    name: 'Yuki Tanaka',
    email: 'yuki@builds.dev',
    phone: null,
    status: 'NO_SHOW',
    amountPaid: 14900,
    refundAmount: 0,
    registeredAt: '2026-02-06T14:00:00Z',
    cancelledAt: null,
    cancellationReason: null,
    attendanceCheckedIn: false,
    completionPercentage: 0,
    feedbackScore: null,
    feedbackComment: null,
    notes: 'No-show. Follow-up email sent.',
    createdAt: '2026-02-06T14:00:00Z',
    updatedAt: '2026-02-10T09:00:00Z',
  },
]

const SEED_CERTIFICATES: Certificate[] = [
  {
    id: 'seed-cert-1',
    certificateId: 'AF-WS-2026-0001',
    workshopId: 'seed-workshop-1',
    registrationId: 'seed-reg-3',
    recipientName: 'Omar Hassan',
    recipientEmail: 'omar@startupstudio.co',
    courseTitle: 'Decentralized Hosting Masterclass',
    completionDate: '2026-02-01',
    templateName: 'Standard Completion',
    status: 'ISSUED',
    issuedAt: '2026-02-02T10:00:00Z',
    revokedAt: null,
    createdAt: '2026-02-02T10:00:00Z',
    updatedAt: '2026-02-02T10:00:00Z',
  },
  {
    id: 'seed-cert-2',
    certificateId: 'AF-WS-2026-0002',
    workshopId: 'seed-workshop-3',
    registrationId: 'seed-reg-9',
    recipientName: 'Frank Mueller',
    recipientEmail: 'frank@webmasters.co',
    courseTitle: 'Akash Network Deep Dive',
    completionDate: '2026-02-05',
    templateName: 'Advanced Certification',
    status: 'ISSUED',
    issuedAt: '2026-02-06T09:00:00Z',
    revokedAt: null,
    createdAt: '2026-02-06T09:00:00Z',
    updatedAt: '2026-02-06T09:00:00Z',
  },
  {
    id: 'seed-cert-3',
    certificateId: 'AF-WS-2026-0003',
    workshopId: 'seed-workshop-3',
    registrationId: 'seed-reg-10',
    recipientName: 'Maria Santos',
    recipientEmail: 'maria@daohub.org',
    courseTitle: 'Akash Network Deep Dive',
    completionDate: '2026-02-05',
    templateName: 'Advanced Certification',
    status: 'ISSUED',
    issuedAt: '2026-02-06T09:30:00Z',
    revokedAt: null,
    createdAt: '2026-02-06T09:30:00Z',
    updatedAt: '2026-02-06T09:30:00Z',
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

export function formatPrice(cents: number, currency = 'USD'): string {
  if (cents === 0) return 'Free'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100)
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

// ---------------------------------------------------------------------------
// GraphQL queries & mutations
// ---------------------------------------------------------------------------

const WORKSHOP_FIELDS = `
  id title slug description shortDescription instructorId capacity enrolledCount
  waitlistCount duration price currency format tags level prerequisites
  learningOutcomes thumbnailUrl status publishedAt createdAt updatedAt
`

const SESSION_FIELDS = `
  id workshopId title date startTime endTime timezone recurrence
  venue onlineLink format maxAttendees notes createdAt updatedAt
`

const REGISTRATION_FIELDS = `
  id workshopId personId name email phone status amountPaid refundAmount
  registeredAt cancelledAt cancellationReason attendanceCheckedIn
  completionPercentage feedbackScore feedbackComment notes createdAt updatedAt
`

const CERTIFICATE_FIELDS = `
  id certificateId workshopId registrationId recipientName recipientEmail
  courseTitle completionDate templateName status issuedAt revokedAt createdAt updatedAt
`

const WORKSHOPS_QUERY = `
  query Workshops($status: WorkshopStatus, $format: WorkshopFormat, $instructorId: ID, $query: String, $limit: Int, $offset: Int) {
    workshops(status: $status, format: $format, instructorId: $instructorId, query: $query, limit: $limit, offset: $offset) {
      ${WORKSHOP_FIELDS}
    }
  }
`

const WORKSHOP_BY_ID_QUERY = `
  query WorkshopById($id: ID!) {
    workshopById(id: $id) {
      ${WORKSHOP_FIELDS}
    }
  }
`

const CREATE_WORKSHOP_MUTATION = `
  mutation CreateWorkshop($input: CreateWorkshopInput!) {
    createWorkshop(input: $input) {
      ${WORKSHOP_FIELDS}
    }
  }
`

const UPDATE_WORKSHOP_MUTATION = `
  mutation UpdateWorkshop($id: ID!, $input: UpdateWorkshopInput!) {
    updateWorkshop(id: $id, input: $input) {
      ${WORKSHOP_FIELDS}
    }
  }
`

const DELETE_WORKSHOP_MUTATION = `
  mutation DeleteWorkshop($id: ID!) {
    deleteWorkshop(id: $id)
  }
`

const SESSIONS_QUERY = `
  query WorkshopSessions($workshopId: ID!) {
    workshopSessions(workshopId: $workshopId) {
      ${SESSION_FIELDS}
    }
  }
`

const CREATE_SESSION_MUTATION = `
  mutation CreateWorkshopSession($input: CreateWorkshopSessionInput!) {
    createWorkshopSession(input: $input) {
      ${SESSION_FIELDS}
    }
  }
`

const DELETE_SESSION_MUTATION = `
  mutation DeleteWorkshopSession($id: ID!) {
    deleteWorkshopSession(id: $id)
  }
`

const REGISTRATIONS_QUERY = `
  query WorkshopRegistrations($workshopId: ID!, $status: RegistrationStatus, $limit: Int, $offset: Int) {
    workshopRegistrations(workshopId: $workshopId, status: $status, limit: $limit, offset: $offset) {
      ${REGISTRATION_FIELDS}
    }
  }
`

const CREATE_REGISTRATION_MUTATION = `
  mutation CreateWorkshopRegistration($input: CreateWorkshopRegistrationInput!) {
    createWorkshopRegistration(input: $input) {
      ${REGISTRATION_FIELDS}
    }
  }
`

const UPDATE_REGISTRATION_MUTATION = `
  mutation UpdateWorkshopRegistration($id: ID!, $input: UpdateWorkshopRegistrationInput!) {
    updateWorkshopRegistration(id: $id, input: $input) {
      ${REGISTRATION_FIELDS}
    }
  }
`

const CERTIFICATES_QUERY = `
  query WorkshopCertificates($workshopId: ID, $limit: Int, $offset: Int) {
    workshopCertificates(workshopId: $workshopId, limit: $limit, offset: $offset) {
      ${CERTIFICATE_FIELDS}
    }
  }
`

const CREATE_CERTIFICATE_MUTATION = `
  mutation CreateWorkshopCertificate($input: CreateWorkshopCertificateInput!) {
    createWorkshopCertificate(input: $input) {
      ${CERTIFICATE_FIELDS}
    }
  }
`

const WORKSHOP_ANALYTICS_QUERY = `
  query WorkshopAnalytics {
    workshopAnalytics {
      totalWorkshops publishedWorkshops totalEnrollments totalRevenue
      avgCompletionRate avgSatisfactionScore waitlistTotal certificatesIssued
    }
  }
`

const INSTRUCTORS_QUERY = `
  query Instructors {
    instructors {
      id name bio photoUrl title specializations email createdAt updatedAt
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

let mockWorkshops = [...SEED_WORKSHOPS]
let mockSessions = [...SEED_SESSIONS]
let mockRegistrations = [...SEED_REGISTRATIONS]
let mockCertificates = [...SEED_CERTIFICATES]
let mockInstructors = [...SEED_INSTRUCTORS]

// ---------------------------------------------------------------------------
// CRUD functions -- Workshop
// ---------------------------------------------------------------------------

export async function fetchWorkshops(
  token: string,
  opts: FetchWorkshopsOpts = {},
): Promise<Workshop[]> {
  try {
    const data = await authGraphqlFetch<{ workshops: Workshop[] }>(
      WORKSHOPS_QUERY,
      opts,
      token,
    )
    return data.workshops
  } catch {
    if (useSeedData()) {
      let result = [...mockWorkshops]
      if (opts.status) {
        result = result.filter((w) => w.status === opts.status)
      }
      if (opts.format) {
        result = result.filter((w) => w.format === opts.format)
      }
      if (opts.instructorId) {
        result = result.filter((w) => w.instructorId === opts.instructorId)
      }
      if (opts.timeframe === 'draft') {
        result = result.filter((w) => w.status === 'DRAFT')
      } else if (opts.timeframe === 'upcoming') {
        result = result.filter((w) => w.status === 'PUBLISHED')
      } else if (opts.timeframe === 'past') {
        result = result.filter((w) => w.status === 'ARCHIVED')
      }
      if (opts.query) {
        const q = opts.query.toLowerCase()
        result = result.filter(
          (w) =>
            w.title.toLowerCase().includes(q) ||
            w.description.toLowerCase().includes(q) ||
            w.tags.some((t) => t.toLowerCase().includes(q)),
        )
      }
      const offset = opts.offset ?? 0
      const limit = opts.limit ?? 100
      return result.slice(offset, offset + limit)
    }
    return []
  }
}

export async function fetchWorkshopById(
  token: string,
  id: string,
): Promise<Workshop | null> {
  try {
    const data = await authGraphqlFetch<{ workshopById: Workshop }>(
      WORKSHOP_BY_ID_QUERY,
      { id },
      token,
    )
    return data.workshopById
  } catch {
    if (useSeedData()) return mockWorkshops.find((w) => w.id === id) || null
    return null
  }
}

export async function createWorkshop(
  token: string,
  input: CreateWorkshopInput,
): Promise<Workshop> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const workshop: Workshop = {
      id: `seed-workshop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: input.title,
      slug: input.slug,
      description: input.description,
      shortDescription: input.shortDescription,
      instructorId: input.instructorId,
      capacity: input.capacity,
      enrolledCount: 0,
      waitlistCount: 0,
      duration: input.duration,
      price: input.price,
      currency: input.currency ?? 'USD',
      format: input.format,
      tags: input.tags ?? [],
      level: input.level ?? 'BEGINNER',
      prerequisites: input.prerequisites ?? [],
      learningOutcomes: input.learningOutcomes ?? [],
      thumbnailUrl: input.thumbnailUrl ?? null,
      status: input.status ?? 'DRAFT',
      publishedAt: null,
      createdAt: now,
      updatedAt: now,
    }
    mockWorkshops = [workshop, ...mockWorkshops]
    return workshop
  }

  const data = await authGraphqlFetch<{ createWorkshop: Workshop }>(
    CREATE_WORKSHOP_MUTATION,
    { input },
    token,
  )
  return data.createWorkshop
}

export async function updateWorkshop(
  token: string,
  id: string,
  input: UpdateWorkshopInput,
): Promise<Workshop> {
  if (useSeedData()) {
    const idx = mockWorkshops.findIndex((w) => w.id === id)
    if (idx === -1) throw new Error('Workshop not found')
    const existing = mockWorkshops[idx]
    const updated: Workshop = {
      ...existing,
      title: input.title ?? existing.title,
      slug: input.slug ?? existing.slug,
      description: input.description ?? existing.description,
      shortDescription: input.shortDescription ?? existing.shortDescription,
      instructorId: input.instructorId ?? existing.instructorId,
      capacity: input.capacity ?? existing.capacity,
      duration: input.duration ?? existing.duration,
      price: input.price ?? existing.price,
      currency: input.currency ?? existing.currency,
      format: input.format ?? existing.format,
      tags: input.tags ?? existing.tags,
      level: input.level ?? existing.level,
      prerequisites: input.prerequisites ?? existing.prerequisites,
      learningOutcomes: input.learningOutcomes ?? existing.learningOutcomes,
      thumbnailUrl: input.thumbnailUrl !== undefined ? input.thumbnailUrl : existing.thumbnailUrl,
      status: input.status ?? existing.status,
      publishedAt:
        input.status === 'PUBLISHED' && !existing.publishedAt
          ? new Date().toISOString()
          : existing.publishedAt,
      updatedAt: new Date().toISOString(),
    }
    mockWorkshops[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateWorkshop: Workshop }>(
    UPDATE_WORKSHOP_MUTATION,
    { id, input },
    token,
  )
  return data.updateWorkshop
}

export async function deleteWorkshop(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    mockWorkshops = mockWorkshops.filter((w) => w.id !== id)
    mockSessions = mockSessions.filter((s) => s.workshopId !== id)
    mockRegistrations = mockRegistrations.filter((r) => r.workshopId !== id)
    mockCertificates = mockCertificates.filter((c) => c.workshopId !== id)
    return
  }

  await authGraphqlFetch<{ deleteWorkshop: boolean }>(
    DELETE_WORKSHOP_MUTATION,
    { id },
    token,
  )
}

// ---------------------------------------------------------------------------
// CRUD functions -- Session
// ---------------------------------------------------------------------------

export async function fetchSessions(
  token: string,
  workshopId: string,
): Promise<Session[]> {
  try {
    const data = await authGraphqlFetch<{ workshopSessions: Session[] }>(
      SESSIONS_QUERY,
      { workshopId },
      token,
    )
    return data.workshopSessions
  } catch {
    if (useSeedData()) {
      return mockSessions
        .filter((s) => s.workshopId === workshopId)
        .sort((a, b) => a.date.localeCompare(b.date))
    }
    return []
  }
}

export async function createSession(
  token: string,
  input: CreateSessionInput,
): Promise<Session> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const session: Session = {
      id: `seed-session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      workshopId: input.workshopId,
      title: input.title,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      timezone: input.timezone,
      recurrence: input.recurrence ?? 'NONE',
      venue: input.venue ?? null,
      onlineLink: input.onlineLink ?? null,
      format: input.format,
      maxAttendees: input.maxAttendees ?? null,
      notes: input.notes ?? null,
      createdAt: now,
      updatedAt: now,
    }
    mockSessions = [session, ...mockSessions]
    return session
  }

  const data = await authGraphqlFetch<{ createWorkshopSession: Session }>(
    CREATE_SESSION_MUTATION,
    { input },
    token,
  )
  return data.createWorkshopSession
}

export async function deleteSession(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    mockSessions = mockSessions.filter((s) => s.id !== id)
    return
  }

  await authGraphqlFetch<{ deleteWorkshopSession: boolean }>(
    DELETE_SESSION_MUTATION,
    { id },
    token,
  )
}

// ---------------------------------------------------------------------------
// CRUD functions -- Registration
// ---------------------------------------------------------------------------

export async function fetchRegistrations(
  token: string,
  workshopId: string,
  opts: { status?: RegistrationStatus; limit?: number; offset?: number } = {},
): Promise<Registration[]> {
  try {
    const data = await authGraphqlFetch<{ workshopRegistrations: Registration[] }>(
      REGISTRATIONS_QUERY,
      { workshopId, ...opts },
      token,
    )
    return data.workshopRegistrations
  } catch {
    if (useSeedData()) {
      let result = mockRegistrations.filter((r) => r.workshopId === workshopId)
      if (opts.status) {
        result = result.filter((r) => r.status === opts.status)
      }
      result.sort(
        (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime(),
      )
      const offset = opts.offset ?? 0
      const limit = opts.limit ?? 100
      return result.slice(offset, offset + limit)
    }
    return []
  }
}

export async function createRegistration(
  token: string,
  input: CreateRegistrationInput,
): Promise<Registration> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const workshop = mockWorkshops.find((w) => w.id === input.workshopId)
    const isWaitlisted = workshop
      ? workshop.enrolledCount >= workshop.capacity
      : false

    const reg: Registration = {
      id: `seed-reg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      workshopId: input.workshopId,
      personId: input.personId ?? null,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      status: isWaitlisted ? 'WAITLISTED' : 'REGISTERED',
      amountPaid: isWaitlisted ? 0 : input.amountPaid,
      refundAmount: 0,
      registeredAt: now,
      cancelledAt: null,
      cancellationReason: null,
      attendanceCheckedIn: false,
      completionPercentage: 0,
      feedbackScore: null,
      feedbackComment: null,
      notes: input.notes ?? null,
      createdAt: now,
      updatedAt: now,
    }
    mockRegistrations = [reg, ...mockRegistrations]

    // Update workshop counts
    if (workshop) {
      const wIdx = mockWorkshops.indexOf(workshop)
      if (isWaitlisted) {
        mockWorkshops[wIdx] = { ...workshop, waitlistCount: workshop.waitlistCount + 1 }
      } else {
        mockWorkshops[wIdx] = { ...workshop, enrolledCount: workshop.enrolledCount + 1 }
      }
    }

    return reg
  }

  const data = await authGraphqlFetch<{ createWorkshopRegistration: Registration }>(
    CREATE_REGISTRATION_MUTATION,
    { input },
    token,
  )
  return data.createWorkshopRegistration
}

export async function updateRegistration(
  token: string,
  id: string,
  input: Partial<Pick<Registration, 'status' | 'attendanceCheckedIn' | 'completionPercentage' | 'feedbackScore' | 'feedbackComment' | 'cancellationReason' | 'refundAmount' | 'notes'>>,
): Promise<Registration> {
  if (useSeedData()) {
    const idx = mockRegistrations.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Registration not found')
    const existing = mockRegistrations[idx]
    const updated: Registration = {
      ...existing,
      ...input,
      cancelledAt: input.status === 'CANCELLED' && !existing.cancelledAt ? new Date().toISOString() : existing.cancelledAt,
      updatedAt: new Date().toISOString(),
    }
    mockRegistrations[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateWorkshopRegistration: Registration }>(
    UPDATE_REGISTRATION_MUTATION,
    { id, input },
    token,
  )
  return data.updateWorkshopRegistration
}

// ---------------------------------------------------------------------------
// CRUD functions -- Certificate
// ---------------------------------------------------------------------------

export async function fetchCertificates(
  token: string,
  workshopId?: string,
  opts: { limit?: number; offset?: number } = {},
): Promise<Certificate[]> {
  try {
    const data = await authGraphqlFetch<{ workshopCertificates: Certificate[] }>(
      CERTIFICATES_QUERY,
      { workshopId, ...opts },
      token,
    )
    return data.workshopCertificates
  } catch {
    if (useSeedData()) {
      let result = [...mockCertificates]
      if (workshopId) {
        result = result.filter((c) => c.workshopId === workshopId)
      }
      result.sort(
        (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime(),
      )
      const offset = opts.offset ?? 0
      const limit = opts.limit ?? 100
      return result.slice(offset, offset + limit)
    }
    return []
  }
}

export async function createCertificate(
  token: string,
  input: {
    workshopId: string
    registrationId: string
    recipientName: string
    recipientEmail: string
    courseTitle: string
    completionDate: string
    templateName: string
  },
): Promise<Certificate> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const seq = mockCertificates.length + 1
    const cert: Certificate = {
      id: `seed-cert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      certificateId: `AF-WS-2026-${String(seq).padStart(4, '0')}`,
      workshopId: input.workshopId,
      registrationId: input.registrationId,
      recipientName: input.recipientName,
      recipientEmail: input.recipientEmail,
      courseTitle: input.courseTitle,
      completionDate: input.completionDate,
      templateName: input.templateName,
      status: 'ISSUED',
      issuedAt: now,
      revokedAt: null,
      createdAt: now,
      updatedAt: now,
    }
    mockCertificates = [cert, ...mockCertificates]
    return cert
  }

  const data = await authGraphqlFetch<{ createWorkshopCertificate: Certificate }>(
    CREATE_CERTIFICATE_MUTATION,
    { input },
    token,
  )
  return data.createWorkshopCertificate
}

// ---------------------------------------------------------------------------
// Instructors
// ---------------------------------------------------------------------------

export async function fetchInstructors(
  token: string,
): Promise<Instructor[]> {
  try {
    const data = await authGraphqlFetch<{ instructors: Instructor[] }>(
      INSTRUCTORS_QUERY,
      {},
      token,
    )
    return data.instructors
  } catch {
    if (useSeedData()) return [...mockInstructors]
    return []
  }
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export async function fetchWorkshopAnalytics(
  token: string,
): Promise<WorkshopAnalytics> {
  try {
    const data = await authGraphqlFetch<{ workshopAnalytics: WorkshopAnalytics }>(
      WORKSHOP_ANALYTICS_QUERY,
      {},
      token,
    )
    return data.workshopAnalytics
  } catch {
    if (useSeedData()) {
      const published = mockWorkshops.filter((w) => w.status === 'PUBLISHED')
      const allRegs = mockRegistrations
      const attended = allRegs.filter(
        (r) => r.status === 'ATTENDED' || r.completionPercentage > 0,
      )
      const revenue = allRegs
        .filter((r) => r.status !== 'REFUNDED')
        .reduce((sum, r) => sum + r.amountPaid - r.refundAmount, 0)
      const completionRates = attended.map((r) => r.completionPercentage)
      const avgCompletion =
        completionRates.length > 0
          ? completionRates.reduce((s, v) => s + v, 0) / completionRates.length
          : 0
      const scores = allRegs
        .filter((r) => r.feedbackScore !== null)
        .map((r) => r.feedbackScore!)
      const avgScore =
        scores.length > 0
          ? scores.reduce((s, v) => s + v, 0) / scores.length
          : 0
      const waitlist = mockWorkshops.reduce((s, w) => s + w.waitlistCount, 0)

      return {
        totalWorkshops: mockWorkshops.length,
        publishedWorkshops: published.length,
        totalEnrollments: allRegs.filter(
          (r) => r.status === 'REGISTERED' || r.status === 'ATTENDED',
        ).length,
        totalRevenue: revenue,
        avgCompletionRate: Math.round(avgCompletion),
        avgSatisfactionScore: Math.round(avgScore * 100) / 100,
        waitlistTotal: waitlist,
        certificatesIssued: mockCertificates.filter((c) => c.status === 'ISSUED').length,
      }
    }
    return {
      totalWorkshops: 0,
      publishedWorkshops: 0,
      totalEnrollments: 0,
      totalRevenue: 0,
      avgCompletionRate: 0,
      avgSatisfactionScore: 0,
      waitlistTotal: 0,
      certificatesIssued: 0,
    }
  }
}

// ---------------------------------------------------------------------------
// Re-export seed data for use in mock mode
// ---------------------------------------------------------------------------

export {
  SEED_INSTRUCTORS,
  SEED_WORKSHOPS,
  SEED_SESSIONS,
  SEED_REGISTRATIONS,
  SEED_CERTIFICATES,
}
