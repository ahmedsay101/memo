import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { writeFile } from 'fs/promises'
import { join } from 'path'

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

export async function POST(request) {
  const auth = verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('image')

    if (!file) {
      return NextResponse.json(
        { error: 'لم يتم العثور على ملف' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم. يرجى رفع صورة' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '')
    const filename = `${timestamp}-${originalName}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory path
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'products')
    
    // Ensure directory exists
    const fs = require('fs')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Write file to uploads directory
    const filePath = join(uploadDir, filename)
    await writeFile(filePath, buffer)

    // Return public URL
    const publicUrl = `/uploads/products/${filename}`

    return NextResponse.json({
      success: true,
      imagePath: publicUrl,
      message: 'تم رفع الصورة بنجاح'
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في رفع الملف' },
      { status: 500 }
    )
  }
}