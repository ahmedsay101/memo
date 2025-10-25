'use client'

import { useState } from 'react'

export default function ContactLocationsSection({ 
  title = "فين تلاقينا",
  showTitle = true,
  className = "",
  backgroundColor = "bg-white"
}) {
  const [expandedLocation, setExpandedLocation] = useState(null) // No location expanded by default

  const locations = [
    {
      id: 1,
      name: "طنطا - فرع الاستاد",
      address: "شارع الحلو بجوار مستشفى الشوكى",
      phone: "01234567890",
      hours: "يومياً 10:00 ص - 2:00 ص",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110565.30017513139!2d30.920155693652236!3d30.788749637817374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f7ca5d59f5bae7%3A0x77bdf67c97d6bd4d!2sTanta%2C%20Tanta%2C%20Gharbia%20Governorate!5e0!3m2!1sen!2seg!4v1696425000000!5m2!1sen!2seg"
    },
    {
      id: 2,
      name: "طنطا - فرع الجامعة",
      address: "شارع الجامعة بجوار كلية الطب",
      phone: "01234567891",
      hours: "يومياً 10:00 ص - 2:00 ص",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110565.30017513139!2d30.920155693652236!3d30.788749637817374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f7ca5d59f5bae7%3A0x77bdf67c97d6bd4d!2sTanta%2C%20Tanta%2C%20Gharbia%20Governorate!5e0!3m2!1sen!2seg!4v1696425000001!5m2!1sen!2seg"
    },
    {
      id: 3,
      name: "المنصورة - فرع الاستاد",
      address: "شارع الاستاد بجوار مستشفى الشوكى",
      phone: "01234567892",
      hours: "يومياً 10:00 ص - 2:00 ص",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d109741.50486700027!2d31.369293293633228!3d31.037958363058103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f79db9d4b2a1b7%3A0x21a1c7a0b3a3b3a3!2sMansoura%2C%20Dakahlia%20Governorate!5e0!3m2!1sen!2seg!4v1696425000002!5m2!1sen!2seg"
    }
  ]

  const toggleLocation = (index) => {
    setExpandedLocation(expandedLocation === index ? null : index)
  }

  return (
    <div className={`${backgroundColor} py-16 ${className}`}>
      <div className="container mx-auto px-6" dir="rtl">
        {/* Section Title */}
        {showTitle && (
          <div className="text-right mb-12">
            <h2 className="text-3xl font-bold text-gray-800 font-arabic">{title}</h2>
            <div className="w-12 h-1 bg-orange-500 mt-2"></div>
          </div>
        )}

        {/* Locations List */}
        <div className="space-y-4">
          {locations.map((location, index) => (
            <div key={location.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Location Header - Clickable */}
              <div 
                className="bg-white p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleLocation(index)}
              >
                <div className="flex items-center justify-between">
                  {/* Location Info */}
                  <div className="flex items-center gap-4">
                    {/* Orange Location Icon */}
                    <div className="bg-orange-500 rounded-lg p-3 flex-shrink-0">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="white"/>
                        <circle cx="12" cy="10" r="3" fill="#FB923C"/>
                      </svg>
                    </div>
                    
                    {/* Location Name */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 font-arabic">
                        {location.name}
                      </h3>
                    </div>
                  </div>

                  {/* Expand/Collapse Arrow */}
                  <div className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className={`transform transition-transform duration-300 ${expandedLocation === index ? 'rotate-180' : ''}`}
                    >
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              <div className={`overflow-hidden transition-all duration-300 ${expandedLocation === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                {/* Location Details */}
                <div className="bg-gray-50 p-6 border-t border-gray-200">
                  <div className="space-y-3 mb-6">
                    {/* Address */}
                    <div className="flex items-center gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#00A4A6" strokeWidth="2"/>
                        <circle cx="12" cy="10" r="3" stroke="#00A4A6" strokeWidth="2"/>
                      </svg>
                      <span className="text-gray-700 font-arabic">{location.address}</span>
                    </div>
                    
                    {/* Phone */}
                    <div className="flex items-center gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" fill="#00A4A6"/>
                      </svg>
                      <a href={`tel:${location.phone}`} className="text-teal-600 font-arabic hover:text-teal-800 transition-colors">
                        {location.phone}
                      </a>
                    </div>
                    
                    {/* Hours */}
                    <div className="flex items-center gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#00A4A6" strokeWidth="2"/>
                        <polyline points="12,6 12,12 16,14" stroke="#00A4A6" strokeWidth="2"/>
                      </svg>
                      <span className="text-gray-700 font-arabic">{location.hours}</span>
                    </div>
                  </div>

                  {/* Map Container */}
                  <div className="rounded-lg overflow-hidden">
                    <div className="h-64 w-full">
                      <iframe
                        src={location.mapEmbedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full h-full"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}