'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/AdminLayout'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [formData, setFormData] = useState({ name: '', text: '', rating: 5 })
  const [saving, setSaving] = useState(false)

  const getToken = () => localStorage.getItem('adminToken')

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const openAddModal = () => {
    setEditingReview(null)
    setFormData({ name: '', text: '', rating: 5 })
    setShowModal(true)
  }

  const openEditModal = (review) => {
    setEditingReview(review)
    setFormData({ name: review.name, text: review.text, rating: review.rating || 5 })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.text.trim()) return
    setSaving(true)

    try {
      const url = editingReview
        ? `/api/admin/reviews/${editingReview.id}`
        : '/api/admin/reviews'
      const method = editingReview ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setShowModal(false)
        fetchReviews()
      }
    } catch (error) {
      console.error('Error saving review:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا التقييم؟')) return

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) fetchReviews()
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  const handleToggleActive = async (review) => {
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ ...review, isActive: !review.isActive })
      })
      if (res.ok) fetchReviews()
    } catch (error) {
      console.error('Error toggling review:', error)
    }
  }

  const handleReorder = async (index, direction) => {
    const newReviews = [...reviews]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newReviews.length) return

    const tempOrder = newReviews[index].order
    newReviews[index].order = newReviews[swapIndex].order
    newReviews[swapIndex].order = tempOrder

    try {
      await Promise.all([
        fetch(`/api/admin/reviews/${newReviews[index].id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify(newReviews[index])
        }),
        fetch(`/api/admin/reviews/${newReviews[swapIndex].id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify(newReviews[swapIndex])
        })
      ])
      fetchReviews()
    } catch (error) {
      console.error('Error reordering reviews:', error)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 font-arabic">إدارة تقييمات العملاء</h1>
            <p className="text-gray-600 font-arabic mt-1">إضافة وتعديل تقييمات العملاء</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors font-arabic flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة تقييم
          </button>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-arabic">جاري التحميل...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-600 font-arabic text-lg">لا توجد تقييمات بعد</p>
            <p className="text-gray-400 font-arabic mt-2">اضغط على &quot;إضافة تقييم&quot; لإضافة أول تقييم</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div key={review.id} className={`bg-white rounded-lg shadow p-6 border-r-4 ${review.isActive ? 'border-teal-500' : 'border-gray-300'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800 font-arabic">{review.name}</h3>
                      {/* Rating Stars */}
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-arabic ${review.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {review.isActive ? 'ظاهر' : 'مخفي'}
                      </span>
                    </div>
                    <p className="text-gray-600 font-arabic leading-relaxed">{review.text}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mr-4">
                    {/* Reorder */}
                    <button
                      onClick={() => handleReorder(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleReorder(index, 'down')}
                      disabled={index === reviews.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Toggle Active */}
                    <button
                      onClick={() => handleToggleActive(review)}
                      className={`p-1.5 rounded ${review.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                      title={review.isActive ? 'إخفاء' : 'إظهار'}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {review.isActive ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        )}
                      </svg>
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => openEditModal(review)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      title="تعديل"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      title="حذف"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg" dir="rtl">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800 font-arabic">
                {editingReview ? 'تعديل التقييم' : 'إضافة تقييم جديد'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">اسم العميل *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 font-arabic focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="مثال: أحمد المصري"
                />
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">نص التقييم *</label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 font-arabic focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  placeholder="اكتب تقييم العميل هنا..."
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">التقييم</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      <svg className={`w-8 h-8 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-arabic"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.name.trim() || !formData.text.trim()}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-arabic"
              >
                {saving ? 'جاري الحفظ...' : editingReview ? 'تحديث' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
