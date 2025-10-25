import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/mongodb'
import ProductVariant from '../../../../../models/ProductVariant'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const { productId } = params
    
    // Fetch all variants for this product
    const variants = await ProductVariant.find({ productId })
    
    // Group variants by type
    const groupedVariants = variants.reduce((acc, variant) => {
      if (!acc[variant.type]) {
        acc[variant.type] = []
      }
      acc[variant.type].push(variant)
      return acc
    }, {})
    
    return NextResponse.json({
      success: true,
      variants: groupedVariants
    })
  } catch (error) {
    console.error('Error fetching variants:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}