import { NextResponse } from 'next/server'

// Paymob configuration
const PAYMOB_SECRET_KEY = process.env.PAYMOB_SECRET_KEY || process.env.PAYMOB_API_KEY
const PAYMOB_PUBLIC_KEY = process.env.PAYMOB_PUBLIC_KEY
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID

export async function POST(request) {
  try {
    const body = await request.json()
    const { 
      orderData, 
      cartItems, 
      totalAmount, 
      customerName, 
      phone, 
      email 
    } = body

    // Use the new Intention API
    const intentionResponse = await fetch('https://accept.paymob.com/v1/intention/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${PAYMOB_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(totalAmount * 100), // Amount in cents
        currency: 'EGP',
        payment_methods: [parseInt(PAYMOB_INTEGRATION_ID)],
        items: [
          // Cart items
          ...cartItems.map(item => ({
            name: item.name,
            amount: Math.round(item.price * 100), // Unit price in cents
            description: item.description || item.name,
            quantity: item.quantity
          })),
          // Delivery fee as separate item
          ...(orderData.deliveryMethod === 'delivery' ? [{
            name: 'رسوم التوصيل',
            amount: Math.round((totalAmount - cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)) * 100), // Delivery fee in cents
            description: 'رسوم توصيل الطلب',
            quantity: 1
          }] : [])
        ],
        billing_data: {
          apartment: orderData.apartment || 'NA',
          first_name: customerName.split(' ')[0] || customerName,
          last_name: customerName.split(' ').slice(1).join(' ') || 'Customer',
          street: orderData.address || 'NA',
          building: 'NA',
          phone_number: phone,
          city: 'Cairo',
          country: 'EG',
          email: email || `${phone}@memo.com`,
          floor: orderData.floor || 'NA',
          state: 'Cairo'
        },
        customer: {
          first_name: customerName.split(' ')[0] || customerName,
          last_name: customerName.split(' ').slice(1).join(' ') || 'Customer',
          email: email || `${phone}@memo.com`
        },
        expiration: 3600, // 1 hour
        special_reference: `MEMO-${Date.now()}`,
        notification_url: process.env.PAYMOB_WEBHOOK_URL,
        redirection_url: process.env.PAYMOB_CALLBACK_URL
      })
    })

    const intentionData = await intentionResponse.json()
    
    if (!intentionResponse.ok) {
      console.error('Paymob API error response:', intentionData)
      throw new Error(`Paymob API error: ${intentionData.detail || JSON.stringify(intentionData)}`)
    }
    
    if (!intentionData.client_secret) {
      console.error('Missing client_secret in response:', intentionData)
      throw new Error('Failed to create payment intention - missing client_secret')
    }

    // Return the unified checkout URL
    const checkoutUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${PAYMOB_PUBLIC_KEY}&clientSecret=${intentionData.client_secret}`

    return NextResponse.json({
      success: true,
      paymentUrl: checkoutUrl,
      paymobOrderId: intentionData.intention_order_id,
      intentionId: intentionData.id,
      message: 'Payment URL generated successfully'
    })

  } catch (error) {
    console.error('Paymob intention error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process payment'
    }, { status: 500 })
  }
}