import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import LocationsSection from '@/components/LocationsSection'
import NewOffersSection from '@/components/NewOffersSection'
import CustomerReviewsSection from '@/components/CustomerReviewsSection'
import MenuSection from '@/components/MenuSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="pt-20">
        <HeroSection />
        <LocationsSection />
        <NewOffersSection />
        <CustomerReviewsSection />
        <MenuSection />
        <Footer />
      </div>
    </main>
  )
}