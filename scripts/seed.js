// Simple seeder using direct MongoDB connection
const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

// Product Schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, default: 'أساسي' },
  available: { type: Boolean, default: true },
  image: { type: String, default: '' }
}, { timestamps: true })

// Order Schema
const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  notes: { type: String, default: '' }
}, { _id: false })

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  branch: { type: String, required: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  notes: { type: String, default: '' }
}, { timestamps: true })

// Generate order number
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const year = new Date().getFullYear()
    const count = await this.constructor.countDocuments()
    this.orderNumber = `${year}${String(count + 1).padStart(4, '0')}`
  }
  next()
})

// Category Schema
const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  nameEn: { type: String, required: true },
  icon: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

// Subcategory Schema
const SubcategorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  nameEn: { type: String, required: true },
  categoryId: { type: String, required: true, ref: 'Category' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

SubcategorySchema.index({ categoryId: 1, id: 1 }, { unique: true })

const Product = mongoose.model('Product', ProductSchema)
const Order = mongoose.model('Order', OrderSchema)
const Category = mongoose.model('Category', CategorySchema)
const Subcategory = mongoose.model('Subcategory', SubcategorySchema)

async function seedData() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI
    console.log('Connecting to:', MONGODB_URI)
    await mongoose.connect(MONGODB_URI)
    
    console.log('🌱 Starting database seeding...')

    // Clear existing data
    await Product.deleteMany({})
    await Order.deleteMany({})
    await Category.deleteMany({})
    await Subcategory.deleteMany({})
    console.log('🗑️  Cleared existing data')

    // Seed Categories
    const categories = [
      {
        id: 'pizza',
        name: 'بيتزا',
        nameEn: 'Pizza',
        icon: '🍕',
        order: 1,
        isActive: true
      },
      {
        id: 'sauces',
        name: 'صوصات',
        nameEn: 'Sauces',
        icon: '🥄',
        order: 2,
        isActive: true
      },
      {
        id: 'snacks-salads',
        name: 'سناكس و سلطات',
        nameEn: 'Snacks & Salads',
        icon: '🥗',
        order: 3,
        isActive: true
      },
      {
        id: 'combo-drinks',
        name: 'كومبو ومشروبات',
        nameEn: 'Combo & Drinks',
        icon: '🥤',
        order: 4,
        isActive: true
      }
    ]

    await Category.insertMany(categories)
    console.log('✅ Created categories')

    // Seed Subcategories (only for pizza)
    const subcategories = [
      // Pizza subcategories
      { id: 'vegetables-cheese', name: 'خضروات و جبن', nameEn: 'Vegetables & Cheese', categoryId: 'pizza', order: 1 },
      { id: 'meat', name: 'لحوم', nameEn: 'Meat', categoryId: 'pizza', order: 2 },
      { id: 'chicken', name: 'دجاج', nameEn: 'Chicken', categoryId: 'pizza', order: 3 },
      { id: 'seafood', name: 'سي فود', nameEn: 'Seafood', categoryId: 'pizza', order: 4 },
      { id: 'half-pizza', name: 'بيتزا نصين', nameEn: 'Half Pizza', categoryId: 'pizza', order: 5 }
    ]

    await Subcategory.insertMany(subcategories)
    console.log('✅ Created subcategories')

    // Seed Products
    const products = [
      // Pizza - Vegetables & Cheese
      {
        name: 'بيتزا مارجريتا',
        description: 'بيتزا كلاسيكية بالجبن الموتزاريلا والطماطم والريحان الطازج',
        price: 35,
        category: 'pizza',
        subcategory: 'vegetables-cheese',
        available: true,
        image: '/uploads/products/pizza-margherita.jpg'
      },
      {
        name: 'بيتزا الخضار',
        description: 'بيتزا نباتية بالفلفل الملون والطماطم والزيتون والفطر',
        price: 40,
        category: 'pizza',
        subcategory: 'vegetables-cheese',
        available: true,
        image: ''
      },
      // Pizza - Meat
      {
        name: 'بيتزا اللحم',
        description: 'بيتزا بلحم البقر المتبل والجبن الذائب',
        price: 50,
        category: 'pizza',
        subcategory: 'meat',
        available: true,
        image: ''
      },
      // Pizza - Chicken
      {
        name: 'بيتزا الدجاج',
        description: 'بيتزا بقطع الدجاج المشوية والخضار',
        price: 45,
        category: 'pizza',
        subcategory: 'chicken',
        available: true,
        image: ''
      },
      // Pizza - Seafood
      {
        name: 'بيتزا السي فود',
        description: 'بيتزا بالجمبري والكاليماري وخلطة البحر الأبيض المتوسط',
        price: 60,
        category: 'pizza',
        subcategory: 'seafood',
        available: true,
        image: ''
      },
      // Sauces
      {
        name: 'صوص الثوم',
        description: 'صوص الثوم الكريمي اللذيذ',
        price: 5,
        category: 'sauces',
        available: true,
        image: ''
      },
      {
        name: 'صوص الباربكيو',
        description: 'صوص الباربكيو الحار والمدخن',
        price: 5,
        category: 'sauces',
        available: true,
        image: ''
      },
      // Snacks & Salads
      {
        name: 'سلطة يونانية',
        description: 'سلطة منعشة بالطماطم والخيار وجبن الفيتا',
        price: 20,
        category: 'snacks-salads',
        available: true,
        image: ''
      },
      {
        name: 'بطاطس مقلية',
        description: 'بطاطس مقلية ذهبية مقرمشة',
        price: 15,
        category: 'snacks-salads',
        available: true,
        image: ''
      },
      // Combo & Drinks
      {
        name: 'كومبو البيتزا',
        description: 'بيتزا متوسطة + مشروب غازي + بطاطس',
        price: 55,
        category: 'combo-drinks',
        available: true,
        image: ''
      },
      {
        name: 'مشروب غازي',
        description: 'مشروب غازي منعش بنكهات مختلفة',
        price: 8,
        category: 'combo-drinks',
        available: true,
        image: ''
      },
      {
        name: 'عصير طبيعي',
        description: 'عصير طبيعي طازج 100%',
        price: 12,
        category: 'combo-drinks',
        available: true,
        image: ''
      }
    ]

    const createdProducts = await Product.insertMany(products)
    console.log(`✅ Created ${createdProducts.length} products`)

    // Seed Orders
    const orders = [
      {
        orderNumber: '20250001',
        customerName: 'أحمد محمد علي',
        phone: '0501234567',
        address: 'شارع الملك عبدالعزيز، حي النزهة، الرياض 12345',
        branch: 'فرع الرياض الرئيسي',
        status: 'pending',
        items: [
          {
            productId: createdProducts[0]._id,
            name: 'بيتزا مارجريتا',
            quantity: 2,
            price: 35,
            notes: 'بدون جبن إضافي'
          },
          {
            productId: createdProducts[1]._id,
            name: 'بيتزا بيبروني',
            quantity: 1,
            price: 45,
            notes: ''
          }
        ],
        totalAmount: 115,
        notes: 'توصيل سريع من فضلك'
      },
      {
        orderNumber: '20250002',
        customerName: 'فاطمة علي السعد',
        phone: '0559876543',
        address: 'طريق الملك فهد، حي العليا، الرياض 11564',
        branch: 'فرع العليا',
        status: 'preparing',
        items: [
          {
            productId: createdProducts[4]._id,
            name: 'برجر اللحم الكلاسيكي',
            quantity: 3,
            price: 25,
            notes: 'إضافة جبن إضافي'
          },
          {
            productId: createdProducts[7]._id,
            name: 'بطاطس مقلية كبيرة',
            quantity: 2,
            price: 15,
            notes: ''
          }
        ],
        totalAmount: 105
      },
      {
        orderNumber: '20250003',
        customerName: 'خالد السعد محمد',
        phone: '0541122334',
        address: 'شارع التحلية، حي السليمانية، الرياض 11533',
        branch: 'فرع السليمانية',
        status: 'delivered',
        items: [
          {
            productId: createdProducts[2]._id,
            name: 'بيتزا مشكلة',
            quantity: 1,
            price: 55,
            notes: 'حار جداً'
          },
          {
            productId: createdProducts[9]._id,
            name: 'عصير برتقال طازج',
            quantity: 1,
            price: 12,
            notes: ''
          }
        ],
        totalAmount: 67
      },
      {
        orderNumber: '20250004',
        customerName: 'سارة أحمد حسن',
        phone: '0567788990',
        address: 'حي الملقا، شمال الرياض 13521',
        branch: 'فرع شمال الرياض',
        status: 'ready',
        items: [
          {
            productId: createdProducts[3]._id,
            name: 'بيتزا الخضار',
            quantity: 1,
            price: 40,
            notes: 'بدون فلفل حار'
          },
          {
            productId: createdProducts[9]._id,
            name: 'عصير برتقال طازج',
            quantity: 2,
            price: 12,
            notes: ''
          },
          {
            productId: createdProducts[11]._id,
            name: 'كيك الشوكولاتة',
            quantity: 1,
            price: 18,
            notes: ''
          }
        ],
        totalAmount: 82
      },
      {
        orderNumber: '20250005',
        customerName: 'محمد عبدالله الأحمد',
        phone: '0555123456',
        address: 'شارع العروبة، حي الملز، الرياض 12613',
        branch: 'فرع الرياض الرئيسي',
        status: 'confirmed',
        items: [
          {
            productId: createdProducts[1]._id,
            name: 'بيتزا بيبروني',
            quantity: 2,
            price: 45,
            notes: ''
          },
          {
            productId: createdProducts[8]._id,
            name: 'أجنحة الدجاج الحارة',
            quantity: 1,
            price: 28,
            notes: 'صوص إضافي'
          }
        ],
        totalAmount: 118
      }
    ]

    // Create orders one by one to trigger pre-save middleware
    const createdOrders = []
    for (const orderData of orders) {
      const order = new Order(orderData)
      await order.save()
      createdOrders.push(order)
    }
    console.log(`✅ Created ${createdOrders.length} orders`)

    console.log('🎉 Database seeding completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - Products: ${createdProducts.length}`)
    console.log(`   - Orders: ${createdOrders.length}`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    process.exit()
  }
}

seedData()