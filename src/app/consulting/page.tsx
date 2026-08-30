import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './consulting.css'

const SITE_URL = 'https://www.alternatefutures.ai'
const CONTACT_URL = 'mailto:system@alternatefutures.ai?subject=AI%20systems%20consulting'

export const metadata: Metadata = {
  title: 'AI Systems Consulting for Startups and SMEs',
  description:
    'Alternate Futures solves difficult AI engineering problems for startups and SMEs, with a focus on compliant systems, privacy, confidential compute, TEEs, durable infrastructure, evaluation, and AI-native team education.',
  alternates: { canonical: '/consulting' },
  openGraph: {
    url: '/consulting',
    title: 'Hard AI problems, solved responsibly | Alternate Futures',
    description:
      'Engineering for private, compliant, durable AI systems—and practical education for teams becoming AI-native.',
  },
}

const faqs = [
  {
    question: 'What kinds of AI problems does Alternate Futures take on?',
    answer:
      'We work on the difficult parts between a promising prototype and a dependable product: deterministic and grounded outputs, evaluation harnesses, agent architecture, data pipelines, model serving, privacy controls, confidential compute, durable storage, and production infrastructure.',
  },
  {
    question: 'Can you help with compliance-sensitive AI systems?',
    answer:
      'Yes. We identify applicable controls before building, document data and personnel access, design for least privilege and auditability, and place workloads with providers appropriate to the client’s requirements. We do not imply that a technical design alone grants a certification.',
  },
  {
    question: 'Do you guarantee hallucination-free AI?',
    answer:
      'No generative system can honestly be guaranteed free of incorrect output. Where correctness matters, we move exact logic into deterministic code, constrain and ground model output, add verification and abstention, and enforce agreed quality targets with evaluation and regression gates.',
  },
  {
    question: 'Can our company retain control of its infrastructure?',
    answer:
      'Yes. We can deploy into client-owned provider accounts and deliver documented, versioned interfaces, infrastructure definitions, runbooks, and access records so the client team can operate the system without depending on us being in the room.',
  },
  {
    question: 'How do you help a team become AI-native?',
    answer:
      'We combine leadership alignment, role-specific workflow design, hands-on workshops, governance practices, and a real deployed project. The goal is a repeatable team capability—not a tour of whichever AI tools are fashionable that month.',
  },
]

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'AI systems engineering and AI-native team education',
      provider: {
        '@type': 'Organization',
        name: 'Alternate Futures',
        url: SITE_URL,
      },
      url: `${SITE_URL}/consulting`,
      serviceType: [
        'AI systems consulting',
        'AI engineering for startups and SMEs',
        'Privacy and compliant AI architecture',
        'Confidential computing and TEE deployment',
        'AI-native team education',
      ],
      description:
        'Engineering and education for startups and SMEs building private, compliant, measurable, and durable AI systems.',
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  ],
}

function Arrow() {
  return <span aria-hidden="true">↗</span>
}

export default function ConsultingPage() {
  return (
    <div className="consulting-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />

      <Header activePage="consulting" />

      <div className="consulting-scrollable">
        <main>
          <section className="consulting-hero">
            <div className="consulting-shell consulting-hero-grid">
              <div className="consulting-hero-copy">
                <p className="consulting-eyebrow">AI SYSTEMS CONSULTING + TEAM EDUCATION</p>
                <h1>
                  Bring us the AI problem your team <em>cannot afford to get wrong.</em>
                </h1>
                <p className="consulting-lede">
                  We help AI startups and SMEs turn difficult prototypes into
                  private, compliant, durable systems—and help the people around
                  them become genuinely AI-native.
                </p>
                <div className="consulting-actions">
                  <a href={CONTACT_URL} className="consulting-button consulting-button-primary">
                    Start with the hard problem <Arrow />
                  </a>
                  <a href="#ways-to-work" className="consulting-button consulting-button-text">
                    See how we work ↓
                  </a>
                </div>
              </div>

              <div className="consulting-hero-system" aria-label="A prototype becoming a trusted production system">
                <div className="consulting-system-label">FROM PROMISING TO PRODUCTION</div>
                <div className="consulting-system-stage consulting-system-stage-start">
                  <span>START</span>
                  <strong>A prototype that works sometimes</strong>
                </div>
                <div className="consulting-system-line" aria-hidden="true">
                  <i></i><i></i><i></i><i></i>
                </div>
                <div className="consulting-system-stage consulting-system-stage-end">
                  <span>SHIP</span>
                  <strong>A system you can measure, govern, and trust</strong>
                </div>
                <div className="consulting-system-orbit" aria-hidden="true"></div>
              </div>
            </div>
          </section>

          <section className="consulting-truth" aria-labelledby="consulting-truth-title">
            <div className="consulting-shell consulting-truth-grid">
              <p className="consulting-eyebrow consulting-eyebrow-light">RELIABILITY WITHOUT THE THEATER</p>
              <div>
                <h2 id="consulting-truth-title">We do not sell “hallucination-free.”</h2>
                <p>
                  We build something more useful: deterministic paths where
                  correctness is non-negotiable, grounded and constrained model
                  output, verification that can abstain instead of guessing, and
                  evaluation gates that stop regressions from shipping.
                </p>
              </div>
            </div>
          </section>

          <section className="consulting-capabilities" aria-labelledby="consulting-capabilities-title">
            <div className="consulting-shell">
              <div className="consulting-section-heading">
                <p className="consulting-eyebrow">WHERE WE GO DEEP</p>
                <div>
                  <h2 id="consulting-capabilities-title">The hard parts belong in the architecture.</h2>
                  <p>Not in a disclaimer, a prompt, or a promise that cannot be measured.</p>
                </div>
              </div>

              <div className="consulting-capability-grid">
                <article className="consulting-capability-card consulting-card-blue">
                  <span>01 · RELIABILITY</span>
                  <h3>Trustworthy outputs</h3>
                  <p>Separate exact logic from generative work, then make quality observable.</p>
                  <ul>
                    <li>Deterministic execution paths</li>
                    <li>Schema-constrained and grounded output</li>
                    <li>Verification, abstention, and citations</li>
                    <li>Evaluation harnesses and CI regression gates</li>
                  </ul>
                </article>

                <article className="consulting-capability-card consulting-card-peach">
                  <span>02 · TRUST</span>
                  <h3>Private and compliant systems</h3>
                  <p>Identify obligations early enough to shape the system—not after it ships.</p>
                  <ul>
                    <li>Data residency, retention, and PII controls</li>
                    <li>Tenant isolation and auditable access</li>
                    <li>Least-privilege secrets and credentials</li>
                    <li>Compliance requirements mapped before build</li>
                  </ul>
                </article>

                <article className="consulting-capability-card consulting-card-dark">
                  <span>03 · CONFIDENTIAL COMPUTE</span>
                  <h3>TEEs where they earn their constraints</h3>
                  <p>Use trusted execution environments for workloads that justify them, with properties stated plainly.</p>
                  <ul>
                    <li>Workload sensitivity assessment</li>
                    <li>TEE-backed inference and services</li>
                    <li>Attestation requirements by workload</li>
                    <li>Private model and data processing</li>
                  </ul>
                </article>

                <article className="consulting-capability-card consulting-card-green">
                  <span>04 · DURABILITY</span>
                  <h3>Infrastructure built to outlast the demo</h3>
                  <p>Design for ownership, recovery, traceability, and change from the first deployment.</p>
                  <ul>
                    <li>CPU, GPU, storage, networking, and secrets</li>
                    <li>Content-addressed and permanent storage</li>
                    <li>Versioned data, models, and infrastructure</li>
                    <li>Observability, rollback, and failure handling</li>
                  </ul>
                </article>
              </div>
            </div>
          </section>

          <section className="consulting-education" aria-labelledby="consulting-education-title">
            <div className="consulting-shell consulting-education-grid">
              <div className="consulting-education-copy">
                <p className="consulting-eyebrow consulting-eyebrow-light">BECOME AI-NATIVE ON PURPOSE</p>
                <h2 id="consulting-education-title">A team with more AI subscriptions is not an AI-native team.</h2>
                <p>
                  The transition happens when people know which work to delegate,
                  how to review it, where human judgment must remain, and how to
                  improve the workflow together.
                </p>
                <div className="consulting-education-actions">
                  <a href={CONTACT_URL} className="consulting-button consulting-button-cream">
                    Plan a team transition <Arrow />
                  </a>
                  <a href="https://education.alternatefutures.ai" className="consulting-education-link">
                    Explore public classes <Arrow />
                  </a>
                </div>
              </div>

              <ol className="consulting-education-steps">
                <li>
                  <span>01</span>
                  <div>
                    <strong>Align leadership</strong>
                    <p>Choose where AI should create leverage, where it creates risk, and how success will be measured.</p>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    <strong>Redesign work by role</strong>
                    <p>Build durable skills and review practices that transfer across models and tools.</p>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    <strong>Learn by deploying</strong>
                    <p>Every program ends in working output—not a slide deck nobody uses after Friday.</p>
                  </div>
                </li>
                <li>
                  <span>04</span>
                  <div>
                    <strong>Make it repeatable</strong>
                    <p>Leave with governance, evaluation habits, reusable workflows, and internal owners.</p>
                  </div>
                </li>
              </ol>
            </div>
          </section>

          <section className="consulting-ownership" aria-labelledby="consulting-ownership-title">
            <div className="consulting-shell consulting-ownership-grid">
              <div>
                <p className="consulting-eyebrow">THE DELIVERY SURFACE</p>
                <h2 id="consulting-ownership-title">Your system should not need us in the room forever.</h2>
              </div>
              <div className="consulting-ownership-copy">
                <p>
                  Work lands as a running, documented, versioned interface—not a
                  report about one. We can deploy into accounts your company
                  controls and transfer the knowledge required to operate what we build.
                </p>
                <ul>
                  <li>Documented APIs and schema-stable contracts</li>
                  <li>Infrastructure definitions, runbooks, and rollback paths</li>
                  <li>Named access, audit trails, and clear responsibility boundaries</li>
                  <li>Architecture and methods your team can extend</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="consulting-engagements" id="ways-to-work" aria-labelledby="consulting-engagements-title">
            <div className="consulting-shell">
              <div className="consulting-section-heading">
                <p className="consulting-eyebrow">WAYS TO WORK TOGETHER</p>
                <div>
                  <h2 id="consulting-engagements-title">Start with the shape of the problem.</h2>
                  <p>We choose the engagement model after we understand the uncertainty, risk, and ownership boundary.</p>
                </div>
              </div>

              <div className="consulting-engagement-grid">
                <article>
                  <span>01</span>
                  <h3>Technical discovery</h3>
                  <p>Repository and system review, architecture options, risk map, evaluation plan, and a defensible path forward.</p>
                </article>
                <article>
                  <span>02</span>
                  <h3>Focused build</h3>
                  <p>A fixed-fee body of work when discovery has made the deliverable and acceptance criteria clear.</p>
                </article>
                <article>
                  <span>03</span>
                  <h3>Embedded engineering</h3>
                  <p>Committed engineering effort that can move across infrastructure, data, models, and evaluation as findings emerge.</p>
                </article>
                <article>
                  <span>04</span>
                  <h3>AI-native team program</h3>
                  <p>A tailored education and adoption track built around your roles, policies, workflows, and a real deployment.</p>
                </article>
              </div>
            </div>
          </section>

          <section className="consulting-faq" aria-labelledby="consulting-faq-title">
            <div className="consulting-shell consulting-faq-grid">
              <div>
                <p className="consulting-eyebrow">STRAIGHT ANSWERS</p>
                <h2 id="consulting-faq-title">Before we talk.</h2>
              </div>
              <div className="consulting-faq-list">
                {faqs.map(({ question, answer }) => (
                  <details key={question}>
                    <summary>{question}<span aria-hidden="true">+</span></summary>
                    <p>{answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="consulting-final">
            <div className="consulting-shell consulting-final-grid">
              <p className="consulting-eyebrow consulting-eyebrow-light">WELCOME TO THE HARD PART</p>
              <div>
                <h2>Tell us what has to work—and what cannot go wrong.</h2>
                <a href={CONTACT_URL} className="consulting-button consulting-button-cream">
                  Start the conversation <Arrow />
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>

      <Footer variant="cream" />
    </div>
  )
}
