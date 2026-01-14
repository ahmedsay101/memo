import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/mongodb'
import Admin from '../../../../models/Admin'

// Initialize admin endpoint - only works if no admin exists
export async function POST(request) {
  try {
    await dbConnect()
    
    // Check if any admin already exists
    const existingAdmin = await Admin.findOne({})
    
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'نظام الإدارة مهيأ بالفعل' },
        { status: 400 }
      )
    }

    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'اسم المستخدم وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      )
    }

    // Create the first admin
    const admin = new Admin({
      username,
      password, // Will be hashed by the pre-save hook
      role: 'super_admin'
    })

    await admin.save()

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء حساب الإدارة الأول بنجاح',
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    })

  } catch (error) {
    console.error('Error initializing admin:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'اسم المستخدم موجود بالفعل' },
        { status: 400 }
      )
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        { error: messages.join(', ') },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء حساب الإدارة' },
      { status: 500 }
    )
  }
}