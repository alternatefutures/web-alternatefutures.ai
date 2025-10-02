import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <p className="copyright">© 2025 Alternate Futures</p>
        </div>
        <div className="footer-right">
          <div className="social-links">
            <a href="https://www.linkedin.com/company/alternate-futures-ai" className="social-link">
              <img src="/assets/linkedin.svg" alt="LinkedIn Social Link" />
            </a>
            <a href="https://x.com/AltFuturesAI" className="social-link">
              <img src="/assets/twitter.svg" alt="Twitter Social Link" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer