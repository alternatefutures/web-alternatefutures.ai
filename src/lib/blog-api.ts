const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

export interface BlogTag {
  id: string
  name: string
  slug: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  authorName: string
  tags: BlogTag[]
  seoTitle: string | null
  seoDescription: string | null
  readingTimeMin: number | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

const BLOG_POSTS_QUERY = `
  query BlogPosts($limit: Int, $offset: Int) {
    blogPosts(limit: $limit, offset: $offset) {
      id title slug excerpt content coverImage status
      authorName tags { id name slug }
      seoTitle seoDescription readingTimeMin
      publishedAt createdAt updatedAt
    }
  }
`

const BLOG_POST_BY_SLUG_QUERY = `
  query BlogPost($slug: String!) {
    blogPost(slug: $slug) {
      id title slug excerpt content coverImage status
      authorName tags { id name slug }
      seoTitle seoDescription readingTimeMin
      publishedAt createdAt updatedAt
    }
  }
`

const BLOG_TAGS_QUERY = `
  query BlogTags {
    blogTags { id name slug }
  }
`

// ---------------------------------------------------------------------------
// Seed data — used in development when the GraphQL API is unreachable
// ---------------------------------------------------------------------------

const SEED_TAGS: BlogTag[] = [
  { id: 'tag-1', name: 'Product Updates', slug: 'product-updates' },
  { id: 'tag-2', name: 'Engineering', slug: 'engineering' },
  { id: 'tag-3', name: 'Web3', slug: 'web3' },
  { id: 'tag-4', name: 'AI Agents', slug: 'ai-agents' },
  { id: 'tag-5', name: 'DePIN', slug: 'depin' },
  { id: 'tag-6', name: 'Tutorials', slug: 'tutorials' },
  { id: 'tag-7', name: 'Community', slug: 'community' },
  { id: 'tag-8', name: 'Decentralized Hosting', slug: 'decentralized-hosting' },
]

const SEED_POSTS: BlogPost[] = [
  {
    id: 'seed-1',
    title: 'Introducing Alternate Futures: The Decentralized Cloud for AI Agents',
    slug: 'introducing-alternate-futures',
    excerpt:
      'We built Alternate Futures because the cloud shouldn\'t have a single point of failure. Today we\'re opening early access to the platform that lets you deploy AI agents, full-stack apps, and static sites on truly decentralized infrastructure.',
    coverImage: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1200&h=630&fit=crop',
    status: 'PUBLISHED',
    authorName: 'Alternate Futures Team',
    tags: [SEED_TAGS[0], SEED_TAGS[2], SEED_TAGS[4]],
    seoTitle: 'Introducing Alternate Futures — Decentralized Cloud for AI Agents',
    seoDescription: 'Deploy AI agents and full-stack apps on decentralized infrastructure with lower costs and always-on uptime.',
    readingTimeMin: 4,
    publishedAt: '2026-01-15T10:00:00Z',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
    content: `The centralized cloud has served us well, but it comes with trade-offs: vendor lock-in, single regions of failure, and costs that scale faster than your revenue.

**Alternate Futures changes that.**

![Decentralized network diagram](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&h=500&fit=crop)

## Why Decentralized Cloud?

Traditional cloud providers concentrate your infrastructure in a handful of data centers. When AWS us-east-1 goes down, half the internet goes with it. Decentralized infrastructure distributes your workloads across hundreds of independent providers worldwide.

### The benefits are real:

- **No single point of failure** — your app stays up even if individual providers go offline
- **Lower costs** — compute on Akash Network costs 50-80% less than equivalent AWS instances
- **Censorship resistant** — no single entity can take your deployment down
- **Data sovereignty** — choose exactly where your data lives

## What You Can Deploy

Alternate Futures supports the full spectrum of modern applications:

| Workload | How It Works |
|----------|-------------|
| Static Sites | IPFS-pinned, served via global CDN |
| Full-Stack Apps | Container-based deployment on Akash |
| AI Agents | ElizaOS, LangChain, or custom agents with persistent state |
| Serverless Functions | Edge functions with IPFS-backed storage |

## Getting Started

Install the CLI and deploy in under 2 minutes:

\`\`\`bash
npm install -g @alternatefutures/cli

# Initialize your project
af init

# Deploy to decentralized cloud
af deploy
\`\`\`

That's it. Your app is now running on decentralized infrastructure with automatic SSL, global distribution, and a permanent content address on IPFS.

> "The future of cloud computing isn't bigger data centers — it's no data centers at all." — AF Manifesto

## Early Access

We're opening early access today. Request an invite at [alternatefutures.ai](https://alternatefutures.ai) and join our [Discord](https://discord.gg/YW6zZfZZUU) to connect with the community.

![AF Dashboard Preview](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=500&fit=crop)

The decentralized cloud is here. Let's build the future together.`,
  },
  {
    id: 'seed-2',
    title: 'How to Deploy Your First AI Agent on Decentralized Infrastructure',
    slug: 'deploy-first-ai-agent',
    excerpt:
      'A step-by-step tutorial for deploying an AI agent using the AF CLI, complete with persistent memory, tool access, and automatic scaling — all on decentralized compute.',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop',
    status: 'PUBLISHED',
    authorName: 'Alternate Futures Team',
    tags: [SEED_TAGS[3], SEED_TAGS[5]],
    seoTitle: 'Deploy Your First AI Agent on Decentralized Infrastructure',
    seoDescription: 'Step-by-step guide to deploying AI agents with persistent memory on decentralized cloud using the AF CLI.',
    readingTimeMin: 7,
    publishedAt: '2026-01-28T14:00:00Z',
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-01-28T14:00:00Z',
    content: `AI agents are only as reliable as the infrastructure they run on. In this tutorial, you'll deploy a fully functional AI agent on decentralized compute — with persistent memory, external tool access, and zero vendor lock-in.

![AI Agent Architecture](https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&h=500&fit=crop)

## Prerequisites

- Node.js 22+ installed
- An Alternate Futures account ([request access](https://alternatefutures.ai))
- The AF CLI: \`npm install -g @alternatefutures/cli\`

## Step 1: Scaffold the Agent

\`\`\`bash
af init --template ai-agent
cd my-agent
\`\`\`

This creates a project with the following structure:

\`\`\`
my-agent/
├── src/
│   ├── agent.ts          # Agent logic
│   ├── tools/            # Custom tools
│   └── memory/           # Memory providers
├── deploy.yaml           # AF deployment config
├── Dockerfile
└── package.json
\`\`\`

## Step 2: Configure the Agent

Edit \`src/agent.ts\` to define your agent's behavior:

\`\`\`typescript
import { Agent, Tool, Memory } from '@alternatefutures/agent-sdk'

const agent = new Agent({
  name: 'research-assistant',
  model: 'claude-sonnet-4-5-20250929',
  systemPrompt: \`You are a research assistant that helps
    users find and summarize technical papers.\`,
  memory: Memory.persistent({ backend: 'ipfs' }),
  tools: [
    Tool.webSearch(),
    Tool.fileRead(),
    Tool.summarize(),
  ],
})

export default agent
\`\`\`

## Step 3: Define the Deployment

The \`deploy.yaml\` tells AF how to run your agent:

\`\`\`yaml
version: "1.0"
services:
  agent:
    image: build
    expose:
      - port: 8080
        as: 80
        to:
          - global: true
    resources:
      cpu: 2
      memory: 2Gi
      storage: 5Gi
\`\`\`

## Step 4: Deploy

\`\`\`bash
af deploy
\`\`\`

The CLI will:
1. Build your Docker image
2. Find the cheapest provider on the Akash network
3. Deploy and configure SSL
4. Return your live URL

\`\`\`
✓ Built image in 12s
✓ Found provider: akash1xyz... ($0.003/hr)
✓ Deployed to: https://research-assistant.af.app
✓ Health check passed
\`\`\`

![Deployment terminal output](https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=900&h=500&fit=crop)

## Step 5: Test It

\`\`\`bash
curl -X POST https://research-assistant.af.app/chat \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Find recent papers on transformer efficiency"}'
\`\`\`

Your agent is now running on decentralized infrastructure, with persistent memory backed by IPFS and automatic failover across providers.

## What's Next?

- Add custom tools in \`src/tools/\`
- Connect to external APIs and databases
- Set up webhooks for Discord/Slack integration
- Monitor with \`af logs --follow\`

Join our [Discord](https://discord.gg/YW6zZfZZUU) if you get stuck — the community is incredibly helpful.`,
  },
  {
    id: 'seed-3',
    title: 'The Web3 Hosting Vacuum: Why Decentralized Cloud Matters More Than Ever',
    slug: 'web3-hosting-vacuum',
    excerpt:
      'With Fleek pivoting to AI inference and Spheron becoming a GPU marketplace, the Web3 hosting space has a massive gap. Here\'s why that matters and what we\'re doing about it.',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop',
    status: 'PUBLISHED',
    authorName: 'Alternate Futures Team',
    tags: [SEED_TAGS[2], SEED_TAGS[7], SEED_TAGS[4]],
    seoTitle: 'The Web3 Hosting Vacuum — Why Decentralized Cloud Matters Now',
    seoDescription: 'Fleek and Spheron have left Web3 hosting. Alternate Futures is filling the gap with true decentralized cloud infrastructure.',
    readingTimeMin: 5,
    publishedAt: '2026-02-05T09:00:00Z',
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: '2026-02-05T09:00:00Z',
    content: `Something remarkable happened in the Web3 infrastructure space over the past six months: the two biggest players left.

**Fleek** — the company that pioneered IPFS hosting for Web3 projects — pivoted entirely to AI inference. **Spheron** — which offered decentralized compute — repositioned as a GPU marketplace for ML workloads.

![Empty server room](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&h=500&fit=crop)

## The Gap Is Real

Thousands of Web3 projects that relied on these platforms are now looking for alternatives. The options aren't great:

- **Vercel/Netlify** — centralized, US-based, and increasingly expensive at scale
- **Self-hosted IPFS** — requires significant DevOps expertise
- **Raw Akash/Filecoin** — powerful but complex for most teams

There's a clear need for a platform that makes decentralized hosting as simple as \`git push\`.

## Why Did They Leave?

The answer is economics. GPU compute for AI training commands premium pricing — often 10-100x more per compute-hour than web hosting. Both companies followed the money.

But web hosting is the *foundation* of the decentralized web. Without reliable, easy-to-use hosting, the entire Web3 ecosystem loses its infrastructure layer.

> "Everyone wants to build the AI layer. But someone needs to keep the lights on for the thousands of dApps, DAOs, and protocols that make Web3 actually work."

## What We're Building

Alternate Futures is purpose-built for this moment. Our platform provides:

### For Web3 Projects
- **IPFS + Arweave** pinning with automatic replication
- **ENS and HNS** domain support out of the box
- **Permanent deployments** — your content stays accessible forever
- **Framework adapters** — Next.js, Astro, React, Vue with zero config

### For AI Agent Builders
- **Decentralized compute** at 50-80% less than AWS
- **Persistent agent memory** backed by IPFS
- **Built-in tool frameworks** for common agent patterns
- **Auto-scaling** across the Akash provider network

### For Everyone
- **One CLI, one config file** — \`af deploy\` handles the rest
- **Automatic SSL** and global CDN
- **GitHub Actions integration** for CI/CD
- **Cost transparency** — see exactly what you're paying providers

![AF Platform Architecture](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&h=500&fit=crop)

## The Opportunity

With Fleek and Spheron out of the hosting game, we have a unique window to define what decentralized cloud looks like for the next generation of builders. We're not just filling a gap — we're raising the bar.

**The decentralized web deserves decentralized infrastructure.** That's what we're here to build.

[Request early access](https://alternatefutures.ai) and help us shape the future.`,
  },
  {
    id: 'seed-4',
    title: 'Building an AI Marketing Swarm with NATS and Discord',
    slug: 'ai-marketing-swarm-nats-discord',
    excerpt:
      'How we built an autonomous team of AI agents that collaborate via NATS messaging to handle content, community, and strategy — all coordinated through Discord.',
    coverImage: 'https://images.unsplash.com/photo-1531746790095-e5cb157f5765?w=1200&h=630&fit=crop',
    status: 'PUBLISHED',
    authorName: 'Alternate Futures Team',
    tags: [SEED_TAGS[3], SEED_TAGS[1], SEED_TAGS[6]],
    seoTitle: 'Building an AI Marketing Swarm with NATS and Discord',
    seoDescription: 'How Alternate Futures built an autonomous AI agent swarm for marketing using NATS messaging and Discord integration.',
    readingTimeMin: 6,
    publishedAt: '2026-02-08T16:00:00Z',
    createdAt: '2026-02-06T10:00:00Z',
    updatedAt: '2026-02-08T16:00:00Z',
    content: `What if your marketing team never slept, never forgot context, and could instantly coordinate across content, community management, competitive intelligence, and growth strategy?

That's what we built at Alternate Futures. Our marketing "team" is a swarm of specialized AI agents, each with a distinct personality and role, all communicating over NATS and interfacing with humans through Discord.

![Swarm architecture diagram](https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&h=500&fit=crop)

## The Architecture

The system has three layers:

### 1. Agent Layer
Eight specialized agents, each running as a Claude-powered process:

| Agent | Role | Personality |
|-------|------|-------------|
| **Senku** | Strategic Orchestrator | Analytical, data-driven |
| **Pixel** | Brand Guardian | Creative, design-focused |
| **Mercury** | Content Writer | Eloquent, SEO-aware |
| **Nova** | Growth Hacker | Metrics-obsessed |
| **Atlas** | Market Intelligence | Research-oriented |
| **Sage** | Community Manager | Empathetic, engaging |
| **Link** | Partnerships & Grants | Diplomatic, thorough |
| **Doc** | DevRel Lead | Technical, helpful |

### 2. Message Bus (NATS)
All agent communication flows through NATS subjects:

\`\`\`
agents.discord.{botname}     → Agent sends message to Discord
agents.human.discord          → Human message forwarded to agents
agents.human.mention.{bot}    → Direct @mention routed to specific agent
marketing.tasks.{agent}       → Task dispatch for batch processing
\`\`\`

### 3. Discord Interface
Each agent has its own Discord bot identity with a unique avatar and name. Humans interact naturally in channels — @mentioning agents for specific tasks or just chatting in team channels.

## How It Works in Practice

Here's a real workflow from last week:

1. **Atlas** detected that a competitor pivoted away from Web3 hosting
2. Atlas published findings to the \`#intel-team\` channel
3. **Senku** picked up the intel and drafted a strategic response
4. **Mercury** was tasked with writing a blog post about the opportunity
5. **Pixel** reviewed the post for brand consistency
6. **Nova** suggested distribution channels and timing
7. A human (our CEO) approved the final draft with a thumbs-up reaction

The entire flow took 12 minutes. A traditional team would need days of meetings.

![Discord channel with agents](https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&h=500&fit=crop)

## Key Lessons Learned

### Close stdin or Claude hangs
When spawning Claude as a subprocess via \`execFile\`, you **must** close \`child.stdin\` immediately or the process blocks forever waiting for input:

\`\`\`typescript
const child = execFile('claude', ['-p', prompt])
child.stdin?.end() // Critical!
\`\`\`

### Use specific bot subjects, not broadcast
Publishing to \`agents.discord.broadcast\` sends from **all** bots simultaneously — creating duplicate messages. Always target a specific bot:

\`\`\`typescript
// Good
nats.publish('agents.discord.senku', payload)

// Bad — sends from all 8 bots
nats.publish('agents.discord.broadcast', payload)
\`\`\`

### PM2 needs --update-env
When environment variables change, PM2 processes don't pick them up automatically:

\`\`\`bash
pm2 restart marketing-worker --update-env
\`\`\`

## Results

After two weeks of operation:
- **47 pieces** of content produced (blog posts, social threads, Discord announcements)
- **3 partnership opportunities** identified and initiated by Link
- **24/7 community coverage** — Sage responds to Discord questions within minutes
- **Zero burnout** — the agents don't need weekends

The swarm isn't replacing human judgment — it's amplifying it. Every significant decision still gets human approval. But the research, drafting, monitoring, and coordination happens autonomously.

## Open Source

We're planning to open-source the NATS-Discord bridge and agent framework later this quarter. Star the repo to get notified: [github.com/alternatefutures](https://github.com/alternatefutures).`,
  },
]

function useSeedData(): boolean {
  return process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
}

// ---------------------------------------------------------------------------
// GraphQL client
// ---------------------------------------------------------------------------

async function graphqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 }, // ISR: revalidate every 5 minutes
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

export async function fetchPublishedPosts(
  limit = 50,
  offset = 0,
): Promise<BlogPost[]> {
  try {
    const data = await graphqlFetch<{ blogPosts: BlogPost[] }>(
      BLOG_POSTS_QUERY,
      { limit, offset },
    )
    return data.blogPosts
  } catch {
    if (useSeedData()) return SEED_POSTS.slice(offset, offset + limit)
    return []
  }
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const data = await graphqlFetch<{ blogPost: BlogPost }>(
      BLOG_POST_BY_SLUG_QUERY,
      { slug },
    )
    return data.blogPost
  } catch {
    if (useSeedData()) return SEED_POSTS.find((p) => p.slug === slug) || null
    return null
  }
}

export async function fetchTags(): Promise<BlogTag[]> {
  try {
    const data = await graphqlFetch<{ blogTags: BlogTag[] }>(BLOG_TAGS_QUERY)
    return data.blogTags
  } catch {
    if (useSeedData()) return SEED_TAGS
    return []
  }
}
