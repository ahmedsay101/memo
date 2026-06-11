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
    trim: true,
    default: 'فرع الرياض الرئيسي'
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  zone: {
    type: String,
    trim: true,
    default: ''
  },
  deliveryMethod: {
    type: String,
    enum: ['delivery', 'pickup'],
    default: 'delivery'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  mpgsOrderId: {
    type: String,
    trim: true,
    sparse: true,
    unique: true
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
OrderSchema.index({ customerName: 1 })
OrderSchema.index({ phone: 1 })

async function generateNextOrderNumber() {
  const year = String(new Date().getFullYear())
  const OrderModel = mongoose.model('Order')
  const lastOrder = await OrderModel.findOne({
    orderNumber: { $regex: `^${year}` }
  })
    .sort({ orderNumber: -1 })
    .select('orderNumber')
    .lean()

  let nextSeq = 1
  if (lastOrder?.orderNumber?.startsWith(year)) {
    const seq = parseInt(lastOrder.orderNumber.slice(year.length), 10)
    if (!isNaN(seq)) nextSeq = seq + 1
  }

  return `${year}${String(nextSeq).padStart(4, '0')}`
}

// Pre-save middleware to generate order number
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = await generateNextOrderNumber()
  }
  next()
})

export default mongoose.models.Order || mongoose.model('Order', OrderSchema)