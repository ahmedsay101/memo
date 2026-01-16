import mongoose from 'mongoose'

const AddonSchema = new mongoose.Schema({
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
    min: 0
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
  image: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['topping', 'sauce', 'drink', 'side', 'dessert'],
    default: 'topping'
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isSpicy: {
    type: Boolean,
    default: false
  },
  available: {
    type: Boolean,
    default: true
  },
  applicableCategories: [{
    type: String,
    trim: true
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

AddonSchema.index({ category: 1, available: 1 })
AddonSchema.index({ applicableCategories: 1 })

export default mongoose.models.Addon || mongoose.model('Addon', AddonSchema)