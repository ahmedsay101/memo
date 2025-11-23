'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function PaymentCallbackPage() {
  const [status, setStatus] = useState('processing') // processing, success, failed
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    handlePaymentCallback()
  }, [])

  const handlePaymentCallback = async () => {
    try {
      // Get URL parameters from Paymob
      const success = searchParams.get('success')
      const txnResponseCode = searchParams.get('txn_response_code')
      const orderId = searchParams.get('order')
      const hmac = searchParams.get('hmac')

      // Get pending order from localStorage
      const pendingOrderData = localStorage.getItem('pendingOrder')
      
      if (!pendingOrderData) {
        setStatus('failed')
        setLoading(false)
        return
      }

      const pendingOrder = JSON.parse(pendingOrderData)

      if (success === 'true' && txnResponseCode === '200') {
        // Payment successful - create the order in our system
        await createConfirmedOrder(pendingOrder, orderId)
      } else {
        // Payment failed
        setStatus('failed')
        setLoading(false)
      }

    } catch (error) {
      console.error('Payment callback error:', error)
      setStatus('failed')
      setLoading(false)
    }
  }

  const createConfirmedOrder = async (pendingOrder, paymobOrderId) => {
    try {
      // Create the order in our system with payment confirmed
      const orderPayload = {
        customerName: pendingOrder.orderData.customerName,
        phone: pendingOrder.orderData.phone,
        address: pendingOrder.orderData.address,
        floor: pendingOrder.orderData.floor,
        apartment: pendingOrder.orderData.apartment,
        landmark: pendingOrder.orderData.landmark,
        deliveryMethod: pendingOrder.orderData.deliveryMethod,
        selectedBranch: pendingOrder.orderData.selectedBranch,
        paymentMethod: 'card',
        paymentStatus: 'paid',
        paymobOrderId: paymobOrderId,
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
        notes: pendingOrder.orderData.notes || ''
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload)
      })

      const result = await response.json()

      if (response.ok) {
        setStatus('success')
        setOrderDetails(result.order)
        
        // Clear pending order and cart data
        localStorage.removeItem('pendingOrder')
        localStorage.removeItem('memoCart')
        localStorage.removeItem('memoOrderData')
        localStorage.removeItem('memoCurrentStep')
        
        // Dispatch event to update header cart count
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      } else {
        throw new Error(result.error || 'Failed to create order')
      }

    } catch (error) {
      console.error('Order creation error:', error)
      setStatus('failed')
    } finally {
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
                  شكراً لك، تم تأكيد طلبك ودفعه بنجاح
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