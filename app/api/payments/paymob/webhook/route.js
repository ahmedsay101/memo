import { NextResponse } from 'next/server'
import crypto from 'crypto'

const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET

// Helper function to verify HMAC signature
function verifyHmacSignature(data, signature) {
  const calculatedSignature = crypto
    .createHmac('sha512', PAYMOB_HMAC_SECRET)
    .update(JSON.stringify(data))
    .digest('hex')
  
  return calculatedSignature === signature
}

export async function POST(request) {
  try {
    const body = await request.json()
    const signature = request.headers.get('x-paymob-signature')

    // Verify webhook signature for security
    if (!verifyHmacSignature(body, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { 
      type, 
      obj: paymentData 
    } = body

    // Handle different webhook types
    switch (type) {
      case 'TRANSACTION':
        await handleTransactionWebhook(paymentData)
        break
      case 'DELIVERY_STATUS':
        await handleDeliveryStatusWebhook(paymentData)
        break
      default:
        console.log('Unhandled webhook type:', type)
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process webhook'
    }, { status: 500 })
  }
}

async function handleTransactionWebhook(paymentData) {
  const {
    success,
    pending,
    amount_cents,
    currency,
    order,
    txn_response_code,
    integration_id
  } = paymentData

  console.log('Payment webhook received:', {
    orderId: order?.id,
    success,
    pending,
    amount: amount_cents / 100,
    currency
  })

  if (success && !pending) {
    // Payment successful - create order in database
    try {
      console.log(`Payment confirmed for order ${order?.id}`)
      
      // Create the order in our system
      const orderResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: paymentData.billing_data?.first_name + ' ' + paymentData.billing_data?.last_name || 'Customer',
          phone: paymentData.billing_data?.phone_number || 'N/A',
          address: paymentData.billing_data?.street || 'N/A',
          floor: paymentData.billing_data?.floor || '',
          apartment: paymentData.billing_data?.apartment || '',
          landmark: '',
          deliveryMethod: 'delivery',
          selectedBranch: '',
          paymentMethod: 'card',
          paymentStatus: 'paid',
          paymobOrderId: order?.id,
          items: [], // Items not available in webhook
          totalAmount: amount_cents / 100,
          notes: `Order created via Paymob webhook - Order ID: ${order?.id}`,
          webhookCreated: true
        })
      })

      if (orderResponse.ok) {
        const orderResult = await orderResponse.json()
        console.log('Order created successfully via webhook:', orderResult.order?._id)
      } else {
        console.error('Failed to create order via webhook:', await orderResponse.text())
      }
      
    } catch (error) {
      console.error('Failed to create order after successful payment:', error)
    }
  } else if (!success) {
    // Payment failed - log the failure
    console.log(`Payment failed for order ${order?.id}:`, txn_response_code)
    
    try {
      // Could implement failed payment tracking here if needed
      console.log('Payment failure recorded')
    } catch (error) {
      console.error('Failed to handle payment failure:', error)
    }
  }
}

async function handleDeliveryStatusWebhook(deliveryData) {
  // Handle delivery status updates if using Paymob delivery services
  console.log('Delivery status update:', deliveryData)
}