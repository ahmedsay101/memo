import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../../../lib/mongodb'
import Slide from '../../../../../models/Slide'

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

// PUT update slide
export async function PUT(request, { params }) {
  const auth = verifyAuth(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    await dbConnect()
    const { id } = await params
    const body = await request.json()

    const slide = await Slide.findByIdAndUpdate(
      id,
      {
        title: body.title,
        image: body.image,
        order: body.order,
        isActive: body.isActive
      },
      { new: true, runValidators: true }
    )

    if (!slide) {
      return NextResponse.json({ error: 'السلايد غير موجود' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      slide: {
        id: slide._id.toString(),
        title: slide.title,
        image: slide.image,
        order: slide.order,
        isActive: slide.isActive
      },
      message: 'تم تعديل السلايد بنجاح'
    })
  } catch (error) {
    console.error('Error updating slide:', error)
    return NextResponse.json({ error: 'حدث خطأ في تعديل السلايد' }, { status: 500 })
  }
}

// DELETE slide
export async function DELETE(request, { params }) {
  const auth = verifyAuth(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    await dbConnect()
    const { id } = await params

    const slide = await Slide.findByIdAndDelete(id)
    if (!slide) {
      return NextResponse.json({ error: 'السلايد غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'تم حذف السلايد بنجاح' })
  } catch (error) {
    console.error('Error deleting slide:', error)
    return NextResponse.json({ error: 'حدث خطأ في حذف السلايد' }, { status: 500 })
  }
}
