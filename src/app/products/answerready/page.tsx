import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './answerready.css'

const ANSWERREADY_URL = 'https://answerready.alternatefutures.ai'

export const metadata: Metadata = {
  title: 'AnswerReady AI SEO Audits and AEO Fix Packs',
  description:
    'AnswerReady turns high-value website pages into clear, source-backed answers with a free SaaS homepage checker and a publish-ready five-page AI SEO and AEO Fix Pack.',
  alternates: { canonical: '/products/answerready' },
  openGraph: {
    url: '/products/answerready',
    title: 'AnswerReady | Publish the fixes closest to revenue',
    description:
      'Free website checks and publish-ready page improvements for clarity, evidence, crawlability, and buyer action.',
  },
}

const faqs = [
  {
    question: 'Does AnswerReady guarantee AI citations?',
    answer:
      'No. No ethical provider can control what a third-party answer engine cites. AnswerReady improves the conditions you can control: access, clarity, entity consistency, evidence, and quotability.',
  },
  {
    question: 'What does the free homepage checker measure?',
    answer:
      'It checks the public HTML returned by a homepage for titles, descriptions, headings, crawlable copy, structured entities, answer-led sections, proof language, buyer actions, and public robots.txt rules.',
  },
  {
    question: 'What is included in the Fix Pack?',
    answer:
      'The $69 one-time Fix Pack covers five high-value pages and includes rewritten answer blocks, page-specific structured data, a source and proof-gap checklist, and a prioritized 30-day implementation map.',
  },
  {
    question: 'Can Alternate Futures implement the changes?',
    answer:
      'Yes. Implementation and launch on Alternate Clouds can be scoped separately after the Fix Pack. Hosting is never added automatically to the $69 purchase.',
  },
]

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'AnswerReady',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: ANSWERREADY_URL,
      description:
        'Website analysis and implementation tools for AI search optimization, answer engine optimization, crawlability, structured data, evidence, and buyer clarity.',
      offers: {
        '@type': 'Offer',
        name: 'AnswerReady Fix Pack',
        price: '69',
        priceCurrency: 'USD',
      },
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

export default function AnswerReadyPage() {
  return (
    <div className="ar-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />

      <Header activePage="products" />

      <main>
        <section className="ar-hero" aria-labelledby="ar-title">
          <div className="ar-shell ar-hero-grid">
            <div className="ar-hero-copy">
              <p className="ar-eyebrow">AN ALTERNATE FUTURES PRODUCT</p>
              <h1 id="ar-title">
                Make your best pages <em>answer ready.</em>
              </h1>
              <p className="ar-lede">
                AnswerReady turns the pages closest to revenue into clear,
                source-backed answers for buyers, search crawlers, and the
                systems that choose what to retrieve.
              </p>
              <div className="ar-actions">
                <a className="ar-button ar-button-primary" href={`${ANSWERREADY_URL}/#checker`}>
                  Check your homepage free <Arrow />
                </a>
                <a className="ar-button ar-button-outline" href={`${ANSWERREADY_URL}/ai-seo-audit-service`}>
                  Get the $69 Fix Pack
                </a>
              </div>
              <p className="ar-microcopy">
                No signup for the checker. No ranking promise. No opaque AI score.
              </p>
            </div>

            <div className="ar-hero-visual" aria-label="AnswerReady turns questions into publishable website improvements">
              <div className="ar-visual-label">FROM QUESTION TO PUBLISHED ANSWER</div>
              <div className="ar-question-card">
                <span>BUYER QUESTION</span>
                <strong>What does it cost, and what do I receive?</strong>
              </div>
              <div className="ar-visual-path" aria-hidden="true">↓</div>
              <div className="ar-answer-card">
                <span>PUBLISH-READY ANSWER</span>
                <p>
                  Price, scope, evidence, and next step—written clearly enough
                  to help a person and structured cleanly enough to retrieve.
                </p>
              </div>
              <div className="ar-visual-star" aria-hidden="true">✦</div>
            </div>
          </div>
        </section>

        <section className="ar-signal" aria-label="AnswerReady product promise">
          <div className="ar-shell ar-signal-grid">
            <p>Visibility dashboards tell you <s>that you have a problem.</s></p>
            <p>AnswerReady gives you <mark>the exact edits to ship.</mark></p>
          </div>
        </section>

        <section className="ar-tools" aria-labelledby="ar-tools-title">
          <div className="ar-shell">
            <div className="ar-section-heading">
              <p className="ar-eyebrow">START WITH A USEFUL ANSWER</p>
              <h2 id="ar-tools-title">Free tools that fix something now.</h2>
              <p>
                Each tool makes its checks visible. Use the result yourself,
                or bring the harder pages to the Fix Pack.
              </p>
            </div>
            <div className="ar-tool-grid">
              <a href={`${ANSWERREADY_URL}/saas-ai-search-checker`} className="ar-tool-card">
                <span>01</span>
                <h3>SaaS homepage checker</h3>
                <p>Run nine transparent clarity, evidence, entity, and buyer-action checks.</p>
                <strong>Check a homepage <Arrow /></strong>
              </a>
              <a href={`${ANSWERREADY_URL}/ai-crawler-checker`} className="ar-tool-card">
                <span>02</span>
                <h3>AI crawler checker</h3>
                <p>Inspect public robots.txt rules for documented search crawlers.</p>
                <strong>Inspect crawl access <Arrow /></strong>
              </a>
              <a href={`${ANSWERREADY_URL}/software-application-schema-generator`} className="ar-tool-card">
                <span>03</span>
                <h3>Software schema generator</h3>
                <p>Create browser-only JSON-LD without inventing ratings or eligibility claims.</p>
                <strong>Generate schema <Arrow /></strong>
              </a>
              <a href={`${ANSWERREADY_URL}/ai-seo-audit-template`} className="ar-tool-card">
                <span>04</span>
                <h3>AI SEO audit template</h3>
                <p>Work through 20 evidence-based checks without submitting a URL or result.</p>
                <strong>Use the template <Arrow /></strong>
              </a>
            </div>
          </div>
        </section>

        <section className="ar-pack" aria-labelledby="ar-pack-title">
          <div className="ar-shell ar-pack-grid">
            <div className="ar-pack-copy">
              <p className="ar-eyebrow ar-eyebrow-light">THE DELIVERABLE</p>
              <h2 id="ar-pack-title">Five pages. Ready to publish.</h2>
              <p>
                Built for founders and marketers who want implementation—not
                another dashboard or open-ended retainer.
              </p>
            </div>
            <article className="ar-price-card">
              <div className="ar-price-top">
                <span>AnswerReady Fix Pack</span>
                <p><strong>$69</strong> one time</p>
              </div>
              <ul>
                <li>AI-crawl and entity clarity review</li>
                <li>Rewritten answer blocks for five pages</li>
                <li>Page-specific structured data</li>
                <li>Source and proof-gap checklist</li>
                <li>Prioritized 30-day implementation map</li>
              </ul>
              <a className="ar-button ar-button-terra" href={`${ANSWERREADY_URL}/ai-seo-audit-service`}>
                Request your pack <Arrow />
              </a>
              <small>Delivered within one business day after scope confirmation.</small>
            </article>
          </div>
        </section>

        <section className="ar-example" aria-labelledby="ar-example-title">
          <div className="ar-shell">
            <div className="ar-section-heading">
              <p className="ar-eyebrow">WHAT CHANGES</p>
              <h2 id="ar-example-title">Put the answer before the persuasion.</h2>
            </div>
            <div className="ar-example-grid">
              <article className="ar-before-card">
                <span>BEFORE</span>
                <p>“Plans designed to scale with your ambitions.”</p>
                <small>Sounds polished. Resolves nothing.</small>
              </article>
              <article className="ar-publish-card">
                <span>PUBLISH</span>
                <p>
                  “AnswerReady costs $69 for a one-time, five-page
                  implementation pack. It includes rewritten answer blocks,
                  page-specific schema, source gaps, and a 30-day action map.”
                </p>
                <small>Price, scope, format, and buyer value in two extractable sentences.</small>
              </article>
            </div>
          </div>
        </section>

        <section className="ar-network" aria-labelledby="ar-network-title">
          <div className="ar-shell ar-network-grid">
            <div>
              <p className="ar-eyebrow">FROM ANSWER TO DEPLOYMENT</p>
              <h2 id="ar-network-title">Fix the page. Then ship it.</h2>
            </div>
            <div>
              <p>
                AnswerReady identifies and writes the changes. Alternate Futures
                can implement them, and Alternate Clouds can host the finished work.
              </p>
              <div className="ar-network-links">
                <a href="/consulting">Implementation help <Arrow /></a>
                <a href="https://clouds.alternatefutures.ai">Deploy on Alternate Clouds <Arrow /></a>
              </div>
            </div>
          </div>
        </section>

        <section className="ar-faq" aria-labelledby="ar-faq-title">
          <div className="ar-shell ar-faq-grid">
            <div>
              <p className="ar-eyebrow">STRAIGHT ANSWERS</p>
              <h2 id="ar-faq-title">No magic. Better evidence.</h2>
            </div>
            <div className="ar-faq-list">
              {faqs.map(({ question, answer }) => (
                <details key={question}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="ar-final" aria-labelledby="ar-final-title">
          <div className="ar-shell ar-final-inner">
            <p className="ar-eyebrow">WELCOME TO THE FUTURE</p>
            <h2 id="ar-final-title">Make the page useful enough to quote.</h2>
            <div className="ar-actions">
              <a className="ar-button ar-button-primary" href={`${ANSWERREADY_URL}/#checker`}>
                Check your homepage free <Arrow />
              </a>
              <a className="ar-button ar-button-outline" href={`${ANSWERREADY_URL}/ai-seo-audit-service`}>
                Request the Fix Pack
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="cream" />
    </div>
  )
}
