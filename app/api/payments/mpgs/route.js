import { NextResponse } from 'next/server'
import { createCheckoutSession, getMpgsConfig } from '../../../../lib/mpgs'

export async function POST(request) {
  try {
    const body = await request.json()
    const { totalAmount, customerName } = body

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'مبلغ الطلب غير صالح' },
        { status: 400 }
      )
    }

    const orderId = `MEMO-${Date.now()}`
    const returnUrl = process.env.MPGS_CALLBACK_URL || `${process.env.NEXTAUTH_URL}/payment-callback`

    const session = await createCheckoutSession({
      orderId,
      amount: totalAmount,
      returnUrl,
      description: `Memo Pizza - ${customerName || 'Customer'}`,
    })

    const config = getMpgsConfig()

    return NextResponse.json({
      success: true,
      orderId,
      sessionId: session.sessionId,
      successIndicator: session.successIndicator,
      merchantId: config.merchantId,
      checkoutScriptUrl: config.checkoutScriptUrl,
      message: 'MPGS checkout session created successfully',
    })
  } catch (error) {
    console.error('MPGS session error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment session' },
      { status: 500 }
    )
  }
}
