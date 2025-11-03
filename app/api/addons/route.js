import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import Addon from '../../../models/Addon'

export async function GET(request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    let query = { available: true }
    
    // If category is provided, filter by both category and applicableCategories
    if (category) {
      if (category === 'topping') {
        // For toppings, we want addons that have category='topping' AND are applicable to 'pizza'
        query = {
          available: true,
          category: 'topping',
          applicableCategories: { $in: ['pizza'] }
        }
      } else {
        // For other categories, use the category directly
        query.category = category
      }
    }
    
    console.log('🔍 Addons API query:', query)
    
    const addons = await Addon.find(query).sort({ name: 1 })
    
    console.log(`📦 Found ${addons.length} addons for category: ${category}`)
    
    return NextResponse.json({
      success: true,
      addons
    })
  } catch (error) {
    console.error('Error fetching addons:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}