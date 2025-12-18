import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './privacy.css'

export const metadata = {
  title: 'Privacy Policy - Alternate Futures',
  description: 'Our commitment to privacy: no tracking, no data collection, complete transparency.',
}

export default function PrivacyPage() {
  return (
    <div className="privacy-container">
      <Header />
      <div className="privacy-scrollable">
        <main className="privacy-content">
          <h1>Privacy Policy</h1>
          <p className="privacy-date">Last Updated: January 12, 2025</p>

          <section className="privacy-section">
            <h2>Our Commitment</h2>
            <p>
              At Alternate Futures, privacy is not a feature—it's a fundamental right. This website is built from the ground up with privacy as a core principle.
            </p>
          </section>

          <section className="privacy-section">
            <h2>What We Don't Collect</h2>
            <p>
              We believe the best privacy policy is one where there's nothing to disclose. This website has:
            </p>
            <ul>
              <li><strong>No analytics or tracking</strong> — We don't use Google Analytics, Facebook Pixel, or any similar services</li>
              <li><strong>No cookies</strong> — We don't set any cookies or use local storage</li>
              <li><strong>No user accounts</strong> — No registration, no login, no user data</li>
              <li><strong>No server-side logging of personal data</strong> — We don't log IP addresses or browsing behavior</li>
              <li><strong>No third-party requests</strong> — All resources are self-hosted (except social links when you click them)</li>
              <li><strong>No email tracking</strong> — If you email us, we don't use tracking pixels or read receipts</li>
              <li><strong>No fingerprinting</strong> — We don't attempt to identify or track you</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>What We Do Collect</h2>
            <p>
              <strong>Nothing.</strong> This website collects zero personal information.
            </p>
            <p>
              Our hosting provider may maintain standard web server logs for operational purposes,
              but we do not have access to or control over this data. These are decentralized systems that
              inherently provide additional privacy protections.
            </p>
          </section>

          <section className="privacy-section">
            <h2>How We Protect Your Privacy</h2>
            <ul>
              <li><strong>Static Site Generation</strong> — No server-side processing means no opportunity to collect data</li>
              <li><strong>IPFS Deployment</strong> — Decentralized hosting through our own Alternate Cloud provides censorship resistance</li>
              <li><strong>Security Headers</strong> — We implement strict Content Security Policy and other protective headers</li>
              <li><strong>No Referrer Leakage</strong> — We use referrer policy to prevent leaking your browsing to other sites</li>
              <li><strong>DNS Prefetch Disabled</strong> — We don't prefetch external domains that could leak your intent</li>
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
              If you contact us via email at <a href="mailto:system@alternatefutures.ai">system@alternatefutures.ai</a>,
              we will only use your email address to respond to your inquiry. We do not add you to mailing lists,
              share your information with third parties, or use your email for any purpose other than responding to you.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Your Rights</h2>
            <p>
              Since we collect no data about you, there's nothing to request, delete, or modify.
              You have complete privacy by default.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Changes to This Policy</h2>
            <p>
              If we ever change our privacy practices, we will update this page and note the change in our
              <a href="https://github.com/alternatefutures/web-alternatefutures.ai/blob/main/CHANGELOG.md"> CHANGELOG</a>.
              However, we are deeply committed to privacy, and any changes will only strengthen protections, never weaken them.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Verification</h2>
            <p>
              Don't just trust us—verify! This website is open source. You can:
            </p>
            <ul>
              <li>Review the source code on <a href="https://github.com/alternatefutures/web-alternatefutures.ai" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li>Inspect the built site for tracking scripts (there are none)</li>
              <li>Check your browser's developer tools—no cookies, no tracking requests</li>
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
              We collect nothing. We track nothing. We share nothing. Your visit to this site is completely private.
            </p>
          </section>
        </main>
      </div>
      <Footer variant="cream" />
    </div>
  )
}
