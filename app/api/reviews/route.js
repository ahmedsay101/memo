import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import Review from '../../../models/Review'

// GET active reviews (public)
export async function GET() {
  try {
    await dbConnect()
    // Use $ne: false so older documents without the isActive field are also returned
    const reviews = await Review.find({ isActive: { $ne: false } }).sort({ order: 1 })
    const formatted = reviews.map(r => ({
      id: r._id.toString(),
      name: r.name,
      text: r.text,
      rating: r.rating,
      order: r.order
    }))
    return NextResponse.json({ success: true, reviews: formatted })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ 
      success: false,
      error: 'حدث خطأ في جلب التقييمات'
    }, { status: 500 })
  }
}
