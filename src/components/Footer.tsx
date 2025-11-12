'use client'

import React, { useEffect, useRef, useState } from 'react'
import LinkedInIcon from './icons/LinkedInIcon'
import TwitterIcon from './icons/TwitterIcon'
import './Footer.css'

type FooterVariant = 'cream' | 'blue' | 'peach' | 'orange'

interface FooterProps {
  variant?: FooterVariant
}

const Footer: React.FC<FooterProps> = ({ variant = 'cream' }) => {
  const footerRef = useRef<HTMLElement>(null)
  const scrollContainerRef = useRef<Element | null>(null)
  const [isAtBottom, setIsAtBottom] = useState(false)

  useEffect(() => {
    // Cache the scrollable container reference (querySelector only runs once)
    scrollContainerRef.current = footerRef.current?.parentElement?.querySelector(
      '.home-scrollable, .products-scrollable, .consulting-scrollable, .cloud-scrollable'
    ) || null

    const handleScroll = () => {
      const scrollContainer = scrollContainerRef.current
      if (!scrollContainer) return

      const scrollTop = scrollContainer.scrollTop
      const scrollHeight = scrollContainer.scrollHeight
      const clientHeight = scrollContainer.clientHeight

      // Only apply solid background if there's scrollable content AND we're at the bottom
      const hasScrollableContent = scrollHeight > clientHeight
      const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10

      // If no scrollable content, always show solid
      const atBottom = !hasScrollableContent || (hasScrollableContent && isScrolledToBottom)
      setIsAtBottom(atBottom)
    }

    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener('scroll', handleScroll)
      window.addEventListener('resize', handleScroll)
      handleScroll() // Check initial state

      return () => {
        scrollContainerRef.current?.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleScroll)
      }
    } else {
      // If no scrollable container found, default to solid
      setIsAtBottom(true)
    }
  }, [])

  const iconColor = variant === 'peach' ? '#BE4200' : variant === 'blue' ? '#F8F5EE' : '#0026FF'
  const bgColor = variant === 'peach' ? '#FFC7AA' : variant === 'blue' ? '#0026FF' : '#F8F5EE'

  return (
    <footer ref={footerRef} className={`footer footer-${variant} ${isAtBottom ? 'footer-solid' : ''}`}>
      <div className="footer-content">
        <div className="footer-left">
          <p className="copyright">
            © 2025 Alternate Futures
            {' · '}
            <a href="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>Privacy</a>
          </p>
        </div>
        <div className="footer-right">
          <div className="social-links">
            <a href="https://www.linkedin.com/company/alternate-futures-ai" className="social-link" aria-label="LinkedIn">
              <LinkedInIcon color={iconColor} bgColor={bgColor} />
            </a>
            <a href="https://x.com/AltFuturesAI" className="social-link" aria-label="Twitter/X">
              <TwitterIcon color={iconColor} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer