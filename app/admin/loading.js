export default function AdminLoading() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
      {/* Main loading container */}
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Simple elegant spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-l-orange-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>

        {/* Loading text */}
        <div className="text-center">
          <p className="text-lg text-white font-arabic animate-pulse">
            جاري تحميل لوحة التحكم...
          </p>
        </div>
      </div>
    </div>
  )
}