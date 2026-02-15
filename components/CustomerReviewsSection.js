'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const fallbackReviews = [
  {
    id: 1,
    name: 'أحمد المصري',
    text: 'بصراحة جيك يوك من عيله كاملة استخدمته للفطار مع جبن التوست وكان طعمه يهبل مرة الولام فيه ابي احد يجرب مرة الثانية الصحيح'
  },
  {
    id: 2,
    name: 'سارة أحمد',
    text: 'تجربة رائعة مع ميموز بيتزا! الطعم ممتاز والتوصيل سريع. البيتزا وصلت ساخنة ولذيذة جداً. بالتأكيد سأطلب مرة أخرى'
  },
  {
    id: 3,
    name: 'محمد علي',
    text: 'أفضل بيتزا جربتها في المنطقة! الجبن طازج والعجينة مقرمشة من الخارج وطرية من الداخل. خدمة العملاء ممتازة أيضاً'
  },
  {
    id: 4,
    name: 'فاطمة حسن',
    text: 'طلبت للعائلة كلها وكانت التجربة مذهلة. تنوع كبير في الأصناف وأسعار معقولة. التطبيق سهل الاستخدام والدفع آمن'
  }
]

export default function CustomerReviewsSection() {
  const [reviews, setReviews] = useState(fallbackReviews)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews')
        if (res.ok) {
          const data = await res.json()
          if (data.reviews && data.reviews.length > 0) {
            setReviews(data.reviews)
          }
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      }
    }
    fetchReviews()
  }, [])

  // Auto-slide
  useEffect(() => {
    if (reviews.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % reviews.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [reviews.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % reviews.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  // Touch/drag swipe support
  const touchStartX = useRef(null)
  const touchEndX = useRef(null)
  const mouseStartX = useRef(null)
  const isDragging = useRef(false)

  const handleSwipe = useCallback(() => {
    const start = touchStartX.current ?? mouseStartX.current
    const end = touchEndX.current
    if (start === null || end === null) return
    const diff = start - end
    const threshold = 50
    if (Math.abs(diff) > threshold) {
      if (diff > 0) prevSlide()
      else nextSlide()
    }
  }, [reviews.length])

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; touchEndX.current = null }
  const onTouchMove = (e) => { touchEndX.current = e.touches[0].clientX }
  const onTouchEnd = () => handleSwipe()

  const onMouseDown = (e) => { isDragging.current = true; mouseStartX.current = e.clientX; touchEndX.current = null; e.preventDefault() }
  const onMouseMove = (e) => { if (isDragging.current) touchEndX.current = e.clientX }
  const onMouseUp = () => { if (isDragging.current) { isDragging.current = false; handleSwipe() } }
  const onMouseLeave = () => { if (isDragging.current) { isDragging.current = false; handleSwipe() } }

  return (
    <section id="reviews-section" className="py-24 px-4 bg-gray-50">
      <div className="container mx-auto" dir="rtl">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 font-arabic mb-4">
            تجارب عملائنا
          </h2>
          <div className="w-16 h-1 mx-auto" style={{ backgroundColor: '#009495' }}></div>
        </div>

        {/* Reviews Slider */}
        <div className="relative w-full max-w-2xl mx-auto">
          <div
            className="relative overflow-hidden rounded-2xl cursor-grab active:cursor-grabbing select-none"
            style={{ minHeight: '280px' }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
          >
            {reviews.map((review, index) => (
              <div
                key={review.id}
                className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                  index === currentSlide ? 'opacity-100 translate-x-0' :
                  index < currentSlide ? 'opacity-0 translate-x-full' : 'opacity-0 -translate-x-full'
                }`}
              >
                <div className="bg-white rounded-2xl p-8 shadow-md h-full flex flex-col items-center justify-center">
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center">
                      <svg width="33" height="25" viewBox="0 0 33 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.19362 15.2974C6.00075 15.002 4.94116 14.3156 4.1839 13.3478C3.42664 12.3799 3.01535 11.1863 3.01563 9.9574V9.4574C3.01563 7.99871 3.59509 6.59976 4.62654 5.56831C5.65799 4.53686 7.05693 3.9574 8.51562 3.9574H9.01562C10.4424 3.95611 11.8137 4.50994 12.8395 5.5017C13.8652 6.49347 14.4649 7.84538 14.5116 9.2714V9.2774H14.5156V9.9574C14.5156 10.2201 14.4976 10.4774 14.4616 10.7294C14.4216 11.2521 14.3616 11.7654 14.2816 12.2694C14.0707 13.5898 13.6951 14.8785 13.1636 16.1054C12.2107 18.3033 10.7245 20.2288 8.83963 21.7074L8.64363 21.8594C8.56079 21.9224 8.45971 21.9568 8.35563 21.9574C8.26956 21.9571 8.18504 21.9345 8.11024 21.892C8.03544 21.8494 7.97289 21.7883 7.92864 21.7145C7.88439 21.6407 7.85994 21.5567 7.85766 21.4706C7.85538 21.3846 7.87535 21.2995 7.91563 21.2234C8.39025 20.3207 8.82403 19.3971 9.21562 18.4554C9.60962 17.5074 10.0076 16.4294 10.3296 15.2994C9.89976 15.4057 9.45845 15.4588 9.01562 15.4574H8.51562C8.05829 15.4561 7.61762 15.4027 7.19362 15.2974ZM6.09562 18.1074C4.33914 17.5857 2.79825 16.5104 1.70261 15.0418C0.606967 13.5731 0.015243 11.7897 0.0156252 9.9574V9.4574C0.0156252 7.20306 0.911158 5.04105 2.50522 3.44699C4.09928 1.85293 6.26128 0.957398 8.51562 0.957398H9.01562C11.9196 0.957398 14.4816 2.4134 16.0156 4.6334C16.7973 3.49939 17.8428 2.57231 19.0622 1.93196C20.2816 1.2916 21.6383 0.957155 23.0156 0.957398H23.5156C25.7405 0.956942 27.8768 1.82883 29.466 3.38587C31.0552 4.94292 31.9706 7.061 32.0156 9.2854V9.9574C32.0156 10.3241 31.9923 10.6861 31.9456 11.0434C31.5316 16.2834 29.2296 20.9754 24.9696 24.2414C24.3627 24.7057 23.6198 24.9573 22.8556 24.9574C20.1736 24.9574 18.5636 22.1074 19.7596 19.8294C19.9816 19.4074 20.2796 18.8134 20.5956 18.1094C19.0385 17.6457 17.6469 16.7455 16.5856 15.5154C15.5024 18.9885 13.3648 22.0383 10.4696 24.2414C9.86268 24.7057 9.11979 24.9573 8.35563 24.9574C5.67362 24.9574 4.06362 22.1074 5.25962 19.8294C5.48163 19.4074 5.77962 18.8134 6.09562 18.1094M21.6956 15.2974C22.1196 15.4027 22.5603 15.4561 23.0176 15.4574H23.5176C23.9603 15.4569 24.4014 15.4038 24.8316 15.2994C24.4671 16.5733 24.0126 17.8198 23.4716 19.0294C23.1451 19.7724 22.7936 20.5042 22.4176 21.2234C22.3773 21.2995 22.3574 21.3846 22.3597 21.4706C22.3619 21.5567 22.3864 21.6407 22.4306 21.7145C22.4749 21.7883 22.5374 21.8494 22.6122 21.892C22.687 21.9345 22.7716 21.9571 22.8576 21.9574C22.9617 21.9568 23.0628 21.9224 23.1456 21.8594L23.3416 21.7074C23.9443 21.2301 24.499 20.7181 25.0056 20.1714C26.1862 18.9025 27.1279 17.4309 27.7856 15.8274C28.2539 14.6838 28.5881 13.4899 28.7816 12.2694C28.8644 11.7589 28.9251 11.2451 28.9636 10.7294C28.9996 10.4761 29.0176 10.2187 29.0176 9.9574V9.2794H29.0156V9.2714C28.9689 7.84468 28.3686 6.49218 27.342 5.50031C26.3154 4.50844 24.9431 3.95507 23.5156 3.9574H23.0136C21.5549 3.9574 20.156 4.53686 19.1245 5.56831C18.0931 6.59976 17.5136 7.99871 17.5136 9.4574V9.9574C17.5136 12.5374 19.2936 14.7054 21.6916 15.2974" fill="#007B7D"/>
                      </svg>
                    </div>
                  </div>

                  {/* Customer Name */}
                  <h3 className="text-xl font-bold font-arabic mb-4" style={{ color: '#FF8500' }}>
                    {review.name}
                  </h3>

                  {/* Review Text */}
                  <p className="text-gray-700 font-arabic text-base leading-relaxed text-center max-w-lg">
                    {review.text}
                  </p>
                </div>
              </div>
            ))}
          </div>



          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 gap-4">
            {reviews.map((_, index) => (
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