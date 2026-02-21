'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/AdminLayout'

export default function SettingsPage() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [workingHours, setWorkingHours] = useState({
    daily: {
      label: "يومياً",
      hours: "من 3:00 - ص 10:00"
    },
    lastOrder: {
      label: "طلب (Last Order) حتى",
      hours: "2:00 ص"
    }
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      
      if (data.success) {
        setSettings(data.settings)
        if (data.settings.workingHours) {
          setWorkingHours(data.settings.workingHours)
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveWorkingHours = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'workingHours',
          value: workingHours
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage('تم حفظ أوقات العمل بنجاح')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(`خطأ: ${data.error}`)
      }
    } catch (error) {
      setMessage('فشل في حفظ أوقات العمل')
    } finally {
      setSaving(false)
    }
  }

  const updateWorkingHours = (type, field, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }))
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-xl text-gray-600">جاري التحميل...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6" dir="rtl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          إعدادات الموقع
        </h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center ${
            message.includes('خطأ') || message.includes('فشل') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        {/* Working Hours Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
            ⏰ أوقات العمل
          </h2>

          <div className="space-y-6">
            {/* Daily Hours */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">أوقات العمل اليومية</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    التسمية
                  </label>
                  <input
                    type="text"
                    value={workingHours.daily.label}
                    onChange={(e) => updateWorkingHours('daily', 'label', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="يومياً"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    الأوقات
                  </label>
                  <input
                    type="text"
                    value={workingHours.daily.hours}
                    onChange={(e) => updateWorkingHours('daily', 'hours', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="من 3:00 - ص 10:00"
                  />
                </div>
              </div>
            </div>

            {/* Last Order */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">آخر طلب</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    التسمية
                  </label>
                  <input
                    type="text"
                    value={workingHours.lastOrder.label}
                    onChange={(e) => updateWorkingHours('lastOrder', 'label', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="طلب (Last Order) حتى"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    الوقت
                  </label>
                  <input
                    type="text"
                    value={workingHours.lastOrder.hours}
                    onChange={(e) => updateWorkingHours('lastOrder', 'hours', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2:00 ص"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={saveWorkingHours}
              disabled={saving}
              className={`px-8 py-3 rounded-lg text-white font-semibold ${
                saving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
              } transition-all duration-200`}
            >
              {saving ? 'جاري الحفظ...' : 'حفظ أوقات العمل'}
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-gray-50 rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            👁️ معاينة أوقات العمل
          </h2>
          
          <div className="bg-white rounded-lg p-6 border-r-4 border-blue-500">
            <h3 className="text-lg font-bold text-gray-800 mb-4">⏱️ أوقات العمل</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{workingHours.daily.label}</span>
                <span className="text-blue-600 font-medium">{workingHours.daily.hours}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{workingHours.lastOrder.label}</span>
                <span className="text-red-600 font-medium">{workingHours.lastOrder.hours}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}