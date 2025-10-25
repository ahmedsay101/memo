'use client'

export default function LoadingModal({ isVisible, message = "جاري استلام رسالتك" }) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl">
        {/* Circular Progress Loader */}
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16">
            {/* Background circle */}
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            {/* Animated progress circle */}
            <div 
              className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
              style={{
                borderTopColor: '#00A4A6',
                borderRightColor: '#00A4A6',
                borderLeftColor: '#7DD3FC',
                animationDuration: '1s'
              }}
            ></div>
          </div>
        </div>

        {/* Loading Message */}
        <p className="text-gray-800 font-arabic text-lg font-semibold">
          {message}
        </p>
      </div>
    </div>
  )
}