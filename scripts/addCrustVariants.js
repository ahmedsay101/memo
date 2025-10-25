const mongoose = require('mongoose')

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
  category: String
})

const ProductVariant = mongoose.model('ProductVariant', ProductVariantSchema)
const Product = mongoose.model('Product', ProductSchema)

const crustVariants = [
  { name: 'أطراف عادية', price: 0, isDefault: true },
  { name: 'أطراف محشية', price: 25 }
]

async function addCrustVariants() {
  try {
    await mongoose.connect('mongodb://localhost:27017/restaurant-memo')
    console.log('Connected to MongoDB')
    
    // Get pizza products
    const pizzaProducts = await Product.find({ category: 'pizza' })
    
    if (pizzaProducts.length === 0) {
      console.log('No pizza products found')
      return
    }
    
    // Add crust variants for each pizza product
    for (const pizzaProduct of pizzaProducts) {
      console.log('Adding crust variants for:', pizzaProduct.name)
      
      // Delete existing crust variants for this product
      await ProductVariant.deleteMany({ 
        productId: pizzaProduct._id, 
        type: 'crust' 
      })
      
      // Add crust variants
      for (const crustData of crustVariants) {
        await ProductVariant.create({
          productId: pizzaProduct._id,
          name: crustData.name,
          type: 'crust',
          price: crustData.price,
          isDefault: crustData.isDefault || false
        })
      }
    }
    
    console.log('Added crust variants for all pizza products')
    
    await mongoose.connection.close()
  } catch (error) {
    console.error('Error:', error)
  }
}

addCrustVariants()