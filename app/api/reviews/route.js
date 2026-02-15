import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import Review from '../../../models/Review'

// GET active reviews (public)
export async function GET() {
  try {
    await dbConnect()
    const reviews = await Review.find({ isActive: true }).sort({ order: 1 })
    const formatted = reviews.map(r => ({
      id: r._id.toString(),
      name: r.name,
      text: r.text,
      rating: r.rating
    }))
    return NextResponse.json({ success: true, reviews: formatted })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'حدث خطأ في جلب التقييمات' }, { status: 500 })
  }
}
