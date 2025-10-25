import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم المنتج مطلوب'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'سعر المنتج مطلوب'],
    min: [0, 'السعر يجب أن يكون أكبر من أو يساوي صفر']
  },
  category: {
    type: String,
    required: [true, 'فئة المنتج مطلوبة'],
    trim: true,
    default: 'pizza'
  },
  subcategory: {
    type: String,
    trim: true,
    default: 'أساسي'
  },
  available: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    trim: true,
    default: ''
  },
  productType: {
    type: String,
    enum: ['regular', 'half-half', 'simple'],
    default: 'regular'
  },
  hasVariants: {
    type: Boolean,
    default: true
  },
  hasAddons: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Add indexes for better query performance
ProductSchema.index({ category: 1, available: 1 })
ProductSchema.index({ name: 'text', description: 'text' })

// Clear existing model if it exists to avoid schema conflicts
if (mongoose.models.Product) {
  delete mongoose.models.Product
}

export default mongoose.model('Product', ProductSchema)