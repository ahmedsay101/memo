'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/AdminLayout'

export default function BranchesPage() {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    phone: '15596',
    hours: 'يومياً: 10:00 ص - 2:00 ص',
    isActive: true
  })

  useEffect(() => {
    fetchBranches()
  }, [])

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  })

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/admin/branches', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      })
      if (response.ok) {
        const data = await response.json()
        setBranches(data.branches || [])
      }
    } catch (error) {
      console.error('Error fetching branches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingBranch
        ? `/api/admin/branches/${editingBranch.id}`
        : '/api/admin/branches'

      const response = await fetch(url, {
        method: editingBranch ? 'PUT' : 'POST',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchBranches()
        resetForm()
      } else {
        const data = await response.json()
        alert(data.error || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error saving branch:', error)
      alert('حدث خطأ في حفظ الفرع')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفرع؟')) return

    try {
      const response = await fetch(`/api/admin/branches/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      })
      if (response.ok) fetchBranches()
    } catch (error) {
      console.error('Error deleting branch:', error)
    }
  }

  const handleEdit = (branch) => {
    setEditingBranch(branch)
    setFormData({
      title: branch.title,
      address: branch.address,
      phone: branch.phone,
      hours: branch.hours,
      isActive: branch.isActive
    })
    setShowModal(true)
  }

  const toggleActive = async (branch) => {
    try {
      await fetch(`/api/admin/branches/${branch.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ ...branch, isActive: !branch.isActive })
      })
      fetchBranches()
    } catch (error) {
      console.error('Error toggling branch:', error)
    }
  }

  const resetForm = () => {
    setFormData({ title: '', address: '', phone: '15596', hours: 'يومياً: 10:00 ص - 2:00 ص', isActive: true })
    setEditingBranch(null)
    setShowModal(false)
  }

  const moveBranch = async (branch, direction) => {
    const sorted = [...branches].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex(b => b.id === branch.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const headers = getHeaders()
    try {
      await Promise.all([
        fetch(`/api/admin/branches/${sorted[idx].id}`, {
          method: 'PUT', headers,
          body: JSON.stringify({ ...sorted[idx], order: sorted[swapIdx].order })
        }),
        fetch(`/api/admin/branches/${sorted[swapIdx].id}`, {
          method: 'PUT', headers,
          body: JSON.stringify({ ...sorted[swapIdx], order: sorted[idx].order })
        })
      ])
      fetchBranches()
    } catch (error) {
      console.error('Error reordering branches:', error)
    }
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 font-arabic">إدارة الفروع</h1>
            <p className="text-gray-500 font-arabic mt-1">إضافة وتعديل فروع المطعم</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true) }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-arabic flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة فرع
          </button>
        </div>

        {/* Branches List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-500 font-arabic">جاري التحميل...</p>
          </div>
        ) : branches.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500 font-arabic text-lg">لا توجد فروع حالياً</p>
            <p className="text-gray-400 font-arabic mt-1">اضغط على &quot;إضافة فرع&quot; لإضافة فرع جديد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {branches.sort((a, b) => a.order - b.order).map((branch, index) => (
              <div key={branch.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Branch Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-400 font-arabic">#{index + 1}</span>
                      <h3 className="font-bold text-lg font-arabic" style={{ color: '#FF8500' }}>
                        {branch.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-arabic ${branch.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {branch.isActive ? 'نشط' : 'مخفي'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 font-arabic">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span>{branch.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span dir="ltr">{branch.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>{branch.hours}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => moveBranch(branch, 'up')} disabled={index === 0}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="تحريك لأعلى">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button onClick={() => moveBranch(branch, 'down')} disabled={index === branches.length - 1}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="تحريك لأسفل">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button onClick={() => toggleActive(branch)}
                      className={`p-2 rounded-lg transition-colors ${branch.isActive ? 'hover:bg-yellow-50 text-yellow-600' : 'hover:bg-green-50 text-green-600'}`}
                      title={branch.isActive ? 'إخفاء' : 'تفعيل'}>
                      {branch.isActive ? (
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
                    <button onClick={() => handleEdit(branch)}
                      className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="تعديل">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(branch.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors" title="حذف">
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
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 font-arabic">
                    {editingBranch ? 'تعديل الفرع' : 'إضافة فرع جديد'}
                  </h2>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">اسم الفرع *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-arabic focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="مثال: فرع الحلو"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">العنوان *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-arabic focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="مثال: ش الحلو مع علي بك"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">رقم الهاتف</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-arabic focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">ساعات العمل</label>
                    <input
                      type="text"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-arabic focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="مثال: يومياً: 10:00 ص - 2:00 ص"
                    />
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

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white py-2.5 rounded-lg font-arabic font-bold transition-colors"
                    >
                      {saving ? 'جاري الحفظ...' : editingBranch ? 'تعديل' : 'إضافة'}
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
