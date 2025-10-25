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

    // Validate required fields
    if (!data.name || !data.price) {
      return NextResponse.json(
        { error: 'اسم المنتج والسعر مطلوبان' },
        { status: 400 }
      )
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: data.name,
        description: data.description || '',
        price: parseFloat(data.price),
        category: data.category || 'pizza',
        subcategory: data.subcategory || 'أساسي',
        available: data.available ?? true,
        image: data.image || ''
      },
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