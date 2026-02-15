import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../../lib/mongodb'
import Slide from '../../../../models/Slide'

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

// GET all slides (admin)
export async function GET(request) {
  const auth = verifyAuth(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    await dbConnect()
    const slides = await Slide.find().sort({ order: 1 })
    const formattedSlides = slides.map(s => ({
      id: s._id.toString(),
      title: s.title,
      image: s.image,
      order: s.order,
      isActive: s.isActive,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt
    }))
    return NextResponse.json({ success: true, slides: formattedSlides })
  } catch (error) {
    console.error('Error fetching slides:', error)
    return NextResponse.json({ error: 'حدث خطأ في جلب السلايدات' }, { status: 500 })
  }
}

// POST create new slide
export async function POST(request) {
  const auth = verifyAuth(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    await dbConnect()
    const body = await request.json()

    // Auto-set order to last
    const lastSlide = await Slide.findOne().sort({ order: -1 })
    const order = lastSlide ? lastSlide.order + 1 : 0

    const slide = await Slide.create({
      title: body.title || '',
      image: body.image,
      order,
      isActive: body.isActive !== undefined ? body.isActive : true
    })

    return NextResponse.json({
      success: true,
      slide: {
        id: slide._id.toString(),
        title: slide.title,
        image: slide.image,
        order: slide.order,
        isActive: slide.isActive
      },
      message: 'تم إضافة السلايد بنجاح'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating slide:', error)
    return NextResponse.json({ error: 'حدث خطأ في إضافة السلايد' }, { status: 500 })
  }
}
