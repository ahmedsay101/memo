import mongoose from 'mongoose'

const SlideSchema = new mongoose.Schema({
  title: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    required: [true, 'صورة السلايد مطلوبة']
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

SlideSchema.index({ order: 1 })
SlideSchema.index({ isActive: 1 })

if (mongoose.models.Slide) {
  delete mongoose.models.Slide
}

export default mongoose.model('Slide', SlideSchema)
