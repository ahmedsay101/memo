'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function NewOffersSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      id: 1,
      image: '/images/pizza-offer-1.svg',
      alt: 'اشتر 1 بيتزا - احصل على 1 مجاناً'
    },
    {
      id: 2,
      image: '/images/pizza-offer-1.svg',
      alt: 'عرض خاص - خصم 50%'
    },
    {
      id: 3,
      image: '/images/pizza-offer-1.svg',
      alt: 'وجبة عائلية - بيتزا كبيرة + مشروبات'
    }
  ]

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 20000) // Change slide every 20 seconds

    return () => clearInterval(interval)
  }, [slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto" dir="rtl">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 font-arabic mb-4">
            جديد ميموز
          </h2>
          <div className="w-16 h-1 mx-auto" style={{ backgroundColor: '#009495' }}></div>
        </div>

        {/* Slider Container */}
        <div className="relative w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl aspect-[16/9] sm:aspect-[20/9] lg:aspect-[24/9]">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                  index === currentSlide ? 'translate-x-0' : 
                  index < currentSlide ? 'translate-x-full' : '-translate-x-full'
                }`}
              >
                <div className="relative w-full h-full bg-white">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                    priority={index === 0}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows - Hidden on mobile */}
          <button
            onClick={prevSlide}
            className="absolute right-2 sm:-right-6 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 text-gray-700 p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 z-10 hidden sm:block"
          >
            <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="#007B7D" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute left-2 sm:-left-6 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 text-gray-700 p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 z-10 hidden sm:block"
          >
            <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="#007B7D" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 gap-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide 
                    ? 'bg-teal-500 w-12' 
                    : 'bg-gray-400 hover:bg-gray-500 w-3'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}