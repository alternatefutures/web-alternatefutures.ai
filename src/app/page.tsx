import './landing.css'

export default function LandingPage() {
  return (
    <div className="frontpage">
      {/* Navigation Bar */}
      <nav className="nav-bar">
        <img src="/landing/logo.png" alt="Alternate Futures Logo" className="logo" />
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <img src="/landing/title-union.png" alt="Alternate Futures" className="title-graphic" />
        <p className="tagline">Building the infrastructure for human-computer alignment.</p>
        <img
          src="/landing/decorative-top.png"
          alt=""
          className="decorative-element decorative-top"
        />
      </section>

      {/* Wave Divider 1 */}
      <div className="wave-divider wave-1">
        <img src="/landing/wave-1.png" alt="" />
      </div>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <p className="cta-text">
            Deploy anything on distributed infrastructure in minutes with{' '}
            <span className="highlight">Alternate Clouds</span>.
          </p>
          <button className="cta-button">
            Request access
            <img src="/landing/star.png" alt="" className="button-star" />
          </button>
        </div>
      </section>

      {/* Wave Divider 2 */}
      <div className="wave-divider wave-2">
        <img src="/landing/wave-2.png" alt="" />
      </div>

      {/* Info Section */}
      <section className="info-section">
        <img src="/landing/hero-image.png" alt="Platform visualization" className="hero-image" />
      </section>

      {/* Decorative Bottom Element */}
      <img
        src="/landing/decorative-bottom.png"
        alt=""
        className="decorative-element decorative-bottom"
      />
    </div>
  )
}
