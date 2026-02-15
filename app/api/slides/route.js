import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import Slide from '../../../models/Slide'

// GET active slides (public)
export async function GET() {
  try {
    await dbConnect()
    const slides = await Slide.find({ isActive: true }).sort({ order: 1 })
    const formattedSlides = slides.map(s => ({
      id: s._id.toString(),
      title: s.title,
      image: s.image,
      order: s.order
    }))
    return NextResponse.json({ success: true, slides: formattedSlides })
  } catch (error) {
    console.error('Error fetching slides:', error)
    return NextResponse.json({ error: 'حدث خطأ في جلب السلايدات' }, { status: 500 })
  }
}
