const mongoose = require('mongoose')

// Define Product schema for CommonJS
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: String, required: true },
  subcategory: { type: String },
  available: { type: Boolean, default: true },
  productType: { 
    type: String, 
    enum: ['regular', 'half-half', 'simple'], 
    default: 'regular' 
  },
  hasVariants: { type: Boolean, default: false },
  hasAddons: { type: Boolean, default: false }
})

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)

async function checkAllProducts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/memo-restaurant')
    console.log('Connected to MongoDB')
    
    const products = await Product.find({})
    console.log('Total products found:', products.length)
    
    if (products.length > 0) {
      console.log('\nAll products:')
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - Category: ${product.category} - Subcategory: ${product.subcategory}`)
      })
      
      // Look for pizza products
      const pizzaProducts = products.filter(p => 
        p.name.includes('بيتزا') || 
        p.category.includes('بيتزا') || 
        p.category.includes('pizza') ||
        p.subcategory.includes('بيتزا') ||
        p.subcategory.includes('pizza')
      )
      
      console.log('\nPizza products found:', pizzaProducts.length)
      pizzaProducts.forEach(product => {
        console.log(`- ${product.name} (ID: ${product._id}) - Category: ${product.category}`)
      })
    } else {
      console.log('No products found in database')
    }
    
    await mongoose.connection.close()
  } catch (error) {
    console.error('Error:', error)
  }
}

checkAllProducts()