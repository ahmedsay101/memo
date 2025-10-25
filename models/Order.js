import mongoose from 'mongoose'

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and string for special products like "half-and-half"
    ref: 'Product'
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  notes: {
    type: String,
    default: ''
  },
  customization: mongoose.Schema.Types.Mixed
}, { _id: false })

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  customerName: {
    type: String,
    required: [true, 'اسم العميل مطلوب'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'العنوان مطلوب'],
    trim: true
  },
  branch: {
    type: String,
    required: [true, 'الفرع مطلوب'],
    enum: [
      'فرع الرياض الرئيسي', 
      'فرع العليا', 
      'فرع السليمانية', 
      'فرع شمال الرياض', 
      'فرع جنوب الرياض',
      'maadi',  // Add English branch names
      'nasr-city',
      'heliopolis',
      'downtown'
    ],
    default: 'فرع الرياض الرئيسي'
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

// Add indexes for better query performance
OrderSchema.index({ status: 1, createdAt: -1 })
OrderSchema.index({ orderNumber: 1 })
OrderSchema.index({ customerName: 1 })
OrderSchema.index({ phone: 1 })

// Pre-save middleware to generate order number
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const year = new Date().getFullYear()
    const count = await mongoose.model('Order').countDocuments()
    this.orderNumber = `${year}${String(count + 1).padStart(4, '0')}`
  }
  next()
})

export default mongoose.models.Order || mongoose.model('Order', OrderSchema)