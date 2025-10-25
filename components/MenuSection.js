'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import ProductCustomizationModal from './ProductCustomizationModal'

export default function MenuSection() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState({})
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [cartItems, setCartItems] = useState([])
  const [showCustomizationModal, setShowCustomizationModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('memoCart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  // Fetch categories and subcategories
  const fetchCategories = async () => {
    try {
      console.log('MenuSection: Fetching categories...')
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      console.log('MenuSection: Categories API response:', data)
      
      if (data.success) {
        setCategories(data.categories)
        setSubcategoriesByCategory(data.subcategories)
        
        // Set first category as default, or empty string if no categories
        if (data.categories.length > 0) {
          console.log('MenuSection: Setting selectedCategory to:', data.categories[0].id)
          setSelectedCategory(data.categories[0].id)
        } else {
          console.log('MenuSection: No categories found, setting selectedCategory to empty string')
          setSelectedCategory('') // This will fetch all products
        }
      } else {
        console.error('Error fetching categories:', data.error)
        // If categories API fails, still try to fetch all products
        setSelectedCategory('')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      // If categories API fails, still try to fetch all products
      setSelectedCategory('')
    }
  }

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      let url = '/api/products?available=true'
      
      // Only filter by category if one is selected and it's not empty
      if (selectedCategory && selectedCategory !== '') {
        url += `&category=${selectedCategory}`
      }
      
      console.log('MenuSection: Fetching products from:', url)
      const response = await fetch(url)
      const data = await response.json()
      
      console.log('MenuSection: Products API response:', data)
      
      if (data.success) {
        setProducts(data.products)
        console.log('MenuSection: Set products:', data.products.length, 'items')
      } else {
        console.error('Error fetching products:', data.error)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory])

  // Group products by subcategory
  const groupedProducts = products.reduce((acc, product) => {
    const subcategory = product.subcategory || 'أخرى'
    if (!acc[subcategory]) {
      acc[subcategory] = []
    }
    acc[subcategory].push(product)
    return acc
  }, {})

  // Initialize component - fetch categories and products
  useEffect(() => {
    fetchCategories()
  }, [])

  // Fetch products when selected category changes
  useEffect(() => {
    console.log('MenuSection: selectedCategory changed to:', selectedCategory)
    if (selectedCategory !== null && selectedCategory !== undefined) {
      console.log('MenuSection: Triggering fetchProducts...')
      fetchProducts()
    }
  }, [selectedCategory, fetchProducts])

  const [showNotification, setShowNotification] = useState(false)
  const [notificationProduct, setNotificationProduct] = useState('')

  const handleProductClick = (product) => {
    // Add category information to product for modal
    const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)
    const productWithCategory = {
      ...product,
      categoryName: selectedCategoryData?.name || '',
      categoryId: selectedCategory
    }
    
    // ALL products should open customization modal (at minimum for size selection)
    setSelectedProduct(productWithCategory)
    setShowCustomizationModal(true)
  }

  const addToCart = (product, quantity = 1, customization = null) => {
    try {
      const existingCart = JSON.parse(localStorage.getItem('memoCart') || '[]')
      
      // Create unique key for customized products
      const productKey = customization ? 
        `${product.id}-${JSON.stringify(customization)}` : 
        product.id
      
      const existingItem = existingCart.find(item => item.productKey === productKey)
      
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        const cartItem = {
          productKey,
          id: product.id,
          name: product.name,
          price: product.price, // This price already includes customizations when passed from modal
          image: product.image,
          quantity,
          description: product.description,
          customization
        }
        
        existingCart.push(cartItem)
      }
      
      localStorage.setItem('memoCart', JSON.stringify(existingCart))
      setCartItems(existingCart)
      
      // Dispatch custom event to update header cart count
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      
      // Show notification feedback
      setNotificationProduct(product.name)
      setShowNotification(true)
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false)
        setNotificationProduct('')
      }, 3000)
      
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId)
  }



  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto" dir="rtl">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 font-arabic mb-4">
            اطلب البيتزا اللي بتحبها
          </h2>
          <div className="w-16 h-1 mx-auto" style={{ backgroundColor: '#009495' }}></div>
        </div>

        {/* Category Tabs - Only show if categories exist */}
        {categories.length > 0 && (
          <div className="flex justify-center mb-8 overflow-x-auto">
            <div className="flex gap-4 bg-white rounded-lg p-2 shadow-sm">
              {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-arabic font-bold transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'text-white'
                    : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: selectedCategory === category.id ? '#FF8500' : 'transparent'
                }}
              >
                <span className="text-lg">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Products by Subcategory */}
        {loading ? (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
            {/* Main loading container */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* Simple elegant spinner */}
              <div className="relative">
                <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-l-orange-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>

              {/* Loading text */}
              <div className="text-center">
                <p className="text-lg text-white font-arabic animate-pulse">
                  جاري تحميل المنتجات...
                </p>
              </div>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-800 font-arabic mb-2">
              لا توجد منتجات
            </h3>
            <p className="text-gray-600 font-arabic">
              لا توجد منتجات في هذه الفئة حالياً
            </p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {/* If categories exist and a category is selected, show by subcategory */}
            {categories.length > 0 && selectedCategory && subcategoriesByCategory[selectedCategory] ? (
              <>
                {/* Regular subcategories */}
                {subcategoriesByCategory[selectedCategory].map((subcategory) => {
                  const subcategoryProducts = products.filter(product => 
                    product.subcategory === subcategory.id || product.subcategory === subcategory.name
                  )
                  
                  if (subcategoryProducts.length === 0) return null
                
                return (
                  <div key={subcategory.id} className="mb-16">
                    {/* Subcategory Heading */}
                    <div className="text-right mb-8">
                      <h3 className="text-3xl font-bold text-gray-800 font-arabic mb-2">
                        {subcategory.name}
                      </h3>
                      <div className="w-12 h-1" style={{ backgroundColor: '#FF8500' }}></div>
                    </div>
                    
                    {/* Products Grid for this subcategory */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {subcategoryProducts.map((product) => (
                      <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                        {/* Product Image */}
                        <div className="relative h-48 bg-gray-100">
                          {product.image ? (
                            <Image 
                              src={product.image} 
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                              </svg>
                            </div>
                          )}
                          {!product.available && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="text-white font-arabic font-bold bg-red-600 px-4 py-2 rounded-lg">
                                غير متوفر
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold font-arabic mb-2 text-gray-800">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 font-arabic text-sm mb-4 leading-relaxed">
                            {product.description}
                          </p>
                          
                          {/* Price and Add Button */}
                          <div className="flex items-center justify-between">
                            <div className="text-right">
                              <span className="text-2xl font-bold text-gray-800 font-arabic">
                                {product.price} جنيه
                              </span>
                            </div>
                            <button 
                              onClick={() => handleProductClick(product)}
                              disabled={!product.available}
                              className={`px-6 py-2 rounded-lg font-arabic font-bold text-white transition-colors duration-200 ${
                                product.available 
                                  ? 'hover:opacity-90 cursor-pointer' 
                                  : 'opacity-50 cursor-not-allowed'
                              }`}
                              style={{ backgroundColor: product.available ? '#009495' : '#666' }}
                            >
                              + أضف للسلة
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            
            {/* Add half-and-half pizza as the last section for pizza category */}
            {(() => {
              const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)
              const isPizzaCategory = selectedCategoryData?.name === 'بيتزا'
              
              if (isPizzaCategory) {
                return (
                  <div className="mb-16">
                    {/* Half-and-Half Subcategory Heading */}
                    <div className="text-right mb-8">
                      <h3 className="text-3xl font-bold text-gray-800 font-arabic mb-2">
                        بيتزا نصين
                      </h3>
                      <div className="w-12 h-1" style={{ backgroundColor: '#FF8500' }}></div>
                    </div>
                    
                    {/* Half-and-Half Pizza Product */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                        {/* Product Image */}
                        <div className="relative h-48 bg-gray-100">
                          <Image 
                            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=500&fit=crop"
                            alt="بيتزا نص ونص (Half & Half)"
                            fill
                            className="object-cover"
                          />
                        </div>
                        
                        {/* Product Details */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold font-arabic mb-2 text-gray-800">
                            بيتزا نص ونص (Half & Half)
                          </h3>
                          <p className="text-gray-600 font-arabic text-sm mb-4 leading-relaxed">
                            اختار البيتزا نصين كل نص على مزاجك
                          </p>
                          
                          {/* Price and Add Button - Same style as regular pizzas */}
                          <div className="flex items-center justify-between">
                            <div className="text-right">
                              <span className="text-2xl font-bold text-gray-800 font-arabic">
                                السعر حسب الاختيار
                              </span>
                            </div>
                            <button 
                              onClick={() => handleProductClick({
                                id: 'half-and-half',
                                name: 'بيتزا نص ونص (Half & Half)',
                                description: 'اختار البيتزا نصين كل نص على مزاجك',
                                price: 0,
                                image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=500&fit=crop',
                                productType: 'half-half',
                                hasVariants: true,
                                hasAddons: true,
                                categoryName: 'بيتزا',
                                categoryId: selectedCategory,
                                available: true
                              })}
                              className="px-6 py-2 rounded-lg font-arabic font-bold text-white transition-colors duration-200 hover:opacity-90 cursor-pointer"
                              style={{ backgroundColor: '#009495' }}
                            >
                              + أضف للسلة
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            })()}
            </>
            ) : (
              /* If no categories exist yet, show all products in a simple grid */
              <div>
                <div className="text-right mb-8">
                  <h3 className="text-3xl font-bold text-gray-800 font-arabic mb-2">
                    جميع المنتجات
                  </h3>
                  <div className="w-12 h-1" style={{ backgroundColor: '#FF8500' }}></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      {/* Product Image */}
                      <div className="relative h-48 bg-gray-100">
                        {product.image ? (
                          <Image 
                            src={product.image} 
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                            </svg>
                          </div>
                        )}
                        {!product.available && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-arabic font-bold bg-red-600 px-4 py-2 rounded-lg">
                              غير متوفر
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold font-arabic mb-2 text-gray-800">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 font-arabic text-sm mb-4 leading-relaxed">
                          {product.description}
                        </p>
                        
                        {/* Price and Add Button */}
                        <div className="flex items-center justify-between">
                          <div className="text-right">
                            <span className="text-2xl font-bold text-gray-800 font-arabic">
                              {product.price} جنيه
                            </span>
                          </div>
                          <button 
                            onClick={() => handleProductClick(product)}
                            disabled={!product.available}
                            className={`px-6 py-2 rounded-lg font-arabic font-bold text-white transition-colors duration-200 ${
                              product.available 
                                ? 'hover:opacity-90 cursor-pointer' 
                                : 'opacity-50 cursor-not-allowed'
                            }`}
                            style={{ backgroundColor: product.available ? '#009495' : '#666' }}
                          >
                            + أضف للسلة
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add to Cart Notification */}
      {showNotification && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-pulse">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="font-arabic">
              <div className="font-bold">تم إضافة المنتج للسلة!</div>
              <div className="text-sm opacity-90">{notificationProduct}</div>
            </div>
          </div>
        </div>
      )}

      {/* Product Customization Modal */}
      <ProductCustomizationModal
        product={selectedProduct}
        isOpen={showCustomizationModal}
        onClose={() => {
          setShowCustomizationModal(false)
          setSelectedProduct(null)
        }}
        onAddToCart={addToCart}
      />
    </section>
  )
}