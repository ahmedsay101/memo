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
  sizes: [{
    name: {
      type: String,
      required: [true, 'اسم المقاس مطلوب'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'سعر المقاس مطلوب'],
      min: [0, 'السعر يجب أن يكون أكبر من أو يساوي صفر']
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  // Keep old pricing structure for backward compatibility
  pricing: {
    small: {
      type: Number,
      min: [0, 'السعر يجب أن يكون أكبر من أو يساوي صفر']
    },
    medium: {
      type: Number,
      min: [0, 'السعر يجب أن يكون أكبر من أو يساوي صفر']
    },
    large: {
      type: Number,
      min: [0, 'السعر يجب أن يكون أكبر من أو يساوي صفر']
    }
  },
  // Keep old price field for backward compatibility, but make it optional
  price: {
    type: Number,
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
  },
  flags: [{
    type: String,
    trim: true
  }]
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