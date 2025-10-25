import mongoose from 'mongoose'

const CategorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  nameEn: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

const SubcategorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  nameEn: {
    type: String,
    required: true
  },
  categoryId: {
    type: String,
    required: true,
    ref: 'Category'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Create compound index for category + subcategory uniqueness
SubcategorySchema.index({ categoryId: 1, id: 1 }, { unique: true })

export const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema)
export const Subcategory = mongoose.models.Subcategory || mongoose.model('Subcategory', SubcategorySchema)