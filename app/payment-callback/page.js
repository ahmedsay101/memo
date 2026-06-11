'use client'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { clearCartStorage } from '../../lib/cartStorage'

function getCompletedOrderKey(mpgsOrderId) {
  return `memoCompletedOrder:${mpgsOrderId}`
}

export default function PaymentCallbackPage() {
  const [status, setStatus] = useState('processing')
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const hasProcessedRef = useRef(false)

  useEffect(() => {
    if (hasProcessedRef.current) return
    hasProcessedRef.current = true
    handlePaymentCallback()
  }, [])

  const showSuccess = (order) => {
    clearCartStorage()
    setStatus('success')
    setOrderDetails(order)
    setLoading(false)
    if (order?.mpgsOrderId) {
      sessionStorage.setItem(getCompletedOrderKey(order.mpgsOrderId), JSON.stringify(order))
    }
  }

  const handlePaymentCallback = async () => {
    try {
      const resultIndicator = searchParams.get('resultIndicator')
      const pendingOrderData = localStorage.getItem('pendingOrder')

      if (!pendingOrderData) {
        setStatus('failed')
        setLoading(false)
        return
      }

      const pendingOrder = JSON.parse(pendingOrderData)
      const mpgsOrderId = pendingOrder.mpgsOrderId

      const cachedOrder = sessionStorage.getItem(getCompletedOrderKey(mpgsOrderId))
      if (cachedOrder) {
        showSuccess(JSON.parse(cachedOrder))
        return
      }

      if (!resultIndicator) {
        setStatus('failed')
        setLoading(false)
        return
      }

      const verifyResponse = await fetch('/api/payments/mpgs/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: mpgsOrderId,
          resultIndicator,
          successIndicator: pendingOrder.successIndicator,
          totalAmount: pendingOrder.totalAmount,
        }),
      })

      const verifyResult = await verifyResponse.json()

      if (!verifyResponse.ok || !verifyResult.success) {
        setStatus('failed')
        setLoading(false)
        return
      }

      await createConfirmedOrder(pendingOrder, mpgsOrderId)
    } catch (error) {
      console.error('Payment callback error:', error)
      setStatus('failed')
      setLoading(false)
    }
  }

  const createConfirmedOrder = async (pendingOrder, mpgsOrderId) => {
    const orderPayload = {
        customerName: pendingOrder.orderData.customerName,
        phone: pendingOrder.orderData.phone,
        address: pendingOrder.orderData.address,
        floor: pendingOrder.orderData.floor,
        apartment: pendingOrder.orderData.apartment,
        landmark: pendingOrder.orderData.landmark,
        zone: pendingOrder.orderData.zone,
        deliveryMethod: pendingOrder.orderData.deliveryMethod,
        selectedBranch: pendingOrder.orderData.selectedBranch,
        paymentMethod: 'card',
        paymentStatus: 'paid',
        mpgsOrderId,
        items: pendingOrder.cartItems.map(item => ({
          id: item.id,
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          notes: item.notes || '',
          customization: item.customization || null
        })),
        totalAmount: pendingOrder.totalAmount,
        deliveryFee: pendingOrder.deliveryFee || 0,
        notes: pendingOrder.orderData.notes
          ? `${pendingOrder.orderData.notes} | MPGS: ${mpgsOrderId}`
          : `MPGS: ${mpgsOrderId}`
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      })

      const result = await response.json()

      if (response.ok && result.success && result.order) {
        showSuccess({ ...result.order, mpgsOrderId })
        return
      }

      throw new Error(result.error || 'Failed to create order')
    } catch (error) {
      console.error('Order creation error:', error)

      try {
        const retryResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        })
        const retryResult = await retryResponse.json()
        if (retryResponse.ok && retryResult.success && retryResult.order) {
          showSuccess({ ...retryResult.order, mpgsOrderId })
          return
        }
      } catch (retryError) {
        console.error('Order retry error:', retryError)
      }

      setStatus('paid-order-failed')
      setLoading(false)
    }
  }

  const handleContinueShopping = () => {
    router.push('/')
  }

  const handleRetryPayment = () => {
    router.push('/cart')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 pb-12">
        <div className="container mx-auto px-6 py-12" dir="rtl">
          <div className="max-w-2xl mx-auto">

            {loading && (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <div className="relative mx-auto mb-6 w-20 h-20">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full animate-spin">
                    <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full opacity-80">
                      <div className="absolute inset-1 bg-gradient-to-br from-teal-200 to-teal-300 rounded-full opacity-90">
                        <div className="absolute top-3 left-4 w-2 h-2 bg-teal-700 rounded-full"></div>
                        <div className="absolute bottom-3 right-3 w-2 h-2 bg-teal-700 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 font-arabic mb-2">جاري معالجة الدفع</h3>
                <p className="text-gray-600 font-arabic mb-4">يرجى الانتظار، لا تغلق الصفحة</p>
              </div>
            )}

            {!loading && status === 'success' && (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <div className="text-6xl mb-6">🎉</div>
                <h1 className="text-3xl font-bold text-green-600 font-arabic mb-4">
                  تم الدفع بنجاح!
                </h1>
                <p className="text-xl text-gray-600 font-arabic mb-6">
                  شكراً لك، تم تأكيد طلبك ودفعه بنجاح وتم تفريغ السلة
                </p>

                {orderDetails && (
                  <div className="bg-green-50 rounded-lg p-6 mb-6 text-right">
                    <h3 className="text-lg font-semibold text-green-800 font-arabic mb-3">
                      تفاصيل الطلب
                    </h3>
                    <div className="space-y-2 text-green-700 font-arabic">
                      <p><strong>رقم الطلب:</strong> #{orderDetails.orderNumber}</p>
                      <p><strong>المجموع:</strong> {orderDetails.totalAmount} جنيه</p>
                      <p><strong>حالة الدفع:</strong> مدفوع ✅</p>
                      <p><strong>حالة الطلب:</strong> مؤكد ✅</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <p className="text-gray-600 font-arabic">
                    سيتم التواصل معك قريباً لتأكيد تفاصيل التوصيل
                  </p>

                  <button
                    onClick={handleContinueShopping}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-arabic font-bold px-8 py-3 rounded-lg transition-colors"
                  >
                    العودة للمتجر
                  </button>
                </div>
              </div>
            )}

            {!loading && status === 'paid-order-failed' && (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <div className="text-6xl mb-6">⚠️</div>
                <h1 className="text-3xl font-bold text-amber-600 font-arabic mb-4">
                  تم الدفع لكن لم يُسجَّل الطلب
                </h1>
                <p className="text-xl text-gray-600 font-arabic mb-6">
                  تم خصم المبلغ من بطاقتك بنجاح، لكن حدث خطأ تقني أثناء إنشاء الطلب
                </p>

                <div className="bg-amber-50 rounded-lg p-6 mb-6 text-right">
                  <p className="text-amber-800 font-arabic">
                    يرجى التواصل معنا فوراً على الرقم 15596 مع ذكر رقم هاتفك ووقت الدفع، وسنقوم بتأكيد طلبك يدوياً.
                  </p>
                </div>

                <button
                  onClick={handleContinueShopping}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-arabic font-bold px-8 py-3 rounded-lg transition-colors"
                >
                  العودة للمتجر
                </button>
              </div>
            )}

            {!loading && status === 'failed' && (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <div className="text-6xl mb-6">😞</div>
                <h1 className="text-3xl font-bold text-red-600 font-arabic mb-4">
                  فشل في الدفع
                </h1>
                <p className="text-xl text-gray-600 font-arabic mb-6">
                  عذراً، حدث خطأ أثناء معالجة الدفع
                </p>

                <div className="bg-red-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-red-800 font-arabic mb-3">
                    ماذا يمكنك فعله؟
                  </h3>
                  <div className="text-red-700 font-arabic text-right">
                    <p>• تأكد من صحة بيانات البطاقة</p>
                    <p>• تأكد من وجود رصيد كافي</p>
                    <p>• جرب طريقة دفع أخرى</p>
                    <p>• اتصل بالبنك للتأكد من عدم حجب المعاملة</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleRetryPayment}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-arabic font-bold px-6 py-3 rounded-lg transition-colors"
                  >
                    إعادة المحاولة
                  </button>

                  <button
                    onClick={handleContinueShopping}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-arabic font-bold px-6 py-3 rounded-lg transition-colors"
                  >
                    العودة للمتجر
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
