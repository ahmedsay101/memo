export default function LocationsSection() {
  const locations = [
    {
      title: "فرع المنصورة",
      address: "شارع الحلو بجوار مستشفى الشروق",
      phone: "01234567890١",
      hours: "يومياً: 10:00 ص - 2:00 ص"
    },
    {
      title: "فرع طنطا - الجامعة", 
      address: "شارع الحلو بجوار مستشفى الشروق",
      phone: "01234567890١",
      hours: "يومياً: 10:00 ص - 2:00 ص"
    },
    {
      title: "فرع طنطا - الإستاد",
      address: "شارع الحلو بجوار مستشفى الشروق", 
      phone: "01234567890١",
      hours: "يومياً: 10:00 ص - 2:00 ص"
    }
  ]

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

        {/* Location Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {locations.map((location, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              {/* Branch Title */}
              <h3 className="text-2xl font-bold font-arabic mb-4" style={{ color: '#FF8500' }}>
                {location.title}
              </h3>

              {/* Address */}
              <div className="flex items-center justify-start mb-4 text-gray-700">
                <svg className="w-5 h-5 ml-2 flex-shrink-0" style={{ color: '#009495' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <p className="font-arabic text-sm leading-relaxed">
                  {location.address}
                </p>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-start mb-4 text-gray-700">
                <svg className="w-5 h-5 ml-2 flex-shrink-0" style={{ color: '#009495' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <p className="font-arabic text-sm" dir="ltr">
                  {location.phone}
                </p>
              </div>

              {/* Hours */}
              <div className="flex items-center justify-start text-gray-700">
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
    </section>
  )
}