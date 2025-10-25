'use client'

import Link from 'next/link'

export default function SuccessModal({ isVisible, onClose }) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 mx-4 max-w-md w-full text-center shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Main Success Message */}
        <h2 className="text-gray-800 font-arabic text-xl font-bold mb-4">
          تم استلام رسالتك بنجاح
        </h2>

        {/* Subtitle Message */}
        <p className="text-gray-600 font-arabic text-sm mb-8 leading-relaxed">
          استلمنا رسالتك، وسنتواصل معاك قريب<br />
          ميموز دايماً في خدمتك
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Homepage Button */}
          <Link 
            href="/"
            onClick={onClose}
            className="flex-1 border-2 border-teal-500 text-teal-500 px-4 py-3 rounded-lg font-arabic font-bold text-sm hover:bg-teal-50 transition-all duration-300 text-center"
          >
            الصفحة الرئيسية
          </Link>

          {/* Order Pizza Button */}
          <button
            onClick={onClose}
            className="flex-1 text-white px-4 py-3 rounded-lg font-arabic font-bold text-sm hover:opacity-90 transition-all duration-300"
            style={{ backgroundColor: '#00A4A6' }}
          >
            جرب بيتزا ميموز دلوقتي
          </button>
        </div>
      </div>
    </div>
  )
}