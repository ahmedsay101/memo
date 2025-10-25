import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/mongodb'
import ProductVariant from '../../../../models/ProductVariant'

export async function GET(request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    // If type is specified, filter by type
    let query = {}
    if (type) {
      query.type = type
    }
    
    // Get all variants, grouped by type
    const variants = await ProductVariant.find(query).lean()
    
    // Group variants by type for easier frontend handling
    const groupedVariants = variants.reduce((acc, variant) => {
      if (!acc[variant.type]) {
        acc[variant.type] = []
      }
      acc[variant.type].push({
        id: variant._id.toString(),
        _id: variant._id.toString(),
        name: variant.name,
        price: variant.price,
        type: variant.type,
        description: variant.description || '',
        isAvailable: variant.isAvailable !== false
      })
      return acc
    }, {})
    
    return NextResponse.json({
      success: true,
      variants: groupedVariants
    })
    
  } catch (error) {
    console.error('Error fetching variants:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch variants' },
      { status: 500 }
    )
  }
}