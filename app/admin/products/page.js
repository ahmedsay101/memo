'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import AdminLayout from '../../../components/AdminLayout'

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  
  // Addons state
  const [addons, setAddons] = useState([])
  const [addonsLoading, setAddonsLoading] = useState(false)
  const [showAddAddonModal, setShowAddAddonModal] = useState(false)
  const [editingAddon, setEditingAddon] = useState(null)
  const [addonFormData, setAddonFormData] = useState({
    name: '',
    category: 'topping',
    sizes: [{ name: 'عادي', price: 0, isDefault: true }],
    image: '',
    imageFile: null,
    description: '',
    applicableCategories: ['pizza'],
    isAvailable: true
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.categories)
        setSubcategoriesByCategory(data.subcategories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId))
      } else {
        alert('حدث خطأ في حذف المنتج')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('حدث خطأ في حذف المنتج')
    }
  }

  // Addons functions
  const fetchAddons = async () => {
    setAddonsLoading(true)
    try {
      const response = await fetch('/api/admin/addons')
      const data = await response.json()
      if (data.success) {
        setAddons(data.addons)
      }
    } catch (error) {
      console.error('Error fetching addons:', error)
    } finally {
      setAddonsLoading(false)
    }
  }

  const handleAddonSubmit = async (e) => {
    e.preventDefault()
    
    try {
      let imageUrl = addonFormData.image

      // Upload image if a new file was selected
      if (addonFormData.imageFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('image', addonFormData.imageFile)

        const uploadResponse = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: uploadFormData
        })

        const uploadData = await uploadResponse.json()
        
        if (uploadData.success) {
          imageUrl = uploadData.imagePath
        } else {
          alert(uploadData.error || 'فشل في رفع الصورة')
          return
        }
      }

      const url = editingAddon 
        ? `/api/admin/addons/${editingAddon._id}`
        : '/api/admin/addons'
      
      const method = editingAddon ? 'PUT' : 'POST'
      
      const submitData = {
        ...addonFormData,
        image: imageUrl
      }
      delete submitData.imageFile // Remove the file object before sending

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(submitData),
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchAddons()
        setShowAddAddonModal(false)
        setEditingAddon(null)
        setAddonFormData({
          name: '',
          category: 'topping',
          price: 0,
          image: '',
          imageFile: null,
          description: '',
          applicableCategories: ['pizza'],
          isAvailable: true
        })
      } else {
        alert(data.error || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error saving addon:', error)
      alert('حدث خطأ في الاتصال')
    }
  }

  const handleEditAddon = (addon) => {
    setEditingAddon(addon)
    
    // Initialize sizes from existing data
    let sizes = []
    if (addon.sizes && addon.sizes.length > 0) {
      sizes = addon.sizes
    } else if (addon.price !== undefined) {
      // Convert old single price to new format
      sizes = [{ name: 'عادي', price: addon.price, isDefault: true }]
    } else {
      sizes = [{ name: 'عادي', price: 0, isDefault: true }]
    }
    
    setAddonFormData({
      name: addon.name,
      category: addon.category,
      sizes: sizes,
      image: addon.image || '',
      imageFile: null,
      description: addon.description || '',
      applicableCategories: addon.applicableCategories || ['pizza'],
      isAvailable: addon.isAvailable
    })
    setShowAddAddonModal(true)
  }

  const handleDeleteAddon = async (addonId) => {
    if (!confirm('هل أنت متأكد من حذف هذه الإضافة؟')) return
    
    try {
      const response = await fetch(`/api/admin/addons/${addonId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchAddons()
      } else {
        alert(data.error || 'حدث خطأ في الحذف')
      }
    } catch (error) {
      console.error('Error deleting addon:', error)
      alert('حدث خطأ في الحذف')
    }
  }

  // Addon size management functions
  const addAddonSize = () => {
    setAddonFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { name: '', price: '', isDefault: false }]
    }))
  }

  const removeAddonSize = (index) => {
    if (addonFormData.sizes.length <= 1) {
      alert('يجب أن يكون هناك مقاس واحد على الأقل')
      return
    }
    
    setAddonFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }))
  }

  const updateAddonSize = (index, field, value) => {
    setAddonFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, i) => 
        i === index ? { ...size, [field]: value } : size
      )
    }))
  }

  const setDefaultAddonSize = (index) => {
    setAddonFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, i) => 
        ({ ...size, isDefault: i === index })
      )
    }))
  }

  // Fetch addons when switching to addons tab
  useEffect(() => {
    if (activeTab === 'addons' && addons.length === 0) {
      fetchAddons()
    }
  }, [activeTab, addons.length])

  // Group products by category and subcategory
  const groupProductsByCategory = () => {
    const grouped = {}
    
    categories.forEach(category => {
      grouped[category.id] = {
        category: category,
        subcategories: {}
      }
      
      // Initialize subcategories for this category
      if (subcategoriesByCategory[category.id]) {
        subcategoriesByCategory[category.id].forEach(subcategory => {
          grouped[category.id].subcategories[subcategory.id] = {
            subcategory: subcategory,
            products: []
          }
        })
      }
      
      // Add products without subcategories
      grouped[category.id].subcategories['no-subcategory'] = {
        subcategory: { id: 'no-subcategory', name: 'منتجات أخرى' },
        products: []
      }
    })
    
    // Group products into their categories and subcategories
    products.forEach(product => {
      if (grouped[product.category]) {
        const subcategoryKey = product.subcategory || 'no-subcategory'
        
        // Find the subcategory by ID or name
        let targetSubcategory = null
        Object.keys(grouped[product.category].subcategories).forEach(key => {
          const sub = grouped[product.category].subcategories[key]
          if (sub.subcategory.id === subcategoryKey || sub.subcategory.name === subcategoryKey) {
            targetSubcategory = key
          }
        })
        
        if (targetSubcategory) {
          grouped[product.category].subcategories[targetSubcategory].products.push(product)
        } else {
          // Fallback to no-subcategory
          grouped[product.category].subcategories['no-subcategory'].products.push(product)
        }
      }
    })
    
    return grouped
  }

  const groupedProducts = groupProductsByCategory()

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
          <p className="text-gray-600 mb-3">{product.description}</p>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-teal-600">
              {product.sizes && product.sizes.length > 0 ? (
                // Show individual prices for each size
                <div className="space-y-1">
                  {product.sizes.map((size, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{size.name}:</span>
                      <span className="mr-1">{size.price} جنيه</span>
                      {size.isDefault && <span className="text-xs bg-green-100 text-green-600 px-1 rounded mr-1">افتراضي</span>}
                    </div>
                  ))}
                </div>
              ) : product.pricing ? (
                // Show individual prices for old pricing structure
                <div className="space-y-1">
                  {product.pricing.small !== undefined && (
                    <div className="text-sm">
                      <span className="font-medium">صغير:</span>
                      <span className="mr-1">{product.pricing.small} جنيه</span>
                    </div>
                  )}
                  {product.pricing.medium !== undefined && (
                    <div className="text-sm">
                      <span className="font-medium">متوسط:</span>
                      <span className="mr-1">{product.pricing.medium} جنيه</span>
                    </div>
                  )}
                  {product.pricing.large !== undefined && (
                    <div className="text-sm">
                      <span className="font-medium">كبير:</span>
                      <span className="mr-1">{product.pricing.large} جنيه</span>
                    </div>
                  )}
                </div>
              ) : (
                // Fallback to single price
                `${product.price} جنيه`
              )}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {product.available ? 'متوفر' : 'غير متوفر'}
            </span>
          </div>
        </div>
        <div className="relative w-20 h-20 ml-4 rounded-lg overflow-hidden bg-gray-100">
          {product.image ? (
            <Image 
              src={product.image} 
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setEditingProduct(product)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
        >
          تعديل
        </button>
        <button
          onClick={() => handleDelete(product.id)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
        >
          حذف
        </button>
      </div>
    </div>
  )

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                إدارة المنتجات والإضافات
              </h1>
              <p className="text-gray-600">
                إدارة قائمة منتجات المطعم والإضافات
              </p>
            </div>
            <button
              onClick={() => {
                if (activeTab === 'products') {
                  setShowAddModal(true)
                } else {
                  setShowAddAddonModal(true)
                  setEditingAddon(null)
                  setAddonFormData({
                    name: '',
                    category: 'topping',
                    price: 0,
                    image: '',
                    description: '',
                    applicableCategories: ['pizza'],
                    isAvailable: true
                  })
                }
              }}
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              {activeTab === 'products' ? '+ إضافة منتج جديد' : '+ إضافة جديدة'}
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" dir="ltr">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                المنتجات
              </button>
              <button
                onClick={() => setActiveTab('addons')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'addons'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                الإضافات
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' ? (
          <div>
            {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">جار التحميل...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">🍕</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              لا توجد منتجات
            </h3>
            <p className="text-gray-600 mb-6">
              ابدأ بإضافة منتجات جديدة لقائمة المطعم
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              إضافة أول منتج
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map(category => {
              const categoryData = groupedProducts[category.id]
              if (!categoryData) return null
              
              // Check if category has any products
              const hasProducts = Object.values(categoryData.subcategories).some(
                sub => sub.products.length > 0
              )
              
              if (!hasProducts) return null
              
              return (
                <div key={category.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Category Header */}
                  <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white p-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h2 className="text-2xl font-bold">{category.name}</h2>
                        <p className="text-teal-100">{category.nameEn}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subcategories and Products */}
                  <div className="p-6">
                    {Object.values(categoryData.subcategories).map(subcategoryData => {
                      if (subcategoryData.products.length === 0) return null
                      
                      return (
                        <div key={subcategoryData.subcategory.id} className="mb-8 last:mb-0">
                          {/* Subcategory Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-800">
                                {subcategoryData.subcategory.name}
                              </h3>
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                                {subcategoryData.products.length} منتج
                              </span>
                            </div>
                          </div>
                          
                          {/* Products Grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {subcategoryData.products.map(product => (
                              <ProductCard key={product.id} product={product} />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            
            {/* Show ungrouped products if any */}
            {products.some(p => !categories.find(c => c.id === p.category)) && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gray-500 text-white p-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">❓</span>
                    <div>
                      <h2 className="text-2xl font-bold">منتجات أخرى</h2>
                      <p className="text-gray-200">منتجات بدون فئة محددة</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {products
                      .filter(p => !categories.find(c => c.id === p.category))
                      .map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="text-blue-600 text-2xl mb-2">📊</div>
            <h3 className="text-lg font-semibold text-blue-800 mb-1">
              إجمالي المنتجات
            </h3>
            <p className="text-3xl font-bold text-blue-600">{products.length}</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-6">
            <div className="text-purple-600 text-2xl mb-2">🏷️</div>
            <h3 className="text-lg font-semibold text-purple-800 mb-1">
              الفئات
            </h3>
            <p className="text-3xl font-bold text-purple-600">{categories.length}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-6">
            <div className="text-green-600 text-2xl mb-2">✅</div>
            <h3 className="text-lg font-semibold text-green-800 mb-1">
              المنتجات المتوفرة
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {products.filter(p => p.available).length}
            </p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-6">
            <div className="text-yellow-600 text-2xl mb-2">⏸️</div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-1">
              المنتجات غير المتوفرة
            </h3>
            <p className="text-3xl font-bold text-yellow-600">
              {products.filter(p => !p.available).length}
            </p>
          </div>
        </div>
          </div>
        ) : (
          <div>
            {/* Addons Grid */}
            {addonsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">جار التحميل...</p>
              </div>
            ) : addons.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <div className="text-6xl mb-4">🍕</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  لا توجد إضافات
                </h3>
                <p className="text-gray-600 mb-4">
                  ابدأ بإضافة أول إضافة لمنتجاتك
                </p>
                <button
                  onClick={() => setShowAddAddonModal(true)}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  + إضافة أول إضافة
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {addons.map((addon) => (
                  <div key={addon._id} className="bg-white rounded-lg shadow-md p-4">
                    {addon.image && (
                      <div className="relative w-full h-32 mb-3">
                        <Image
                          src={addon.image}
                          alt={addon.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    <h3 className="font-bold text-lg mb-1">{addon.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {addon.category === 'topping' && 'إضافات البيتزا'}
                      {addon.category === 'sauce' && 'الصوص'}
                      {addon.category === 'drink' && 'المشروبات'}
                      {addon.category === 'side' && 'الأطباق الجانبية'}
                      {addon.category === 'dessert' && 'الحلويات'}
                    </p>
                    <p className="text-teal-600 font-bold mb-2">
                      {addon.price} جنيه
                    </p>
                    
                    {addon.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {addon.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        addon.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {addon.isAvailable ? 'متاح' : 'غير متاح'}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditAddon(addon)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDeleteAddon(addon._id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Addon Form Modal */}
        {showAddAddonModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 my-auto max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingAddon ? 'تعديل الإضافة' : 'إضافة جديدة'}
              </h2>
              
              <form onSubmit={handleAddonSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم الإضافة
                  </label>
                  <input
                    type="text"
                    value={addonFormData.name}
                    onChange={(e) => setAddonFormData({...addonFormData, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    التصنيف
                  </label>
                  <select
                    value={addonFormData.category}
                    onChange={(e) => setAddonFormData({...addonFormData, category: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="topping">إضافات البيتزا</option>
                    <option value="sauce">الصوص</option>
                    <option value="drink">المشروبات</option>
                    <option value="side">الأطباق الجانبية</option>
                    <option value="dessert">الحلويات</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      المقاسات والأسعار
                    </label>
                    <button
                      type="button"
                      onClick={addAddonSize}
                      className="bg-teal-500 hover:bg-teal-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                    >
                      <span>+</span>
                      إضافة مقاس
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {addonFormData.sizes.map((size, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={size.name}
                            onChange={(e) => updateAddonSize(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                            placeholder="اسم المقاس"
                            required
                          />
                        </div>
                        
                        <div className="flex-1">
                          <input
                            type="number"
                            step="0.01"
                            value={size.price}
                            onChange={(e) => updateAddonSize(index, 'price', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                            placeholder="السعر"
                            required
                          />
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setDefaultAddonSize(index)}
                            className={`text-xs px-1 py-1 rounded ${
                              size.isDefault 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            title={size.isDefault ? 'المقاس الافتراضي' : 'جعله افتراضي'}
                          >
                            {size.isDefault ? '✓' : 'افتراضي'}
                          </button>
                          
                          {addonFormData.sizes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAddonSize(index)}
                              className="bg-red-500 hover:bg-red-600 text-white px-1 py-1 rounded text-xs"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    صورة الإضافة
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        setAddonFormData({...addonFormData, imageFile: file})
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                  {addonFormData.image && (
                    <div className="mt-2">
                      <Image
                        src={addonFormData.image}
                        alt="معاينة الصورة"
                        width={80}
                        height={80}
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف
                  </label>
                  <textarea
                    value={addonFormData.description}
                    onChange={(e) => setAddonFormData({...addonFormData, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows="3"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={addonFormData.isAvailable}
                    onChange={(e) => setAddonFormData({...addonFormData, isAvailable: e.target.checked})}
                  />
                  <label htmlFor="isAvailable" className="text-sm">
                    متاح للطلب
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg"
                  >
                    {editingAddon ? 'تحديث' : 'إضافة'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddAddonModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {(showAddModal || editingProduct) && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowAddModal(false)
            setEditingProduct(null)
          }}
          onSave={() => {
            fetchProducts()
            setShowAddModal(false)
            setEditingProduct(null)
          }}
        />
      )}
      </div>
    </AdminLayout>
  )
}

// Product Modal Component
function ProductModal({ product, onClose, onSave }) {
  // Initialize sizes from existing data or create default structure
  const initializeSizes = () => {
    if (product?.sizes && product.sizes.length > 0) {
      // Use new dynamic sizes structure
      return product.sizes
    } else if (product?.pricing) {
      // Convert old pricing structure to new format
      const sizes = []
      if (product.pricing.small !== undefined) sizes.push({ name: 'صغير', price: product.pricing.small, isDefault: true })
      if (product.pricing.medium !== undefined) sizes.push({ name: 'متوسط', price: product.pricing.medium, isDefault: false })
      if (product.pricing.large !== undefined) sizes.push({ name: 'كبير', price: product.pricing.large, isDefault: false })
      return sizes.length > 0 ? sizes : [{ name: 'عادي', price: product.price || '', isDefault: true }]
    } else {
      // Default single size for new products
      return [{ name: 'عادي', price: product?.price || '', isDefault: true }]
    }
  }

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    sizes: initializeSizes(),
    category: product?.category || '',
    subcategory: product?.subcategory || '',
    available: product?.available ?? true,
    image: product?.image || '',
    flags: product?.flags || []
  })
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(product?.image || '')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [categories, setCategories] = useState([])
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState({})
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        
        if (data.success) {
          setCategories(data.categories)
          setSubcategoriesByCategory(data.subcategories)
          
          // Set default category and subcategory if not editing existing product
          if (!product) {
            if (data.categories.length > 0) {
              const defaultCategory = data.categories[0].id
              const defaultSubcategory = data.subcategories[defaultCategory]?.[0]?.id || 'basic'
              setFormData(prev => ({
                ...prev,
                category: defaultCategory,
                subcategory: defaultSubcategory
              }))
            } else {
              // Fallback to pizza when no categories exist
              setFormData(prev => ({
                ...prev,
                category: 'pizza',
                subcategory: 'vegetables-cheese'
              }))
            }
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }
    
    fetchCategories()
  }, [product])

  // Size management functions
  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { name: '', price: '', isDefault: false }]
    }))
  }

  const removeSize = (index) => {
    if (formData.sizes.length <= 1) {
      alert('يجب أن يكون هناك مقاس واحد على الأقل')
      return
    }
    
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }))
  }

  const updateSize = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, i) => 
        i === index ? { ...size, [field]: value } : size
      )
    }))
  }

  const setDefaultSize = (index) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, i) => 
        ({ ...size, isDefault: i === index })
      )
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت')
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح')
        return
      }

      setImageFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return formData.image

    setUploadingImage(true)
    try {
      const formDataForUpload = new FormData()
      formDataForUpload.append('image', imageFile)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formDataForUpload
      })

      if (response.ok) {
        const data = await response.json()
        return data.imagePath
      } else {
        throw new Error('فشل في رفع الصورة')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('حدث خطأ في رفع الصورة')
      return formData.image
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Upload image first if there's a new image
      const imagePath = await uploadImage()
      
      const dataToSend = {
        ...formData,
        image: imagePath
      }

      const url = product 
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products'
      
      const method = product ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(dataToSend)
      })

      if (response.ok) {
        onSave()
      } else {
        alert('حدث خطأ في حفظ المنتج')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('حدث خطأ في حفظ المنتج')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-4" dir="rtl">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 my-auto max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {product ? 'تعديل منتج' : 'إضافة منتج جديد'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المنتج
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows="3"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                المقاسات والأسعار
              </label>
              <button
                type="button"
                onClick={addSize}
                className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
              >
                <span>+</span>
                إضافة مقاس
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.sizes.map((size, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={size.name}
                      onChange={(e) => updateSize(index, 'name', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="اسم المقاس"
                      required
                    />
                  </div>
                  
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.01"
                      value={size.price}
                      onChange={(e) => updateSize(index, 'price', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="السعر"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDefaultSize(index)}
                      className={`text-xs px-2 py-1 rounded ${
                        size.isDefault 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title={size.isDefault ? 'المقاس الافتراضي' : 'جعله افتراضي'}
                    >
                      {size.isDefault ? '✓' : 'افتراضي'}
                    </button>
                    
                    {formData.sizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الفئة
            </label>
            <select
              value={formData.category}
              onChange={(e) => {
                const selectedCategory = e.target.value
                let defaultSubcategory = 'أساسي'
                
                // If categories exist, use dynamic subcategories
                if (categories.length > 0) {
                  defaultSubcategory = subcategoriesByCategory[selectedCategory]?.[0]?.id || 'basic'
                } else {
                  // Fallback subcategories when no categories in database
                  if (selectedCategory === 'pizza') {
                    defaultSubcategory = 'vegetables-cheese'
                  }
                }
                
                setFormData({
                  ...formData, 
                  category: selectedCategory,
                  subcategory: defaultSubcategory
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={loadingCategories}
            >
              {loadingCategories ? (
                <option>جاري تحميل الفئات...</option>
              ) : categories.length === 0 ? (
                <>
                  <option value="pizza">بيتزا</option>
                  <option value="burgers">برجر</option>
                  <option value="appetizers">مقبلات</option>
                  <option value="drinks">مشروبات</option>
                  <option value="desserts">حلويات</option>
                </>
              ) : (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Subcategory Field - Show if category has subcategories or is pizza with fallback */}
          {formData.category && (
            (subcategoriesByCategory[formData.category]?.length > 0) || 
            (categories.length === 0 && formData.category === 'pizza')
          ) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفئة الفرعية
              </label>
              <select
                value={formData.subcategory}
                onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {categories.length === 0 && formData.category === 'pizza' ? (
                  // Fallback subcategories for pizza when no categories in database
                  <>
                    <option value="vegetables-cheese">خضروات و جبن</option>
                    <option value="meat">لحوم</option>
                    <option value="chicken">دجاج</option>
                    <option value="seafood">سي فود</option>
                    <option value="half-pizza">بيتزا نصين</option>
                  </>
                ) : (
                  // Dynamic subcategories from database
                  subcategoriesByCategory[formData.category]?.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              صورة المنتج
            </label>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-4">
                <div className="relative w-32 h-32 rounded-lg border border-gray-300 overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={imagePreview} 
                    alt="معاينة الصورة"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            {/* File Input */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              اختر صورة بصيغة JPG، PNG أو GIF (حد أقصى 5 ميجابايت)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العلامات
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.flags.map((flag, index) => (
                <span key={index} className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-arabic">
                  {flag}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, flags: prev.flags.filter((_, i) => i !== index) }))}
                    className="text-orange-500 hover:text-orange-700 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                id="flagInput"
                placeholder="مثال: جديد، الأكثر مبيعاً"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const val = e.target.value.trim()
                    if (val && !formData.flags.includes(val)) {
                      setFormData(prev => ({ ...prev, flags: [...prev.flags, val] }))
                      e.target.value = ''
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('flagInput')
                  const val = input.value.trim()
                  if (val && !formData.flags.includes(val)) {
                    setFormData(prev => ({ ...prev, flags: [...prev.flags, val] }))
                    input.value = ''
                  }
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md text-sm"
              >
                إضافة
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {['جديد', 'الأكثر مبيعاً', 'عرض خاص', 'حصري'].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    if (!formData.flags.includes(suggestion)) {
                      setFormData(prev => ({ ...prev, flags: [...prev.flags, suggestion] }))
                    }
                  }}
                  className={`text-xs px-2 py-1 rounded-full border ${
                    formData.flags.includes(suggestion)
                      ? 'bg-orange-100 border-orange-300 text-orange-600'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({...formData, available: e.target.checked})}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="available" className="mr-2 text-sm text-gray-700">
              متوفر للطلب
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-md font-semibold disabled:opacity-50"
            >
              {uploadingImage ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  جار رفع الصورة...
                </span>
              ) : loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  جار الحفظ...
                </span>
              ) : 'حفظ'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading || uploadingImage}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-semibold disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}