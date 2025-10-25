import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import Product from '../../../models/Product'

export async function GET(request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const available = searchParams.get('available')
    
    // Build query object
    let query = {}
    
    if (category) {
      query.category = category
    }
    
    if (available !== null) {
      query.available = available === 'true'
    }
    
    // Fetch products from database
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .lean()

    // Format products for frontend
    const formattedProducts = products.map(product => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      subcategory: product.subcategory,
      available: product.available,
      image: product.image,
      productType: product.productType || 'regular',
      hasVariants: product.hasVariants || false,
      hasAddons: product.hasAddons || false,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }))

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      count: formattedProducts.length
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'حدث خطأ في جلب المنتجات' 
      },
      { status: 500 }
    )
  }
}