'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/AdminLayout'

const SUBJECT_LABELS = {
  'تقييم': { label: 'تقييم', color: 'bg-blue-100 text-blue-800' },
  'شكوى': { label: 'شكوى', color: 'bg-red-100 text-red-800' },
  'سؤال': { label: 'سؤال', color: 'bg-yellow-100 text-yellow-800' },
  'اخرى': { label: 'أخرى', color: 'bg-gray-100 text-gray-800' },
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState(null)
  const [filterSubject, setFilterSubject] = useState('all')
  const [filterRead, setFilterRead] = useState('all')

  const getToken = () => localStorage.getItem('adminToken')

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/admin/contacts', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) {
        const data = await res.json()
        setContacts(data.contacts || [])
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const handleMarkRead = async (contact) => {
    try {
      const res = await fetch(`/api/admin/contacts/${contact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ isRead: !contact.isRead })
      })
      if (res.ok) fetchContacts()
    } catch (error) {
      console.error('Error updating contact:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) {
        if (selectedContact?.id === id) setSelectedContact(null)
        fetchContacts()
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
    }
  }

  const filteredContacts = contacts.filter(c => {
    if (filterSubject !== 'all' && c.subject !== filterSubject) return false
    if (filterRead === 'read' && !c.isRead) return false
    if (filterRead === 'unread' && c.isRead) return false
    return true
  })

  const unreadCount = contacts.filter(c => !c.isRead).length

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 font-arabic">رسائل التواصل</h1>
            <p className="text-gray-600 font-arabic mt-1">
              إجمالي {contacts.length} رسالة
              {unreadCount > 0 && (
                <span className="text-red-600 font-bold mr-2">({unreadCount} غير مقروءة)</span>
              )}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg font-arabic text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">كل المواضيع</option>
            <option value="تقييم">تقييم</option>
            <option value="شكوى">شكوى</option>
            <option value="سؤال">سؤال</option>
            <option value="اخرى">أخرى</option>
          </select>

          <select
            value={filterRead}
            onChange={e => setFilterRead(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg font-arabic text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">الكل</option>
            <option value="unread">غير مقروءة</option>
            <option value="read">مقروءة</option>
          </select>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(SUBJECT_LABELS).map(([key, val]) => {
            const count = contacts.filter(c => c.subject === key).length
            return (
              <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                <p className={`text-sm font-arabic font-bold mb-1 ${val.color} inline-block px-3 py-1 rounded-full`}>{val.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{count}</p>
              </div>
            )
          })}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-arabic">جاري التحميل...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-bold text-gray-800 font-arabic">لا توجد رسائل</h3>
            <p className="text-gray-500 font-arabic mt-1">لم يتم استلام أي رسائل بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact list */}
            <div className="lg:col-span-1 space-y-3 max-h-[70vh] overflow-y-auto">
              {filteredContacts.map(contact => {
                const subjectInfo = SUBJECT_LABELS[contact.subject] || SUBJECT_LABELS['اخرى']
                return (
                  <div
                    key={contact.id}
                    onClick={() => {
                      setSelectedContact(contact)
                      if (!contact.isRead) handleMarkRead(contact)
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-colors duration-200 ${
                      selectedContact?.id === contact.id
                        ? 'border-teal-500 bg-teal-50'
                        : !contact.isRead
                          ? 'border-orange-300 bg-orange-50 hover:bg-orange-100'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-800 font-arabic">
                        {contact.firstName} {contact.lastName}
                      </span>
                      {!contact.isRead && (
                        <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0"></span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-arabic px-2 py-0.5 rounded-full ${subjectInfo.color}`}>
                        {subjectInfo.label}
                      </span>
                      <span className="text-xs text-gray-400 font-arabic">{formatDate(contact.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 font-arabic line-clamp-2">{contact.message}</p>
                  </div>
                )
              })}
            </div>

            {/* Contact detail */}
            <div className="lg:col-span-2">
              {selectedContact ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 font-arabic">
                        {selectedContact.firstName} {selectedContact.lastName}
                      </h2>
                      <p className="text-sm text-gray-500 font-arabic mt-1">{formatDate(selectedContact.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMarkRead(selectedContact)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-arabic transition-colors ${
                          selectedContact.isRead
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                        }`}
                      >
                        {selectedContact.isRead ? 'تحديد كغير مقروءة' : 'تحديد كمقروءة'}
                      </button>
                      <button
                        onClick={() => handleDelete(selectedContact.id)}
                        className="px-3 py-1.5 rounded-lg text-sm font-arabic bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      >
                        حذف
                      </button>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-arabic mb-1">رقم الهاتف</p>
                      <a href={`tel:${selectedContact.phone}`} className="text-teal-600 font-bold font-arabic hover:underline" dir="ltr">
                        {selectedContact.phone}
                      </a>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-arabic mb-1">الموضوع</p>
                      <span className={`text-sm font-arabic px-3 py-1 rounded-full ${(SUBJECT_LABELS[selectedContact.subject] || SUBJECT_LABELS['اخرى']).color}`}>
                        {(SUBJECT_LABELS[selectedContact.subject] || SUBJECT_LABELS['اخرى']).label}
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-arabic mb-2">الرسالة</p>
                    <p className="text-gray-800 font-arabic leading-relaxed whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="text-5xl mb-4">📩</div>
                  <p className="text-gray-500 font-arabic">اختر رسالة لعرض التفاصيل</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
