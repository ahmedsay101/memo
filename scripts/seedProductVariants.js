const mongoose = require('mongoose')

// Define schemas directly in seeding script
const ProductVariantSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['size', 'crust', 'flavor'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  subcategory: String,
  available: { type: Boolean, default: true },
  productType: {
    type: String,
    enum: ['regular', 'half-half', 'simple'],
    default: 'regular'
  },
  hasVariants: { type: Boolean, default: false },
  hasAddons: { type: Boolean, default: false }
}, {
  timestamps: true
})

const ProductVariant = mongoose.model('ProductVariant', ProductVariantSchema)
const Product = mongoose.model('Product', ProductSchema)

async function seedProductVariants() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-memo')
    
    console.log('Connected to MongoDB')
    
    // Clear existing variants
    await ProductVariant.deleteMany({})
    console.log('Cleared existing product variants')
    
    // Get all pizza products
    const pizzaProducts = await Product.find({ 
      $or: [
        { category: 'pizza' },
        { category: 'بيتزا' }
      ]
    })
    
    console.log(`Found ${pizzaProducts.length} pizza products`)
    
    const variants = []
    
    // Create variants for each pizza product
    for (const product of pizzaProducts) {
      // Size variants
      variants.push(
        {
          productId: product._id,
          name: 'صغير',
          type: 'size',
          price: 0, // Base price
          isDefault: true
        },
        {
          productId: product._id,
          name: 'وسط',
          type: 'size',
          price: 25,
          isDefault: false
        },
        {
          productId: product._id,
          name: 'كبير',
          type: 'size',
          price: 50,
          isDefault: false
        },
        {
          productId: product._id,
          name: 'عائلي',
          type: 'size',
          price: 80,
          isDefault: false
        }
      )
      
      // Crust variants
      variants.push(
        {
          productId: product._id,
          name: 'عجينة رقيقة',
          type: 'crust',
          price: 0,
          isDefault: true
        },
        {
          productId: product._id,
          name: 'عجينة سميكة',
          type: 'crust',
          price: 10,
          isDefault: false
        },
        {
          productId: product._id,
          name: 'عجينة محشوة جبن',
          type: 'crust',
          price: 25,
          isDefault: false
        }
      )
      
      // Update product to indicate it has variants
      await Product.findByIdAndUpdate(product._id, {
        hasVariants: true,
        hasAddons: true // Enable addons for pizzas
      })
    }
    
    // Create some flavor variants for half-half pizzas
    const halfHalfProducts = await Product.find({ 
      productType: 'half-half'
    })
    
    for (const product of halfHalfProducts) {
      // Common pizza flavors for half-half selection
      const flavors = [
        'مارجريتا',
        'بيبروني',
        'سجق',
        'دجاج باربيكيو',
        'فراخ رانش',
        'تونة',
        'خضروات'
      ]
      
      flavors.forEach((flavor, index) => {
        variants.push({
          productId: product._id,
          name: flavor,
          type: 'flavor',
          price: 0,
          isDefault: index === 0 // First flavor is default
        })
      })
    }
    
    // Insert all variants
    if (variants.length > 0) {
      await ProductVariant.insertMany(variants)
      console.log(`Seeded ${variants.length} product variants`)
    }
    
    // Show summary
    const variantsByType = await ProductVariant.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ])
    
    console.log('Variants created by type:')
    variantsByType.forEach(group => {
      console.log(`- ${group._id}: ${group.count} variants`)
    })
    
    await mongoose.connection.close()
    console.log('Database connection closed')
  } catch (error) {
    console.error('Error seeding product variants:', error)
    process.exit(1)
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedProductVariants()
}

module.exports = { seedProductVariants }