import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../../lib/mongodb'
import Order from '../../../../models/Order'

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

// GET - Fetch all orders
export async function GET(request) {
  const auth = verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    await dbConnect()
    
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean()

    // Convert _id to id for frontend compatibility
    const formattedOrders = orders.map(order => ({
      ...order,
      id: order.orderNumber, // Use orderNumber as id for display
      _id: undefined
    }))

    return NextResponse.json({
      success: true,
      orders: formattedOrders
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الطلبات' },
      { status: 500 }
    )
  }
}

// POST - Create new order (this would typically be called from the public website)
export async function POST(request) {
  try {
    await dbConnect()
    
    const data = await request.json()
    
    // Validate required fields
    if (!data.customerName || !data.phone || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: 'بيانات الطلب غير مكتملة' },
        { status: 400 }
      )
    }

    // Calculate total amount
    const totalAmount = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Create new order
    const order = new Order({
      customerName: data.customerName,
      phone: data.phone,
      address: data.address || '',
      branch: data.branch || 'فرع الرياض الرئيسي',
      items: data.items,
      totalAmount,
      notes: data.notes || ''
    })

    await order.save()

    // Format response
    const formattedOrder = {
      ...order.toObject(),
      id: order.orderNumber,
      _id: undefined
    }

    return NextResponse.json({
      success: true,
      order: formattedOrder,
      message: 'تم إنشاء الطلب بنجاح'
    })

  } catch (error) {
    console.error('Error creating order:', error)
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        { error: messages.join(', ') },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الطلب' },
      { status: 500 }
    )
  }
}