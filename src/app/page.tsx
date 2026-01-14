import './landing.css'

export default function LandingPage() {
  return (
    <div className="frontpage">
      {/* Navigation Bar */}
      <nav className="nav-bar">
        <img src="/landing/logo.svg" alt="Alternate Futures Logo" className="logo" />
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <img src="/landing/title-union.svg" alt="Alternate Futures" className="title-graphic" />
        <p className="tagline">Building the infrastructure for human-computer alignment.</p>
        <img
          src="/landing/decorative-top.svg"
          alt=""
          className="decorative-element decorative-top"
        />
      </section>

      {/* Wave Divider 1 */}
      <div className="wave-divider wave-1"></div>

      {/* CTA Section */}
      <section className="cta-section">
        {/* Left decorative sparkles */}
        <img src="/landing/star.svg" alt="" className="cta-sparkle-large" />
        <img src="/landing/star.svg" alt="" className="cta-sparkle-small" />

        <div className="cta-content">
          <p className="cta-text">
            Deploy anything on distributed infrastructure in minutes with{' '}
            <span className="highlight">Alternate Clouds</span>.
          </p>
          <button className="cta-button">
            Request access
            <img src="/landing/star.svg" alt="" className="button-star" />
          </button>
        </div>
      </section>

      {/* Wave Divider 2 */}
      <div className="wave-divider wave-2"></div>

      {/* Info Section */}
      <section className="info-section">
        <img src="/landing/hero-image.png" alt="Platform visualization" className="hero-image" />
      </section>

      {/* Decorative Bottom Element */}
      <img
        src="/landing/decorative-bottom.svg"
        alt=""
        className="decorative-element decorative-bottom"
      />
    </div>
  )
}
