'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function NavigationLoader() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Show loading when pathname changes
    setIsLoading(true)
    
    // Hide loading after a short delay to allow page to render
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 animate-pulse"></div>
      <div 
        className="h-full bg-gradient-to-r from-orange-400 to-red-400 animate-pulse"
        style={{
          animation: 'loading-bar 0.5s ease-out forwards',
        }}
      ></div>
      
      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0% }
          50% { width: 70% }
          100% { width: 100% }
        }
      `}</style>
    </div>
  )
}

export function LoadingSpinner({ size = 'md', color = 'orange' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colorClasses = {
    orange: 'border-orange-500',
    gray: 'border-gray-500',
    white: 'border-white',
    red: 'border-red-500'
  }

  return (
    <div className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}></div>
  )
}

export function PageLoadingSpinner({ message = 'جاري التحميل...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        {/* Animated pizza */}
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full animate-spin">
          <div className="absolute inset-2 bg-gradient-to-br from-red-400 to-red-500 rounded-full opacity-80">
            <div className="absolute inset-1 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full opacity-90">
              <div className="absolute top-2 left-3 w-1.5 h-1.5 bg-red-700 rounded-full"></div>
              <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-red-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      <p className="mt-4 text-gray-600 font-arabic animate-pulse">{message}</p>
      
      <div className="flex space-x-1 mt-2" dir="ltr">
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
      <div className="h-32 bg-gray-300 rounded-md mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-6 bg-orange-200 rounded w-1/4 mt-3"></div>
      </div>
    </div>
  )
}