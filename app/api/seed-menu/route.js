import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Category, Subcategory } from '@/models/Menu'

export async function POST() {
  try {
    await connectDB()
    
    // Clear existing data
    await Category.deleteMany({})
    await Subcategory.deleteMany({})
    
    // Create categories
    const categories = [
      { name: 'بيتزا', nameEn: 'Pizza', icon: '🍕', order: 1 },
      { name: 'صوصات', nameEn: 'Sauces', icon: '🥫', order: 2 },
      { name: 'سناكس و سلطات', nameEn: 'Snacks & Salads', icon: '🥗', order: 3 },
      { name: 'كومبو و مشروبات', nameEn: 'Combo & Drinks', icon: '🥤', order: 4 }
    ]
    
    const createdCategories = await Category.insertMany(categories)
    
    // Find pizza category
    const pizzaCategory = createdCategories.find(cat => cat.name === 'بيتزا')
    
    // Create subcategories (all under بيتزا)
    const subcategories = [
      { name: 'خضروات و جبن', nameEn: 'Vegetables & Cheese', categoryId: pizzaCategory._id, order: 1 },
      { name: 'لحوم', nameEn: 'Meat', categoryId: pizzaCategory._id, order: 2 },
      { name: 'دجاج', nameEn: 'Chicken', categoryId: pizzaCategory._id, order: 3 },
      { name: 'سي فود', nameEn: 'Seafood', categoryId: pizzaCategory._id, order: 4 },
      { name: 'بيتزا نصين', nameEn: 'Half & Half Pizza', categoryId: pizzaCategory._id, order: 5 }
    ]
    
    const createdSubcategories = await Subcategory.insertMany(subcategories)
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      categories: createdCategories,
      subcategories: createdSubcategories
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}