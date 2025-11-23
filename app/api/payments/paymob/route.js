import { NextResponse } from 'next/server'

// Paymob configuration - Add these to your environment variables
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID
const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET
const PAYMOB_BASE_URL = 'https://accept.paymob.com/api'

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

    // Step 1: Authentication Request
    const authResponse = await fetch(`${PAYMOB_BASE_URL}/auth/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: PAYMOB_API_KEY
      })
    })

    const authData = await authResponse.json()
    
    if (!authData.token) {
      throw new Error('Failed to authenticate with Paymob')
    }

    const authToken = authData.token

    // Step 2: Create Order at Paymob
    const orderResponse = await fetch(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: orderData.deliveryMethod === 'delivery' ? 'true' : 'false',
        amount_cents: Math.round(totalAmount * 100), // Convert to cents
        currency: 'EGP',
        items: cartItems.map(item => ({
          name: item.name,
          amount_cents: Math.round(item.price * 100),
          description: item.description || '',
          quantity: item.quantity
        }))
      })
    })

    const orderData_paymob = await orderResponse.json()
    
    if (!orderData_paymob.id) {
      throw new Error('Failed to create order at Paymob')
    }

    // Step 3: Generate Payment Key
    const paymentKeyResponse = await fetch(`${PAYMOB_BASE_URL}/acceptance/payment_keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: Math.round(totalAmount * 100),
        expiration: 3600, // 1 hour expiration
        order_id: orderData_paymob.id,
        billing_data: {
          apartment: orderData.apartment || 'NA',
          email: email || `${phone}@memo.com`, // Paymob requires email
          floor: orderData.floor || 'NA',
          first_name: customerName.split(' ')[0] || customerName,
          last_name: customerName.split(' ').slice(1).join(' ') || 'Customer',
          phone_number: phone,
          postal_code: 'NA',
          state: 'Cairo',
          street: orderData.address || 'NA',
          city: 'Cairo',
          country: 'EG',
          building: 'NA'
        },
        currency: 'EGP',
        integration_id: PAYMOB_INTEGRATION_ID
      })
    })

    const paymentKeyData = await paymentKeyResponse.json()
    
    if (!paymentKeyData.token) {
      throw new Error('Failed to generate payment key')
    }

    // Return the payment URL and data
    return NextResponse.json({
      success: true,
      paymentToken: paymentKeyData.token,
      paymentUrl: `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_INTEGRATION_ID}?payment_token=${paymentKeyData.token}`,
      paymobOrderId: orderData_paymob.id,
      message: 'Payment URL generated successfully'
    })

  } catch (error) {
    console.error('Paymob integration error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process payment'
    }, { status: 500 })
  }
}