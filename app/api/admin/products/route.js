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
    if (!data.name) {
      return NextResponse.json(
        { error: 'اسم المنتج مطلوب' },
        { status: 400 }
      )
    }

    // Validate sizes or pricing
    if (!data.sizes && !data.pricing && !data.price) {
      return NextResponse.json(
        { error: 'أسعار المنتج مطلوبة' },
        { status: 400 }
      )
    }

    if (data.sizes && data.sizes.length === 0) {
      return NextResponse.json(
        { error: 'يجب إضافة مقاس واحد على الأقل' },
        { status: 400 }
      )
    }

    // Validate sizes if provided
    if (data.sizes) {
      for (const size of data.sizes) {
        if (!size.name || !size.price) {
          return NextResponse.json(
            { error: 'اسم المقاس والسعر مطلوبان لكل مقاس' },
            { status: 400 }
          )
        }
      }
    }

    // Create product data object
    const productData = {
      name: data.name,
      description: data.description || '',
      category: data.category || 'pizza',
      subcategory: data.subcategory || 'أساسي',
      available: data.available ?? true,
      image: data.image || ''
    }

    // Handle pricing structure
    if (data.sizes && data.sizes.length > 0) {
      // Use new dynamic sizes structure
      productData.sizes = data.sizes.map(size => ({
        name: size.name,
        price: parseFloat(size.price),
        isDefault: !!size.isDefault
      }))
      // Set default price for backward compatibility
      const defaultSize = data.sizes.find(s => s.isDefault) || data.sizes[0]
      productData.price = parseFloat(defaultSize.price)
    } else if (data.pricing) {
      // Convert old pricing to new sizes structure for consistency
      const sizes = []
      if (data.pricing.small !== undefined) sizes.push({ name: 'صغير', price: parseFloat(data.pricing.small), isDefault: true })
      if (data.pricing.medium !== undefined) sizes.push({ name: 'متوسط', price: parseFloat(data.pricing.medium), isDefault: false })
      if (data.pricing.large !== undefined) sizes.push({ name: 'كبير', price: parseFloat(data.pricing.large), isDefault: false })
      
      if (sizes.length > 0) {
        productData.sizes = sizes
        productData.pricing = {
          small: data.pricing.small ? parseFloat(data.pricing.small) : undefined,
          medium: data.pricing.medium ? parseFloat(data.pricing.medium) : undefined,
          large: data.pricing.large ? parseFloat(data.pricing.large) : undefined
        }
        productData.price = parseFloat(data.pricing.small || data.pricing.medium || data.pricing.large)
      }
    } else if (data.price) {
      // Single price - create default size
      productData.sizes = [{ name: 'عادي', price: parseFloat(data.price), isDefault: true }]
      productData.price = parseFloat(data.price)
    }

    // Create new product
    const product = new Product(productData)

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