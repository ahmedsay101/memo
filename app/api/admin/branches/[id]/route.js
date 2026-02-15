import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../../../lib/mongodb'
import Branch from '../../../../../models/Branch'

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

// PUT update branch
export async function PUT(request, { params }) {
  const auth = verifyAuth(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    await dbConnect()
    const { id } = await params
    const body = await request.json()

    const branch = await Branch.findByIdAndUpdate(
      id,
      {
        title: body.title,
        address: body.address,
        phone: body.phone,
        hours: body.hours,
        order: body.order,
        isActive: body.isActive
      },
      { new: true, runValidators: true }
    )

    if (!branch) {
      return NextResponse.json({ error: 'الفرع غير موجود' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      branch: {
        id: branch._id.toString(),
        title: branch.title,
        address: branch.address,
        phone: branch.phone,
        hours: branch.hours,
        order: branch.order,
        isActive: branch.isActive
      },
      message: 'تم تعديل الفرع بنجاح'
    })
  } catch (error) {
    console.error('Error updating branch:', error)
    return NextResponse.json({ error: 'حدث خطأ في تعديل الفرع' }, { status: 500 })
  }
}

// DELETE branch
export async function DELETE(request, { params }) {
  const auth = verifyAuth(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    await dbConnect()
    const { id } = await params

    const branch = await Branch.findByIdAndDelete(id)
    if (!branch) {
      return NextResponse.json({ error: 'الفرع غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'تم حذف الفرع بنجاح' })
  } catch (error) {
    console.error('Error deleting branch:', error)
    return NextResponse.json({ error: 'حدث خطأ في حذف الفرع' }, { status: 500 })
  }
}
