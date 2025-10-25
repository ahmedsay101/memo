'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/AdminLayout'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    todayOrders: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, bgColor, icon }) => (
    <div className={`${bgColor} rounded-lg p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-3xl font-bold">
            {loading ? '...' : value}
          </p>
        </div>
        <div className="text-4xl opacity-80">
          {icon}
        </div>
      </div>
    </div>
  )

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            لوحة التحكم الرئيسية
          </h1>
          <p className="text-gray-600">
            مرحباً بك في نظام إدارة مطعم ميمو
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="إجمالي المنتجات"
            value={stats.totalProducts}
            bgColor="bg-blue-500"
            icon="🍕"
          />
          <StatCard
            title="إجمالي الطلبات"
            value={stats.totalOrders}
            bgColor="bg-green-500"
            icon="📋"
          />
          <StatCard
            title="الطلبات المعلقة"
            value={stats.pendingOrders}
            bgColor="bg-yellow-500"
            icon="⏳"
          />
          <StatCard
            title="طلبات اليوم"
            value={stats.todayOrders}
            bgColor="bg-purple-500"
            icon="📅"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            إجراءات سريعة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={() => window.location.href = '/admin/products'}
              className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg p-4 text-right transition-colors"
            >
              <div className="text-blue-600 text-2xl mb-2">🍕</div>
              <h3 className="font-semibold text-blue-800 mb-1">إدارة المنتجات</h3>
              <p className="text-sm text-blue-600">إضافة وتعديل المنتجات</p>
            </button>

            <button 
              onClick={() => window.location.href = '/admin/orders'}
              className="bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-lg p-4 text-right transition-colors"
            >
              <div className="text-green-600 text-2xl mb-2">📋</div>
              <h3 className="font-semibold text-green-800 mb-1">إدارة الطلبات</h3>
              <p className="text-sm text-green-600">مراجعة وتحديث الطلبات</p>
            </button>

            <button 
              onClick={() => window.location.href = '/admin/settings'}
              className="bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-lg p-4 text-right transition-colors"
            >
              <div className="text-gray-600 text-2xl mb-2">⚙️</div>
              <h3 className="font-semibold text-gray-800 mb-1">الإعدادات</h3>
              <p className="text-sm text-gray-600">إعدادات النظام</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            النشاط الأخير
          </h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">جار التحميل...</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>لا توجد أنشطة حديثة</p>
              <p className="text-sm mt-1">ستظهر الأنشطة هنا عند إضافة المنتجات والطلبات</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}