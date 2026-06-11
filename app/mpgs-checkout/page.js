'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function MpgsCheckoutPage() {
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkoutData = localStorage.getItem('mpgsCheckout')
    if (!checkoutData) {
      setError('لم يتم العثور على بيانات الدفع. يرجى المحاولة مرة أخرى.')
      return
    }

    let config
    try {
      config = JSON.parse(checkoutData)
    } catch {
      setError('بيانات الدفع غير صالحة.')
      return
    }

    const { sessionId, merchantId, checkoutScriptUrl, orderId } = config
    if (!sessionId || !merchantId || !checkoutScriptUrl) {
      setError('بيانات جلسة الدفع غير مكتملة.')
      return
    }

    const script = document.createElement('script')
    script.src = checkoutScriptUrl
    script.async = true

    script.onload = () => {
      if (typeof window.Checkout === 'undefined') {
        setError('تعذر تحميل صفحة الدفع.')
        return
      }

      window.Checkout.configure({
        merchant: merchantId,
        session: { id: sessionId },
        order: {
          id: orderId,
          description: 'Memo Pizza Order',
        },
        interaction: {
          merchant: {
            name: 'Memo Pizza',
            url: window.location.origin,
          },
          displayControl: {
            billingAddress: 'HIDE',
            customerEmail: 'HIDE',
            orderSummary: 'SHOW',
            paymentConfirmation: 'HIDE',
            shipping: 'HIDE',
          },
        },
      })

      window.Checkout.showPaymentPage()
    }

    script.onerror = () => {
      setError('تعذر الاتصال ببوابة الدفع. يرجى المحاولة لاحقاً.')
    }

    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 pb-12">
        <div className="container mx-auto px-6 py-12" dir="rtl">
          <div className="max-w-2xl mx-auto text-center py-12 bg-white rounded-lg shadow-md">
            {error ? (
              <>
                <div className="text-6xl mb-6">😞</div>
                <h1 className="text-2xl font-bold text-red-600 font-arabic mb-4">{error}</h1>
                <button
                  onClick={() => router.push('/cart')}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-arabic font-bold px-8 py-3 rounded-lg transition-colors"
                >
                  العودة للسلة
                </button>
              </>
            ) : (
              <>
                <div className="relative mx-auto mb-6 w-20 h-20">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full animate-spin">
                    <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full opacity-80">
                      <div className="absolute inset-1 bg-gradient-to-br from-teal-200 to-teal-300 rounded-full opacity-90" />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 font-arabic mb-2">جاري التوجيه لصفحة الدفع</h3>
                <p className="text-gray-600 font-arabic">يرجى الانتظار، سيتم فتح صفحة الدفع الآمنة </p>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
