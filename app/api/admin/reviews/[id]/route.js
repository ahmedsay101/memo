import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../../../lib/mongodb'
import Review from '../../../../../models/Review'

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

// PUT update review
export async function PUT(request, { params }) {
  const auth = verifyAuth(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    await dbConnect()
    const { id } = await params
    const body = await request.json()

    const review = await Review.findByIdAndUpdate(
      id,
      {
        name: body.name,
        text: body.text,
        rating: body.rating,
        order: body.order,
        isActive: body.isActive
      },
      { new: true, runValidators: true }
    )

    if (!review) {
      return NextResponse.json({ error: 'التقييم غير موجود' }, { status: 404 })
    }

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
      message: 'تم تحديث التقييم بنجاح'
    })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json({ error: 'حدث خطأ في تحديث التقييم' }, { status: 500 })
  }
}

// DELETE review
export async function DELETE(request, { params }) {
  const auth = verifyAuth(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    await dbConnect()
    const { id } = await params
    const review = await Review.findByIdAndDelete(id)

    if (!review) {
      return NextResponse.json({ error: 'التقييم غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'تم حذف التقييم بنجاح' })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'حدث خطأ في حذف التقييم' }, { status: 500 })
  }
}
