'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function TopLoader() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    let progressTimer
    let hideTimer

    const startLoading = () => {
      setIsLoading(true)
      setProgress(0)

      // Simulate progress
      const incrementProgress = () => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressTimer)
            return prev
          }
          return prev + Math.random() * 15
        })
      }

      progressTimer = setInterval(incrementProgress, 100)

      // Complete loading after a short delay
      hideTimer = setTimeout(() => {
        setProgress(100)
        setTimeout(() => {
          setIsLoading(false)
          setProgress(0)
        }, 200)
      }, 800)
    }

    startLoading()

    return () => {
      clearInterval(progressTimer)
      clearTimeout(hideTimer)
    }
  }, [pathname])

  if (!isLoading && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gray-100">
      <div 
        className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300 ease-out"
        style={{ 
          width: `${progress}%`,
          opacity: isLoading ? 1 : 0 
        }}
      />
    </div>
  )
}

// Simple button loading state component
export function LoadingButton({ 
  children, 
  loading = false, 
  disabled = false, 
  className = '', 
  onClick,
  ...props 
}) {
  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      className={`relative ${className} ${(disabled || loading) ? 'opacity-70 cursor-not-allowed' : ''}`}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  )
}