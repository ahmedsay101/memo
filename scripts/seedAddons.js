const mongoose = require('mongoose')

// Define Addon schema directly in seeding script to avoid import issues
const AddonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['topping', 'sauce', 'drink', 'side', 'dessert'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String
  },
  description: {
    type: String
  },
  applicableCategories: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

const Addon = mongoose.model('Addon', AddonSchema)

const addons = [
  // Toppings for pizzas
  {
    name: 'بيبروني',
    category: 'topping',
    price: 25,
    applicableCategories: ['pizza', 'بيتزا'],
    isAvailable: true
  },
  {
    name: 'سجق',
    category: 'topping',
    price: 20,
    applicableCategories: ['pizza', 'بيتزا'],
    isAvailable: true
  },
  {
    name: 'دجاج مدخن',
    category: 'topping',
    price: 30,
    applicableCategories: ['pizza', 'بيتزا'],
    isAvailable: true
  },
  {
    name: 'جبن إضافي',
    category: 'topping',
    price: 15,
    applicableCategories: ['pizza', 'بيتزا'],
    isAvailable: true
  },
  {
    name: 'فلفل أخضر',
    category: 'topping',
    price: 10,
    applicableCategories: ['pizza', 'بيتزا'],
    isAvailable: true
  },
  {
    name: 'بصل',
    category: 'topping',
    price: 8,
    applicableCategories: ['pizza', 'بيتزا'],
    isAvailable: true
  },
  {
    name: 'طماطم',
    category: 'topping',
    price: 10,
    applicableCategories: ['pizza', 'بيتزا'],
    isAvailable: true
  },
  {
    name: 'زيتون أسود',
    category: 'topping',
    price: 12,
    applicableCategories: ['pizza', 'بيتزا'],
    isAvailable: true
  },
  {
    name: 'مشروم',
    category: 'topping',
    price: 15,
    applicableCategories: ['pizza', 'بيتزا'],
    isAvailable: true
  },
  {
    name: 'أناناس',
    category: 'topping',
    price: 18,
    applicableCategories: ['pizza', 'بيتزا'],
    isAvailable: true
  },

  // Sauces
  {
    name: 'صوص الثوم',
    category: 'sauce',
    price: 5,
    applicableCategories: ['pizza', 'بيتزا', 'chicken', 'دجاج'],
    isAvailable: true
  },
  {
    name: 'صوص الباربيكيو',
    category: 'sauce',
    price: 8,
    applicableCategories: ['pizza', 'بيتزا', 'chicken', 'دجاج'],
    isAvailable: true
  },
  {
    name: 'صوص الرانش',
    category: 'sauce',
    price: 6,
    applicableCategories: ['pizza', 'بيتزا', 'chicken', 'دجاج'],
    isAvailable: true
  },
  {
    name: 'صوص الهوت سوس',
    category: 'sauce',
    price: 5,
    applicableCategories: ['pizza', 'بيتزا', 'chicken', 'دجاج'],
    isAvailable: true
  },

  // Drinks
  {
    name: 'كوكاكولا',
    category: 'drink',
    price: 12,
    applicableCategories: ['pizza', 'بيتزا', 'chicken', 'دجاج', 'burger', 'برجر'],
    isAvailable: true
  },
  {
    name: 'سبرايت',
    category: 'drink',
    price: 12,
    applicableCategories: ['pizza', 'بيتزا', 'chicken', 'دجاج', 'burger', 'برجر'],
    isAvailable: true
  },
  {
    name: 'فانتا',
    category: 'drink',
    price: 12,
    applicableCategories: ['pizza', 'بيتزا', 'chicken', 'دجاج', 'burger', 'برجر'],
    isAvailable: true
  },
  {
    name: 'مياه معدنية',
    category: 'drink',
    price: 8,
    applicableCategories: ['pizza', 'بيتزا', 'chicken', 'دجاج', 'burger', 'برجر'],
    isAvailable: true
  },

  // Sides
  {
    name: 'بطاطس مقلية',
    category: 'side',
    price: 20,
    applicableCategories: ['burger', 'برجر', 'chicken', 'دجاج'],
    isAvailable: true
  },
  {
    name: 'خبز بالثوم',
    category: 'side',
    price: 15,
    applicableCategories: ['pizza', 'بيتزا'],
    isAvailable: true
  },
  {
    name: 'أصابع الجبن',
    category: 'side',
    price: 25,
    applicableCategories: ['pizza', 'بيتزا'],
    isAvailable: true
  },
  {
    name: 'سلطة خضراء',
    category: 'side',
    price: 18,
    applicableCategories: ['pizza', 'بيتزا', 'chicken', 'دجاج', 'burger', 'برجر'],
    isAvailable: true
  },

  // Desserts
  {
    name: 'تشيز كيك',
    category: 'dessert',
    price: 35,
    applicableCategories: ['pizza', 'بيتزا', 'chicken', 'دجاج', 'burger', 'برجر'],
    isAvailable: true
  },
  {
    name: 'آيس كريم فانيلا',
    category: 'dessert',
    price: 20,
    applicableCategories: ['pizza', 'بيتزا', 'chicken', 'دجاج', 'burger', 'برجر'],
    isAvailable: true
  },
  {
    name: 'براونيز',
    category: 'dessert',
    price: 30,
    applicableCategories: ['pizza', 'بيتزا', 'chicken', 'دجاج', 'burger', 'برجر'],
    isAvailable: true
  }
]

async function seedAddons() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-memo')
    
    console.log('Connected to MongoDB')
    
    // Clear existing addons
    await Addon.deleteMany({})
    console.log('Cleared existing addons')
    
    // Insert new addons
    await Addon.insertMany(addons)
    console.log(`Seeded ${addons.length} addons`)
    
    // List created addons
    const createdAddons = await Addon.find({})
    console.log('Created addons:')
    createdAddons.forEach(addon => {
      console.log(`- ${addon.name} (${addon.category}) - ${addon.price} جنيه`)
    })
    
    await mongoose.connection.close()
    console.log('Database connection closed')
  } catch (error) {
    console.error('Error seeding addons:', error)
    process.exit(1)
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedAddons()
}

module.exports = { seedAddons, addons }