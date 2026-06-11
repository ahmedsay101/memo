import { NextResponse } from 'next/server'
import { retrieveOrder, verifyPaymentResult } from '../../../../../lib/mpgs'

export async function POST(request) {
  try {
    const body = await request.json()
    const { orderId, resultIndicator, successIndicator, totalAmount } = body

    if (!orderId || !resultIndicator || !successIndicator || !totalAmount) {
      return NextResponse.json(
        { success: false, error: 'بيانات التحقق من الدفع غير مكتملة' },
        { status: 400 }
      )
    }

    const order = await retrieveOrder(orderId)
    const verification = verifyPaymentResult({
      order,
      expectedAmount: totalAmount,
      resultIndicator,
      successIndicator,
    })

    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.reason },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      orderId,
      status: order.status,
      capturedAmount: order.totalCapturedAmount,
    })
  } catch (error) {
    console.error('MPGS verification error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
