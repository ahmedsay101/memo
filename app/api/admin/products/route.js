import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../../lib/mongodb'
import Product from '../../../../models/Product'

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

// GET - Fetch all products
export async function GET(request) {
  const auth = verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    await dbConnect()
    
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .lean()

    // Convert _id to id for frontend compatibility
    const formattedProducts = products.map(product => ({
      ...product,
      id: product._id.toString(),
      _id: undefined
    }))

    return NextResponse.json({
      success: true,
      products: formattedProducts
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المنتجات' },
      { status: 500 }
    )
  }
}

// POST - Create new product
export async function POST(request) {
  const auth = verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    await dbConnect()
    
    const data = await request.json()
    
    // Validate required fields
    if (!data.name || !data.price) {
      return NextResponse.json(
        { error: 'اسم المنتج والسعر مطلوبان' },
        { status: 400 }
      )
    }

    // Create new product
    const product = new Product({
      name: data.name,
      description: data.description || '',
      price: parseFloat(data.price),
      category: data.category || 'pizza',
      subcategory: data.subcategory || 'أساسي',
      available: data.available ?? true,
      image: data.image || ''
    })

    await product.save()

    // Format response
    const formattedProduct = {
      ...product.toObject(),
      id: product._id.toString(),
      _id: undefined
    }

    return NextResponse.json({
      success: true,
      product: formattedProduct,
      message: 'تم إضافة المنتج بنجاح'
    })

  } catch (error) {
    console.error('Error creating product:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      errors: error.errors
    })
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        { error: messages.join(', ') },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء المنتج' },
      { status: 500 }
    )
  }
}