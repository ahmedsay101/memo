'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/AdminLayout'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filter, setFilter] = useState('all') // all, pending, confirmed, preparing, ready, delivered
  const [timeFilter, setTimeFilter] = useState('all') // all, 1h, 1d, 1w, 1m, 1y
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 10

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
            : order
        ))
      } else {
        alert('حدث خطأ في تحديث حالة الطلب')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('حدث خطأ في تحديث حالة الطلب')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-orange-100 text-orange-800 border-orange-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      delivered: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status] || colors.pending
  }

  const getStatusText = (status) => {
    const texts = {
      pending: 'في الانتظار',
      confirmed: 'مؤكد',
      preparing: 'قيد التحضير',
      ready: 'جاهز',
      delivered: 'تم التسليم',
      cancelled: 'ملغي'
    }
    return texts[status] || 'غير محدد'
  }

  const getPaymentMethodText = (method) => {
    return method === 'card' ? 'فيزا / ماستركارد' : 'كاش عند الاستلام'
  }

  const getPaymentStatusText = (status) => {
    return status === 'paid' ? 'مدفوع' : 'غير مدفوع'
  }

  const getPaymentBadgeColor = (method, paymentStatus) => {
    if (method === 'card' && paymentStatus === 'paid') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    }
    if (method === 'card') {
      return 'bg-indigo-100 text-indigo-800 border-indigo-200'
    }
    return 'bg-amber-100 text-amber-800 border-amber-200'
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`
    } else if (diffInDays < 7) {
      return `منذ ${diffInDays} يوم`
    } else {
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  // Helper function to get time filter display name
  const getTimeFilterText = (timeFilter) => {
    const texts = {
      'all': 'كل الأوقات',
      '1h': 'آخر ساعة',
      '1d': 'آخر يوم', 
      '1w': 'آخر أسبوع',
      '1m': 'آخر شهر',
      '1y': 'آخر سنة'
    }
    return texts[timeFilter] || 'كل الأوقات'
  }

  // Function to filter orders by time period
  const filterOrdersByTime = (orders, timeFilter) => {
    if (timeFilter === 'all') return orders
    
    const now = new Date()
    let cutoffDate = new Date()
    
    switch (timeFilter) {
      case '1h':
        cutoffDate.setHours(now.getHours() - 1)
        break
      case '1d':
        cutoffDate.setDate(now.getDate() - 1)
        break
      case '1w':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '1m':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        return orders
    }
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= cutoffDate
    })
  }

  // Filter orders based on status and time
  const filteredOrders = filterOrdersByTime(orders, timeFilter).filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
  const startIndex = (currentPage - 1) * ordersPerPage
  const endIndex = startIndex + ordersPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    setCurrentPage(1)
  }

  const handleTimeFilterChange = (newTimeFilter) => {
    setTimeFilter(newTimeFilter)
    setCurrentPage(1)
  }

  const OrderCard = ({ order }) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      {/* First Row - Order Header and Price */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h3 className="text-lg font-semibold text-gray-800">
            طلب #{order.id}
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPaymentBadgeColor(order.paymentMethod, order.paymentStatus)}`}>
            {order.paymentMethod === 'card' ? '💳' : '💵'} {getPaymentMethodText(order.paymentMethod || 'cash')}
            {order.paymentMethod === 'card' && ` • ${getPaymentStatusText(order.paymentStatus || 'unpaid')}`}
          </span>
        </div>
        <div className="text-left flex-shrink-0">
          <div className="text-xl sm:text-2xl font-bold text-teal-600 mb-1">
            {order.totalAmount} جنيه
          </div>
          <button
            onClick={() => setSelectedOrder(order)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            عرض التفاصيل
          </button>
        </div>
      </div>
      
      {/* Second Row - Customer Details and Timestamps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="text-sm text-gray-600">
          <p><strong>العميل:</strong> {order.customerName}</p>
          <p><strong>الهاتف:</strong> {order.phone}</p>
          <p><strong>العنوان:</strong> {order.address}</p>
          <p><strong>الفرع:</strong> {order.branch}</p>
          <p>
            <strong>طريقة الدفع:</strong>{' '}
            {getPaymentMethodText(order.paymentMethod || 'cash')}
            {order.paymentMethod === 'card' && (
              <span className="mr-1 text-gray-500">
                ({getPaymentStatusText(order.paymentStatus || 'unpaid')})
              </span>
            )}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          <p>تاريخ الطلب: {formatDate(order.createdAt)}</p>
          {order.updatedAt !== order.createdAt && (
            <p>آخر تحديث: {formatDate(order.updatedAt)}</p>
          )}
          <p className="mt-1"><strong>عدد الأصناف:</strong> {order.items.length}</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-600 whitespace-nowrap">تغيير الحالة:</span>
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 flex-1 sm:flex-none min-w-0"
            >
              <option value="pending">في الانتظار</option>
              <option value="confirmed">مؤكد</option>
              <option value="preparing">قيد التحضير</option>
              <option value="ready">جاهز</option>
              <option value="delivered">تم التسليم</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
          
          {/* Quick customization summary */}
          <div className="flex items-center gap-2 flex-wrap">
            {order.items.some(item => item.customization) && (
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                يحتوي على تخصيصات
              </div>
            )}
            {order.items.some(item => item.customization?.leftSide && item.customization?.rightSide) && (
              <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                بيتزا نص ونص
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          {/* First Row - Title and Description */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              إدارة الطلبات
            </h1>
            <p className="text-gray-600">
              مراجعة وإدارة طلبات العملاء
              {(filter !== 'all' || timeFilter !== 'all') && (
                <span className="inline-flex items-center gap-2 ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  <span>🔍</span>
                  مصفاة: {filter !== 'all' && getStatusText(filter)} 
                  {filter !== 'all' && timeFilter !== 'all' && ' • '}
                  {timeFilter !== 'all' && getTimeFilterText(timeFilter)}
                </span>
              )}
            </p>
          </div>
          
          {/* Second Row - Filters and Actions */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter */}
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-0 flex-shrink-0"
            >
              <option value="all">جميع الطلبات</option>
              <option value="pending">في الانتظار</option>
              <option value="confirmed">مؤكدة</option>
              <option value="preparing">قيد التحضير</option>
              <option value="ready">جاهزة</option>
              <option value="delivered">تم التسليم</option>
              <option value="cancelled">ملغية</option>
            </select>
            
            {/* Time Filter */}
            <select
              value={timeFilter}
              onChange={(e) => handleTimeFilterChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 flex-shrink-0"
            >
              <option value="all">كل الأوقات</option>
              <option value="1h">آخر ساعة</option>
              <option value="1d">آخر يوم</option>
              <option value="1w">آخر أسبوع</option>
              <option value="1m">آخر شهر</option>
              <option value="1y">آخر سنة</option>
            </select>
            
            {/* Reset Filters Button */}
            {(filter !== 'all' || timeFilter !== 'all') && (
              <button
                onClick={() => {
                  setFilter('all')
                  setTimeFilter('all')
                  setCurrentPage(1)
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold flex-shrink-0"
              >
                إزالة الفلاتر
              </button>
            )}
            
            <button
              onClick={fetchOrders}
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold flex-shrink-0"
            >
              تحديث
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="text-blue-600 text-2xl mb-2">📋</div>
            <h3 className="text-lg font-semibold text-blue-800 mb-1">
              إجمالي الطلبات
            </h3>
            <p className="text-3xl font-bold text-blue-600">{filterOrdersByTime(orders, timeFilter).length}</p>
            <p className="text-xs text-blue-500 mt-1">
              {getTimeFilterText(timeFilter)}
            </p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-6">
            <div className="text-yellow-600 text-2xl mb-2">⏳</div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-1">
              في الانتظار
            </h3>
            <p className="text-3xl font-bold text-yellow-600">
              {filterOrdersByTime(orders, timeFilter).filter(o => o.status === 'pending').length}
            </p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-6">
            <div className="text-orange-600 text-2xl mb-2">🍳</div>
            <h3 className="text-lg font-semibold text-orange-800 mb-1">
              قيد التحضير
            </h3>
            <p className="text-3xl font-bold text-orange-600">
              {filterOrdersByTime(orders, timeFilter).filter(o => o.status === 'preparing').length}
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-6">
            <div className="text-green-600 text-2xl mb-2">✅</div>
            <h3 className="text-lg font-semibold text-green-800 mb-1">
              تم التسليم
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {filterOrdersByTime(orders, timeFilter).filter(o => o.status === 'delivered').length}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-6">
            <div className="text-purple-600 text-2xl mb-2">🔍</div>
            <h3 className="text-lg font-semibold text-purple-800 mb-1">
              المعروضة
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {filteredOrders.length}
            </p>
            <p className="text-xs text-purple-500 mt-1">بعد التصفية</p>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">جار التحميل...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              لا توجد طلبات
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' && timeFilter === 'all' 
                ? 'لا توجد طلبات حتى الآن' 
                : filter === 'all' 
                  ? `لا توجد طلبات خلال ${getTimeFilterText(timeFilter)}`
                  : timeFilter === 'all'
                    ? `لا توجد طلبات ${getStatusText(filter)}`
                    : `لا توجد طلبات ${getStatusText(filter)} خلال ${getTimeFilterText(timeFilter)}`
              }
            </p>
            {(filter !== 'all' || timeFilter !== 'all') && (
              <button
                onClick={() => {
                  setFilter('all')
                  setTimeFilter('all')
                  setCurrentPage(1)
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
              >
                إزالة جميع الفلاتر
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">
              عرض {startIndex + 1} إلى {Math.min(endIndex, filteredOrders.length)} من أصل {filteredOrders.length} طلب
            </div>
            
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg font-semibold ${
                  currentPage === 1 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                السابق
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  // Show first page, last page, current page and pages around current page
                  if (
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg font-semibold ${
                          currentPage === pageNum 
                            ? 'bg-teal-500 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  } else if (
                    (pageNum === currentPage - 2 && currentPage > 3) ||
                    (pageNum === currentPage + 2 && currentPage < totalPages - 2)
                  ) {
                    return <span key={pageNum} className="px-2 text-gray-400">...</span>
                  }
                  return null
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg font-semibold ${
                  currentPage === totalPages 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </AdminLayout>
  )
}

// Order Details Modal Component
function OrderDetailsModal({ order, onClose }) {
  const [addonNames, setAddonNames] = useState({})
  
  // Fetch addon names for display
  useEffect(() => {
    const fetchAddonNames = async () => {
      try {
        const response = await fetch('/api/addons')
        const data = await response.json()
        
        if (data.success) {
          const addonMap = {}
          data.addons.forEach(addon => {
            addonMap[addon._id] = addon
          })
          setAddonNames(addonMap)
        }
      } catch (error) {
        console.error('Error fetching addon names:', error)
      }
    }
    
    if (order) {
      fetchAddonNames()
    }
  }, [order])
  
  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`
    } else if (diffInDays < 7) {
      return `منذ ${diffInDays} يوم`
    } else {
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            تفاصيل الطلب #{order.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">معلومات العميل</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">الاسم:</span> {order.customerName}
              </div>
              <div>
                <span className="font-medium">الهاتف:</span> {order.phone}
              </div>
              <div className="md:col-span-2">
                <span className="font-medium">العنوان:</span> {order.address}
              </div>
              <div>
                <span className="font-medium">الفرع:</span> {order.branch}
              </div>
              <div>
                <span className="font-medium">الحالة:</span> 
                <span className={`mr-2 px-2 py-1 rounded text-xs ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {order.status === 'pending' && 'في الانتظار'}
                  {order.status === 'confirmed' && 'مؤكد'}
                  {order.status === 'preparing' && 'قيد التحضير'}
                  {order.status === 'ready' && 'جاهز'}
                  {order.status === 'delivered' && 'تم التسليم'}
                  {order.status === 'cancelled' && 'ملغي'}
                </span>
              </div>
              <div>
                <span className="font-medium">طريقة الدفع:</span>{' '}
                {order.paymentMethod === 'card' ? '💳' : '💵'}{' '}
                {order.paymentMethod === 'card' ? 'فيزا / ماستركارد' : 'كاش عند الاستلام'}
              </div>
              <div>
                <span className="font-medium">حالة الدفع:</span>{' '}
                <span className={`px-2 py-1 rounded text-xs ${
                  order.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {order.paymentStatus === 'paid' ? 'مدفوع ✅' : 'غير مدفوع'}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">أصناف الطلب</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {/* Item Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-lg">{item.name}</div>
                      <div className="text-sm text-gray-600">الكمية: {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">{item.price} جنيه</div>
                      <div className="text-sm text-gray-600">
                        المجموع: {(item.price * item.quantity).toFixed(2)} جنيه
                      </div>
                    </div>
                  </div>

                  {/* Customization Details */}
                  {item.customization && (
                    <div className="border-t pt-3 mt-3">
                      <div className="text-sm font-semibold text-gray-700 mb-2">تفاصيل التخصيص:</div>
                      
                      {/* Variants (Size, Crust, etc.) */}
                      {item.customization.variants && item.customization.variants.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-600">المواصفات: </span>
                          <div className="inline-flex flex-wrap gap-1">
                            {item.customization.variants.map((variant, vIndex) => {
                              // Handle both old format (just IDs) and new format (objects)
                              if (typeof variant === 'string') {
                                // Old format - just display the ID with mapping
                                const variantNames = {
                                  'small': 'صغير',
                                  'medium': 'وسط (+15 جنيه)',
                                  'large': 'كبير (+30 جنيه)',
                                  'regular': 'أطراف عادية',
                                  'stuffed': 'أطراف محشية (+10 جنيه)'
                                }
                                return (
                                  <span 
                                    key={vIndex} 
                                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                  >
                                    {variantNames[variant] || variant}
                                  </span>
                                )
                              } else {
                                // New format - use name and price from object
                                return (
                                  <span 
                                    key={vIndex} 
                                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                  >
                                    {variant.name}
                                    {variant.price > 0 && ` (+${variant.price} جنيه)`}
                                  </span>
                                )
                              }
                            })}
                          </div>
                        </div>
                      )}

                      {/* Addons/Toppings */}
                      {item.customization.addons && item.customization.addons.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-600">الإضافات: </span>
                          <div className="inline-flex flex-wrap gap-1">
                            {item.customization.addons.map((addon, aIndex) => {
                              // Handle both old format (just IDs) and new format (objects)
                              if (typeof addon === 'string') {
                                // Old format - lookup addon name from fetched data
                                const addonData = addonNames[addon]
                                return (
                                  <span 
                                    key={aIndex} 
                                    className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                                  >
                                    {addonData ? addonData.name : `إضافة ${aIndex + 1}`}
                                    {addonData && addonData.price > 0 && ` (+${addonData.price} جنيه)`}
                                  </span>
                                )
                              } else {
                                // New format - use name and price from object
                                return (
                                  <span 
                                    key={aIndex} 
                                    className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                                  >
                                    {addon.name}
                                    {addon.price > 0 && ` (+${addon.price} جنيه)`}
                                  </span>
                                )
                              }
                            })}
                          </div>
                        </div>
                      )}

                      {/* Half-and-Half Pizza Details */}
                      {item.customization.leftSide && item.customization.leftSide.pizza && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-600">النصف الأيسر: </span>
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                            {item.customization.leftSide.pizza.name}
                          </span>
                        </div>
                      )}
                      
                      {item.customization.rightSide && item.customization.rightSide.pizza && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-600">النصف الأيمن: </span>
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                            {item.customization.rightSide.pizza.name}
                          </span>
                        </div>
                      )}

                      {/* Customer Notes */}
                      {item.customization.notes && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-600">ملاحظات التخصيص: </span>
                          <span className="text-sm text-gray-700 italic">&ldquo;{item.customization.notes}&rdquo;</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Item Notes (separate from customization notes) */}
                  {item.notes && (
                    <div className="border-t pt-2">
                      <span className="text-sm font-medium text-gray-600">ملاحظات الصنف: </span>
                      <span className="text-sm text-gray-700">&ldquo;{item.notes}&rdquo;</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-teal-50 rounded-lg p-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>المجموع الكلي:</span>
              <span className="text-teal-600">{order.totalAmount} جنيه</span>
            </div>
          </div>

          {/* Timestamps */}
          <div className="text-sm text-gray-600">
            <p>تاريخ الطلب: {formatDate(order.createdAt)}</p>
            {order.updatedAt !== order.createdAt && (
              <p>آخر تحديث: {formatDate(order.updatedAt)}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-semibold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}