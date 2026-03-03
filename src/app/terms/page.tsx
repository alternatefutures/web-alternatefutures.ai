import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './terms.css'

export const metadata = {
  title: 'Terms of Service - Alternate Futures',
  description:
    'Terms governing use of Alternate Futures services, wallet authentication, billing, and dispute resolution.',
}

export default function TermsPage() {
  return (
    <div className="terms-container">
      <Header />
      <div className="terms-scrollable">
        <main className="terms-content">
          <h1>Alternate Futures: Terms of Service</h1>
          <p className="terms-date">Last Updated: March 2, 2026</p>
          <p className="terms-date">Effective Date: Upon Acceptance</p>

          <section className="terms-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you
              (&quot;User,&quot; &quot;you,&quot; or &quot;your&quot;) and Alternate Futures (&quot;Company,&quot;
              &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By connecting a cryptocurrency wallet to
              our platform, accessing our services, or using the <code>af</code> CLI tool, you agree to be
              bound by these Terms.
            </p>
            <p>
              <strong>Notice Regarding Jurisdiction:</strong> Your contractual relationship is determined by
              your status as a &quot;US Person&quot; or &quot;Non-US Person.&quot;
            </p>
            <ul>
              <li>
                <strong>US Persons:</strong> You are contracting with <strong>Alternate Futures Inc.</strong>{' '}
                (a Washington State corporation).
              </li>
              <li>
                <strong>Non-US Persons:</strong> You are contracting with{' '}
                <strong>Alternate Futures AM LLC</strong> (an Armenian subsidiary).
              </li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>2. The Services (Abstraction Layer Model)</h2>
            <p>
              Alternate Futures provides an abstraction layer and marketplace for decentralized physical
              infrastructure networks (&quot;DePIN&quot;), including but not limited to Akash Network,
              Filecoin, IPFS, and Arweave (the &quot;Services&quot;).
            </p>
            <p>
              <strong>Neutral Intermediary Disclosure:</strong> Company is a software provider and
              compute/storage aggregator. Company:
            </p>
            <ol>
              <li>Does not own or operate the physical hardware on which your data is stored or your compute tasks are executed.</li>
              <li>Does not build, inspect, or modify the software or content you choose to deploy.</li>
              <li>Functions as a neutral marketplace and routing layer between you and independent third-party provider networks.</li>
            </ol>
          </section>

          <section className="terms-section">
            <h2>3. Eligibility and Wallet Authentication</h2>
            <h3>3.1 Permissionless Access</h3>
            <p>
              Access to the Services is primarily provided via decentralized wallet authentication (for
              example, MetaMask or Keplr). You are solely responsible for maintaining the security of your
              private keys and recovery phrases.
            </p>
            <h3>3.2 Sanctions and Compliance</h3>
            <p>You represent and warrant that you are not:</p>
            <ol>
              <li>
                A resident of a country or territory subject to comprehensive US, UN, or EU sanctions
                (including but not limited to North Korea, Iran, Cuba, Syria, Crimea, Donetsk, and Luhansk).
              </li>
              <li>
                Listed on the OFAC Specially Designated Nationals (&quot;SDN&quot;) list or any other
                restricted party list.
              </li>
            </ol>
            <p>
              <strong>Wallet Screening:</strong> You acknowledge that we implement automated wallet
              screening. If your wallet address is associated with sanctioned entities or high-risk illicit
              activity (as determined by our third-party compliance partners), your access will be
              automatically blocked.
            </p>
          </section>

          <section className="terms-section">
            <h2>4. Payments and Billing</h2>
            <h3>4.1 Payment Methods</h3>
            <p>Services are billed in supported cryptocurrencies (for example, BTC, ETH, USDC, AKT).</p>
            <h3>4.2 Integral to Sale</h3>
            <p>
              Payment for Services is considered integral to the sale of compute and storage resources.
              Alternate Futures is a merchant of Services, not a financial intermediary, money transmitter,
              or custodian.
            </p>
            <h3>4.3 No Refunds</h3>
            <p>
              Due to the programmatic and decentralized nature of the underlying networks, all payments are
              final and non-refundable.
            </p>
          </section>

          <section className="terms-section">
            <h2>5. User Conduct and Content</h2>
            <h3>5.1 Prohibited Content</h3>
            <p>You strictly agree not to use the Services to store, compute, or transmit:</p>
            <ol>
              <li>
                <strong>CSAM:</strong> Any material depicting child sexual exploitation or abuse (subject to
                mandatory REPORT Act filing with NCMEC).
              </li>
              <li>
                <strong>Illegal Activity:</strong> Content that facilitates terrorism, human trafficking, or
                illegal drug sales.
              </li>
              <li>
                <strong>Malware:</strong> Viruses, worms, or malicious code designed to disrupt the
                underlying DePIN networks.
              </li>
            </ol>
            <h3>5.2 AI Agents</h3>
            <p>
              If you host autonomous AI agents via the Services, you are solely responsible for the outputs
              and actions of those agents. You agree to indemnify Company for any third-party claims arising
              from agent behavior.
            </p>
          </section>

          <section className="terms-section">
            <h2>6. Intellectual Property</h2>
            <h3>6.1 Your Content</h3>
            <p>
              You retain all rights to the data and software you deploy. By using the Services, you grant
              Company a limited license to transmit and route your content as necessary to provide the
              Services.
            </p>
            <h3>6.2 DMCA Policy</h3>
            <p>
              Alternate Futures respects the intellectual property of others. If you believe your work has
              been infringed, please contact our designated DMCA Agent at{' '}
              <a href="mailto:legal@alternatefutures.ai">legal@alternatefutures.ai</a>.
            </p>
          </section>

          <section className="terms-section">
            <h2>7. Limitation of Liability and Warranty</h2>
            <h3>7.1 &quot;As-Is&quot; Service</h3>
            <p>
              THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot; WE DISCLAIM ALL
              WARRANTIES, EXPRESS OR IMPLIED.
            </p>
            <h3>7.2 DePIN Risks</h3>
            <p>
              YOU ACKNOWLEDGE THAT THE UNDERLYING DECENTRALIZED NETWORKS ARE OUTSIDE OUR CONTROL. WE ARE NOT
              LIABLE FOR:
            </p>
            <ol>
              <li>Network-wide outages or slashing events on Akash, Filecoin, or other networks.</li>
              <li>Permanent data loss on IPFS or Arweave due to lack of persistence or pinning failure.</li>
              <li>Fluctuations in compute/storage pricing determined by decentralized marketplaces.</li>
            </ol>
            <h3>7.3 Liability Cap</h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF THESE
              TERMS SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY YOU FOR THE SERVICES IN THE THREE (3) MONTHS
              PRECEDING THE CLAIM.
            </p>
          </section>

          <section className="terms-section">
            <h2>8. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless Alternate Futures, its officers, and
              employees from and against any claims, damages, or costs (including legal fees) arising from
              your breach of these Terms or your use of the Services.
            </p>
          </section>

          <section className="terms-section">
            <h2>9. Dispute Resolution</h2>
            <h3>9.1 US Persons</h3>
            <p>
              Any dispute between you and Alternate Futures Inc. shall be resolved via binding arbitration in
              <strong> King County, Washington</strong>, under the rules of the American Arbitration
              Association (&quot;AAA&quot;).
            </p>
            <h3>9.2 Non-US Persons</h3>
            <p>
              Any dispute between you and Alternate Futures AM LLC shall be resolved in the courts of
              <strong> Yerevan, Armenia</strong>, and governed by the laws of the Republic of Armenia.
            </p>
          </section>

          <section className="terms-section">
            <h2>10. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the Services at our sole
              discretion, without notice, for violation of these Terms or compliance with legal/regulatory
              requests.
            </p>
          </section>

          <section className="terms-contact">
            <h2>Contact Information</h2>
            <p>Alternate Futures Legal Dept.</p>
            <p>
              Email: <a href="mailto:system@alternatefutures.ai">system@alternatefutures.ai</a>
            </p>
          </section>
        </main>
      </div>
      <Footer variant="cream" />
    </div>
  )
}
