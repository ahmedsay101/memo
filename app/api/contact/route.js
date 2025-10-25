import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import Contact from '../../../models/Contact'

export async function POST(request) {
  try {
    // Connect to database
    await dbConnect()
    
    const body = await request.json()
    const { firstName, lastName, phone, subject, message } = body

    // Basic validation
    if (!firstName || !lastName || !phone || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Create new contact submission
    const contactSubmission = new Contact({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      subject,
      message: message.trim()
    })

    // Save to database
    await contactSubmission.save()

    console.log('Contact form submission saved:', {
      id: contactSubmission._id,
      firstName,
      lastName,
      phone,
      subject,
      timestamp: new Date().toISOString()
    })

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    return NextResponse.json({
      success: true,
      message: 'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً!',
      submissionId: contactSubmission._id
    })

  } catch (error) {
    console.error('Contact form error:', error)
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        { success: false, message: errorMessages[0] },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    )
  }
}