'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [cartCount, setCartCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  // Navigation links array for easier management
  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/about', label: 'عن ميموز' },
    { href: '/contact', label: 'تواصل معنا' },
    { href: '#', label: 'وظائف ميموز' }
  ]

  useEffect(() => {
    // Get cart count from localStorage - calculate total quantity
    const calculateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('memoCart') || '[]')
      const totalCount = cart.reduce((total, item) => total + item.quantity, 0)
      setCartCount(totalCount)
    }

    calculateCartCount()

    // Listen for cart updates
    const handleCartUpdate = () => {
      calculateCartCount()
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const scrollToMenu = () => {
    closeMobileMenu()
    
    // Check if we're already on the home page
    if (window.location.pathname === '/') {
      // We're on home page, just scroll to menu section
      const menuSection = document.getElementById('menu-section')
      if (menuSection) {
        const offset = menuSection.getBoundingClientRect().top + window.pageYOffset - 100
        window.scrollTo({ top: offset, behavior: 'smooth' })
      }
    } else {
      // We're on a different page, navigate to home first
      router.push('/')
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const menuSection = document.getElementById('menu-section')
        if (menuSection) {
          const offset = menuSection.getBoundingClientRect().top + window.pageYOffset - 100
          window.scrollTo({ top: offset, behavior: 'smooth' })
        }
      }, 100)
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 shadow-lg" style={{ backgroundColor: '#00A4A6' }}>
        <nav className="relative z-10 container mx-auto px-4 sm:px-6 py-4 sm:py-6" dir="rtl">
          <div className="flex items-center justify-between gap-3">
            
            {/* Right side - Logo + Mobile Menu Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="lg:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors"
                aria-label="القائمة الرئيسية"
                aria-expanded={isMobileMenuOpen}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>


              <Link href="/" onClick={closeMobileMenu} className="flex items-center">
                <img src="/images/logo.svg" alt="Memo's Pizza Logo" className="h-8 sm:h-10" />
              </Link>
            </div>

            {/* Center - Navigation Menu */}
            <div className="hidden lg:flex items-center justify-center flex-1 max-w-2xl mx-8">
              <div className="flex items-center px-4 py-2">
                {navLinks.map(({ href, label }) => (
                  href.startsWith('/') ? (
                    <Link
                      key={label}
                      href={href}
                      className="text-white hover:text-teal-800 transition-colors font-arabic font-bold text-md mx-4"
                    >
                      {label}
                    </Link>
                  ) : (
                    <a
                      key={label}
                      href={href}
                      className="text-white hover:text-teal-800 transition-colors font-arabic font-bold text-md mx-4"
                    >
                      {label}
                    </a>
                  )
                ))}
              </div>
            </div>

            {/* Left side - Cart & Order Now Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <Link href="/cart" className="bg-white h-9 sm:h-10 px-2 sm:px-3 rounded-md font-arabic font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-1 text-xs sm:text-sm" style={{ color: '#00A4A6' }}>
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M25.6527 7.44024H25.1194L20.6127 2.93357C20.2527 2.57357 19.666 2.57357 19.2927 2.93357C18.9327 3.29357 18.9327 3.88024 19.2927 4.25357L22.4794 7.44024H9.51935L12.706 4.25357C13.066 3.89357 13.066 3.30691 12.706 2.93357C12.346 2.57357 11.7593 2.57357 11.386 2.93357L6.89268 7.44024H6.35935C5.15935 7.44024 2.66602 7.44024 2.66602 10.8536C2.66602 12.1469 2.93268 13.0002 3.49268 13.5602C3.81268 13.8936 4.19935 14.0669 4.61268 14.1602C4.99935 14.2536 5.41268 14.2669 5.81268 14.2669H26.186C26.5994 14.2669 26.986 14.2402 27.3594 14.1602C28.4794 13.8936 29.3327 13.0936 29.3327 10.8536C29.3327 7.44024 26.8394 7.44024 25.6527 7.44024Z" fill="#007B7D"/>
                    <path d="M25.4009 16H6.49419C5.66752 16 5.04086 16.7333 5.17419 17.5467L6.29419 24.4C6.66752 26.6933 7.66752 29.3333 12.1075 29.3333H19.5875C24.0809 29.3333 24.8809 27.08 25.3609 24.56L26.7075 17.5867C26.8675 16.76 26.2409 16 25.4009 16ZM16.0009 26C12.8809 26 10.3342 23.4533 10.3342 20.3333C10.3342 19.7867 10.7875 19.3333 11.3342 19.3333C11.8809 19.3333 12.3342 19.7867 12.3342 20.3333C12.3342 22.36 13.9742 24 16.0009 24C18.0275 24 19.6675 22.36 19.6675 20.3333C19.6675 19.7867 20.1209 19.3333 20.6675 19.3333C21.2142 19.3333 21.6675 19.7867 21.6675 20.3333C21.6675 23.4533 19.1209 26 16.0009 26Z" fill="#007B7D"/>
                  </svg>
                  <span className="hidden sm:inline">السلة</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
              <button
                type="button"
                onClick={scrollToMenu}
                className="text-white h-9 sm:h-10 px-3 sm:px-4 rounded-lg font-arabic font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 hover:bg-white/10"
                style={{ backgroundColor: '#008B8D' }}
              >
                <span className="hidden sm:inline">اطلب دلوقتي</span>
                <span className="sm:hidden">اطلب</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.5 2.95752C6.99 2.95752 2.5 7.44752 2.5 12.9575C2.5 18.4675 6.99 22.9575 12.5 22.9575C18.01 22.9575 22.5 18.4675 22.5 12.9575C22.5 7.44752 18.01 2.95752 12.5 2.95752ZM16.56 12.2275L13.03 15.7575C12.88 15.9075 12.69 15.9775 12.5 15.9775C12.31 15.9775 12.12 15.9075 11.97 15.7575L8.44 12.2275C8.15 11.9375 8.15 11.4575 8.44 11.1675C8.73 10.8775 9.21 10.8775 9.5 11.1675L12.5 14.1675L15.5 11.1675C15.79 10.8775 16.27 10.8775 16.56 11.1675C16.85 11.4575 16.85 11.9275 16.56 12.2275Z" fill="white"/>
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={closeMobileMenu} />
          <aside className="absolute top-0 right-0 h-full w-72 bg-white text-right shadow-2xl p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-800 font-arabic">القائمة</span>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                aria-label="إغلاق القائمة"
              >
                ×
              </button>
            </div>

            <nav className="flex flex-col gap-4">
              {navLinks.map(({ href, label }) => (
                href.startsWith('/') ? (
                  <Link
                    key={`mobile-${label}`}
                    href={href}
                    className="text-gray-800 font-arabic font-semibold text-lg hover:text-teal-600 transition-colors py-2"
                    onClick={closeMobileMenu}
                  >
                    {label}
                  </Link>
                ) : (
                  <a
                    key={`mobile-${label}`}
                    href={href}
                    className="text-gray-800 font-arabic font-semibold text-lg hover:text-teal-600 transition-colors py-2"
                    onClick={closeMobileMenu}
                  >
                    {label}
                  </a>
                )
              ))}
            </nav>

            <div className="mt-auto space-y-3">
              <Link
                href="/cart"
                className="w-full bg-teal-50 text-teal-700 py-3 rounded-lg font-arabic font-bold flex items-center justify-center gap-2"
                onClick={closeMobileMenu}
              >
                السلة
                {cartCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={scrollToMenu}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-arabic font-bold flex items-center justify-center gap-2"
              >
                اطلب من القائمة
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}