const mongoose = require('mongoose')

// Connect to MongoDB
const dbConnect = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      return
    }
    await mongoose.connect('mongodb://localhost:27017/restaurant-memo')
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    throw error
  }
}

// Product schema (inline for this script)
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
    required: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  productType: {
    type: String,
    enum: ['regular', 'half-half'],
    default: 'regular'
  },
  hasVariants: {
    type: Boolean,
    default: false
  },
  hasAddons: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

const SubcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema)
const Subcategory = mongoose.models.Subcategory || mongoose.model('Subcategory', SubcategorySchema)

const createHalfAndHalfPizza = async () => {
  try {
    await dbConnect()
    
    console.log('🍕 Creating Half-and-Half Pizza Product')
    console.log('=====================================')
    
    // Find or create pizza category
    let pizzaCategory = await Category.findOne({ name: 'بيتزا' })
    if (!pizzaCategory) {
      pizzaCategory = await Category.create({
        name: 'بيتزا',
        description: 'جميع أنواع البيتزا اللذيذة',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b'
      })
      console.log('✅ Created pizza category:', pizzaCategory.name)
    } else {
      console.log('✅ Found existing pizza category:', pizzaCategory.name)
    }
    
    // Create or find half-and-half subcategory
    let halfHalfSubcategory = await Subcategory.findOne({ 
      name: 'بيتزا نصين',
      category: pizzaCategory._id 
    })
    
    if (!halfHalfSubcategory) {
      halfHalfSubcategory = await Subcategory.create({
        name: 'بيتزا نصين',
        description: 'اختار نصين مختلفين على نفس البيتزا',
        category: pizzaCategory._id
      })
      console.log('✅ Created half-and-half subcategory:', halfHalfSubcategory.name)
    } else {
      console.log('✅ Found existing half-and-half subcategory:', halfHalfSubcategory.name)
    }
    
    // Check if half-and-half product already exists
    const existingHalfHalf = await Product.findOne({
      name: 'بيتزا نص ونص (Half & Half)',
      productType: 'half-half'
    })
    
    if (existingHalfHalf) {
      console.log('✅ Half-and-half pizza already exists:', existingHalfHalf.name)
      console.log('   Product ID:', existingHalfHalf._id)
      console.log('   Product Type:', existingHalfHalf.productType)
      console.log('   Has Variants:', existingHalfHalf.hasVariants)
      console.log('   Has Addons:', existingHalfHalf.hasAddons)
      return existingHalfHalf
    }
    
    // Create half-and-half pizza product
    const halfHalfPizza = await Product.create({
      name: 'بيتزا نص ونص (Half & Half)',
      description: 'اختار البيتزا نصين كل نص على مزاجك',
      price: 0, // Base price will be calculated based on selected halves
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=500&fit=crop',
      category: pizzaCategory._id,
      subcategory: halfHalfSubcategory._id,
      productType: 'half-half',
      hasVariants: true, // For size selection
      hasAddons: true,   // For additional toppings
      isAvailable: true
    })
    
    console.log('✅ Created half-and-half pizza product!')
    console.log('   Product ID:', halfHalfPizza._id)
    console.log('   Name:', halfHalfPizza.name)
    console.log('   Description:', halfHalfPizza.description)
    console.log('   Product Type:', halfHalfPizza.productType)
    console.log('   Category:', pizzaCategory.name)
    console.log('   Subcategory:', halfHalfSubcategory.name)
    
    // Get count of all pizza products for reference
    const allPizzas = await Product.find({ category: pizzaCategory._id, productType: 'regular' })
    console.log(`\n📊 Total regular pizza products available for halves: ${allPizzas.length}`)
    allPizzas.forEach((pizza, index) => {
      console.log(`   ${index + 1}. ${pizza.name} (ID: ${pizza._id})`)
    })
    
    return halfHalfPizza
    
  } catch (error) {
    console.error('❌ Error creating half-and-half pizza:', error.message)
    throw error
  } finally {
    mongoose.connection.close()
  }
}

// Run the script
createHalfAndHalfPizza().catch(console.error)