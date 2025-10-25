import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/mongodb'
import Addon from '../../../../models/Addon'

export async function GET() {
  try {
    await dbConnect()
    
    const addons = await Addon.find({}).sort({ createdAt: -1 })
    
    return NextResponse.json({
      success: true,
      addons
    })
  } catch (error) {
    console.error('Error fetching addons:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { name, category, price, image, description, applicableCategories, isAvailable } = body
    
    // Validation
    if (!name || !category || price < 0) {
      return NextResponse.json(
        { success: false, error: 'البيانات المطلوبة مفقودة' },
        { status: 400 }
      )
    }
    
    const addon = new Addon({
      name: name.trim(),
      category,
      price: parseFloat(price),
      image: image?.trim() || '',
      description: description?.trim() || '',
      applicableCategories: applicableCategories || ['pizza'],
      isAvailable: isAvailable !== false
    })
    
    await addon.save()
    
    return NextResponse.json({
      success: true,
      addon,
      message: 'تم إضافة الإضافة بنجاح'
    })
  } catch (error) {
    console.error('Error creating addon:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'هذه الإضافة موجودة بالفعل' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إنشاء الإضافة' },
      { status: 500 }
    )
  }
}