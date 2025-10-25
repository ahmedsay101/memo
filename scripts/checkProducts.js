const mongoose = require('mongoose')

// Define Product schema
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

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-memo')
    
    const products = await Product.find({})
    console.log(`Found ${products.length} products:`)
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - Category: ${product.category || 'N/A'} - Subcategory: ${product.subcategory || 'N/A'} - ${product.price} جنيه`)
    })
    
    // Look for pizza products
    const pizzaProducts = products.filter(p => 
      (p.name && p.name.includes('بيتزا')) || 
      (p.category && p.category.includes('بيتزا')) || 
      (p.category && p.category.includes('pizza')) ||
      (p.subcategory && p.subcategory.includes('بيتزا')) ||
      (p.subcategory && p.subcategory.includes('pizza'))
    )
    
    console.log(`\nPizza products found: ${pizzaProducts.length}`)
    pizzaProducts.forEach(product => {
      console.log(`- ${product.name} (ID: ${product._id}) - Category: ${product.category}`)
    })
    
    // Update some products to be pizzas for testing
    if (products.length > 0) {
      const firstProduct = products[0]
      await Product.findByIdAndUpdate(firstProduct._id, {
        category: 'بيتزا',
        productType: 'regular',
        hasVariants: true,
        hasAddons: true
      })
      console.log(`Updated "${firstProduct.name}" to be a pizza with variants and addons`)
      
      if (products.length > 1) {
        const secondProduct = products[1]
        await Product.findByIdAndUpdate(secondProduct._id, {
          category: 'بيتزا',
          productType: 'half-half',
          hasVariants: true,
          hasAddons: true
        })
        console.log(`Updated "${secondProduct.name}" to be a half-half pizza`)
      }
    }
    
    await mongoose.connection.close()
  } catch (error) {
    console.error('Error:', error)
  }
}

checkProducts()