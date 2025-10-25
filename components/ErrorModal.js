'use client'

export default function ErrorModal({ isVisible, onClose, onRetry }) {
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

        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Main Error Message */}
        <h2 className="text-gray-800 font-arabic text-xl font-bold mb-4">
          اعتذرنا منك، لم يتم إرسال رسالتك
        </h2>

        {/* Subtitle Message */}
        <p className="text-gray-600 font-arabic text-sm mb-4 leading-relaxed">
          قد تكون هناك مشكلة في شبكة الإنترنت حالياً
        </p>

        {/* Contact Info */}
        <p className="text-gray-600 font-arabic text-sm mb-2">
          يمكنك التواصل معنا عن طريق الخط الساخن
        </p>

        {/* Phone Number */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" fill="#00A4A6"/>
          </svg>
          <span className="text-teal-500 font-arabic font-bold text-lg">19019</span>
        </div>

        {/* Retry Button */}
        <button
          onClick={onRetry}
          className="w-full text-white px-6 py-4 rounded-lg font-arabic font-bold text-lg hover:opacity-90 transition-all duration-300"
          style={{ backgroundColor: '#00A4A6' }}
        >
          أعد المحاولة
        </button>
      </div>
    </div>
  )
}