const mongoose = require('mongoose')

// Define schemas
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

const sizeVariants = [
  { name: 'صغير', price: 0, isDefault: true },
  { name: 'وسط', price: 15 },
  { name: 'كبير', price: 30 }
]

async function addSampleVariants() {
  try {
    await mongoose.connect('mongodb://localhost:27017/restaurant-memo')
    console.log('Connected to MongoDB')
    
    // Get first pizza product
    const pizzaProduct = await Product.findOne({ category: 'pizza' })
    
    if (!pizzaProduct) {
      console.log('No pizza products found')
      return
    }
    
    console.log('Adding variants for:', pizzaProduct.name)
    
    // Clear existing variants for this product
    await ProductVariant.deleteMany({ productId: pizzaProduct._id })
    
    // Add size variants
    for (const sizeData of sizeVariants) {
      await ProductVariant.create({
        productId: pizzaProduct._id,
        name: sizeData.name,
        type: 'size',
        price: sizeData.price,
        isDefault: sizeData.isDefault || false
      })
    }
    
    console.log('Added size variants for pizza product')
    
    await mongoose.connection.close()
  } catch (error) {
    console.error('Error:', error)
  }
}

addSampleVariants()