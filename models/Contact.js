import mongoose from 'mongoose'

const contactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'الاسم الأول مطلوب'],
    trim: true,
    maxlength: [50, 'الاسم الأول يجب أن يكون أقل من 50 حرف']
  },
  lastName: {
    type: String,
    required: [true, 'الاسم الأخير مطلوب'],
    trim: true,
    maxlength: [50, 'الاسم الأخير يجب أن يكون أقل من 50 حرف']
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\+]?[1-9][\d]{0,15}$/.test(v)
      },
      message: 'رقم الهاتف غير صحيح'
    }
  },
  subject: {
    type: String,
    required: [true, 'الموضوع مطلوب'],
    enum: {
      values: ['تقييم', 'شكوى', 'سؤال', 'اخرى'],
      message: 'الموضوع يجب أن يكون أحد القيم المحددة'
    }
  },
  message: {
    type: String,
    required: [true, 'الرسالة مطلوبة'],
    trim: true,
    maxlength: [1000, 'الرسالة يجب أن تكون أقل من 1000 حرف']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  response: {
    type: String,
    default: null
  },
  responseDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// Add index for better performance
contactSchema.index({ createdAt: -1 })
contactSchema.index({ isRead: 1 })
contactSchema.index({ subject: 1 })

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema)

export default Contact