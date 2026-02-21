import connectDB from '../../../../lib/mongodb'
import Settings from '../../../../models/Settings'

export async function GET() {
  try {
    await connectDB()
    
    const settings = await Settings.find({})
    const settingsObject = {}
    
    settings.forEach(setting => {
      settingsObject[setting.key] = setting.value
    })
    
    // Provide default values if settings don't exist
    const defaultSettings = {
      workingHours: {
        daily: {
          label: "يومياً",
          hours: "من 3:00 - ص 10:00"
        },
        lastOrder: {
          label: "طلب (Last Order) حتى",
          hours: "2:00 ص"
        }
      },
      contactInfo: {
        phone: "15596",
        email: "support@memos-pizza.com"
      }
    }
    
    // Merge default settings with existing settings
    const finalSettings = { ...defaultSettings, ...settingsObject }
    
    return Response.json({ 
      success: true, 
      settings: finalSettings 
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return Response.json(
      { success: false, error: 'فشل في جلب الإعدادات' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    await connectDB()
    
    const { key, value } = await request.json()
    
    if (!key || !value) {
      return Response.json(
        { success: false, error: 'المفتاح والقيمة مطلوبان' },
        { status: 400 }
      )
    }
    
    // Update or create setting
    const setting = await Settings.findOneAndUpdate(
      { key },
      { key, value, updatedAt: new Date() },
      { upsert: true, new: true }
    )
    
    return Response.json({ 
      success: true, 
      setting,
      message: 'تم حفظ الإعدادات بنجاح' 
    })
  } catch (error) {
    console.error('Error saving settings:', error)
    return Response.json(
      { success: false, error: 'فشل في حفظ الإعدادات' },
      { status: 500 }
    )
  }
}