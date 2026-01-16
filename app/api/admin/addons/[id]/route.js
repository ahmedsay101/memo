import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/mongodb'
import Addon from '../../../../../models/Addon'

export async function PUT(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    const body = await request.json()
    const { name, category, sizes, price, image, description, applicableCategories, isAvailable } = body
    
    // Validation
    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: 'اسم الإضافة والتصنيف مطلوبان' },
        { status: 400 }
      )
    }

    // Validate sizes or price
    if (!sizes && price === undefined) {
      return NextResponse.json(
        { success: false, error: 'أسعار الإضافة مطلوبة' },
        { status: 400 }
      )
    }

    if (sizes && sizes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'يجب إضافة مقاس واحد على الأقل' },
        { status: 400 }
      )
    }

    // Validate sizes if provided
    if (sizes) {
      for (const size of sizes) {
        if (!size.name || size.price === undefined) {
          return NextResponse.json(
            { success: false, error: 'اسم المقاس والسعر مطلوبان لكل مقاس' },
            { status: 400 }
          )
        }
      }
    }

    // Create update data object
    const updateData = {
      name: name.trim(),
      category,
      image: image?.trim() || '',
      description: description?.trim() || '',
      applicableCategories: applicableCategories || ['pizza'],
      isAvailable: isAvailable !== false
    }

    // Handle pricing structure
    if (sizes && sizes.length > 0) {
      // Use new dynamic sizes structure
      updateData.sizes = sizes.map(size => ({
        name: size.name,
        price: parseFloat(size.price),
        isDefault: !!size.isDefault
      }))
      // Set default price for backward compatibility
      const defaultSize = sizes.find(s => s.isDefault) || sizes[0]
      updateData.price = parseFloat(defaultSize.price)
    } else if (price !== undefined) {
      // Single price - create default size
      updateData.sizes = [{ name: 'عادي', price: parseFloat(price), isDefault: true }]
      updateData.price = parseFloat(price)
    }
    
    const addon = await Addon.findByIdAndUpdate(
      id,
      updateData,
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