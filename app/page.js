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
className="fixed bottom-6 left-6 z-50 flex items-center justify-center bg-teal-600 rounded-full px-5 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        aria-label="اتصل بالخط الساخن 15596"
      >
        <div className="flex items-center gap-2 select-none" style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}>
          <div className="flex items-baseline gap-0.5">
          <span className="text-white text-4xl font-black drop-shadow-[2px_2px_0px_#E8922D]" style={{ WebkitTextStroke: '2px #E8922D', paintOrder: 'stroke fill' }}>6</span>
          <span className="text-white text-4xl font-black drop-shadow-[2px_2px_0px_#E8922D]" style={{ WebkitTextStroke: '2px #E8922D', paintOrder: 'stroke fill' }}>9</span>
          <span className="text-white text-5xl font-black drop-shadow-[3px_3px_0px_#E8922D] relative -top-1" style={{ WebkitTextStroke: '3px #E8922D', paintOrder: 'stroke fill' }}>5</span>
          <span className="text-white text-4xl font-black drop-shadow-[2px_2px_0px_#E8922D]" style={{ WebkitTextStroke: '2px #E8922D', paintOrder: 'stroke fill' }}>5</span>
          <span className="text-white text-4xl font-black drop-shadow-[2px_2px_0px_#E8922D]" style={{ WebkitTextStroke: '2px #E8922D', paintOrder: 'stroke fill' }}>1</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-7 h-7 flex-shrink-0">
            <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
          </svg>
        </div>
      </a>
    </main>
  )
}