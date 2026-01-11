'use client'

import { useState } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import LoadingModal from '../../components/LoadingModal'
import SuccessModal from '../../components/SuccessModal'
import ErrorModal from '../../components/ErrorModal'
import ContactLocationsSection from '../../components/ContactLocationsSection'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' or 'error'
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')
    setSubmitStatus(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus('success')
        setSubmitMessage(result.message)
        setShowSuccessModal(true)
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          subject: '',
          message: ''
        })
      } else {
        setSubmitStatus('error')
        setSubmitMessage(result.message)
        setShowErrorModal(true)
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.')
      setShowErrorModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    setSubmitMessage('')
    setSubmitStatus(null)
  }

  const handleErrorModalClose = () => {
    setShowErrorModal(false)
    setSubmitMessage('')
    setSubmitStatus(null)
  }

  const handleRetry = () => {
    setShowErrorModal(false)
    setSubmitMessage('')
    setSubmitStatus(null)
    // The form is already visible, user can retry
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading Modal */}
      <LoadingModal isVisible={isSubmitting} message="جاري استلام رسالتك" />
      
      {/* Success Modal */}
      <SuccessModal 
        isVisible={showSuccessModal}
        onClose={handleSuccessModalClose}
      />

      {/* Error Modal */}
      <ErrorModal 
        isVisible={showErrorModal}
        onClose={handleErrorModalClose}
        onRetry={handleRetry}
      />
      
      {/* Header with navigation */}
      <Header />
      <div className="pt-20">
        {/* Contact Section */}
        <div className="relative" style={{ backgroundColor: '#00A4A6' }}>

        <div className="relative z-10 container mx-auto px-6 py-16" dir="rtl">
          {/* Contact Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white font-arabic mb-8">تواصل معنا</h1>
            
            {/* Contact Info Section */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mb-12">
              {/* Phone Number */}
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-full p-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" fill="#00A4A6"/>
                  </svg>
                </div>
                <span className="text-3xl font-bold text-white font-arabic">19012</span>
              </div>

              {/* Happy Face Emoji */}
              <div className="text-2xl">😊</div>

              {/* Social Media Text */}
              <div className="text-white font-arabic text-lg">يسعدنا تواصلك معنا</div>

              {/* Social Media Icons */}
              <div className="flex items-center gap-4">
                {/* Facebook */}
                <a href="#" className="bg-white rounded-full p-3 hover:bg-gray-100 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#00A4A6"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a href="#" className="bg-white rounded-full p-3 hover:bg-gray-100 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="#00A4A6"/>
                  </svg>
                </a>

                {/* WhatsApp */}
                <a href="#" className="bg-white rounded-full p-3 hover:bg-gray-100 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.474 3.488" fill="#00A4A6"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-6 max-w-4xl" dir="rtl">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
            {/* Form Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* First Name */}
              <div>
                <label className="block text-gray-700 font-arabic font-semibold mb-2">الاسم الاول</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="الاسم الاول"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-arabic"
                  required
                />
                <div className="flex justify-end mt-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#9CA3AF"/>
                  </svg>
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-gray-700 font-arabic font-semibold mb-2">الاسم الاخير</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="الاسم الاخير"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-arabic"
                  required
                />
                <div className="flex justify-end mt-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#9CA3AF"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div className="mb-6">
              <label className="block text-gray-700 font-arabic font-semibold mb-2">رقم الهاتف</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+20174566728..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-arabic"
                required
              />
              <div className="flex justify-end mt-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" fill="#9CA3AF"/>
                </svg>
              </div>
            </div>

            {/* Subject */}
            <div className="mb-6">
              <label className="block text-gray-700 font-arabic font-semibold mb-3">الموضوع</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="subject"
                    value="تقييم"
                    checked={formData.subject === 'تقييم'}
                    onChange={handleInputChange}
                    className="ml-2"
                  />
                  <span className="font-arabic">تقييم</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="subject"
                    value="شكوى"
                    checked={formData.subject === 'شكوى'}
                    onChange={handleInputChange}
                    className="ml-2"
                  />
                  <span className="font-arabic">شكوى</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="subject"
                    value="سؤال"
                    checked={formData.subject === 'سؤال'}
                    onChange={handleInputChange}
                    className="ml-2"
                  />
                  <span className="font-arabic">سؤال</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="subject"
                    value="اخرى"
                    checked={formData.subject === 'اخرى'}
                    onChange={handleInputChange}
                    className="ml-2"
                  />
                  <span className="font-arabic">اخرى</span>
                </label>
              </div>
            </div>

            {/* Message */}
            <div className="mb-8">
              <label className="block text-gray-700 font-arabic font-semibold mb-2">الرسالة</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="اكتب ما تريد من هنا"
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-arabic resize-none"
                required
              ></textarea>
              <div className="flex justify-end mt-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#9CA3AF"/>
                </svg>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`text-white px-8 py-4 rounded-lg font-arabic font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 mx-auto ${
                  isSubmitting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:opacity-90'
                }`}
                style={{ backgroundColor: '#00A4A6' }}
              >
                إرسال
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="white"/>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

        {/* Locations Section */}
        <ContactLocationsSection />
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}