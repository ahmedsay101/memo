import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/mongodb'
import Slide from '../../../../models/Slide'
import Review from '../../../../models/Review'

export async function GET() {
  try {
    console.log('Debug API: Starting comprehensive database test...')
    console.log('Debug API: Environment:', process.env.NODE_ENV)
    console.log('Debug API: MongoDB URI exists:', !!process.env.MONGODB_URI)
    console.log('Debug API: Server timestamp:', new Date().toISOString())
    
    await dbConnect()
    console.log('Debug API: Connected to database successfully')

    // Test slides
    const slideCount = await Slide.countDocuments()
    const allSlides = await Slide.find({}).sort({ createdAt: -1 }).limit(5)
    const activeSlides = await Slide.find({ isActive: true })
    
    console.log('Debug API: Slides - Total:', slideCount, 'Active:', activeSlides.length)

    // Test reviews  
    const reviewCount = await Review.countDocuments()
    const allReviews = await Review.find({}).sort({ createdAt: -1 }).limit(5)
    const activeReviews = await Review.find({ isActive: true })
    
    console.log('Debug API: Reviews - Total:', reviewCount, 'Active:', activeReviews.length)

    // Database info
    const dbName = (await dbConnect()).connection.db.databaseName
    const collections = await (await dbConnect()).connection.db.listCollections().toArray()
    
    console.log('Debug API: Database name:', dbName)
    console.log('Debug API: Collections:', collections.map(c => c.name))

    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      database: {
        name: dbName,
        collections: collections.map(c => c.name)
      },
      slides: {
        total: slideCount,
        active: activeSlides.length,
        sample: allSlides.map(s => ({
          id: s._id.toString(),
          title: s.title,
          isActive: s.isActive,
          isActiveType: typeof s.isActive,
          createdAt: s.createdAt
        }))
      },
      reviews: {
        total: reviewCount, 
        active: activeReviews.length,
        sample: allReviews.map(r => ({
          id: r._id.toString(),
          name: r.name,
          text: r.text ? r.text.substring(0, 50) + '...' : '',
          isActive: r.isActive,
          isActiveType: typeof r.isActive,
          createdAt: r.createdAt
        }))
      }
    })
  } catch (error) {
    console.error('Debug API: Error:', error)
    return NextResponse.json({
      success: false,
      environment: process.env.NODE_ENV,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}