const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types — Intel Data Warehouse (BF-MI-013)
// ---------------------------------------------------------------------------

export type IntelCategory = 'competitor' | 'market' | 'pricing' | 'technology' | 'sentiment'
export type IntelSentiment = 'positive' | 'neutral' | 'negative'

export interface IntelEntry {
  id: string
  category: IntelCategory
  source: string
  sourceUrl: string
  title: string
  summary: string
  fullContent: string
  tags: string[]
  relevanceScore: number
  sentiment: IntelSentiment
  relatedCompetitors: string[]
  publishedAt: string
  ingestedAt: string
}

// ---------------------------------------------------------------------------
// Types — Competitor Profile Registry (BF-MI-001)
// ---------------------------------------------------------------------------

export type CompetitorCategory = 'direct' | 'indirect' | 'adjacent'

export interface PricingTier {
  name: string
  price: string
  features: string[]
}

export interface CompetitorProfile {
  id: string
  name: string
  website: string
  logo: string
  description: string
  category: CompetitorCategory
  pricing: { tiers: PricingTier[] }
  features: string[]
  strengths: string[]
  weaknesses: string[]
  marketShare: number
  lastUpdated: string
}

// ---------------------------------------------------------------------------
// Types — Feature Comparison Matrix (BF-MI-002)
// ---------------------------------------------------------------------------

export interface FeatureComparison {
  featureName: string
  af: boolean | string
  competitors: Record<string, boolean | string>
}

// ---------------------------------------------------------------------------
// Seed data — Competitor Profiles (8 competitors)
// ---------------------------------------------------------------------------

const SEED_COMPETITORS: CompetitorProfile[] = [
  {
    id: 'comp-render',
    name: 'Render',
    website: 'https://render.com',
    logo: 'https://render.com/favicon.ico',
    description: 'Cloud platform for building and running apps with free SSL, a global CDN, private networks, and auto deploys from Git.',
    category: 'direct',
    pricing: {
      tiers: [
        { name: 'Free', price: '$0/mo', features: ['Static sites', 'Web services (750 hrs)', 'PostgreSQL (90 days)'] },
        { name: 'Individual', price: '$7/mo', features: ['Persistent disks', 'DDoS protection', 'Custom domains'] },
        { name: 'Team', price: '$19/mo', features: ['Preview environments', 'Team management', 'Priority support'] },
        { name: 'Organization', price: '$29/mo', features: ['SSO/SAML', 'SOC 2', 'Dedicated support'] },
      ],
    },
    features: ['Auto deploy from Git', 'Docker support', 'Managed PostgreSQL', 'Background workers', 'Cron jobs', 'Static sites'],
    strengths: ['Simple UX', 'Good free tier', 'Fast deploys', 'Managed databases'],
    weaknesses: ['US-only regions', 'No IPFS support', 'Limited GPU compute', 'Cold starts on free tier'],
    marketShare: 3.2,
    lastUpdated: '2026-02-10T00:00:00Z',
  },
  {
    id: 'comp-vercel',
    name: 'Vercel',
    website: 'https://vercel.com',
    logo: 'https://vercel.com/favicon.ico',
    description: 'Frontend cloud platform specializing in Next.js deployments with edge functions and global CDN.',
    category: 'direct',
    pricing: {
      tiers: [
        { name: 'Hobby', price: '$0/mo', features: ['Personal projects', '100GB bandwidth', 'Serverless functions'] },
        { name: 'Pro', price: '$20/mo', features: ['Team collaboration', '1TB bandwidth', 'Preview deployments'] },
        { name: 'Enterprise', price: 'Custom', features: ['SLA', 'SSO/SAML', 'Advanced DDoS', 'Multi-region'] },
      ],
    },
    features: ['Next.js first-class', 'Edge functions', 'Image optimization', 'Analytics', 'Git integration', 'Preview deploys'],
    strengths: ['Best-in-class DX', 'Massive ecosystem', 'Edge network', 'Strong brand'],
    weaknesses: ['Vendor lock-in (Next.js)', 'Expensive at scale', 'No backend hosting', 'Centralized infrastructure'],
    marketShare: 12.5,
    lastUpdated: '2026-02-10T00:00:00Z',
  },
  {
    id: 'comp-netlify',
    name: 'Netlify',
    website: 'https://netlify.com',
    logo: 'https://netlify.com/favicon.ico',
    description: 'Web development platform offering hosting and serverless backend services for modern web projects.',
    category: 'direct',
    pricing: {
      tiers: [
        { name: 'Starter', price: '$0/mo', features: ['300 build mins', '100GB bandwidth', '1 concurrent build'] },
        { name: 'Pro', price: '$19/mo', features: ['25K form submissions', '1TB bandwidth', '3 concurrent builds'] },
        { name: 'Enterprise', price: 'Custom', features: ['SLA', 'SSO/SAML', 'High-perf edge', 'Audit logs'] },
      ],
    },
    features: ['Git-based deploy', 'Serverless functions', 'Edge functions', 'Forms', 'Identity', 'Split testing'],
    strengths: ['Pioneer in Jamstack', 'Great plugin ecosystem', 'Netlify CMS', 'Edge functions'],
    weaknesses: ['Build time limits', 'Bandwidth overage costs', 'Limited backend options', 'Centralized'],
    marketShare: 8.1,
    lastUpdated: '2026-02-10T00:00:00Z',
  },
  {
    id: 'comp-railway',
    name: 'Railway',
    website: 'https://railway.app',
    logo: 'https://railway.app/favicon.ico',
    description: 'Infrastructure platform offering instant deployments from GitHub with managed databases and simple pricing.',
    category: 'direct',
    pricing: {
      tiers: [
        { name: 'Trial', price: '$0', features: ['$5 credit', '500 hrs execution', 'Community support'] },
        { name: 'Hobby', price: '$5/mo', features: ['$5 included', 'Up to $10 resource usage', 'Unlimited projects'] },
        { name: 'Pro', price: '$20/mo', features: ['Usage-based', 'Multiple members', 'Priority support'] },
        { name: 'Enterprise', price: 'Custom', features: ['SLA', 'SOC 2', 'Dedicated support', 'Private networking'] },
      ],
    },
    features: ['Instant deploys', 'Managed PostgreSQL/MySQL/Redis', 'Cron jobs', 'Docker support', 'Monorepo support', 'Templates'],
    strengths: ['Best startup DX', 'Usage-based pricing', 'Managed databases', 'Fast iteration'],
    weaknesses: ['Small team risk', 'Limited regions', 'No IPFS/Web3', 'Young platform'],
    marketShare: 2.1,
    lastUpdated: '2026-02-10T00:00:00Z',
  },
  {
    id: 'comp-flyio',
    name: 'Fly.io',
    website: 'https://fly.io',
    logo: 'https://fly.io/favicon.ico',
    description: 'Platform for running full-stack apps and databases close to users with global edge deployment.',
    category: 'direct',
    pricing: {
      tiers: [
        { name: 'Hobby', price: '$0/mo', features: ['3 shared VMs', '3GB persistent storage', '160GB bandwidth'] },
        { name: 'Launch', price: 'Usage-based', features: ['Dedicated VMs', 'Uptime SLA', 'Email support'] },
        { name: 'Scale', price: 'Usage-based', features: ['SOC 2', 'Priority support', 'Custom networking'] },
      ],
    },
    features: ['Global edge VMs', 'Fly Postgres', 'GPU machines', 'Anycast networking', 'Docker native', 'Fly Machines API'],
    strengths: ['True multi-region', 'Full VM control', 'GPU support', 'Low latency globally'],
    weaknesses: ['Complex pricing', 'Steep learning curve', 'Reliability concerns', 'Support quality varies'],
    marketShare: 2.8,
    lastUpdated: '2026-02-10T00:00:00Z',
  },
  {
    id: 'comp-cloudflare',
    name: 'Cloudflare Pages',
    website: 'https://pages.cloudflare.com',
    logo: 'https://cloudflare.com/favicon.ico',
    description: 'JAMstack platform integrated with Cloudflare\'s global network, offering Workers for serverless compute.',
    category: 'direct',
    pricing: {
      tiers: [
        { name: 'Free', price: '$0/mo', features: ['500 builds/mo', 'Unlimited bandwidth', 'Unlimited sites'] },
        { name: 'Pro', price: '$20/mo', features: ['5K builds/mo', 'Web analytics', 'Image transformations'] },
        { name: 'Business', price: '$200/mo', features: ['20K builds/mo', 'WAF', 'Custom caching'] },
      ],
    },
    features: ['Unlimited bandwidth', 'Workers integration', 'KV storage', 'R2 object storage', 'D1 database', 'Global CDN'],
    strengths: ['Massive network', 'Unlimited bandwidth', 'Workers ecosystem', 'Low cost'],
    weaknesses: ['Pages is secondary product', 'Limited framework support', 'Complex ecosystem', 'Vendor lock-in'],
    marketShare: 6.5,
    lastUpdated: '2026-02-10T00:00:00Z',
  },
  {
    id: 'comp-digitalocean',
    name: 'DigitalOcean App Platform',
    website: 'https://www.digitalocean.com/products/app-platform',
    logo: 'https://digitalocean.com/favicon.ico',
    description: 'PaaS offering from DigitalOcean providing managed infrastructure for deploying apps from GitHub.',
    category: 'indirect',
    pricing: {
      tiers: [
        { name: 'Starter', price: '$0/mo', features: ['3 static sites', 'Global CDN', 'Auto HTTPS'] },
        { name: 'Basic', price: '$5/mo', features: ['1 container', '512MB RAM', '1 vCPU'] },
        { name: 'Professional', price: '$12/mo', features: ['Horizontal scaling', 'Alerts', 'Managed DB add-ons'] },
      ],
    },
    features: ['Static sites', 'Web services', 'Workers', 'Managed databases', 'Job scheduling', 'Container registry'],
    strengths: ['Simple pricing', 'Strong community', 'Droplets fallback', 'Good docs'],
    weaknesses: ['Limited edge presence', 'No serverless functions', 'App Platform less polished', 'No Web3 features'],
    marketShare: 4.3,
    lastUpdated: '2026-02-10T00:00:00Z',
  },
  {
    id: 'comp-heroku',
    name: 'Heroku',
    website: 'https://heroku.com',
    logo: 'https://heroku.com/favicon.ico',
    description: 'Pioneer PaaS now owned by Salesforce, known for ease of deployment but increasingly expensive.',
    category: 'indirect',
    pricing: {
      tiers: [
        { name: 'Eco', price: '$5/mo', features: ['1K dyno hours', 'Sleep after 30 min', 'Deploy from Git'] },
        { name: 'Basic', price: '$7/mo', features: ['Always-on dyno', 'Custom domains', 'Free SSL'] },
        { name: 'Standard', price: '$25/mo', features: ['Horizontal scaling', 'Metrics', 'Preboot'] },
        { name: 'Performance', price: '$250/mo', features: ['Dedicated compute', 'Autoscaling', 'Performance dynos'] },
      ],
    },
    features: ['Git push deploy', 'Add-ons marketplace', 'Review apps', 'Pipelines', 'Heroku Postgres', 'Heroku Redis'],
    strengths: ['Mature platform', 'Add-on ecosystem', 'Enterprise features', 'Salesforce integration'],
    weaknesses: ['Expensive', 'Killed free tier', 'Stale DX', 'Slow innovation', 'No modern edge features'],
    marketShare: 5.8,
    lastUpdated: '2026-02-10T00:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Seed data — Intel Entries (30+ entries)
// ---------------------------------------------------------------------------

const SEED_INTEL: IntelEntry[] = [
  {
    id: 'intel-001',
    category: 'competitor',
    source: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com/2026/01/vercel-series-e',
    title: 'Vercel Raises $300M Series E at $6B Valuation',
    summary: 'Vercel closed a $300M round led by GV, pushing its valuation to $6B. The company plans to expand its AI SDK and enterprise offerings.',
    fullContent: 'Vercel announced a $300M Series E funding round, valuing the company at $6 billion. The round was led by GV (formerly Google Ventures) with participation from existing investors. CEO Guillermo Rauch stated the funds will accelerate their AI SDK development and enterprise go-to-market.',
    tags: ['funding', 'vercel', 'enterprise'],
    relevanceScore: 92,
    sentiment: 'neutral',
    relatedCompetitors: ['comp-vercel'],
    publishedAt: '2026-01-15T10:00:00Z',
    ingestedAt: '2026-01-15T12:00:00Z',
  },
  {
    id: 'intel-002',
    category: 'market',
    source: 'Gartner',
    sourceUrl: 'https://gartner.com/cloud-paas-market-2026',
    title: 'PaaS Market to Reach $230B by 2028',
    summary: 'Gartner projects the global PaaS market will grow at 22% CAGR, reaching $230B by 2028. Edge compute and AI workloads are the fastest-growing segments.',
    fullContent: 'According to Gartner\'s latest forecast, the Platform-as-a-Service market is projected to reach $230 billion by 2028, growing at a compound annual growth rate of 22%. Key drivers include the shift to edge computing, AI/ML workload proliferation, and the increasing adoption of serverless architectures.',
    tags: ['market-size', 'paas', 'growth'],
    relevanceScore: 88,
    sentiment: 'positive',
    relatedCompetitors: [],
    publishedAt: '2026-01-20T09:00:00Z',
    ingestedAt: '2026-01-20T11:00:00Z',
  },
  {
    id: 'intel-003',
    category: 'pricing',
    source: 'Railway Blog',
    sourceUrl: 'https://blog.railway.app/p/pricing-update-2026',
    title: 'Railway Increases Pro Plan Price to $25/mo',
    summary: 'Railway raised its Pro plan from $20 to $25/mo, citing infrastructure costs. Usage credits remain the same.',
    fullContent: 'Railway announced a pricing adjustment for its Pro plan, increasing from $20 to $25 per month effective March 2026. The company stated that rising infrastructure costs and new feature investments necessitated the change. Included usage credits remain unchanged at $10/month.',
    tags: ['pricing', 'railway', 'increase'],
    relevanceScore: 75,
    sentiment: 'neutral',
    relatedCompetitors: ['comp-railway'],
    publishedAt: '2026-01-25T14:00:00Z',
    ingestedAt: '2026-01-25T15:30:00Z',
  },
  {
    id: 'intel-004',
    category: 'technology',
    source: 'Cloudflare Blog',
    sourceUrl: 'https://blog.cloudflare.com/workers-ai-ga',
    title: 'Cloudflare Workers AI Reaches General Availability',
    summary: 'Cloudflare announced GA for Workers AI, offering serverless GPU inference at the edge with pay-per-request pricing.',
    fullContent: 'Cloudflare has launched Workers AI into general availability. The service provides serverless GPU inference at the edge across Cloudflare\'s 300+ locations. Supported models include Llama 3, Mistral, and Stable Diffusion. Pricing is pay-per-request with no minimum commitment.',
    tags: ['ai', 'cloudflare', 'workers', 'gpu'],
    relevanceScore: 85,
    sentiment: 'neutral',
    relatedCompetitors: ['comp-cloudflare'],
    publishedAt: '2026-01-28T16:00:00Z',
    ingestedAt: '2026-01-28T17:00:00Z',
  },
  {
    id: 'intel-005',
    category: 'competitor',
    source: 'The Verge',
    sourceUrl: 'https://theverge.com/2026/netlify-layoffs',
    title: 'Netlify Lays Off 15% of Workforce',
    summary: 'Netlify announced layoffs affecting approximately 15% of its workforce as the company refocuses on enterprise revenue.',
    fullContent: 'Netlify has laid off approximately 15% of its workforce, affecting around 75 employees. CEO Matt Biilmann stated the company is refocusing on enterprise revenue streams and profitability. The Jamstack pioneer has faced increasing competition from Vercel, Cloudflare, and emerging platforms.',
    tags: ['netlify', 'layoffs', 'enterprise'],
    relevanceScore: 90,
    sentiment: 'negative',
    relatedCompetitors: ['comp-netlify'],
    publishedAt: '2026-01-30T11:00:00Z',
    ingestedAt: '2026-01-30T12:00:00Z',
  },
  {
    id: 'intel-006',
    category: 'market',
    source: 'a16z',
    sourceUrl: 'https://a16z.com/2026/decentralized-compute-thesis',
    title: 'a16z: Decentralized Compute Is the Next Cloud Frontier',
    summary: 'a16z published a thesis arguing that decentralized compute networks will capture 15% of cloud market share by 2030.',
    fullContent: 'Andreessen Horowitz published an investment thesis on decentralized compute, arguing that networks like Akash, Render, and io.net will collectively capture 15% of the cloud computing market by 2030. Key drivers cited include cost efficiency (50-80% cheaper), censorship resistance, and GPU availability.',
    tags: ['depin', 'decentralized', 'thesis', 'a16z'],
    relevanceScore: 95,
    sentiment: 'positive',
    relatedCompetitors: [],
    publishedAt: '2026-02-01T09:00:00Z',
    ingestedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'intel-007',
    category: 'competitor',
    source: 'Fly.io Blog',
    sourceUrl: 'https://fly.io/blog/gpus-anywhere',
    title: 'Fly.io Expands GPU Availability to 12 Regions',
    summary: 'Fly.io now offers GPU machines (A100, L4) in 12 regions globally, positioning for AI workload hosting.',
    fullContent: 'Fly.io announced expansion of its GPU machine offering to 12 regions worldwide. Available GPUs include NVIDIA A100 (40GB and 80GB) and L4 accelerators. The company is targeting AI inference workloads with per-second billing and integration with their Machines API.',
    tags: ['flyio', 'gpu', 'ai', 'expansion'],
    relevanceScore: 78,
    sentiment: 'neutral',
    relatedCompetitors: ['comp-flyio'],
    publishedAt: '2026-02-03T15:00:00Z',
    ingestedAt: '2026-02-03T16:00:00Z',
  },
  {
    id: 'intel-008',
    category: 'pricing',
    source: 'Vercel Blog',
    sourceUrl: 'https://vercel.com/blog/enterprise-pricing-update',
    title: 'Vercel Enterprise Now Starts at $3,500/mo',
    summary: 'Vercel raised its enterprise minimum from $2,500 to $3,500/mo, adding advanced security and compliance features.',
    fullContent: 'Vercel updated its enterprise tier pricing, with the minimum commitment increasing from $2,500 to $3,500 per month. New features included in the enterprise tier are SOC 2 Type II compliance, advanced WAF, custom SLAs, and dedicated support engineers.',
    tags: ['vercel', 'pricing', 'enterprise'],
    relevanceScore: 72,
    sentiment: 'neutral',
    relatedCompetitors: ['comp-vercel'],
    publishedAt: '2026-02-04T10:00:00Z',
    ingestedAt: '2026-02-04T11:00:00Z',
  },
  {
    id: 'intel-009',
    category: 'technology',
    source: 'Akash Network Blog',
    sourceUrl: 'https://akash.network/blog/akash-gpu-marketplace-2',
    title: 'Akash GPU Marketplace 2.0: Automated Provider Matching',
    summary: 'Akash launched GPU Marketplace 2.0 with automated provider matching, reducing deployment time by 70%.',
    fullContent: 'Akash Network released version 2.0 of its GPU Marketplace, featuring automated provider matching based on workload requirements, pricing preferences, and uptime history. The update reduces average deployment time from 5 minutes to 90 seconds and introduces a provider reputation system.',
    tags: ['akash', 'gpu', 'depin', 'marketplace'],
    relevanceScore: 91,
    sentiment: 'positive',
    relatedCompetitors: [],
    publishedAt: '2026-02-05T12:00:00Z',
    ingestedAt: '2026-02-05T13:00:00Z',
  },
  {
    id: 'intel-010',
    category: 'sentiment',
    source: 'Hacker News',
    sourceUrl: 'https://news.ycombinator.com/item?id=39123456',
    title: 'HN Discussion: "Why I Switched from Vercel to Self-Hosted"',
    summary: 'A viral HN post about Vercel bill shock (from $20 to $4,200/mo) generated 500+ comments and widespread frustration.',
    fullContent: 'A developer posted about receiving a $4,200 Vercel bill after a traffic spike, up from the usual $20/month. The post received 500+ comments with many users sharing similar experiences. Common themes: unpredictable pricing, bandwidth overage costs, and lack of spend caps.',
    tags: ['vercel', 'pricing', 'sentiment', 'hn'],
    relevanceScore: 87,
    sentiment: 'negative',
    relatedCompetitors: ['comp-vercel'],
    publishedAt: '2026-02-06T20:00:00Z',
    ingestedAt: '2026-02-06T21:00:00Z',
  },
  {
    id: 'intel-011',
    category: 'competitor',
    source: 'Bloomberg',
    sourceUrl: 'https://bloomberg.com/render-ipo-2026',
    title: 'Render Exploring IPO in Late 2026',
    summary: 'Sources say Render is in early talks with banks about a potential IPO in Q4 2026, valuing the company at $2-3B.',
    fullContent: 'According to people familiar with the matter, Render Inc. is in early discussions with investment banks about a potential initial public offering in late 2026. The cloud platform company, which last raised at a $500M valuation, could seek a public listing at a $2-3 billion valuation.',
    tags: ['render', 'ipo', 'funding'],
    relevanceScore: 80,
    sentiment: 'neutral',
    relatedCompetitors: ['comp-render'],
    publishedAt: '2026-02-07T08:00:00Z',
    ingestedAt: '2026-02-07T09:30:00Z',
  },
  {
    id: 'intel-012',
    category: 'market',
    source: 'Messari',
    sourceUrl: 'https://messari.io/report/depin-q4-2025',
    title: 'DePIN Sector Revenue Grew 340% in Q4 2025',
    summary: 'Messari reports DePIN protocols generated $180M in Q4 2025 revenue, a 340% increase year-over-year.',
    fullContent: 'Messari\'s Q4 2025 DePIN report shows the sector generated $180M in protocol revenue, representing 340% year-over-year growth. Compute networks (Akash, Render, io.net) accounted for 45% of revenue, followed by storage (Filecoin, Arweave) at 30% and wireless (Helium) at 15%.',
    tags: ['depin', 'revenue', 'growth', 'messari'],
    relevanceScore: 93,
    sentiment: 'positive',
    relatedCompetitors: [],
    publishedAt: '2026-02-08T09:00:00Z',
    ingestedAt: '2026-02-08T10:00:00Z',
  },
  {
    id: 'intel-013',
    category: 'technology',
    source: 'Netlify Blog',
    sourceUrl: 'https://netlify.com/blog/netlify-ai-compose',
    title: 'Netlify Launches AI Compose for Automated Frontend Testing',
    summary: 'Netlify released AI Compose, an AI-powered tool that automatically generates and runs visual regression tests.',
    fullContent: 'Netlify announced AI Compose, a new AI-powered feature that automatically generates visual regression tests for web applications. The tool uses computer vision to detect layout shifts, broken components, and accessibility issues in preview deployments before merging to production.',
    tags: ['netlify', 'ai', 'testing', 'devtools'],
    relevanceScore: 68,
    sentiment: 'neutral',
    relatedCompetitors: ['comp-netlify'],
    publishedAt: '2026-02-08T14:00:00Z',
    ingestedAt: '2026-02-08T15:00:00Z',
  },
  {
    id: 'intel-014',
    category: 'pricing',
    source: 'DigitalOcean Blog',
    sourceUrl: 'https://digitalocean.com/blog/app-platform-pricing-2026',
    title: 'DigitalOcean Drops App Platform Starter Price to $3/mo',
    summary: 'DO reduced its App Platform basic container price from $5 to $3/mo, undercutting Railway and Render.',
    fullContent: 'DigitalOcean announced a price reduction for its App Platform, dropping the basic container from $5 to $3 per month. The move targets individual developers and small teams who might otherwise choose Railway or Render. Bandwidth remains unmetered for static sites.',
    tags: ['digitalocean', 'pricing', 'decrease'],
    relevanceScore: 71,
    sentiment: 'neutral',
    relatedCompetitors: ['comp-digitalocean'],
    publishedAt: '2026-02-09T11:00:00Z',
    ingestedAt: '2026-02-09T12:00:00Z',
  },
  {
    id: 'intel-015',
    category: 'sentiment',
    source: 'Reddit r/webdev',
    sourceUrl: 'https://reddit.com/r/webdev/comments/xyz123',
    title: 'Survey: 62% of Developers Want Decentralized Hosting Options',
    summary: 'A community survey of 2,400 developers shows 62% are interested in decentralized alternatives to traditional cloud.',
    fullContent: 'A Reddit survey conducted in r/webdev with 2,400 responses revealed that 62% of developers are interested in decentralized hosting alternatives. Key motivators include lower costs (cited by 78%), censorship resistance (45%), and data sovereignty (52%). The main barrier cited was complexity (71%).',
    tags: ['sentiment', 'decentralized', 'survey', 'developers'],
    relevanceScore: 89,
    sentiment: 'positive',
    relatedCompetitors: [],
    publishedAt: '2026-02-10T08:00:00Z',
    ingestedAt: '2026-02-10T09:00:00Z',
  },
  {
    id: 'intel-016',
    category: 'competitor',
    source: 'Heroku Blog',
    sourceUrl: 'https://blog.heroku.com/next-gen-platform',
    title: 'Heroku Announces "Next-Gen" Platform Rebuild on Kubernetes',
    summary: 'Heroku is rebuilding its platform on Kubernetes, promising improved performance and container support by Q3 2026.',
    fullContent: 'Heroku announced a full platform rebuild on Kubernetes, dubbed "Heroku Next-Gen." The new platform promises containerized workloads, improved cold start times, and better resource utilization. GA is expected in Q3 2026, with beta access starting in April.',
    tags: ['heroku', 'kubernetes', 'rebuild', 'platform'],
    relevanceScore: 74,
    sentiment: 'neutral',
    relatedCompetitors: ['comp-heroku'],
    publishedAt: '2026-02-10T13:00:00Z',
    ingestedAt: '2026-02-10T14:00:00Z',
  },
  {
    id: 'intel-017',
    category: 'market',
    source: 'McKinsey',
    sourceUrl: 'https://mckinsey.com/ai-infrastructure-spend-2026',
    title: 'AI Infrastructure Spend to Hit $500B by 2027',
    summary: 'McKinsey projects global AI infrastructure spending will reach $500B by 2027, with compute being the largest segment at 60%.',
    fullContent: 'McKinsey\'s latest technology forecast predicts global AI infrastructure spending will reach $500 billion by 2027. Compute infrastructure accounts for 60% of spend, followed by data infrastructure (25%) and networking (15%). The report notes that decentralized compute providers could capture significant share due to cost advantages.',
    tags: ['ai', 'infrastructure', 'spend', 'mckinsey'],
    relevanceScore: 82,
    sentiment: 'positive',
    relatedCompetitors: [],
    publishedAt: '2026-02-11T09:00:00Z',
    ingestedAt: '2026-02-11T10:00:00Z',
  },
  {
    id: 'intel-018',
    category: 'technology',
    source: 'Protocol',
    sourceUrl: 'https://protocol.com/filecoin-compute-layer',
    title: 'Filecoin Launches Compute Layer for Full-Stack Decentralized Apps',
    summary: 'Filecoin announced a compute layer (FVM+) enabling full-stack dApps to run entirely on decentralized infrastructure.',
    fullContent: 'Filecoin launched FVM+ (Filecoin Virtual Machine Plus), a compute execution layer that enables full-stack applications to run on Filecoin infrastructure. Combined with existing storage capabilities, developers can now build and deploy complete applications without relying on centralized cloud providers.',
    tags: ['filecoin', 'compute', 'fvm', 'depin'],
    relevanceScore: 86,
    sentiment: 'positive',
    relatedCompetitors: [],
    publishedAt: '2026-02-11T15:00:00Z',
    ingestedAt: '2026-02-11T16:00:00Z',
  },
  {
    id: 'intel-019',
    category: 'competitor',
    source: 'SimilarWeb',
    sourceUrl: 'https://similarweb.com/comparison/vercel-vs-netlify',
    title: 'Vercel Traffic Surpasses Netlify by 2x in January 2026',
    summary: 'SimilarWeb data shows Vercel.com had 18M visits in Jan 2026, while Netlify had 8.5M, widening the gap.',
    fullContent: 'According to SimilarWeb data, Vercel.com received approximately 18 million visits in January 2026, compared to Netlify\'s 8.5 million. The gap has widened from 1.5x to 2x over the past year. Vercel\'s growth is attributed to the AI SDK ecosystem and Next.js adoption.',
    tags: ['vercel', 'netlify', 'traffic', 'comparison'],
    relevanceScore: 76,
    sentiment: 'neutral',
    relatedCompetitors: ['comp-vercel', 'comp-netlify'],
    publishedAt: '2026-02-12T10:00:00Z',
    ingestedAt: '2026-02-12T11:00:00Z',
  },
  {
    id: 'intel-020',
    category: 'pricing',
    source: 'Fly.io Blog',
    sourceUrl: 'https://fly.io/blog/simplified-pricing-2026',
    title: 'Fly.io Simplifies Pricing: Flat $0.0035/s for All Machines',
    summary: 'Fly.io moved to simplified per-second pricing for all machine types, eliminating the confusing tier system.',
    fullContent: 'Fly.io announced a pricing simplification, moving to a flat per-second rate of $0.0035/s for standard machines (1 shared CPU, 256MB RAM). GPU machines use separate pricing. The company eliminated its previous tiered pricing structure that many users found confusing.',
    tags: ['flyio', 'pricing', 'simplification'],
    relevanceScore: 69,
    sentiment: 'positive',
    relatedCompetitors: ['comp-flyio'],
    publishedAt: '2026-02-12T14:00:00Z',
    ingestedAt: '2026-02-12T15:00:00Z',
  },
  {
    id: 'intel-021',
    category: 'sentiment',
    source: 'Twitter/X',
    sourceUrl: 'https://x.com/kelseyhightower/status/12345',
    title: 'Kelsey Hightower: "Decentralized cloud is where Kubernetes was in 2015"',
    summary: 'Former Google engineer Kelsey Hightower endorsed decentralized cloud, comparing its trajectory to early Kubernetes.',
    fullContent: 'Kelsey Hightower, former Google Distinguished Engineer, tweeted about decentralized cloud platforms: "Decentralized cloud is where Kubernetes was in 2015 — rough edges but fundamentally right. Give it 3 years." The tweet received 12K likes and 3K retweets, sparking widespread discussion.',
    tags: ['sentiment', 'endorsement', 'decentralized', 'influencer'],
    relevanceScore: 94,
    sentiment: 'positive',
    relatedCompetitors: [],
    publishedAt: '2026-02-13T18:00:00Z',
    ingestedAt: '2026-02-13T19:00:00Z',
  },
  {
    id: 'intel-022',
    category: 'competitor',
    source: 'Render Blog',
    sourceUrl: 'https://render.com/blog/render-ai-deploy',
    title: 'Render Launches One-Click AI Model Deployment',
    summary: 'Render added one-click deployment templates for popular AI models including Llama 3, Mixtral, and Whisper.',
    fullContent: 'Render introduced AI Deploy, a feature enabling one-click deployment of popular open-source AI models. Supported models include Meta Llama 3, Mixtral 8x7B, and OpenAI Whisper. The feature includes auto-scaling, GPU resource management, and API endpoint generation.',
    tags: ['render', 'ai', 'deployment', 'models'],
    relevanceScore: 77,
    sentiment: 'neutral',
    relatedCompetitors: ['comp-render'],
    publishedAt: '2026-02-13T11:00:00Z',
    ingestedAt: '2026-02-13T12:00:00Z',
  },
  {
    id: 'intel-023',
    category: 'market',
    source: 'Coinbase Research',
    sourceUrl: 'https://coinbase.com/research/web3-developer-survey-2026',
    title: 'Web3 Developer Population Grew 45% in 2025',
    summary: 'Coinbase\'s annual developer survey shows the Web3 developer ecosystem grew from 18K to 26K active contributors.',
    fullContent: 'Coinbase Research\'s 2026 Web3 Developer Survey reports that the number of active Web3 developers grew 45% in 2025, from approximately 18,000 to 26,000 monthly active contributors. The fastest-growing areas were DePIN (120% growth), AI-crypto intersection (95%), and L2 development (60%).',
    tags: ['web3', 'developers', 'growth', 'survey'],
    relevanceScore: 84,
    sentiment: 'positive',
    relatedCompetitors: [],
    publishedAt: '2026-02-14T09:00:00Z',
    ingestedAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 'intel-024',
    category: 'technology',
    source: 'IPFS Blog',
    sourceUrl: 'https://blog.ipfs.tech/2026-02-ipfs-3',
    title: 'IPFS 3.0 Announcement: 10x Faster Content Routing',
    summary: 'Protocol Labs announced IPFS 3.0 with a new content routing system that is 10x faster than the current DHT.',
    fullContent: 'Protocol Labs announced IPFS 3.0, featuring a completely redesigned content routing system. The new Accelerated DHT provides 10x faster content discovery compared to the current implementation. Additional improvements include smaller metadata footprint, improved NAT traversal, and native HTTP gateway performance.',
    tags: ['ipfs', 'technology', 'upgrade', 'protocol-labs'],
    relevanceScore: 90,
    sentiment: 'positive',
    relatedCompetitors: [],
    publishedAt: '2026-02-14T15:00:00Z',
    ingestedAt: '2026-02-14T16:00:00Z',
  },
  {
    id: 'intel-025',
    category: 'competitor',
    source: 'VentureBeat',
    sourceUrl: 'https://venturebeat.com/cloudflare-workers-ai-partnership',
    title: 'Cloudflare Partners with Hugging Face for Edge AI',
    summary: 'Cloudflare and Hugging Face announced a partnership to deploy ML models directly to Workers AI with one click.',
    fullContent: 'Cloudflare and Hugging Face announced a strategic partnership enabling one-click deployment of Hugging Face models to Cloudflare Workers AI. The integration supports 100+ models including text generation, image classification, and embeddings. Models run at the edge across Cloudflare\'s global network.',
    tags: ['cloudflare', 'huggingface', 'ai', 'partnership'],
    relevanceScore: 79,
    sentiment: 'neutral',
    relatedCompetitors: ['comp-cloudflare'],
    publishedAt: '2026-02-14T12:00:00Z',
    ingestedAt: '2026-02-14T13:00:00Z',
  },
  {
    id: 'intel-026',
    category: 'pricing',
    source: 'Netlify Blog',
    sourceUrl: 'https://netlify.com/blog/new-pro-features-2026',
    title: 'Netlify Adds Bandwidth Caps to Prevent Bill Shock',
    summary: 'Netlify introduced configurable bandwidth caps and spending alerts after competitor bill shock incidents went viral.',
    fullContent: 'Following viral social media posts about unexpected cloud bills, Netlify introduced configurable bandwidth caps and spending alerts across all plans. Users can set hard limits on bandwidth, build minutes, and serverless function invocations. The feature is available immediately on all paid plans.',
    tags: ['netlify', 'pricing', 'billing', 'caps'],
    relevanceScore: 73,
    sentiment: 'positive',
    relatedCompetitors: ['comp-netlify'],
    publishedAt: '2026-02-15T10:00:00Z',
    ingestedAt: '2026-02-15T11:00:00Z',
  },
  {
    id: 'intel-027',
    category: 'market',
    source: 'Electric Capital',
    sourceUrl: 'https://electriccapital.com/developer-report-2026',
    title: 'Electric Capital: Akash Ecosystem Has 1,200+ Active Developers',
    summary: 'The Akash developer ecosystem grew to 1,200+ monthly active developers, making it the 4th largest DePIN network.',
    fullContent: 'Electric Capital\'s 2026 Developer Report reveals that the Akash Network ecosystem has grown to over 1,200 monthly active developers, making it the 4th largest DePIN developer ecosystem behind Filecoin (3,400), Helium (1,800), and Arweave (1,500). Year-over-year growth was 180%.',
    tags: ['akash', 'developers', 'ecosystem', 'depin'],
    relevanceScore: 88,
    sentiment: 'positive',
    relatedCompetitors: [],
    publishedAt: '2026-02-15T09:00:00Z',
    ingestedAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'intel-028',
    category: 'sentiment',
    source: 'Dev.to',
    sourceUrl: 'https://dev.to/cloudnative/railway-vs-render-2026',
    title: 'Railway vs Render 2026: Community Comparison',
    summary: 'A detailed community comparison of Railway and Render shows Railway winning on DX, Render on reliability.',
    fullContent: 'A popular Dev.to post comparing Railway and Render in 2026 attracted 15K views and 200+ comments. Key findings: Railway wins on developer experience (4.5/5 vs 4.0/5), while Render leads on reliability (99.95% vs 99.8% uptime). Both struggle with pricing transparency at scale.',
    tags: ['railway', 'render', 'comparison', 'community'],
    relevanceScore: 70,
    sentiment: 'neutral',
    relatedCompetitors: ['comp-railway', 'comp-render'],
    publishedAt: '2026-02-13T09:00:00Z',
    ingestedAt: '2026-02-13T10:00:00Z',
  },
  {
    id: 'intel-029',
    category: 'technology',
    source: 'Arweave Blog',
    sourceUrl: 'https://arweave.org/blog/ao-hyperbeam',
    title: 'Arweave AO HyperBeam: Massively Parallel Smart Contracts',
    summary: 'Arweave launched AO HyperBeam, enabling massively parallel computation on permanent storage.',
    fullContent: 'Arweave announced AO HyperBeam, a massively parallel computation framework built on top of Arweave permanent storage. The system enables smart contracts that scale horizontally without limits, processing 100K+ messages per second. This positions Arweave as both a storage and compute layer.',
    tags: ['arweave', 'ao', 'compute', 'technology'],
    relevanceScore: 83,
    sentiment: 'positive',
    relatedCompetitors: [],
    publishedAt: '2026-02-14T11:00:00Z',
    ingestedAt: '2026-02-14T12:00:00Z',
  },
  {
    id: 'intel-030',
    category: 'competitor',
    source: 'DigitalOcean Blog',
    sourceUrl: 'https://digitalocean.com/blog/gpu-droplets-ga',
    title: 'DigitalOcean Launches GPU Droplets Starting at $2.99/hr',
    summary: 'DigitalOcean entered the GPU market with H100 and A100 Droplets, targeting indie developers and small teams.',
    fullContent: 'DigitalOcean launched GPU Droplets, offering NVIDIA H100 and A100 GPUs starting at $2.99/hour. The offering targets indie developers, small teams, and startups who find AWS/GCP GPU pricing prohibitive. Integration with DigitalOcean\'s existing ecosystem (Spaces, managed databases) is seamless.',
    tags: ['digitalocean', 'gpu', 'pricing', 'launch'],
    relevanceScore: 75,
    sentiment: 'neutral',
    relatedCompetitors: ['comp-digitalocean'],
    publishedAt: '2026-02-12T16:00:00Z',
    ingestedAt: '2026-02-12T17:00:00Z',
  },
  {
    id: 'intel-031',
    category: 'market',
    source: 'Statista',
    sourceUrl: 'https://statista.com/static-hosting-market-2026',
    title: 'Static Hosting Market Share: Vercel 25%, Netlify 16%, Others 59%',
    summary: 'Statista reports Vercel leads static hosting with 25% market share, followed by Netlify at 16%.',
    fullContent: 'Statista\'s 2026 Static Hosting Market Report shows Vercel leading with 25% market share, up from 20% in 2025. Netlify holds 16% (down from 19%), Cloudflare Pages has 12% (up from 8%), and GitHub Pages maintains 10%. The remaining 37% is split among smaller providers including Render, Railway, and self-hosted solutions.',
    tags: ['market-share', 'static-hosting', 'vercel', 'netlify'],
    relevanceScore: 85,
    sentiment: 'neutral',
    relatedCompetitors: ['comp-vercel', 'comp-netlify', 'comp-cloudflare'],
    publishedAt: '2026-02-11T10:00:00Z',
    ingestedAt: '2026-02-11T11:00:00Z',
  },
  {
    id: 'intel-032',
    category: 'sentiment',
    source: 'Twitter/X',
    sourceUrl: 'https://x.com/t3dotgg/status/67890',
    title: 'Theo: "The PaaS market is ripe for disruption from decentralized alternatives"',
    summary: 'Popular tech YouTuber Theo (t3.gg) endorsed decentralized hosting alternatives in a viral thread.',
    fullContent: 'Theo from t3.gg posted a thread about the PaaS market: "The PaaS market is ripe for disruption from decentralized alternatives. Centralized platforms keep raising prices while decentralized compute gets cheaper. Someone is going to make the UX bridge and win big." The thread got 8K likes.',
    tags: ['sentiment', 'endorsement', 'influencer', 'decentralized'],
    relevanceScore: 81,
    sentiment: 'positive',
    relatedCompetitors: [],
    publishedAt: '2026-02-09T19:00:00Z',
    ingestedAt: '2026-02-09T20:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Seed data — Feature Comparison Matrix (20+ features)
// ---------------------------------------------------------------------------

const SEED_FEATURES: FeatureComparison[] = [
  { featureName: 'IPFS Hosting', af: true, competitors: { 'Render': false, 'Vercel': false, 'Netlify': false, 'Railway': false, 'Fly.io': false, 'Cloudflare Pages': false, 'DigitalOcean': false, 'Heroku': false } },
  { featureName: 'Arweave Permanent Storage', af: true, competitors: { 'Render': false, 'Vercel': false, 'Netlify': false, 'Railway': false, 'Fly.io': false, 'Cloudflare Pages': false, 'DigitalOcean': false, 'Heroku': false } },
  { featureName: 'Decentralized Compute', af: true, competitors: { 'Render': false, 'Vercel': false, 'Netlify': false, 'Railway': false, 'Fly.io': false, 'Cloudflare Pages': false, 'DigitalOcean': false, 'Heroku': false } },
  { featureName: 'Serverless Functions', af: true, competitors: { 'Render': true, 'Vercel': true, 'Netlify': true, 'Railway': false, 'Fly.io': false, 'Cloudflare Pages': 'Workers', 'DigitalOcean': false, 'Heroku': false } },
  { featureName: 'Custom Domains', af: true, competitors: { 'Render': true, 'Vercel': true, 'Netlify': true, 'Railway': true, 'Fly.io': true, 'Cloudflare Pages': true, 'DigitalOcean': true, 'Heroku': true } },
  { featureName: 'Free SSL', af: true, competitors: { 'Render': true, 'Vercel': true, 'Netlify': true, 'Railway': true, 'Fly.io': true, 'Cloudflare Pages': true, 'DigitalOcean': true, 'Heroku': true } },
  { featureName: 'Global CDN', af: true, competitors: { 'Render': true, 'Vercel': true, 'Netlify': true, 'Railway': false, 'Fly.io': true, 'Cloudflare Pages': true, 'DigitalOcean': true, 'Heroku': false } },
  { featureName: 'Git-Based Deploys', af: true, competitors: { 'Render': true, 'Vercel': true, 'Netlify': true, 'Railway': true, 'Fly.io': false, 'Cloudflare Pages': true, 'DigitalOcean': true, 'Heroku': true } },
  { featureName: 'Docker Support', af: true, competitors: { 'Render': true, 'Vercel': false, 'Netlify': false, 'Railway': true, 'Fly.io': true, 'Cloudflare Pages': false, 'DigitalOcean': true, 'Heroku': 'Container Registry' } },
  { featureName: 'GPU Compute', af: 'Via Akash', competitors: { 'Render': true, 'Vercel': false, 'Netlify': false, 'Railway': false, 'Fly.io': true, 'Cloudflare Pages': 'Workers AI', 'DigitalOcean': true, 'Heroku': false } },
  { featureName: 'AI Agent Hosting', af: true, competitors: { 'Render': 'Templates', 'Vercel': 'AI SDK', 'Netlify': false, 'Railway': false, 'Fly.io': false, 'Cloudflare Pages': 'Workers AI', 'DigitalOcean': false, 'Heroku': false } },
  { featureName: 'Managed Database', af: false, competitors: { 'Render': 'PostgreSQL', 'Vercel': 'Postgres/KV', 'Netlify': false, 'Railway': 'PostgreSQL/MySQL/Redis', 'Fly.io': 'Postgres', 'Cloudflare Pages': 'D1/KV', 'DigitalOcean': 'PostgreSQL/MySQL/Redis', 'Heroku': 'Postgres/Redis' } },
  { featureName: 'ENS Domain Support', af: true, competitors: { 'Render': false, 'Vercel': false, 'Netlify': false, 'Railway': false, 'Fly.io': false, 'Cloudflare Pages': false, 'DigitalOcean': false, 'Heroku': false } },
  { featureName: 'Preview Deployments', af: true, competitors: { 'Render': true, 'Vercel': true, 'Netlify': true, 'Railway': true, 'Fly.io': false, 'Cloudflare Pages': true, 'DigitalOcean': false, 'Heroku': 'Review Apps' } },
  { featureName: 'Edge Functions', af: false, competitors: { 'Render': false, 'Vercel': true, 'Netlify': true, 'Railway': false, 'Fly.io': true, 'Cloudflare Pages': true, 'DigitalOcean': false, 'Heroku': false } },
  { featureName: 'Multi-Region', af: 'Akash providers', competitors: { 'Render': false, 'Vercel': true, 'Netlify': true, 'Railway': false, 'Fly.io': true, 'Cloudflare Pages': true, 'DigitalOcean': 'Limited', 'Heroku': 'US/EU only' } },
  { featureName: 'Cost Transparency', af: 'On-chain pricing', competitors: { 'Render': 'Good', 'Vercel': 'Opaque at scale', 'Netlify': 'Overage risk', 'Railway': 'Usage-based', 'Fly.io': 'Complex', 'Cloudflare Pages': 'Good', 'DigitalOcean': 'Simple', 'Heroku': 'Expensive' } },
  { featureName: 'Censorship Resistance', af: true, competitors: { 'Render': false, 'Vercel': false, 'Netlify': false, 'Railway': false, 'Fly.io': false, 'Cloudflare Pages': false, 'DigitalOcean': false, 'Heroku': false } },
  { featureName: 'Web3 Wallet Auth', af: true, competitors: { 'Render': false, 'Vercel': false, 'Netlify': false, 'Railway': false, 'Fly.io': false, 'Cloudflare Pages': false, 'DigitalOcean': false, 'Heroku': false } },
  { featureName: 'CLI Tool', af: 'af', competitors: { 'Render': false, 'Vercel': 'vercel', 'Netlify': 'netlify', 'Railway': 'railway', 'Fly.io': 'flyctl', 'Cloudflare Pages': 'wrangler', 'DigitalOcean': 'doctl', 'Heroku': 'heroku' } },
  { featureName: 'Free Tier', af: true, competitors: { 'Render': true, 'Vercel': true, 'Netlify': true, 'Railway': '$5 credit', 'Fly.io': true, 'Cloudflare Pages': true, 'DigitalOcean': 'Static only', 'Heroku': false } },
  { featureName: 'Monorepo Support', af: true, competitors: { 'Render': true, 'Vercel': true, 'Netlify': true, 'Railway': true, 'Fly.io': false, 'Cloudflare Pages': true, 'DigitalOcean': false, 'Heroku': false } },
]

// ---------------------------------------------------------------------------
// GraphQL queries
// ---------------------------------------------------------------------------

const INTEL_ENTRIES_QUERY = `
  query IntelEntries($limit: Int, $offset: Int, $category: String, $competitor: String, $dateFrom: String, $dateTo: String) {
    intelEntries(limit: $limit, offset: $offset, category: $category, competitor: $competitor, dateFrom: $dateFrom, dateTo: $dateTo) {
      id category source sourceUrl title summary fullContent
      tags relevanceScore sentiment relatedCompetitors
      publishedAt ingestedAt
    }
  }
`

const COMPETITOR_PROFILES_QUERY = `
  query CompetitorProfiles {
    competitorProfiles {
      id name website logo description category
      pricing { tiers { name price features } }
      features strengths weaknesses marketShare lastUpdated
    }
  }
`

const FEATURE_MATRIX_QUERY = `
  query FeatureMatrix {
    featureMatrix {
      featureName af competitors
    }
  }
`

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function useSeedData(): boolean {
  return process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
}

async function graphqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 },
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
// In-memory mock stores
// ---------------------------------------------------------------------------

let mockIntel = [...SEED_INTEL]
let mockCompetitors = [...SEED_COMPETITORS]

// ---------------------------------------------------------------------------
// Intel Entry CRUD
// ---------------------------------------------------------------------------

export interface IntelFilters {
  category?: IntelCategory
  competitor?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  sentiment?: IntelSentiment
}

export async function fetchIntelEntries(
  limit = 50,
  offset = 0,
  filters?: IntelFilters,
): Promise<IntelEntry[]> {
  try {
    const data = await graphqlFetch<{ intelEntries: IntelEntry[] }>(
      INTEL_ENTRIES_QUERY,
      { limit, offset, ...filters },
    )
    return data.intelEntries
  } catch {
    if (useSeedData()) {
      let result = [...mockIntel]
      if (filters?.category) {
        result = result.filter((e) => e.category === filters.category)
      }
      if (filters?.competitor) {
        result = result.filter((e) => e.relatedCompetitors.includes(filters.competitor!))
      }
      if (filters?.sentiment) {
        result = result.filter((e) => e.sentiment === filters.sentiment)
      }
      if (filters?.dateFrom) {
        result = result.filter((e) => e.publishedAt >= filters.dateFrom!)
      }
      if (filters?.dateTo) {
        result = result.filter((e) => e.publishedAt <= filters.dateTo!)
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        result = result.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.summary.toLowerCase().includes(q) ||
            e.tags.some((t) => t.toLowerCase().includes(q)),
        )
      }
      result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      return result.slice(offset, offset + limit)
    }
    return []
  }
}

export async function fetchIntelEntryById(id: string): Promise<IntelEntry | null> {
  if (useSeedData()) return mockIntel.find((e) => e.id === id) || null
  try {
    const data = await graphqlFetch<{ intelEntry: IntelEntry }>(
      `query IntelEntry($id: ID!) { intelEntry(id: $id) { id category source sourceUrl title summary fullContent tags relevanceScore sentiment relatedCompetitors publishedAt ingestedAt } }`,
      { id },
    )
    return data.intelEntry
  } catch {
    return null
  }
}

export async function createIntelEntry(entry: Omit<IntelEntry, 'id' | 'ingestedAt'>): Promise<IntelEntry> {
  const newEntry: IntelEntry = {
    ...entry,
    id: `intel-${Date.now()}`,
    ingestedAt: new Date().toISOString(),
  }
  if (useSeedData()) {
    mockIntel = [newEntry, ...mockIntel]
    return newEntry
  }
  return newEntry
}

export async function deleteIntelEntry(id: string): Promise<void> {
  if (useSeedData()) {
    mockIntel = mockIntel.filter((e) => e.id !== id)
  }
}

// ---------------------------------------------------------------------------
// Competitor Profiles
// ---------------------------------------------------------------------------

export async function fetchCompetitorProfiles(): Promise<CompetitorProfile[]> {
  try {
    const data = await graphqlFetch<{ competitorProfiles: CompetitorProfile[] }>(
      COMPETITOR_PROFILES_QUERY,
    )
    return data.competitorProfiles
  } catch {
    if (useSeedData()) return mockCompetitors
    return []
  }
}

export async function fetchCompetitorById(id: string): Promise<CompetitorProfile | null> {
  if (useSeedData()) return mockCompetitors.find((c) => c.id === id) || null
  try {
    const data = await graphqlFetch<{ competitorProfile: CompetitorProfile }>(
      `query CompetitorProfile($id: ID!) { competitorProfile(id: $id) { id name website logo description category pricing { tiers { name price features } } features strengths weaknesses marketShare lastUpdated } }`,
      { id },
    )
    return data.competitorProfile
  } catch {
    return null
  }
}

export async function updateCompetitorProfile(
  id: string,
  updates: Partial<CompetitorProfile>,
): Promise<CompetitorProfile> {
  if (useSeedData()) {
    const idx = mockCompetitors.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Competitor not found')
    mockCompetitors[idx] = { ...mockCompetitors[idx], ...updates, lastUpdated: new Date().toISOString() }
    return mockCompetitors[idx]
  }
  throw new Error('Not implemented')
}

// ---------------------------------------------------------------------------
// Feature Comparison Matrix
// ---------------------------------------------------------------------------

export async function fetchFeatureMatrix(): Promise<FeatureComparison[]> {
  try {
    const data = await graphqlFetch<{ featureMatrix: FeatureComparison[] }>(
      FEATURE_MATRIX_QUERY,
    )
    return data.featureMatrix
  } catch {
    if (useSeedData()) return SEED_FEATURES
    return []
  }
}

// ---------------------------------------------------------------------------
// Aggregation helpers for dashboard
// ---------------------------------------------------------------------------

export function getIntelByCategory(entries: IntelEntry[]): Record<IntelCategory, IntelEntry[]> {
  const groups: Record<IntelCategory, IntelEntry[]> = {
    competitor: [],
    market: [],
    pricing: [],
    technology: [],
    sentiment: [],
  }
  for (const entry of entries) {
    groups[entry.category].push(entry)
  }
  return groups
}

export function getCompetitorActivityTimeline(entries: IntelEntry[]): { date: string; count: number; entries: IntelEntry[] }[] {
  const grouped: Record<string, IntelEntry[]> = {}
  for (const entry of entries) {
    const date = entry.publishedAt.split('T')[0]
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(entry)
  }
  return Object.entries(grouped)
    .map(([date, items]) => ({ date, count: items.length, entries: items }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getMarketTrends(entries: IntelEntry[]): { trend: string; sentiment: IntelSentiment; count: number }[] {
  const tagCounts: Record<string, { positive: number; neutral: number; negative: number }> = {}
  for (const entry of entries) {
    for (const tag of entry.tags) {
      if (!tagCounts[tag]) tagCounts[tag] = { positive: 0, neutral: 0, negative: 0 }
      tagCounts[tag][entry.sentiment]++
    }
  }
  return Object.entries(tagCounts)
    .map(([trend, counts]) => {
      const total = counts.positive + counts.neutral + counts.negative
      const dominant = counts.positive >= counts.negative ? (counts.positive >= counts.neutral ? 'positive' : 'neutral') : 'negative'
      return { trend, sentiment: dominant as IntelSentiment, count: total }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)
}

// Re-export seed data
export { SEED_COMPETITORS, SEED_INTEL, SEED_FEATURES }
