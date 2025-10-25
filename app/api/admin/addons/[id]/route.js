import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/mongodb'
import Addon from '../../../../../models/Addon'

export async function PUT(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    const body = await request.json()
    const { name, category, price, image, description, applicableCategories, isAvailable } = body
    
    // Validation
    if (!name || !category || price < 0) {
      return NextResponse.json(
        { success: false, error: 'البيانات المطلوبة مفقودة' },
        { status: 400 }
      )
    }
    
    const addon = await Addon.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        category,
        price: parseFloat(price),
        image: image?.trim() || '',
        description: description?.trim() || '',
        applicableCategories: applicableCategories || ['pizza'],
        isAvailable: isAvailable !== false
      },
      { new: true, runValidators: true }
    )
    
    if (!addon) {
      return NextResponse.json(
        { success: false, error: 'الإضافة غير موجودة' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      addon,
      message: 'تم تحديث الإضافة بنجاح'
    })
  } catch (error) {
    console.error('Error updating addon:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في التحديث' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    
    const addon = await Addon.findByIdAndDelete(id)
    
    if (!addon) {
      return NextResponse.json(
        { success: false, error: 'الإضافة غير موجودة' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف الإضافة بنجاح'
    })
  } catch (error) {
    console.error('Error deleting addon:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الحذف' },
      { status: 500 }
    )
  }
}