'use client'
import { useState } from 'react'

export default function TermsAcceptance({ onAccept, isAccepted }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTerms, setSelectedTerms] = useState('')

  const handleAcceptance = () => {
    onAccept(true)
    setModalOpen(false)
  }

  const openTermsModal = (type) => {
    setSelectedTerms(type)
    setModalOpen(true)
  }

  return (
    <>
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4" dir="rtl">
        <div className="flex items-start space-x-3 space-x-reverse">
          <input
            type="checkbox"
            id="terms-acceptance"
            checked={isAccepted}
            onChange={(e) => onAccept(e.target.checked)}
            className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <div className="flex-1">
            <label htmlFor="terms-acceptance" className="text-sm text-gray-700 font-arabic">
              أوافق على{' '}
              <button
                type="button"
                onClick={() => openTermsModal('terms')}
                className="text-orange-600 underline hover:text-orange-700"
              >
                الشروط والأحكام
              </button>
              {' '}و{' '}
              <button
                type="button"
                onClick={() => openTermsModal('policies')}
                className="text-orange-600 underline hover:text-orange-700"
              >
                سياسات الإلغاء والاستبدال والتوصيل
              </button>
            </label>
            <div className="mt-2 text-xs text-gray-600 font-arabic">
              <p>✓ الدفع بالبطاقات الائتمانية: Visa, MasterCard, Meeza</p>
              <p>✓ الدفع النقدي عند الاستلام متاح</p>
            </div>
          </div>
        </div>
        
        {isAccepted && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-700">
              <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-arabic">
                تم قبول الشروط والأحكام رقمياً بتاريخ {new Date().toLocaleDateString('ar-EG')} الساعة {new Date().toLocaleTimeString('ar-EG')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Terms Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-hidden" dir="rtl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold font-arabic">
                {selectedTerms === 'terms' ? 'الشروط والأحكام' : 'سياسات الإلغاء والاستبدال والتوصيل'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {selectedTerms === 'terms' ? (
                <TermsContent />
              ) : (
                <PoliciesContent />
              )}
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3 space-x-reverse">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-arabic"
              >
                إلغاء
              </button>
              <button
                onClick={handleAcceptance}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-arabic"
              >
                أوافق على الشروط
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Terms Content Component
function TermsContent() {
  return (
    <div className="space-y-4 font-arabic text-gray-700 text-sm leading-relaxed">
      <section>
        <h3 className="font-semibold text-gray-800 mb-2">مقدمة</h3>
        <p>
          مرحباً بكم في ميموز بيتزا. هذه الشروط والأحكام تحكم استخدامكم لموقعنا الإلكتروني وخدماتنا. 
          باستخدام موقعنا أو تقديم طلب، فإنكم توافقون على هذه الشروط والأحكام.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">الطلبات والدفع</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>يجب تأكيد الطلب خلال 15 دقيقة من تقديمه</li>
          <li>الأسعار تشمل ضريبة القيمة المضافة</li>
          <li>نقبل الدفع نقداً عند الاستلام أو بالبطاقات الائتمانية في حالة استلام من احد فروعنا فقط</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">سياسة التوصيل</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>وقت التوصيل المعتاد: 40-60 دقيقة</li>
          <li>قد يزيد وقت التوصيل في أوقات الذروة</li>
          <li>رسوم التوصيل تختلف حسب المنطقة</li>
          <li>نوصل في جميع أنحاء المدينة ضمن نطاق خدمتنا</li>
        </ul>
      </section>
    </div>
  )
}

// Policies Content Component  
function PoliciesContent() {
  return (
    <div className="space-y-4 font-arabic text-gray-700 text-sm leading-relaxed">
      <section>
        <h3 className="font-semibold text-orange-600 mb-2">سياسة الإلغاء</h3>
        <div className="space-y-2">
          <p><strong>إلغاء مجاني:</strong> خلال 5 دقائق من التأكيد</p>
          <p><strong>رسوم إلغاء 25%:</strong> خلال 15 دقيقة من بداية التحضير</p>
          <p><strong>لا يمكن الإلغاء:</strong> بعد انطلاق المندوب للتوصيل</p>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-teal-600 mb-2">سياسة الاستبدال</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>استبدال مجاني في حالة خطأ منا أو مشاكل الجودة</li>
          <li>الإبلاغ عن المشكلة خلال 30 دقيقة من الاستلام</li>
          <li>استرداد الأموال خلال 3-5 أيام عمل</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-purple-600 mb-2">سياسة التوصيل</h3>
        <ul className="list-disc list-inside space-y-1">
          <li> والمناطق المجاورة: 5 جنيه (حد أدنى 30 جنيه)</li>
          <li>المضروبة: 10 جنيه (حد أدنى 50 جنيه)</li>
          <li>المناطق البعيدة: 15 جنيه (حد أدنى 75 جنيه)</li>
        </ul>
      </section>
    </div>
  )
}