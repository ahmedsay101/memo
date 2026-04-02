import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../../lib/mongodb'
import Contact from '../../../../models/Contact'

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

// GET - Fetch all contact submissions
export async function GET(request) {
  const auth = verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    await dbConnect()

    const contacts = await Contact.find({})
      .sort({ createdAt: -1 })
      .lean()

    const formattedContacts = contacts.map(contact => ({
      id: contact._id.toString(),
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone,
      subject: contact.subject,
      message: contact.message,
      isRead: contact.isRead,
      response: contact.response,
      responseDate: contact.responseDate,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      contacts: formattedContacts
    })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الرسائل' },
      { status: 500 }
    )
  }
}
