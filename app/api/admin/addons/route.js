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

    // Create addon data object
    const addonData = {
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
      addonData.sizes = sizes.map(size => ({
        name: size.name,
        price: parseFloat(size.price),
        isDefault: !!size.isDefault
      }))
      // Set default price for backward compatibility
      const defaultSize = sizes.find(s => s.isDefault) || sizes[0]
      addonData.price = parseFloat(defaultSize.price)
    } else if (price !== undefined) {
      // Single price - create default size
      addonData.sizes = [{ name: 'عادي', price: parseFloat(price), isDefault: true }]
      addonData.price = parseFloat(price)
    }
    
    const addon = new Addon(addonData)
    
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