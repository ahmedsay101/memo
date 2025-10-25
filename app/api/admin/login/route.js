import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Simple admin credentials (in production, use database)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'memo2024',
  id: '1',
  role: 'admin'
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    // Validate credentials
    if (!username || !password) {
      return NextResponse.json(
        { error: 'اسم المستخدم وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    // Check credentials
    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      return NextResponse.json(
        { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: ADMIN_CREDENTIALS.id,
        username: ADMIN_CREDENTIALS.username,
        role: ADMIN_CREDENTIALS.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: ADMIN_CREDENTIALS.id,
        username: ADMIN_CREDENTIALS.username,
        role: ADMIN_CREDENTIALS.role
      },
      message: 'تم تسجيل الدخول بنجاح'
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}