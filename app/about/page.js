'use client'

import { useState } from 'react'
import Image from 'next/image'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ContactLocationsSection from '../../components/ContactLocationsSection'

export default function AboutPage() {
  const [selectedImage, setSelectedImage] = useState(0)

  // Sample images for the story section
  const storyImages = [
    {
      id: 1,
      src: '/images/story-1.png',
      alt: 'قصتنا - الجزء الأول',
      title: 'بداية الحلم'
    },
    {
      id: 2,
      src: '/images/story-2.png',
      alt: 'قصتنا - الجزء الثاني',
      title: 'النمو والتطور'
    },
    {
      id: 3,
      src: '/images/story-3.png',
      alt: 'قصتنا - الجزء الثالث',
      title: 'المستقبل'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      <div className="pt-20">
        {/* Story Section */}
        <div className="bg-white py-16">
        <div className="container mx-auto px-6" dir="rtl">
          {/* Section Title */}
          <div className="text-right mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 font-arabic">
              قصتنا مستمرة منذ 2017
            </h2>
            <div className="w-16 h-1 bg-teal-500 mt-3"></div>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Image Display - Left Side (Larger) */}
            <div className="lg:col-span-9">
              <div className="rounded-xl overflow-hidden shadow-xl">
                <div className="aspect-video relative">
                  <Image
                    src={storyImages[selectedImage].src}
                    alt={storyImages[selectedImage].alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                  />
                  
                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <h3 className="text-2xl font-bold text-white font-arabic mb-2">
                      {storyImages[selectedImage].title}
                    </h3>
                    <p className="text-white/90 font-arabic">
                      صورة تحكي جزءاً من قصة ميموز منذ عام 2017
                    </p>
                  </div>

                  {/* Image Navigation Dots */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                    {storyImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          selectedImage === index 
                            ? 'bg-teal-500 scale-125' 
                            : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Images - Right Side (Smaller) */}
            <div className="lg:col-span-3">
              <div className="flex flex-col h-full space-y-3">
                {storyImages.map((image, index) => (
                  <div 
                    key={image.id}
                    className={`relative rounded-md overflow-hidden cursor-pointer transition-all duration-300 flex-1 ${
                      selectedImage === index 
                        ? 'ring-3 ring-teal-500 shadow-md scale-105' 
                        : 'hover:shadow-sm hover:scale-102'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <div className="h-full relative">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw, 20vw"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <span className="text-white font-arabic text-xs font-medium">{image.title}</span>
                      </div>
                    </div>
                  
                    {/* Overlay for selected state */}
                    {selectedImage === index && (
                      <div className="absolute inset-0 bg-teal-500 bg-opacity-20 flex items-center justify-center">
                        <div className="bg-white rounded-full p-2">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12l2 2 4-4" stroke="#14B8A6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vision and Mission Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-6" dir="rtl">
          <div className="space-y-16">
            
            {/* Vision Section */}
            <div className="text-right">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 font-arabic mb-4">
                رؤيتنا
              </h2>
              <div className="w-12 h-1 bg-orange-500 mb-8"></div>
              
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-500 rounded-full p-2 flex-shrink-0 mt-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="white"/>
                    </svg>
                  </div>
                  <p className="text-gray-700 font-arabic text-lg leading-relaxed">
                    انتشار سلسلة مطاعم كبرى حول العالم تترك في ذاكرة عملائنا تجربة طعام فريدة، آمنة وسريعة.
                  </p>
                </div>
              </div>
            </div>

            {/* Mission Section */}
            <div className="text-right">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 font-arabic mb-4">
                رسالتنا
              </h2>
              <div className="w-12 h-1 bg-orange-500 mb-8"></div>
              
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-orange-500 rounded-full p-2 flex-shrink-0 mt-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 11H7l5-8 5 8h-2l-3 8-3-8z" fill="white"/>
                    </svg>
                  </div>
                  <p className="text-gray-700 font-arabic text-lg leading-relaxed mb-6">
                    أن نترك ذكرى خاصة في ذهن أكبر عدد من الزبائن يوميًا من خلال:
                  </p>
                </div>
                
                {/* Mission Points */}
                <div className="space-y-4 mr-12">
                  <div className="flex items-start gap-3">
                    <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">1</span>
                    <p className="text-gray-700 font-arabic leading-relaxed">
                      الحفاظ على نبات منظومة جودة الطعام اللحين والطعم الرائع
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">2</span>
                    <p className="text-gray-700 font-arabic leading-relaxed">
                      إنشاء سلسلة مطاعم مجهزة بشكل معماري فريد وصديق البيئة والمجتمع
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">3</span>
                    <p className="text-gray-700 font-arabic leading-relaxed">
                      تقديم خدمة يومية متميزة تليق بعقلية ميموز
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">4</span>
                    <p className="text-gray-700 font-arabic leading-relaxed">
                      انطلاق الدائم في البحث العلمي لمواكبة التطور
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6" dir="rtl">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 font-arabic mb-4">
              قيمنا
            </h2>
            <div className="w-16 h-1 bg-orange-500 mx-auto"></div>
          </div>

          {/* Values Grid */}
          <div className="max-w-6xl mx-auto">
            {/* First Row - 3 values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Quality and Consistency */}
              <div className="text-center group">
                <div className="bg-teal-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-600 transition-colors duration-300">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="white"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 font-arabic">
                  الجودة والثبات
                </h3>
              </div>

              {/* Safety and Reliability */}
              <div className="text-center group">
                <div className="bg-teal-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-600 transition-colors duration-300">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 font-arabic">
                  السلامة والموثوقية
                </h3>
              </div>

              {/* Speed and Comfort */}
              <div className="text-center group">
                <div className="bg-teal-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-600 transition-colors duration-300">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 font-arabic">
                  السرعة والراحة
                </h3>
              </div>
            </div>

            {/* Second Row - 2 values centered */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {/* Innovation and Development */}
              <div className="text-center group">
                <div className="bg-teal-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-600 transition-colors duration-300">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z" fill="white"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 font-arabic">
                  الابتكار والتطوير
                </h3>
              </div>

              {/* Social and Environmental Responsibility */}
              <div className="text-center group">
                <div className="bg-teal-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-600 transition-colors duration-300">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2a3 3 0 0 0-3 3c0 1 .5 1.5 1 2l2 2 2-2c.5-.5 1-1 1-2a3 3 0 0 0-3-3zm0 6L9 5a5 5 0 0 0-5 5c0 3 2 6 8 12 6-6 8-9 8-12a5 5 0 0 0-5-5l-3 3z" fill="white"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 font-arabic text-center">
                  المسؤولية المجتمعية<br />والبيئية
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Locations Section */}
        <ContactLocationsSection />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}