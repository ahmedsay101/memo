'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import AdminLayout from '../../../components/AdminLayout'

export default function SlidesPage() {
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSlide, setEditingSlide] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    imageFile: null,
    isActive: true
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/admin/slides', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSlides(data.slides || [])
      }
    } catch (error) {
      console.error('Error fetching slides:', error)
    } finally {
      setLoading(false)
    }
  }

  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: formData
    })
    const data = await response.json()
    if (data.success) return data.imagePath
    throw new Error(data.error || 'فشل رفع الصورة')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)

    try {
      let imagePath = formData.image

      if (formData.imageFile) {
        imagePath = await uploadImage(formData.imageFile)
      }

      if (!imagePath) {
        alert('يرجى اختيار صورة')
        setUploading(false)
        return
      }

      const slideData = {
        title: formData.title,
        image: imagePath,
        isActive: formData.isActive
      }

      const url = editingSlide
        ? `/api/admin/slides/${editingSlide.id}`
        : '/api/admin/slides'

      const response = await fetch(url, {
        method: editingSlide ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(slideData)
      })

      if (response.ok) {
        fetchSlides()
        resetForm()
      } else {
        const data = await response.json()
        alert(data.error || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error saving slide:', error)
      alert('حدث خطأ في حفظ السلايد')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا السلايد؟')) return

    try {
      const response = await fetch(`/api/admin/slides/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      if (response.ok) {
        fetchSlides()
      }
    } catch (error) {
      console.error('Error deleting slide:', error)
    }
  }

  const handleEdit = (slide) => {
    setEditingSlide(slide)
    setFormData({
      title: slide.title,
      image: slide.image,
      imageFile: null,
      isActive: slide.isActive
    })
    setShowAddModal(true)
  }

  const toggleActive = async (slide) => {
    try {
      const response = await fetch(`/api/admin/slides/${slide.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ ...slide, isActive: !slide.isActive })
      })
      if (response.ok) fetchSlides()
    } catch (error) {
      console.error('Error toggling slide:', error)
    }
  }

  const resetForm = () => {
    setFormData({ title: '', image: '', imageFile: null, isActive: true })
    setEditingSlide(null)
    setShowAddModal(false)
  }

  const moveSlide = async (slide, direction) => {
    const sorted = [...slides].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex(s => s.id === slide.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const token = localStorage.getItem('adminToken')
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }

    try {
      await Promise.all([
        fetch(`/api/admin/slides/${sorted[idx].id}`, {
          method: 'PUT', headers,
          body: JSON.stringify({ ...sorted[idx], order: sorted[swapIdx].order })
        }),
        fetch(`/api/admin/slides/${sorted[swapIdx].id}`, {
          method: 'PUT', headers,
          body: JSON.stringify({ ...sorted[swapIdx], order: sorted[idx].order })
        })
      ])
      fetchSlides()
    } catch (error) {
      console.error('Error reordering slides:', error)
    }
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 font-arabic">إدارة السلايدر</h1>
            <p className="text-gray-500 font-arabic mt-1">إضافة وتعديل صور السلايدر في الصفحة الرئيسية</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowAddModal(true) }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-arabic flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة سلايد
          </button>
        </div>

        {/* Slides Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-500 font-arabic">جاري التحميل...</p>
          </div>
        ) : slides.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 font-arabic text-lg">لا توجد سلايدات حالياً</p>
            <p className="text-gray-400 font-arabic mt-1">اضغط على &quot;إضافة سلايد&quot; لإضافة صور جديدة</p>
          </div>
        ) : (
          <div className="space-y-4">
            {slides.sort((a, b) => a.order - b.order).map((slide, index) => (
              <div key={slide.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col sm:flex-row items-stretch">
                {/* Image Preview */}
                <div className="relative w-full sm:w-64 h-40 sm:h-auto flex-shrink-0 bg-gray-100">
                  <Image
                    src={slide.image}
                    alt={slide.title || `سلايد ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-400 font-arabic">#{index + 1}</span>
                      <h3 className="font-bold text-gray-800 font-arabic text-lg">
                        {slide.title || 'بدون عنوان'}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-arabic ${slide.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {slide.isActive ? 'نشط' : 'مخفي'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => moveSlide(slide, 'up')}
                      disabled={index === 0}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="تحريك لأعلى"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveSlide(slide, 'down')}
                      disabled={index === slides.length - 1}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="تحريك لأسفل"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleActive(slide)}
                      className={`p-2 rounded-lg transition-colors ${slide.isActive ? 'hover:bg-yellow-50 text-yellow-600' : 'hover:bg-green-50 text-green-600'}`}
                      title={slide.isActive ? 'إخفاء' : 'تفعيل'}
                    >
                      {slide.isActive ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878l4.242 4.242M21 21l-4.878-4.878" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(slide)}
                      className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                      title="تعديل"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                      title="حذف"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 font-arabic">
                    {editingSlide ? 'تعديل السلايد' : 'إضافة سلايد جديد'}
                  </h2>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">
                      العنوان (اختياري)
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-arabic focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="عنوان السلايد"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">
                      الصورة *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-teal-500 transition-colors">
                      {(formData.imageFile || formData.image) ? (
                        <div className="space-y-3">
                          <div className="relative w-full h-40 bg-gray-50 rounded-lg overflow-hidden">
                            <Image
                              src={formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.image}
                              alt="معاينة"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image: '', imageFile: null })}
                            className="text-red-500 text-sm font-arabic hover:text-red-700"
                          >
                            إزالة الصورة
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-gray-500 font-arabic">اضغط لاختيار صورة</p>
                          <p className="text-xs text-gray-400 font-arabic mt-1">PNG, JPG, SVG - الحد الأقصى 5MB</p>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                setFormData({ ...formData, imageFile: e.target.files[0], image: '' })
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 font-arabic">نشط</label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-teal-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-1' : 'translate-x-6'}`} />
                    </button>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white py-2.5 rounded-lg font-arabic font-bold transition-colors"
                    >
                      {uploading ? 'جاري الحفظ...' : editingSlide ? 'تعديل' : 'إضافة'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg font-arabic hover:bg-gray-50 transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
