const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

// Import the existing models
const { Category, Subcategory } = require('../models/Category')

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-memo')
    console.log('✅ Connected to MongoDB')

    // Clear existing categories and subcategories
    await Category.deleteMany({})
    await Subcategory.deleteMany({})
    console.log('🗑️ Cleared existing categories and subcategories')

    // Seed Categories
    const categories = [
      {
        id: 'pizza',
        name: 'بيتزا',
        nameEn: 'Pizza',
        icon: '🍕',
        order: 1,
        isActive: true
      },
      {
        id: 'sauces',
        name: 'صوصات',
        nameEn: 'Sauces',
        icon: '🥄',
        order: 2,
        isActive: true
      },
      {
        id: 'snacks-salads',
        name: 'سناكس و سلطات',
        nameEn: 'Snacks & Salads',
        icon: '🥗',
        order: 3,
        isActive: true
      },
      {
        id: 'combo-drinks',
        name: 'كومبو ومشروبات',
        nameEn: 'Combo & Drinks',
        icon: '🥤',
        order: 4,
        isActive: true
      }
    ]

    await Category.insertMany(categories)
    console.log('✅ Created categories:', categories.length)

    // Seed Pizza Subcategories
    const pizzaSubcategories = [
      {
        id: 'vegetables-cheese',
        name: 'خضروات و جبن',
        nameEn: 'Vegetables & Cheese',
        categoryId: 'pizza',
        order: 1,
        isActive: true
      },
      {
        id: 'meat',
        name: 'لحوم',
        nameEn: 'Meat',
        categoryId: 'pizza',
        order: 2,
        isActive: true
      },
      {
        id: 'chicken',
        name: 'دجاج',
        nameEn: 'Chicken',
        categoryId: 'pizza',
        order: 3,
        isActive: true
      },
      {
        id: 'seafood',
        name: 'سي فود',
        nameEn: 'Seafood',
        categoryId: 'pizza',
        order: 4,
        isActive: true
      },
      {
        id: 'half-pizza',
        name: 'بيتزا نصين',
        nameEn: 'Half & Half Pizza',
        categoryId: 'pizza',
        order: 5,
        isActive: true
      }
    ]

    await Subcategory.insertMany(pizzaSubcategories)
    console.log('✅ Created pizza subcategories:', pizzaSubcategories.length)

    console.log('\n🎉 Seeding completed successfully!')
    console.log('📊 Summary:')
    console.log(`   Categories: ${categories.length}`)
    console.log(`   Pizza Subcategories: ${pizzaSubcategories.length}`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
    process.exit(0)
  }
}

// Run the seeder
seedCategories()