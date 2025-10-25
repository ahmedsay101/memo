import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../../lib/mongodb'
import Product from '../../../../models/Product'
import Order from '../../../../models/Order'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      
      await dbConnect()
      
      // Get real statistics from database
      const [
        totalProducts,
        totalOrders,
        pendingOrders,
        todayOrders
      ] = await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        })
      ])

      const stats = {
        totalProducts,
        totalOrders,
        pendingOrders,
        todayOrders
      }

      return NextResponse.json(stats)

    } catch (jwtError) {
      return NextResponse.json(
        { error: 'رمز المصادقة غير صالح' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}