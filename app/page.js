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

      {/* Floating Hotline Button */}
      <a
        href="tel:15596"
        className="fixed bottom-6 left-6 z-50 block shadow-[0_8px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer rounded-full overflow-hidden"
        aria-label="اتصل بالخط الساخن 15596"
      >
        <img 
          src="/images/hotline.png" 
          alt="15596"
          className="w-auto h-16 object-contain rounded-full"
        />
      </a>
    </main>
  )
}