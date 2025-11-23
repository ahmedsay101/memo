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
    // Payment successful - update order status in database
    try {
      // Here you would typically:
      // 1. Find the order by Paymob order ID
      // 2. Update the order status to 'paid' or 'confirmed'
      // 3. Send confirmation email/SMS to customer
      // 4. Update inventory if needed

      console.log(`Payment confirmed for order ${order?.id}`)
      
      // Example: Update order in database
      // await updateOrderPaymentStatus(order?.merchant_order_id, 'paid')
      
    } catch (error) {
      console.error('Failed to update order after successful payment:', error)
    }
  } else if (!success) {
    // Payment failed - handle accordingly
    console.log(`Payment failed for order ${order?.id}:`, txn_response_code)
    
    try {
      // Update order status to 'payment_failed'
      // await updateOrderPaymentStatus(order?.merchant_order_id, 'payment_failed')
    } catch (error) {
      console.error('Failed to update order after failed payment:', error)
    }
  }
}

async function handleDeliveryStatusWebhook(deliveryData) {
  // Handle delivery status updates if using Paymob delivery services
  console.log('Delivery status update:', deliveryData)
}