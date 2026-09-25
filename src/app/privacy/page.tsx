import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AnalyticsPrivacyControls from '@/components/AnalyticsPrivacyControls'
import './privacy.css'

export const metadata = {
  title: 'Privacy & Cookie Notice - Alternate Futures',
  description: 'How Alternate Futures uses optional analytics, cookies, service providers, and visitor information.',
}

export default function PrivacyPage() {
  return (
    <div className="privacy-container">
      <Header />
      <div className="privacy-scrollable">
        <main className="privacy-content">
          <h1>Privacy &amp; Cookie Notice</h1>
          <p className="privacy-date">Last Updated: September 25, 2026</p>

          <section className="privacy-section">
            <h2>Who We Are</h2>
            <p>
              Alternate Futures Inc., a Washington State corporation, is the controller responsible
              for personal information processed through this website. This notice applies to the
              public website at alternatefutures.ai. Contact us at{' '}
              <a href="mailto:system@alternatefutures.ai">system@alternatefutures.ai</a> with a
              privacy question or request.
            </p>
          </section>

          <section className="privacy-section">
            <h2>What We Process and Why</h2>
            <h3>Site delivery and security</h3>
            <p>
              Our hosting, content-delivery, and security providers may process IP address, request
              time, requested page, browser information, and technical logs needed to deliver and
              protect the site. We rely on our legitimate interests in operating a secure, reliable
              website and, where applicable, compliance with legal obligations.
            </p>
            <h3>Messages and access requests</h3>
            <p>
              When you contact us or request access, we process the information you submit to answer
              you, evaluate the request, take steps you ask us to take, and maintain the resulting
              business relationship. The legal basis is taking steps at your request before a
              contract, performing a contract, or our legitimate interest in responding to you,
              depending on the request. We do not add you to marketing lists without a separate choice.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Optional Google Analytics</h2>
            <p>
              If you select “Accept analytics,” we use Google Analytics 4 to understand how people
              find and use our public website. Consent is the legal basis for this processing. We may
              measure pages viewed, scrolling and outbound-link interactions, referral or campaign
              source, approximate geography, device category, browser, operating system, and session
              information. We remove unknown and potentially sensitive URL parameters before sending
              a page path to Google.
            </p>
            <p>
              Analytics is off until you accept. We disable Google Signals, advertising storage,
              advertising user data, and advertising personalization. Analytics is also disabled on
              login and administrative routes. Declining does not change how the public website works.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Cookies and Your Choice</h2>
            <p>
              We use <strong>af-analytics-consent-v2</strong>, an essential first-party preference
              stored in your browser for up to six months, to remember whether you accepted or
              declined analytics. If you accept, Google Analytics may set <strong>_ga</strong> and
              <strong> _ga_*</strong> cookies for measurement; we configure those cookies for no more
              than six months. Declining or withdrawing consent disables future measurement and asks
              the browser to remove those Google Analytics cookies.
            </p>
            <p>
              Your choice, policy version, and choice time are stored in your browser. We do not create
              an identity-level consent profile for an otherwise anonymous visitor. You can change
              your choice below at any time. Withdrawal does not affect processing that occurred while
              your consent was valid.
            </p>
            <AnalyticsPrivacyControls />
          </section>

          <section className="privacy-section">
            <h2>Privacy Safeguards</h2>
            <ul>
              <li><strong>Consent First</strong> — Google Analytics does not load unless you accept it</li>
              <li><strong>Limited Scope</strong> — Analytics is disabled on administrative and login routes</li>
              <li><strong>No Advertising Signals</strong> — Google Signals and ad personalization are disabled</li>
              <li><strong>Shorter Cookies</strong> — Analytics and consent cookies are limited to six months</li>
              <li><strong>Security Headers</strong> — We implement strict Content Security Policy and other protective headers</li>
              <li><strong>Restricted URLs</strong> — Email, token, code, session, and other unknown query parameters are not sent to GA4</li>
              <li><strong>Open Source</strong> — All code is public and auditable on GitHub</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>Service Providers and International Transfers</h2>
            <p>
              Google LLC processes optional analytics data on our behalf. Hosting, content-delivery,
              security, and email providers process the limited information needed to provide their
              services. These providers may process information in the United States or other
              countries. Where GDPR requires a transfer safeguard, we use the provider&apos;s applicable
              adequacy mechanism or contractual protections, such as Standard Contractual Clauses.
              Learn more in <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a>.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Retention</h2>
            <p>
              The analytics consent preference and analytics cookies expire after no more than six
              months unless you renew your choice. We configure GA4 event-level reporting data for a
              two-month retention period. Security and delivery logs are kept only as long as needed
              to operate and protect the service. In GA4, event-level data is retained for two months
              and user-level data for 14 months; Google notes that these controls do not change most
              aggregated standard reports. Messages and business records are retained while we handle
              the request and for any period required by contract, tax, security, or other law.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Your GDPR Rights</h2>
            <p>
              Where GDPR applies, you may ask to access, correct, erase, restrict, or receive personal
              information, or object to processing based on legitimate interests. You may withdraw
              consent at any time and may lodge a complaint with the data-protection authority where
              you live, work, or believe an infringement occurred. Some rights have legal exceptions.
            </p>
            <p>
              Send a request to <a href="mailto:system@alternatefutures.ai">system@alternatefutures.ai</a>.
              We may need to verify your identity before acting. We do not use public-site analytics
              for automated decisions that produce legal or similarly significant effects.
            </p>
          </section>

          <section className="privacy-section">
            <h2>External Links</h2>
            <p>
              Links to external websites take you to services governed by their own privacy notices.
              Opening a link does not grant those services analytics consent on this website.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Verification</h2>
            <p>
              Don't just trust us—verify! This website is open source. You can:
            </p>
            <ul>
              <li>Review the source code on <a href="https://github.com/alternatefutures/web-alternatefutures.ai" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li>Inspect the analytics implementation and consent controls</li>
              <li>Check your browser's developer tools to confirm Google Analytics loads only after consent</li>
              <li>Use browser extensions to verify no fingerprinting or tracking</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>Changes and Questions</h2>
            <p>
              We update the date above and our{' '}
              <a href="https://github.com/alternatefutures/web-alternatefutures.ai/blob/main/CHANGELOG.md">CHANGELOG</a>{' '}
              when this notice changes. A material change to optional analytics will use a new consent
              version and ask you to choose again. Contact{' '}
              <a href="mailto:system@alternatefutures.ai">system@alternatefutures.ai</a> with questions.
            </p>
          </section>

          <section className="privacy-tldr">
            <h2>TL;DR</h2>
            <p>
              Analytics is optional and off until you accept it. We do not use it for advertising,
              we limit its cookies and event retention, and you can withdraw consent at any time.
            </p>
          </section>
        </main>
      </div>
      <Footer variant="cream" />
    </div>
  )
}
