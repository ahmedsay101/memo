const mongoose = require('mongoose')

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

const Product = mongoose.model('Product', ProductSchema)

async function checkProductFlags() {
  try {
    await mongoose.connect('mongodb://localhost:27017/restaurant-memo')
    
    const pizzaProducts = await Product.find({ category: 'pizza' })
    console.log('Pizza products customization flags:')
    pizzaProducts.forEach(product => {
      console.log(`- ${product.name}:`)
      console.log(`  hasVariants: ${product.hasVariants}`)
      console.log(`  hasAddons: ${product.hasAddons}`)
      console.log(`  productType: ${product.productType}`)
      console.log('')
    })
    
    // Update all pizza products to have customization flags
    const updateResult = await Product.updateMany(
      { category: 'pizza' },
      { 
        hasVariants: true, 
        hasAddons: true,
        productType: 'regular'
      }
    )
    
    console.log(`Updated ${updateResult.modifiedCount} pizza products with customization flags`)
    
    await mongoose.connection.close()
  } catch (error) {
    console.error('Error:', error)
  }
}

checkProductFlags()