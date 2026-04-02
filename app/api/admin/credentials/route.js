import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../../lib/mongodb'
import Admin from '../../../../models/Admin'

export const dynamic = 'force-dynamic'

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

// PUT - Update admin username and/or password
export async function PUT(request) {
  const auth = verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    await dbConnect()

    const { currentPassword, newUsername, newPassword } = await request.json()

    if (!currentPassword) {
      return NextResponse.json(
        { error: 'كلمة المرور الحالية مطلوبة للتأكيد' },
        { status: 400 }
      )
    }

    if (!newUsername && !newPassword) {
      return NextResponse.json(
        { error: 'يجب تقديم اسم مستخدم جديد أو كلمة مرور جديدة' },
        { status: 400 }
      )
    }

    // Find the current admin
    const admin = await Admin.findById(auth.user.id)
    if (!admin) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // Verify current password
    const isValid = await admin.comparePassword(currentPassword)
    if (!isValid) {
      return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 401 })
    }

    // Update username if provided
    if (newUsername) {
      if (newUsername.trim().length < 3) {
        return NextResponse.json(
          { error: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' },
          { status: 400 }
        )
      }
      // Check if username is already taken by another admin
      const existing = await Admin.findOne({ username: newUsername.trim(), _id: { $ne: admin._id } })
      if (existing) {
        return NextResponse.json({ error: 'اسم المستخدم مستخدم بالفعل' }, { status: 400 })
      }
      admin.username = newUsername.trim()
    }

    // Update password if provided
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
          { status: 400 }
        )
      }
      admin.password = newPassword
    }

    await admin.save()

    // Generate a new token with updated info
    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      success: true,
      token,
      message: 'تم تحديث بيانات الحساب بنجاح'
    })
  } catch (error) {
    console.error('Error updating credentials:', error)
    return NextResponse.json({ error: 'حدث خطأ في تحديث البيانات' }, { status: 500 })
  }
}
