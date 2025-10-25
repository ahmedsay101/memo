'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page
    router.push('/admin/login')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">جار التحويل...</div>
    </div>
  )
}