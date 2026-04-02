import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../../../lib/mongodb'
import Contact from '../../../../../models/Contact'

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

// PUT - Mark as read / add response
export async function PUT(request, { params }) {
  const auth = verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    await dbConnect()
    const { id } = await params
    const body = await request.json()

    const updateData = {}
    if (body.isRead !== undefined) updateData.isRead = body.isRead
    if (body.response !== undefined) {
      updateData.response = body.response
      updateData.responseDate = new Date()
    }

    const contact = await Contact.findByIdAndUpdate(id, updateData, { new: true }).lean()

    if (!contact) {
      return NextResponse.json({ error: 'الرسالة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      contact: { ...contact, id: contact._id.toString() }
    })
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json({ error: 'حدث خطأ في تحديث الرسالة' }, { status: 500 })
  }
}

// DELETE - Delete a contact submission
export async function DELETE(request, { params }) {
  const auth = verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    await dbConnect()
    const { id } = await params

    const contact = await Contact.findByIdAndDelete(id)

    if (!contact) {
      return NextResponse.json({ error: 'الرسالة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json({ error: 'حدث خطأ في حذف الرسالة' }, { status: 500 })
  }
}
