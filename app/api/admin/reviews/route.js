import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../../lib/mongodb'
import Review from '../../../../models/Review'

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

// GET all reviews (admin)
export async function GET(request) {
  const auth = verifyAuth(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    await dbConnect()
    const reviews = await Review.find().sort({ order: 1 })
    const formatted = reviews.map(r => ({
      id: r._id.toString(),
      name: r.name,
      text: r.text,
      rating: r.rating,
      order: r.order,
      isActive: r.isActive,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }))
    return NextResponse.json({ success: true, reviews: formatted })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'حدث خطأ في جلب التقييمات' }, { status: 500 })
  }
}

// POST create new review
export async function POST(request) {
  const auth = verifyAuth(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    await dbConnect()
    const body = await request.json()

    const lastReview = await Review.findOne().sort({ order: -1 })
    const order = lastReview ? lastReview.order + 1 : 0

    const review = await Review.create({
      name: body.name,
      text: body.text,
      rating: body.rating || 5,
      order,
      isActive: body.isActive !== undefined ? body.isActive : true
    })

    return NextResponse.json({
      success: true,
      review: {
        id: review._id.toString(),
        name: review.name,
        text: review.text,
        rating: review.rating,
        order: review.order,
        isActive: review.isActive
      },
      message: 'تم إضافة التقييم بنجاح'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'حدث خطأ في إضافة التقييم' }, { status: 500 })
  }
}
