'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function CartPage() {
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [orderData, setOrderData] = useState({
    customerName: '',
    phone: '',
    address: '',
    floor: '',
    apartment: '',
    landmark: '',
    deliveryMethod: 'delivery', // 'delivery' or 'pickup'
    selectedBranch: '',
    paymentMethod: 'cash',
    notes: ''
  })

  // Save order data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('memoOrderData', JSON.stringify(orderData))
  }, [orderData])

  // Load order data from localStorage on component mount
  useEffect(() => {
    const savedOrderData = localStorage.getItem('memoOrderData')
    if (savedOrderData) {
      setOrderData(JSON.parse(savedOrderData))
    }
  }, [])

  // Save current step to localStorage
  useEffect(() => {
    localStorage.setItem('memoCurrentStep', currentStep.toString())
  }, [currentStep])

  // Load current step from localStorage on component mount
  useEffect(() => {
    const savedStep = localStorage.getItem('memoCurrentStep')
    if (savedStep && cartItems.length > 0) {
      setCurrentStep(parseInt(savedStep))
    }
  }, [cartItems])

  useEffect(() => {
    // Simulate loading cart items from localStorage or API
    const timer = setTimeout(() => {
      const savedCart = localStorage.getItem('memoCart')
      if (savedCart) {
        setCartItems(JSON.parse(savedCart))
      }
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const removeFromCart = (itemKey) => {
    const updatedCart = cartItems.filter(item => (item.productKey || item.id) !== itemKey)
    setCartItems(updatedCart)
    localStorage.setItem('memoCart', JSON.stringify(updatedCart))
    // Dispatch event to update header cart count
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }

  const updateQuantity = (itemKey, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemKey)
      return
    }
    
    const updatedCart = cartItems.map(item => 
      (item.productKey || item.id) === itemKey ? { ...item, quantity: newQuantity } : item
    )
    setCartItems(updatedCart)
    localStorage.setItem('memoCart', JSON.stringify(updatedCart))
    // Dispatch event to update header cart count
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getDeliveryFee = () => {
    return orderData.deliveryMethod === 'delivery' ? 20 : 0
  }

  const getFinalTotal = () => {
    return getTotalPrice() + getDeliveryFee()
  }

  const clearOrderData = () => {
    // Clear all saved order data when order is completed
    localStorage.removeItem('memoOrderData')
    localStorage.removeItem('memoCurrentStep')
    localStorage.removeItem('memoCart')
    setOrderData({
      customerName: '',
      phone: '',
      address: '',
      floor: '',
      apartment: '',
      landmark: '',
      deliveryMethod: 'delivery',
      selectedBranch: '',
      paymentMethod: 'cash',
      notes: ''
    })
    setCurrentStep(1)
    setCartItems([])
    // Dispatch event to update header cart count
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }

  const handleOrderSubmit = async () => {
    try {
      setIsSubmitting(true)
      // Prepare the order payload
      const orderPayload = {
        customerName: orderData.customerName,
        phone: orderData.phone,
        address: orderData.address,
        floor: orderData.floor,
        apartment: orderData.apartment,
        landmark: orderData.landmark,
        deliveryMethod: orderData.deliveryMethod,
        selectedBranch: orderData.selectedBranch,
        paymentMethod: orderData.paymentMethod,
        items: cartItems.map(item => ({
          id: item.id,
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          notes: item.notes || '',
          customization: item.customization || null
        })),
        totalAmount: getFinalTotal(),
        notes: orderData.notes || ''
      }

      console.log('Submitting order:', orderPayload)
      console.log('Cart items with customization:', cartItems.map(item => ({
        name: item.name,
        customization: item.customization
      })))

      // Submit order to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload)
      })

      const result = await response.json()

      if (response.ok) {
        // Success - show success message with order number
        alert(`تم إرسال طلبك بنجاح!\nرقم الطلب: ${result.order.orderNumber}\nسيتم التواصل معك قريباً`)
        
        // Clear all data after successful order
        clearOrderData()
        
        // Optionally redirect to success page or order details
        // window.location.href = `/order-success?orderNumber=${result.order.orderNumber}`
      } else {
        // Error - show error message
        alert(`خطأ في إرسال الطلب: ${result.error || 'حدث خطأ غير متوقع'}`)
      }

    } catch (error) {
      console.error('Error submitting order:', error)
      alert('حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
        {/* Main loading container */}
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Simple elegant spinner */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-l-orange-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>

          {/* Loading text */}
          <div className="text-center">
            <p className="text-lg text-white font-arabic animate-pulse">
              جاري تحميل السلة...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Header />
      
      {/* Order submission loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center">
            <div className="relative mx-auto mb-6 w-20 h-20">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full animate-spin">
                <div className="absolute inset-2 bg-gradient-to-br from-red-400 to-red-500 rounded-full opacity-80">
                  <div className="absolute inset-1 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full opacity-90">
                    <div className="absolute top-3 left-4 w-2 h-2 bg-red-700 rounded-full"></div>
                    <div className="absolute bottom-3 right-3 w-2 h-2 bg-red-700 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 font-arabic mb-2">جاري إرسال طلبك</h3>
            <p className="text-gray-600 font-arabic mb-4">يرجى الانتظار، لا تغلق الصفحة</p>
            
            <div className="flex justify-center space-x-1" dir="ltr">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <div className="pt-20">
      
      {cartItems.length === 0 ? (
        // Empty Cart State
        <div className="relative">
          {/* Empty Cart Content */}
          <div className="relative z-10 container mx-auto px-6 py-32" dir="rtl">
            <div className="max-w-lg mx-auto text-center">
              
              {/* Shopping Bag Illustration */}
              <div className="mb-8">
                <div className="relative mx-auto w-48 h-48">
                  {/* Background decorative shapes */}
                  <div className="absolute top-4 left-8 w-20 h-8 bg-teal-200 rounded-full opacity-60"></div>
                  <div className="absolute top-12 right-4 w-16 h-16 bg-teal-100 rounded-full opacity-40"></div>
                  <div className="absolute bottom-8 left-12 w-12 h-12 bg-teal-300 rounded-full opacity-50"></div>
                  <div className="absolute bottom-16 right-8 w-8 h-8 bg-teal-200 rounded-full opacity-60"></div>
                  
                  {/* Shopping bag with smiley face */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Bag handle */}
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-8 h-8 border-4 border-teal-500 rounded-t-full"></div>
                      </div>
                      
                      {/* Bag body */}
                      <div className="w-32 h-40 bg-white border-4 border-teal-500 rounded-lg shadow-lg flex items-center justify-center">
                        {/* Smiley face */}
                        <div className="text-center">
                          {/* Eyes */}
                          <div className="flex justify-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                          </div>
                          {/* Smile */}
                          <div className="w-8 h-4 border-b-3 border-teal-500 rounded-b-full"></div>
                        </div>
                      </div>
                      
                      {/* Decorative lines */}
                      <div className="absolute -left-8 top-8 w-6 h-0.5 bg-teal-400"></div>
                      <div className="absolute -right-8 top-12 w-4 h-0.5 bg-teal-400"></div>
                      <div className="absolute -left-6 bottom-8 w-4 h-0.5 bg-teal-400"></div>
                      <div className="absolute -right-6 bottom-12 w-6 h-0.5 bg-teal-400"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Empty Cart Messages */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 font-arabic mb-4">
                سلتك فاضية؟ ولا بيهمك!
              </h1>
              
              <p className="text-xl text-gray-600 font-arabic mb-8 leading-relaxed">
                منيو ميموز مليان اختيارات هتحبها
              </p>

              {/* Order Now Button */}
              <Link
                href="/"
                className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-arabic font-bold text-lg px-8 py-4 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                اطلب دلوقتي
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // Cart with Items - 3 Step Process
        <div className="container mx-auto px-6 py-8" dir="rtl">
          <div className="max-w-6xl mx-auto">
            
            {/* Steps Header */}
            <div className="flex items-center justify-center mb-8 bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-4">
                {/* Step 1 */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentStep >= 1 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 1 ? 'bg-white text-teal-500' : 'bg-gray-300'}`}>
                    1
                  </div>
                  <span className="font-arabic font-semibold">تفاصيل السلة</span>
                </div>
                
                {/* Arrow */}
                <div className="text-gray-400">←</div>
                
                {/* Step 2 */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentStep >= 2 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 2 ? 'bg-white text-teal-500' : 'bg-gray-300'}`}>
                    2
                  </div>
                  <span className="font-arabic font-semibold">بيانات الطلب</span>
                </div>
                
                {/* Arrow */}
                <div className="text-gray-400">←</div>
                
                {/* Step 3 */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentStep >= 3 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 3 ? 'bg-white text-teal-500' : 'bg-gray-300'}`}>
                    3
                  </div>
                  <span className="font-arabic font-semibold">إتمام الطلب</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2">
                
                {/* Step 1: Cart Items */}
                {currentStep === 1 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-gray-800 font-arabic mb-6">مراجعة وإتمام الطلب</h2>
                    
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.productKey || item.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                          <Image 
                            src={item.image} 
                            alt={item.name} 
                            width={80} 
                            height={80} 
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0" 
                          />
                          
                          <div className="flex-grow">
                            <h3 className="font-arabic font-bold text-lg text-gray-800 mb-1">{item.name}</h3>
                            <p className="font-arabic text-gray-600 mb-2">{item.description}</p>
                            
                            {/* Show customization details */}
                            {item.customization && (
                              <div className="bg-gray-50 p-3 rounded-md mb-2 text-sm">
                                {/* Regular product customizations */}
                                {item.customization.variants && item.customization.variants.length > 0 && (
                                  <div className="mb-2">
                                    <span className="font-arabic font-semibold text-gray-700">المواصفات: </span>
                                    {item.customization.variants.map((variant, index) => (
                                      <span key={index} className="font-arabic text-gray-600">
                                        {variant.name}
                                        {variant.price > 0 && ` (+${variant.price} جنيه)`}
                                        {index < item.customization.variants.length - 1 && ', '}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                
                                {item.customization.addons && item.customization.addons.length > 0 && (
                                  <div className="mb-2">
                                    <span className="font-arabic font-semibold text-gray-700">الإضافات: </span>
                                    {item.customization.addons.map((addon, index) => (
                                      <span key={index} className="font-arabic text-gray-600">
                                        {addon.name}
                                        {addon.price > 0 && ` (+${addon.price} جنيه)`}
                                        {index < item.customization.addons.length - 1 && ', '}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Half-half pizza customizations */}
                                {item.customization.leftSide && item.customization.leftSide.pizza && (
                                  <div className="mb-2">
                                    <span className="font-arabic font-semibold text-gray-700">النصف الأيسر: </span>
                                    <span className="font-arabic text-gray-600">{item.customization.leftSide.pizza.name}</span>
                                  </div>
                                )}
                                
                                {item.customization.rightSide && item.customization.rightSide.pizza && (
                                  <div className="mb-2">
                                    <span className="font-arabic font-semibold text-gray-700">النصف الأيمن: </span>
                                    <span className="font-arabic text-gray-600">{item.customization.rightSide.pizza.name}</span>
                                  </div>
                                )}

                                {item.customization.notes && (
                                  <div>
                                    <span className="font-arabic font-semibold text-gray-700">ملاحظات: </span>
                                    <span className="font-arabic text-gray-600">{item.customization.notes}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="font-arabic text-lg font-bold text-teal-600">
                              EGP {item.price}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => updateQuantity(item.productKey || item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold"
                              >
                                -
                              </button>
                              <div className="w-10 h-8 bg-teal-500 text-white rounded flex items-center justify-center font-arabic font-bold">
                                {item.quantity}
                              </div>
                              <button 
                                onClick={() => updateQuantity(item.productKey || item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 text-left">
                      <button 
                        onClick={() => setCurrentStep(2)}
                        className="bg-teal-500 hover:bg-teal-600 text-white font-arabic font-bold px-8 py-3 rounded-lg transition-colors"
                      >
                        التالي: اختيار طريقة الاستلام
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Order Details */}
                {currentStep === 2 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-gray-800 font-arabic mb-6">طريقة الاستلام</h2>
                    
                    {/* Delivery Method Tabs */}
                    <div className="flex mb-6">
                      <button 
                        className={`flex-1 py-3 px-6 text-center font-arabic font-semibold rounded-t-lg transition-colors ${
                          orderData.deliveryMethod === 'delivery' 
                            ? 'bg-teal-500 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        onClick={() => setOrderData({...orderData, deliveryMethod: 'delivery'})}
                      >
                        🚚 توصيل
                      </button>
                      <button 
                        className={`flex-1 py-3 px-6 text-center font-arabic font-semibold rounded-t-lg transition-colors ${
                          orderData.deliveryMethod === 'pickup' 
                            ? 'bg-teal-500 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        onClick={() => setOrderData({...orderData, deliveryMethod: 'pickup'})}
                      >
                        🏪 استلام من الفرع
                      </button>
                    </div>
                    
                    <form className="space-y-6">
                      {/* Delivery Tab Content */}
                      {orderData.deliveryMethod === 'delivery' && (
                        <div className="space-y-6">
                          {/* Customer Name */}
                          <div>
                            <label className="block font-arabic font-semibold text-gray-700 mb-2">
                              الاسم
                            </label>
                            <input
                              type="text"
                              value={orderData.customerName}
                              onChange={(e) => setOrderData({...orderData, customerName: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-arabic"
                              placeholder="اسم المستلم"
                            />
                          </div>

                          {/* Phone Number */}
                          <div>
                            <label className="block font-arabic font-semibold text-gray-700 mb-2">
                              📱 رقم الهاتف
                            </label>
                            <input
                              type="tel"
                              value={orderData.phone}
                              onChange={(e) => setOrderData({...orderData, phone: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-arabic"
                              placeholder="رقمك على WhatsApp"
                            />
                            <p className="text-sm text-gray-500 font-arabic mt-1">
                              هذا الرقم سيتم استخدامه للتواصل معاك وتوصيلك الطلب أول بأول
                            </p>
                          </div>

                          {/* Address Section */}
                          <div>
                            <label className="block font-arabic font-semibold text-gray-700 mb-2">
                              📍 العنوان
                            </label>
                            
                            {/* Main Address */}
                            <div className="mb-3">
                              <input
                                type="text"
                                value={orderData.address}
                                onChange={(e) => setOrderData({...orderData, address: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-arabic"
                                placeholder="الشارع والمنطقة"
                              />
                            </div>

                            {/* Floor and Apartment */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <input
                                type="text"
                                value={orderData.floor}
                                onChange={(e) => setOrderData({...orderData, floor: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-arabic"
                                placeholder="الدور"
                              />
                              <input
                                type="text"
                                value={orderData.apartment}
                                onChange={(e) => setOrderData({...orderData, apartment: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-arabic"
                                placeholder="رقم الشقة"
                              />
                            </div>

                            {/* Landmark */}
                            <input
                              type="text"
                              value={orderData.landmark}
                              onChange={(e) => setOrderData({...orderData, landmark: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-arabic"
                              placeholder="علامة مميزة"
                            />
                          </div>

                          {/* Contact Options */}
                          <div>
                            <label className="block font-arabic font-semibold text-gray-700 mb-3">
                              📞 بيانات التواصل
                            </label>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <p className="text-sm text-blue-700 font-arabic leading-relaxed">
                                💡 هنجي نتصل عليك للتأكد وتنسيق الوصول. إحرص ان يكون رقمك شغال وقت الطلب للتواصل السريع.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pickup Tab Content */}
                      {orderData.deliveryMethod === 'pickup' && (
                        <div className="space-y-6">
                          {/* Customer Name */}
                          <div>
                            <label className="block font-arabic font-semibold text-gray-700 mb-2">
                              الاسم
                            </label>
                            <input
                              type="text"
                              value={orderData.customerName}
                              onChange={(e) => setOrderData({...orderData, customerName: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-arabic"
                              placeholder="اسم المستلم"
                            />
                          </div>

                          {/* Branch Selection */}
                          <div>
                            <label className="block font-arabic font-semibold text-gray-700 mb-2">
                              📍 اختيار الفرع
                            </label>
                            <select
                              value={orderData.selectedBranch}
                              onChange={(e) => setOrderData({...orderData, selectedBranch: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-arabic"
                            >
                              <option value="">اختر الفرع الأقرب ليك</option>
                              <option value="maadi">فرع المعادي - شارع 9</option>
                              <option value="nasr-city">فرع مدينة نصر - العباسية</option>
                              <option value="heliopolis">فرع مصر الجديدة - الكوربة</option>
                              <option value="zamalek">فرع الزمالك - شارع 26 يوليو</option>
                            </select>
                          </div>

                          {/* Contact Info */}
                          <div>
                            <label className="block font-arabic font-semibold text-gray-700 mb-2">
                              📱 بيانات التواصل
                            </label>
                            <input
                              type="tel"
                              value={orderData.phone}
                              onChange={(e) => setOrderData({...orderData, phone: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-arabic"
                              placeholder="رقمك على WhatsApp"
                            />
                            <p className="text-sm text-gray-500 font-arabic mt-1">
                              هنتصل عليك لما طلبك يبقى جاهز للاستلام من الفرع
                            </p>
                          </div>

                          {/* Branch Info */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-green-600">✅</span>
                              <span className="font-arabic font-semibold text-green-700">استلام مجاني من الفرع</span>
                            </div>
                            <p className="text-sm text-green-600 font-arabic">
                              وفر رسوم التوصيل واستلم طلبك من أقرب فرع ليك في أي وقت يناسبك
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Notes Section (Common for both) */}
                      <div>
                        <label className="block font-arabic font-semibold text-gray-700 mb-2">
                          📝 ملاحظات إضافية
                        </label>
                        <textarea
                          value={orderData.notes}
                          onChange={(e) => setOrderData({...orderData, notes: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-arabic"
                          rows="3"
                          placeholder="أي ملاحظات أو طلبات خاصة..."
                        />
                      </div>
                    </form>
                    
                    <div className="mt-8 flex justify-between">
                      <button 
                        onClick={() => setCurrentStep(1)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-arabic font-bold px-6 py-3 rounded-lg transition-colors"
                      >
                        العودة للسلة
                      </button>
                      <button 
                        onClick={() => setCurrentStep(3)}
                        className="bg-teal-500 hover:bg-teal-600 text-white font-arabic font-bold px-8 py-3 rounded-lg transition-colors"
                        disabled={!orderData.customerName || !orderData.phone || (orderData.deliveryMethod === 'delivery' && !orderData.address) || (orderData.deliveryMethod === 'pickup' && !orderData.selectedBranch)}
                      >
                        التالي: إتمام الطلب
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-gray-800 font-arabic mb-6">وسيلة الدفع</h2>
                    
                    {/* Payment Method Tabs */}
                    <div className="flex mb-6">
                      <button 
                        className={`flex-1 py-3 px-6 text-center font-arabic font-semibold rounded-t-lg transition-colors ${
                          orderData.paymentMethod === 'card' 
                            ? 'bg-teal-500 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        onClick={() => setOrderData({...orderData, paymentMethod: 'card'})}
                      >
                        💳 بطاقة بنكية
                      </button>
                      <button 
                        className={`flex-1 py-3 px-6 text-center font-arabic font-semibold rounded-t-lg transition-colors ${
                          orderData.paymentMethod === 'cash' 
                            ? 'bg-teal-500 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        onClick={() => setOrderData({...orderData, paymentMethod: 'cash'})}
                      >
                        💵 كاش عند الاستلام
                      </button>
                    </div>

                    {/* Card Payment Tab */}
                    {orderData.paymentMethod === 'card' && (
                      <div className="space-y-6">
                        {/* Security Message */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-blue-600">🔒</span>
                            <span className="font-arabic font-semibold text-blue-700">الدفع آمن ومحمي</span>
                          </div>
                          <p className="text-sm text-blue-600 font-arabic">
                            كل المعاملات مؤمنة عبر تقنية التشفير SSL وبنوك معتمدة
                          </p>
                        </div>

                        {/* Card Details Form */}
                        <div className="space-y-4">
                          {/* Card Number */}
                          <div>
                            <label className="block font-arabic font-semibold text-gray-700 mb-2">
                              رقم البطاقة
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono text-lg"
                                placeholder="1234 5678 9012 3456"
                                maxLength="19"
                              />
                              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                <span className="text-blue-600 font-bold text-sm">VISA</span>
                                <span className="text-red-600 font-bold text-sm">●●</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 font-arabic mt-1">
                              أدخل الـ 16 رقم الموجودين على البطاقة البنكية
                            </p>
                          </div>

                          {/* Expiry and CVV */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block font-arabic font-semibold text-gray-700 mb-2">
                                تاريخ الانتهاء
                              </label>
                              <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono"
                                placeholder="MM/YY"
                                maxLength="5"
                              />
                            </div>
                            <div>
                              <label className="block font-arabic font-semibold text-gray-700 mb-2">
                                CVV
                              </label>
                              <input
                                type="password"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono"
                                placeholder="123"
                                maxLength="4"
                              />
                            </div>
                          </div>

                          {/* Cardholder Name */}
                          <div>
                            <label className="block font-arabic font-semibold text-gray-700 mb-2">
                              اسم حامل البطاقة
                            </label>
                            <input
                              type="text"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              placeholder="الاسم كما هو مكتوب على البطاقة"
                            />
                          </div>
                        </div>

                        {/* SSL Security Info */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-green-600">
                            <span>🔐</span>
                            <span className="font-arabic text-sm">
                              الدفع الإلكتروني آمن ومحمي عبر شهادات SSL المعتمدة من البنوك
                            </span>
                          </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <input type="checkbox" className="mt-1" />
                            <p className="text-sm text-blue-600 font-arabic">
                              أوافق على شروط وأحكام الدفع وسياسة الخصوصية للمتجر
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cash Payment Tab */}
                    {orderData.paymentMethod === 'cash' && (
                      <div className="space-y-6">
                        {/* Cash Payment Info */}
                        <div className="text-center py-8">
                          <div className="text-6xl mb-4">�</div>
                          <h3 className="text-2xl font-bold text-gray-800 font-arabic mb-3">
                            كاش عند الاستلام
                          </h3>
                          <p className="text-gray-600 font-arabic text-lg">
                            ادفع نقداً عند استلام طلبك
                          </p>
                        </div>

                        {/* Payment Instructions */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-yellow-600">💡</span>
                            <span className="font-arabic font-semibold text-yellow-700">تعليمات الدفع</span>
                          </div>
                          <p className="text-sm text-yellow-600 font-arabic">
                            تأكد من تحضير المبلغ الكامل نقداً عند الاستلام. المندوب معه فكة للطوارئ بس أحسن تجهز المبلغ ضبط.
                          </p>
                        </div>

                        {/* Order Summary for Cash */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-arabic font-semibold text-gray-700 mb-3">المبلغ المطلوب عند الاستلام:</h4>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-teal-600 font-arabic">
                              EGP {getFinalTotal().toFixed(2)}
                            </div>
                            <p className="text-gray-500 font-arabic text-sm mt-1">شامل جميع الرسوم</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-8 flex justify-between">
                      <button 
                        onClick={() => setCurrentStep(2)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-arabic font-bold px-6 py-3 rounded-lg transition-colors"
                      >
                        العودة لطريقة الاستلام
                      </button>
                      <button 
                        className={`${isSubmitting ? 'bg-gray-400' : 'bg-teal-500 hover:bg-teal-600'} text-white font-arabic font-bold px-8 py-3 rounded-lg transition-colors relative`}
                        onClick={handleOrderSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                            جاري إرسال الطلب...
                          </div>
                        ) : (
                          orderData.paymentMethod === 'card' ? 'ادفع واتمم الطلب' : 'إتمام الطلب'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Order Summary Sidebar - Persistent across all steps */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                  <h2 className="text-xl font-bold text-gray-800 font-arabic mb-6">ملخص الطلب</h2>
                  
                  {/* Items List */}
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-arabic font-semibold text-gray-800">{item.name}</span>
                          <span className="font-arabic font-bold text-gray-800">EGP {item.price}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span className="font-arabic">الكمية: {item.quantity}</span>
                          <span className="font-arabic">EGP {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Promo Code Section (if on step 3) */}
                  {currentStep === 3 && (
                    <div className="mb-6">
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="كود خصم"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-arabic focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-arabic font-semibold">
                          تطبيق
                        </button>
                      </div>
                      
                      {/* Applied Discount */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="font-arabic text-sm text-green-700">عندك كود خصم؟</span>
                          <span className="font-arabic text-sm font-bold text-green-600">-EGP 20.00</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <hr className="my-4" />
                  
                  {/* Pricing Breakdown */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between font-arabic text-gray-700">
                      <span>إجمالي الطلب</span>
                      <span>EGP {getTotalPrice().toFixed(2)}</span>
                    </div>
                    
                    {currentStep === 3 && (
                      <div className="flex justify-between font-arabic text-green-600">
                        <span>خصم</span>
                        <span>-EGP 20.00</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between font-arabic text-gray-700">
                      <span>رسوم التوصيل</span>
                      <span>{getDeliveryFee() === 0 ? 'مجاناً' : `EGP ${getDeliveryFee().toFixed(2)}`}</span>
                    </div>
                  </div>
                  
                  <hr className="my-4" />
                  
                  {/* Final Total */}
                  <div className="flex justify-between font-arabic font-bold text-xl text-gray-800">
                    <span>الإجمالي</span>
                    <span>EGP {currentStep === 3 ? (getFinalTotal() - 20).toFixed(2) : getFinalTotal().toFixed(2)}</span>
                  </div>

                  {/* Payment Method Display (if on step 3) */}
                  {currentStep === 3 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-arabic text-sm text-gray-600">طريقة الدفع:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-arabic text-sm font-semibold">
                            {orderData.paymentMethod === 'card' ? 'بطاقة بنكية' : 'كاش عند الاستلام'}
                          </span>
                          <span className="text-lg">
                            {orderData.paymentMethod === 'card' ? '💳' : '💵'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Method Display (if step 2 or 3) */}
                  {currentStep >= 2 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-arabic text-sm text-gray-600">طريقة الاستلام:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-arabic text-sm font-semibold">
                            {orderData.deliveryMethod === 'delivery' ? 'توصيل للمنزل' : 'استلام من الفرع'}
                          </span>
                          <span className="text-lg">
                            {orderData.deliveryMethod === 'delivery' ? '🚚' : '🏪'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
        <Footer />
      </div>
    </div>
  )
}