import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AnalyticsPrivacyControls from '@/components/AnalyticsPrivacyControls'
import './privacy.css'

export const metadata = {
  title: 'Privacy Policy - Alternate Futures',
  description: 'How Alternate Futures handles website analytics, access requests, and visitor privacy.',
}

export default function PrivacyPage() {
  return (
    <div className="privacy-container">
      <Header />
      <div className="privacy-scrollable">
        <main className="privacy-content">
          <h1>Privacy Policy</h1>
          <p className="privacy-date">Last Updated: September 23, 2026</p>

          <section className="privacy-section">
            <h2>Our Commitment</h2>
            <p>
              At Alternate Futures, privacy is a fundamental right. We collect only what helps us
              operate the site, understand which public resources are useful, and respond when you
              intentionally contact us. Optional analytics are off until you accept them.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Optional Website Analytics</h2>
            <p>
              If you select “Accept analytics,” we use Google Analytics 4 to understand how people
              find and use our public website. This may include:
            </p>
            <ul>
              <li>Pages viewed and interactions such as scrolling or outbound-link clicks</li>
              <li>The referral source or campaign that brought you to the site</li>
              <li>Approximate geography, device category, browser, and operating system</li>
              <li>Technical information needed to measure sessions and diagnose site performance</li>
            </ul>
            <p>
              Google Analytics may set cookies after you consent. We disable Google Signals and
              advertising personalization, and we do not use this website analytics data to target ads.
              Declining analytics does not change the way the website works.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Your Analytics Choice</h2>
            <p>
              Your choice is saved in browser storage and an essential preference cookie so we can
              remember it. You can change that choice below at any time. Declining disables further
              Google Analytics measurement from this browser.
            </p>
            <AnalyticsPrivacyControls />
          </section>

          <section className="privacy-section">
            <h2>Information You Choose to Send</h2>
            <p>
              When you submit a contact or access request, we use the information you provide to
              respond, evaluate the request, and maintain the business relationship. Required and
              optional fields are identified on the form. We do not sell this information.
            </p>
          </section>

          <section className="privacy-section">
            <h2>How We Protect Your Privacy</h2>
            <ul>
              <li><strong>Consent First</strong> — Google Analytics does not load unless you accept it</li>
              <li><strong>Limited Scope</strong> — Analytics is disabled on administrative and login routes</li>
              <li><strong>No Advertising Signals</strong> — Google Signals and ad personalization are disabled</li>
              <li><strong>IPFS Deployment</strong> — Decentralized hosting through our own Alternate Cloud provides censorship resistance</li>
              <li><strong>Security Headers</strong> — We implement strict Content Security Policy and other protective headers</li>
              <li><strong>No Referrer Leakage</strong> — We use referrer policy to prevent leaking your browsing to other sites</li>
              <li><strong>Open Source</strong> — All code is public and auditable on GitHub</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>External Links</h2>
            <p>
              This website contains links to external services (LinkedIn, Twitter/X, documentation sites).
              When you click these links, you leave our website and are subject to those platforms' privacy policies.
              We have no control over and assume no responsibility for the privacy practices of external sites.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Email Contact</h2>
            <p>
              If you contact us at <a href="mailto:system@alternatefutures.ai">system@alternatefutures.ai</a>,
              we use your message and contact information to respond and handle your request. We do
              not add you to marketing lists without a separate choice.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Service Providers and Retention</h2>
            <p>
              Google processes optional analytics data on our behalf under its terms and privacy
              documentation. Our hosting and email providers may process the limited technical or
              contact information needed to provide their services. We retain information only as
              long as needed for the purposes described here, legal obligations, and security.
              Learn more in <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Your Rights</h2>
            <p>
              Depending on where you live, you may have rights to access, correct, delete, restrict,
              or receive a copy of personal information associated with you. Contact us at{' '}
              <a href="mailto:system@alternatefutures.ai">system@alternatefutures.ai</a> to make a request.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Changes to This Policy</h2>
            <p>
              If we ever change our privacy practices, we will update this page and note the change in our
              <a href="https://github.com/alternatefutures/web-alternatefutures.ai/blob/main/CHANGELOG.md"> CHANGELOG</a>.
              We will describe our current practices here and update the date above when they change.
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
            <h2>Questions?</h2>
            <p>
              If you have questions about this privacy policy, please contact us at{' '}
              <a href="mailto:system@alternatefutures.ai">system@alternatefutures.ai</a>.
            </p>
          </section>

          <section className="privacy-tldr">
            <h2>TL;DR</h2>
            <p>
              Analytics is optional and off until you accept it. We do not use analytics for advertising,
              and you can change your choice at any time.
            </p>
          </section>
        </main>
      </div>
      <Footer variant="cream" />
    </div>
  )
}
