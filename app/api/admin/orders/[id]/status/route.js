import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../../../../lib/mongodb'
import Order from '../../../../../../models/Order'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'

const verifyAuth = (request) => {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'غير مصرح', status: 401 }
  }

  try {
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET)
    return { user: decoded }
  } catch (error) {
    return { error: 'رمز المصادقة غير صالح', status: 401 }
  }
}

// PUT - Update order status
export async function PUT(request, { params }) {
  const auth = verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    await dbConnect()
    
    const { id } = params // This is the orderNumber
    const { status } = await request.json()
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'حالة الطلب غير صالحة' },
        { status: 400 }
      )
    }

    // Update order by orderNumber
    const updatedOrder = await Order.findOneAndUpdate(
      { orderNumber: id },
      { status },
      { new: true, runValidators: true }
    ).lean()
    
    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      )
    }

    // Format response
    const formattedOrder = {
      ...updatedOrder,
      id: updatedOrder.orderNumber,
      _id: undefined
    }

    return NextResponse.json({
      success: true,
      order: formattedOrder,
      message: 'تم تحديث حالة الطلب بنجاح'
    })

  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث حالة الطلب' },
      { status: 500 }
    )
  }
}