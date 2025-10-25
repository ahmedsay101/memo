import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import { Category, Subcategory } from '../../../models/Category'

export async function GET() {
  try {
    await dbConnect()
    
    // Get all active categories with their subcategories
    const categories = await Category.find({ isActive: true }).sort({ order: 1 })
    
    // Get all subcategories and group by categoryId
    const allSubcategories = await Subcategory.find({}).sort({ order: 1 })
    
    const subcategoriesData = {}
    allSubcategories.forEach(sub => {
      if (!subcategoriesData[sub.categoryId]) {
        subcategoriesData[sub.categoryId] = []
      }
      subcategoriesData[sub.categoryId].push({
        id: sub.id,
        name: sub.name,
        nameEn: sub.nameEn
      })
    })
    
    // Format categories with their subcategories
    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      nameEn: cat.nameEn,
      icon: cat.icon
    }))
    
    return NextResponse.json({
      success: true,
      categories: formattedCategories,
      subcategories: subcategoriesData
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب الفئات' },
      { status: 500 }
    )
  }
}

