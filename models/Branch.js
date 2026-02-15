import mongoose from 'mongoose'

const BranchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'اسم الفرع مطلوب'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'عنوان الفرع مطلوب'],
    trim: true
  },
  phone: {
    type: String,
    default: '15596',
    trim: true
  },
  hours: {
    type: String,
    default: 'يومياً: 10:00 ص - 2:00 ص',
    trim: true
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

BranchSchema.index({ order: 1 })
BranchSchema.index({ isActive: 1 })

if (mongoose.models.Branch) {
  delete mongoose.models.Branch
}

export default mongoose.model('Branch', BranchSchema)
