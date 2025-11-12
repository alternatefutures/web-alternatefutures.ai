import React from 'react'
import Image from 'next/image'

const Hero: React.FC = () => {
  return (
    <section className="hero hero-with-wave">
      <div className="hero-content">
        <div className="hero-logo">
          <Image src="/assets/hero-logo.svg" alt="Alternate Futures Logo" width={600} height={138} priority />
        </div>
      </div>
    </section>
  )
}

export default Hero