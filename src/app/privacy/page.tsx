import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './privacy.css'

export const metadata = {
  title: 'Privacy Policy - Alternate Futures',
  description:
    'How Alternate Futures collects, uses, and protects personal data on alternatefutures.ai, including your rights under the GDPR and UK GDPR.',
}

export default function PrivacyPage() {
  return (
    <div className="privacy-container">
      <Header />
      <div className="privacy-scrollable">
        <main className="privacy-content">
          <h1>Privacy Policy</h1>
          <p className="privacy-date">Last Updated: September 4, 2026</p>

          <section className="privacy-section">
            <h2>Summary</h2>
            <p>
              We keep data collection to the minimum this website needs to work. We do not run advertising
              trackers, we do not profile you, and we do not sell or rent personal data. We do collect a small
              amount of personal data — server logs, the details you enter into our forms, and login sessions
              for our own team — and this policy explains exactly what, why, on what legal basis, and how to
              get it removed.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Who We Are</h2>
            <p>
              Alternate Futures, Inc. (&ldquo;Alternate Futures&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is
              the data controller for personal data processed through this website. You can reach us at:
            </p>
            <ul>
              <li><strong>Post</strong> — Alternate Futures, Inc., 1205 West Bay Drive NW, Olympia, WA 98502, United States</li>
              <li><strong>Email</strong> — <a href="mailto:privacy@alternatefutures.ai">privacy@alternatefutures.ai</a></li>
            </ul>
            <p>
              This policy covers the website at alternatefutures.ai. Our Alternate Clouds product
              (app.alternatefutures.ai and the <code>acc</code> CLI) is governed by the terms and data
              processing agreement that apply to that service.
            </p>
          </section>

          <section className="privacy-section">
            <h2>What We Collect, Why, and On What Legal Basis</h2>
            <p>
              We only process personal data where the GDPR gives us a lawful basis to do so. In practice:
            </p>
            <ul>
              <li>
                <strong>Server and access logs</strong> — our hosting provider records your IP address, the
                pages you request, timestamps, referrer, and user agent. Purpose: keeping the site running,
                diagnosing faults, and defending against abuse and attacks. Legal basis: our legitimate
                interests in the security and availability of our own service (Art. 6(1)(f)).
              </li>
              <li>
                <strong>Beta access and &ldquo;get in touch&rdquo; forms</strong> — first name, last name,
                email address, the type of work you do, and optionally your GitHub profile, a project link,
                and a social profile link. Purpose: replying to you, assessing and administering beta access.
                Legal basis: performance of a contract or steps taken at your request prior to a contract
                (Art. 6(1)(b)). Where we go on to send you product or marketing updates, the legal basis is
                your consent (Art. 6(1)(a)), which you can withdraw at any time.
              </li>
              <li>
                <strong>Email correspondence</strong> — your email address and whatever you write to us.
                Purpose: answering you and keeping a record of the exchange. Legal basis: legitimate interests
                in handling enquiries, or contract where the exchange concerns a service you use (Art. 6(1)(b)
                and (f)).
              </li>
              <li>
                <strong>Login sessions for restricted areas</strong> — email address, a one-time login code,
                and session tokens. These areas are for Alternate Futures staff and invited testers, not
                general visitors. Purpose: authenticating access. Legal basis: contract, and legitimate
                interests in securing internal tooling (Art. 6(1)(b) and (f)).
              </li>
            </ul>
            <p>
              We do not ask for and do not want special category data (health, biometrics, political opinions,
              and the other categories listed in Art. 9). Please do not send it to us through this website.
            </p>
          </section>

          <section className="privacy-section">
            <h2>What We Don&rsquo;t Do</h2>
            <ul>
              <li><strong>No advertising or analytics trackers</strong> — this site currently loads no Google Analytics, no Meta Pixel, and no comparable third-party analytics or advertising script. If we ever add analytics, we will ask visitors in the EEA and UK for consent first and update this policy before it goes live.</li>
              <li><strong>No selling or renting of personal data</strong> — we do not, and we do not share it with data brokers.</li>
              <li><strong>No profiling or automated decision-making</strong> — nothing on this site makes automated decisions about you that produce legal effects or similarly significant effects (Art. 22).</li>
              <li><strong>No email open or click tracking</strong> in our replies to you.</li>
              <li><strong>No fingerprinting</strong> — we do not attempt to identify you across sites or sessions.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>Cookies and Local Storage</h2>
            <p>
              We use no advertising, analytics, or profiling cookies, so there is nothing here that requires a
              consent banner. The only cookies this site sets are strictly necessary ones, and only once you
              log in to a restricted area:
            </p>
            <ul>
              <li><strong>af_access_token</strong> — your signed-in session. Expires after 15 minutes.</li>
              <li><strong>af_refresh_token</strong> — lets your session be renewed without logging in again. Expires after 7 days.</li>
            </ul>
            <p>
              Both are set with the <code>HttpOnly</code>, <code>Secure</code>, and <code>SameSite=Lax</code>
              flags, and both are cleared when you log out. Our internal admin tools also store a small amount
              of interface state (such as which items you have dismissed) in your browser&rsquo;s local
              storage; that never leaves your device. Public pages set no cookies at all.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Who We Share Data With</h2>
            <p>
              We use a small number of service providers who process personal data on our instructions, under
              contract, and only for the purposes below. They are:
            </p>
            <ul>
              <li><strong>Vercel Inc.</strong> (United States) — website hosting and delivery. Processes server access logs, including IP addresses.</li>
              <li><strong>Resend (Plus Five Five, Inc.)</strong> (United States) — transactional email and our contact list. Processes the details you submit through our forms and the emails we send you.</li>
              <li><strong>Our own authentication service</strong> — processes the email address and one-time code used to sign in to restricted areas, running on infrastructure we operate.</li>
            </ul>
            <p>
              We may also disclose personal data where we are legally required to, or where it is necessary to
              establish, exercise, or defend legal claims. If Alternate Futures is ever involved in a merger or
              acquisition, personal data may transfer as part of that transaction, and we will tell you before
              your data becomes subject to a different privacy policy.
            </p>
            <p>
              Links on this site to external services — GitHub, LinkedIn, X, Bluesky, Discord and others — take
              you to those companies&rsquo; own platforms, where their privacy policies apply. We do not embed
              their tracking scripts on our pages.
            </p>
          </section>

          <section className="privacy-section">
            <h2>International Transfers</h2>
            <p>
              We are based in the United States and our service providers named above process data in the
              United States. If you are in the European Economic Area, the United Kingdom, or Switzerland, that
              means your personal data is transferred outside your home jurisdiction. We rely on the European
              Commission&rsquo;s Standard Contractual Clauses (and the UK International Data Transfer Addendum
              where applicable), together with our providers&rsquo; certification under the EU&ndash;U.S. Data
              Privacy Framework where they hold one. You can ask us for a copy of the safeguards that apply to
              a specific transfer by emailing{' '}
              <a href="mailto:privacy@alternatefutures.ai">privacy@alternatefutures.ai</a>.
            </p>
          </section>

          <section className="privacy-section">
            <h2>How Long We Keep It</h2>
            <ul>
              <li><strong>Server and access logs</strong> — retained by our hosting provider for a short operational window, typically no more than 30 days, and then deleted.</li>
              <li><strong>Form submissions and contact records</strong> — kept while we are in contact with you and for up to 24 months after our last interaction, then deleted. If you withdraw consent or ask for erasure, we remove them sooner.</li>
              <li><strong>Email correspondence</strong> — kept for up to 24 months after the exchange ends, unless we need it longer for a legal or accounting obligation.</li>
              <li><strong>Login sessions</strong> — session cookies expire as described above; account records last as long as the account does.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>Your Rights</h2>
            <p>
              If the GDPR or UK GDPR applies to you, you have the right to:
            </p>
            <ul>
              <li><strong>Access</strong> a copy of the personal data we hold about you (Art. 15)</li>
              <li><strong>Rectify</strong> data that is inaccurate or incomplete (Art. 16)</li>
              <li><strong>Erase</strong> your data where one of the grounds in Art. 17 applies</li>
              <li><strong>Restrict</strong> our processing in the circumstances set out in Art. 18</li>
              <li><strong>Receive your data</strong> in a portable, machine-readable form (Art. 20)</li>
              <li><strong>Object</strong> to processing we carry out on the basis of legitimate interests, and to direct marketing at any time (Art. 21)</li>
              <li><strong>Withdraw consent</strong> at any time where we rely on it, without affecting processing that already took place (Art. 7(3))</li>
            </ul>
            <p>
              To exercise any of these, email{' '}
              <a href="mailto:privacy@alternatefutures.ai">privacy@alternatefutures.ai</a>. We will respond
              within one month, and will tell you if we need longer because the request is complex. We do not
              charge for this, and we will not treat you differently for asking.
            </p>
            <p>
              You also have the right to lodge a complaint with a data protection supervisory authority — in
              the EEA, the authority in the country where you live or work; in the UK, the Information
              Commissioner&rsquo;s Office. We would appreciate the chance to address your concern first, but
              you are not obliged to come to us before going to them.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Children</h2>
            <p>
              This website is intended for professional and business use and is not directed at children. We do
              not knowingly collect personal data from anyone under 16. If you believe a child has given us
              personal data, contact us and we will delete it.
            </p>
          </section>

          <section className="privacy-section">
            <h2>How We Protect Your Data</h2>
            <ul>
              <li><strong>Encryption in transit</strong> — the whole site is served over HTTPS with HSTS</li>
              <li><strong>Security headers</strong> — a strict Content Security Policy and related protective headers</li>
              <li><strong>No referrer leakage</strong> — our referrer policy stops your browsing being leaked to other sites</li>
              <li><strong>DNS prefetch disabled</strong> — we do not prefetch external domains that could reveal your intent</li>
              <li><strong>Hardened sessions</strong> — short-lived, <code>HttpOnly</code>, <code>Secure</code> session cookies</li>
              <li><strong>Least access</strong> — internal tools are restricted to the people who need them</li>
            </ul>
            <p>
              No system is perfectly secure, but if a breach ever affects your personal data we will notify the
              relevant supervisory authority within 72 hours where the GDPR requires it, and notify you
              directly where the risk to you is high.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Verification</h2>
            <p>
              Don&rsquo;t just trust us — verify. This website is open source, so you can check our claims
              yourself:
            </p>
            <ul>
              <li>Read the source on <a href="https://github.com/alternatefutures/web-alternatefutures.ai" target="_blank" rel="noopener noreferrer">GitHub</a>, including exactly which cookies we set and which providers we call</li>
              <li>Open your browser&rsquo;s developer tools and confirm that public pages load no analytics or advertising scripts</li>
              <li>Use a tracker-blocking extension and see that it has nothing to block</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>Changes to This Policy</h2>
            <p>
              We will update this page when our practices change, and revise the &ldquo;Last Updated&rdquo;
              date at the top. Material changes — a new category of data, a new purpose, a new processor, or
              the introduction of analytics — will also be recorded in our
              <a href="https://github.com/alternatefutures/web-alternatefutures.ai/blob/main/CHANGELOG.md"> CHANGELOG</a>,
              and where the law requires it we will ask for your consent before the change takes effect.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Questions?</h2>
            <p>
              Email <a href="mailto:privacy@alternatefutures.ai">privacy@alternatefutures.ai</a> with anything
              about this policy or how we handle your data.
            </p>
          </section>

          <section className="privacy-tldr">
            <h2>TL;DR</h2>
            <p>
              No ad trackers, no analytics scripts, no profiling, no data sales. We keep server logs, whatever
              you type into our forms, and login sessions for our own team — nothing more — and you can have
              any of it deleted by emailing privacy@alternatefutures.ai.
            </p>
          </section>
        </main>
      </div>
      <Footer variant="cream" />
    </div>
  )
}
