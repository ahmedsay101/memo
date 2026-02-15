import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../../lib/mongodb'
import Branch from '../../../../models/Branch'

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

// GET all branches (admin)
export async function GET(request) {
  const auth = verifyAuth(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    await dbConnect()
    const branches = await Branch.find().sort({ order: 1 })
    const formatted = branches.map(b => ({
      id: b._id.toString(),
      title: b.title,
      address: b.address,
      phone: b.phone,
      hours: b.hours,
      order: b.order,
      isActive: b.isActive,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt
    }))
    return NextResponse.json({ success: true, branches: formatted })
  } catch (error) {
    console.error('Error fetching branches:', error)
    return NextResponse.json({ error: 'حدث خطأ في جلب الفروع' }, { status: 500 })
  }
}

// POST create new branch
export async function POST(request) {
  const auth = verifyAuth(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    await dbConnect()
    const body = await request.json()

    const lastBranch = await Branch.findOne().sort({ order: -1 })
    const order = lastBranch ? lastBranch.order + 1 : 0

    const branch = await Branch.create({
      title: body.title,
      address: body.address,
      phone: body.phone || '15596',
      hours: body.hours || 'يومياً: 10:00 ص - 2:00 ص',
      order,
      isActive: body.isActive !== undefined ? body.isActive : true
    })

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
      message: 'تم إضافة الفرع بنجاح'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating branch:', error)
    return NextResponse.json({ error: 'حدث خطأ في إضافة الفرع' }, { status: 500 })
  }
}
