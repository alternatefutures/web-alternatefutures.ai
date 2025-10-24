import React from 'react'
import './Footer.css'

type FooterVariant = 'cream' | 'blue' | 'peach'

interface FooterProps {
  variant?: FooterVariant
}

const Footer: React.FC<FooterProps> = ({ variant = 'cream' }) => {
  const getIconSet = () => {
    if (variant === 'peach') {
      return {
        linkedin: '/assets/linkedin-dark.svg',
        twitter: '/assets/twitter-dark.svg'
      }
    }
    return {
      linkedin: '/assets/linkedin.svg',
      twitter: '/assets/twitter.svg'
    }
  }

  const icons = getIconSet()

  return (
    <footer className={`footer footer-${variant}`}>
      <div className="footer-content">
        <div className="footer-left">
          <p className="copyright">© 2025 Alternate Futures</p>
        </div>
        <div className="footer-right">
          <div className="social-links">
            <a href="https://www.linkedin.com/company/alternate-futures-ai" className="social-link">
              <img src={icons.linkedin} alt="LinkedIn Social Link" />
            </a>
            <a href="https://x.com/AltFuturesAI" className="social-link">
              <img src={icons.twitter} alt="Twitter Social Link" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer