const mongoose = require('mongoose')

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

const sampleToppings = [
  {
    name: 'بيبروني',
    category: 'topping',
    price: 25,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=200&fit=crop&crop=center',
    applicableCategories: ['pizza'],
    isAvailable: true
  },
  {
    name: 'جبن إضافي',
    category: 'topping',
    price: 15,
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&h=200&fit=crop&crop=center',
    applicableCategories: ['pizza'],
    isAvailable: true
  },
  {
    name: 'مشروم',
    category: 'topping',
    price: 20,
    image: 'https://images.unsplash.com/photo-1580959833943-2dc6161ed1fc?w=200&h=200&fit=crop&crop=center',
    applicableCategories: ['pizza'],
    isAvailable: true
  },
  {
    name: 'فلفل أخضر',
    category: 'topping',
    price: 10,
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200&h=200&fit=crop&crop=center',
    applicableCategories: ['pizza'],
    isAvailable: true
  },
  {
    name: 'زيتون أسود',
    category: 'topping',
    price: 12,
    image: 'https://images.unsplash.com/photo-1452827073306-6e6e661baf57?w=200&h=200&fit=crop&crop=center',
    applicableCategories: ['pizza'],
    isAvailable: true
  },
  {
    name: 'طماطم',
    category: 'topping',
    price: 8,
    image: 'https://images.unsplash.com/photo-1546470427-e5b264f739b8?w=200&h=200&fit=crop&crop=center',
    applicableCategories: ['pizza'],
    isAvailable: true
  }
]

async function addSampleToppings() {
  try {
    await mongoose.connect('mongodb://localhost:27017/restaurant-memo')
    console.log('Connected to MongoDB')
    
    // Clear existing toppings
    await Addon.deleteMany({ category: 'topping' })
    
    // Add sample toppings
    for (const topping of sampleToppings) {
      await Addon.create(topping)
    }
    
    console.log('Added sample toppings matching the design')
    
    await mongoose.connection.close()
  } catch (error) {
    console.error('Error:', error)
  }
}

addSampleToppings()