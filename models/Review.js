import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم العميل مطلوب'],
    trim: true
  },
  text: {
    type: String,
    required: [true, 'نص التقييم مطلوب'],
    trim: true
  },
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
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

ReviewSchema.index({ order: 1 })
ReviewSchema.index({ isActive: 1 })

if (mongoose.models.Review) {
  delete mongoose.models.Review
}

export default mongoose.model('Review', ReviewSchema)
