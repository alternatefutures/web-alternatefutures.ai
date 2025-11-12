import Header from '@/components/Header'
import Hero from '@/components/Hero'
import MainContent from '@/components/MainContent'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <div className="container">
      <div className="page-wrapper">
        <Header />
        <div className="home-scrollable">
          <Hero />
          <MainContent />
        </div>
        <Footer variant="cream" />
      </div>
    </div>
  )
}