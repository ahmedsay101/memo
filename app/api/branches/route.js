import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import Branch from '../../../models/Branch'

// GET active branches (public)
export async function GET() {
  try {
    await dbConnect()
    const branches = await Branch.find({ isActive: true }).sort({ order: 1 })
    const formatted = branches.map(b => ({
      id: b._id.toString(),
      title: b.title,
      address: b.address,
      phone: b.phone,
      hours: b.hours
    }))
    return NextResponse.json({ success: true, branches: formatted })
  } catch (error) {
    console.error('Error fetching branches:', error)
    return NextResponse.json({ error: 'حدث خطأ في جلب الفروع' }, { status: 500 })
  }
}
