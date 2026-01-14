import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import dbConnect from '../../../../../lib/mongodb'
import Product from '../../../../../models/Product'

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

// GET - Fetch single product
export async function GET(request, { params }) {
  const auth = verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    await dbConnect()
    
    const { id } = params
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'معرف المنتج غير صالح' },
        { status: 400 }
      )
    }

    const product = await Product.findById(id).lean()

    if (!product) {
      return NextResponse.json(
        { error: 'المنتج غير موجود' },
        { status: 404 }
      )
    }

    // Format response
    const formattedProduct = {
      ...product,
      id: product._id.toString(),
      _id: undefined
    }

    return NextResponse.json({
      success: true,
      product: formattedProduct
    })

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المنتج' },
      { status: 500 }
    )
  }
}

// PUT - Update product
export async function PUT(request, { params }) {
  const auth = verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    await dbConnect()
    
    const { id } = params
    const data = await request.json()
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'معرف المنتج غير صالح' },
        { status: 400 }
      )
    }

    // Validate required fields - check for pricing object or old price field
    if (!data.name) {
      return NextResponse.json(
        { error: 'اسم المنتج مطلوب' },
        { status: 400 }
      )
    }

    // Validate pricing - either new pricing object or old price field
    if (!data.pricing && !data.price) {
      return NextResponse.json(
        { error: 'أسعار المنتج مطلوبة' },
        { status: 400 }
      )
    }

    if (data.pricing && (!data.pricing.small || !data.pricing.medium || !data.pricing.large)) {
      return NextResponse.json(
        { error: 'جميع أسعار المقاسات مطلوبة (صغير، متوسط، كبير)' },
        { status: 400 }
      )
    }

    // Update product
    const updateData = {
      name: data.name,
      description: data.description || '',
      category: data.category || 'pizza',
      subcategory: data.subcategory || 'أساسي',
      available: data.available ?? true,
      image: data.image || ''
    }

    // Handle pricing - new structure takes priority
    if (data.pricing) {
      updateData.pricing = {
        small: parseFloat(data.pricing.small),
        medium: parseFloat(data.pricing.medium),
        large: parseFloat(data.pricing.large)
      }
      updateData.price = parseFloat(data.pricing.medium) // Set medium as default price for compatibility
    } else if (data.price) {
      updateData.price = parseFloat(data.price)
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean()

    if (!updatedProduct) {
      return NextResponse.json(
        { error: 'المنتج غير موجود' },
        { status: 404 }
      )
    }

    // Format response
    const formattedProduct = {
      ...updatedProduct,
      id: updatedProduct._id.toString(),
      _id: undefined
    }

    return NextResponse.json({
      success: true,
      product: formattedProduct,
      message: 'تم تحديث المنتج بنجاح'
    })

  } catch (error) {
    console.error('Error updating product:', error)
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        { error: messages.join(', ') },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث المنتج' },
      { status: 500 }
    )
  }
}

// DELETE - Delete product
export async function DELETE(request, { params }) {
  const auth = verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    await dbConnect()
    
    const { id } = params
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'معرف المنتج غير صالح' },
        { status: 400 }
      )
    }

    // Delete product
    const deletedProduct = await Product.findByIdAndDelete(id).lean()

    if (!deletedProduct) {
      return NextResponse.json(
        { error: 'المنتج غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف المنتج بنجاح',
      deletedProduct: {
        ...deletedProduct,
        id: deletedProduct._id.toString(),
        _id: undefined
      }
    })

  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في حذف المنتج' },
      { status: 500 }
    )
  }
}