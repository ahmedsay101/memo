'use client'

import { useState, useEffect } from 'react'

const fallbackLocations = [
  {
    title: "فرع الحلو",
    address: "ش الحلو مع علي بك تحت مستشفى الشروق",
    phone: "15596",
    hours: "يومياً: 10:00 ص - 2:00 ص",
    location: "https://maps.google.com/maps/search/Memo's%20Pizza/@30.79633009,31.00393401,17z?hl=en"
  },
  {
    title: "فرع الإستاد",
    address: "ش الاستاد بجوار مستشفى الكنانه",
    phone: "15596",
    hours: "يومياً: 10:00 ص - 2:00 ص",
    location: "https://maps.google.com/?q=30.816591,30.992641"
  }
]

export default function LocationsSection() {
  const [locations, setLocations] = useState(fallbackLocations)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch('/api/branches')
        if (res.ok) {
          const data = await res.json()
          if (data.branches && data.branches.length > 0) {
            setLocations(data.branches)
          }
        }
      } catch (error) {
        console.error('Error fetching branches:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBranches()
  }, [])

  if (loading) return null

  return (
    <section 
      className="py-24 px-4 bg-cover bg-center bg-no-repeat relative" 
      style={{ 
        backgroundColor: '#009495',
        backgroundImage: 'url(/images/locations-bg.svg)'
      }}
    >
      {/* Optional overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      <div className="container mx-auto relative z-10" dir="rtl">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-white font-arabic mb-4">
            فين تلاقينا
          </h2>
          <div className="w-16 h-1 bg-white mx-auto"></div>
        </div>

        {/* Location Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
          <div className="divide-y divide-gray-200">
            {locations.map((location, index) => (
              <div key={index} className="py-6 first:pt-0 last:pb-0 text-center">
                {/* Branch Title */}
                <h3 className="text-2xl font-bold font-arabic mb-4" style={{ color: '#FF8500' }}>
                  {location.title}
                </h3>

                {/* Address */}
                <a 
                  href={location.location} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center mb-3 text-gray-700 hover:text-teal-600 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 ml-2 flex-shrink-0" style={{ color: '#009495' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <p className="font-arabic text-sm leading-relaxed hover:underline">
                    {location.address}
                  </p>
                </a>

                {/* Phone */}
                <div className="flex items-center justify-center mb-3 text-gray-700">
                  <svg className="w-5 h-5 ml-2 flex-shrink-0" style={{ color: '#009495' }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <p className="font-arabic text-sm" dir="ltr">
                    {location.phone}
                  </p>
                </div>

                {/* Hours */}
                <div className="flex items-center justify-center text-gray-700">
                  <svg className="w-5 h-5 ml-2 flex-shrink-0" style={{ color: '#009495' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <p className="font-arabic text-sm">
                    {location.hours}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}