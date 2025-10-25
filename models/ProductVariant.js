import mongoose from 'mongoose'

const ProductVariantSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  nameEn: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    required: true,
    enum: ['size', 'crust', 'flavor'],
    default: 'size'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  available: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

ProductVariantSchema.index({ productId: 1, type: 1 })
ProductVariantSchema.index({ productId: 1, isDefault: 1 })

export default mongoose.models.ProductVariant || mongoose.model('ProductVariant', ProductVariantSchema)