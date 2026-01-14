'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

export default function ProductCustomizationModal({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart 
}) {
  const [variants, setVariants] = useState({})
  const [addons, setAddons] = useState([])
  const [selectedVariants, setSelectedVariants] = useState({})
  const [selectedAddons, setSelectedAddons] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  
  // For half-half pizzas
  const [availablePizzas, setAvailablePizzas] = useState([])
  const [leftSide, setLeftSide] = useState({
    pizza: null,
    variants: {},
    addons: []
  })
  const [rightSide, setRightSide] = useState({
    pizza: null,
    variants: {},
    addons: []
  })

  const fetchProductCustomizations = useCallback(async () => {
    if (!product) return
    
    setLoading(true)
    try {
      // If this is a half-and-half pizza, fetch available pizzas
      if (product.productType === 'half-half') {
        console.log('🍕 Fetching available pizzas for half-and-half...')
        const pizzasResponse = await fetch('/api/pizzas/half-selection')
        const pizzasData = await pizzasResponse.json()
        
        console.log('Half-selection API response:', pizzasData)
        
        if (pizzasResponse.ok) {
          console.log('Setting available pizzas:', pizzasData.pizzas?.length || 0, 'pizzas')
          setAvailablePizzas(pizzasData.pizzas || [])
        } else {
          console.error('Failed to fetch pizzas:', pizzasData)
        }
      }
      
      // Set simple predefined variants based on product category
      if (product.categoryName === 'بيتزا' || product.category === 'pizza') {
        // Pizza products get size + crust options
        const sizeVariants = []
        
        if (product.pricing) {
          // Use new size-based pricing
          sizeVariants.push(
            { _id: 'small', name: 'صغير', price: product.pricing.small, isDefault: true },
            { _id: 'medium', name: 'وسط', price: product.pricing.medium },
            { _id: 'large', name: 'كبير', price: product.pricing.large }
          )
        } else {
          // Fallback to old pricing system
          sizeVariants.push(
            { _id: 'small', name: 'صغير', price: 0, isDefault: true },
            { _id: 'medium', name: 'وسط', price: 15 },
            { _id: 'large', name: 'كبير', price: 30 }
          )
        }
        
        setVariants({
          size: sizeVariants,
          crust: [
            { _id: 'regular', name: 'أطراف عادية', price: 0, isDefault: true },
            { _id: 'stuffed', name: 'أطراف محشية', price: 10 }
          ]
        })
        
        // Set default variants
        setSelectedVariants({
          size: 'small',
          crust: 'regular'
        })
        
        // Fetch addons for pizzas
        const addonsResponse = await fetch(`/api/addons?category=topping`)
        const addonsData = await addonsResponse.json()
        
        if (addonsData.success) {
          setAddons(addonsData.addons || [])
        }
      } else {
        // Other products only get size options
        const sizeVariants = []
        
        if (product.pricing) {
          // Use new size-based pricing - for non-pizza items, use small and large
          sizeVariants.push(
            { _id: 'small', name: 'صغير', price: product.pricing.small, isDefault: true },
            { _id: 'large', name: 'كبير', price: product.pricing.large }
          )
        } else {
          // Fallback to old pricing system
          sizeVariants.push(
            { _id: 'small', name: 'صغير', price: 0, isDefault: true },
            { _id: 'large', name: 'كبير', price: 20 }
          )
        }
        
        setVariants({
          size: sizeVariants
        })
        
        // Set default variants
        setSelectedVariants({
          size: 'small'
        })
        
        // No addons for non-pizza products
        setAddons([])
      }
      
    } catch (error) {
      console.error('Error setting up customizations:', error)
    } finally {
      setLoading(false)
    }
  }, [product])

  useEffect(() => {
    if (isOpen && product) {
      fetchProductCustomizations()
      // Reset form when opening modal
      setSelectedVariants({})
      setSelectedAddons([])
      setNotes('')
      setQuantity(1)
      // Reset half-and-half selections
      setLeftSide({ pizza: null, variants: {}, addons: [] })
      setRightSide({ pizza: null, variants: {}, addons: [] })
    }
  }, [isOpen, product, fetchProductCustomizations])

  const handleVariantChange = (type, variantId) => {
    setSelectedVariants(prev => ({
      ...prev,
      [type]: variantId
    }))
  }

  const handleAddonToggle = (addonId) => {
    setSelectedAddons(prev => {
      if (prev.includes(addonId)) {
        return prev.filter(id => id !== addonId)
      } else {
        return [...prev, addonId]
      }
    })
  }

  const calculateTotalPrice = () => {
    let total = 0
    
    if (product.productType === 'half-half') {
      // For half-and-half pizzas, use the price of the more expensive half
      const leftPrice = leftSide.pizza ? leftSide.pizza.price : 0
      const rightPrice = rightSide.pizza ? rightSide.pizza.price : 0
      
      // Take the higher price as the base price
      total = Math.max(leftPrice, rightPrice)
      
      // Add size variant price (full price for size)
      Object.values(selectedVariants).forEach(variantId => {
        const variant = Object.values(variants).flat().find(v => v._id === variantId)
        if (variant) total += variant.price
      })
    } else {
      // For regular products (pizza and non-pizza)
      if (product.pricing) {
        // Use new pricing system - size determines the base price
        const sizeVariant = Object.values(variants).flat().find(v => v._id === selectedVariants.size)
        total = sizeVariant ? sizeVariant.price : product.pricing.small
        
        // Add other variant prices (like crust)
        Object.entries(selectedVariants).forEach(([variantType, variantId]) => {
          if (variantType !== 'size') { // Skip size as it's already the base price
            const variant = Object.values(variants).flat().find(v => v._id === variantId)
            if (variant) total += variant.price
          }
        })
      } else {
        // Fallback to old pricing system
        total = product.price
        
        // Add variant prices
        Object.values(selectedVariants).forEach(variantId => {
          const variant = Object.values(variants).flat().find(v => v._id === variantId)
          if (variant) total += variant.price
        })
      }
      
      // Add addon prices (only for pizza products)
      if (product.categoryName === 'بيتزا') {
        selectedAddons.forEach(addonId => {
          const addon = addons.find(a => a._id === addonId)
          if (addon) total += addon.price
        })
      }
    }
    
    return total * quantity
  }

  const handleAddToCart = () => {
    console.log('🔍 Debug - selectedVariants:', selectedVariants)
    console.log('🔍 Debug - variants:', variants)
    console.log('🔍 Debug - selectedAddons:', selectedAddons)
    console.log('🔍 Debug - addons:', addons)
    
    // Build variants array with full objects (name, price)
    const variantObjects = []
    
    Object.entries(selectedVariants).forEach(([type, variantId]) => {
      console.log(`🔍 Processing variant ${type}:${variantId}`)
      const variantOption = variants[type]?.find(v => v._id === variantId)
      console.log(`🔍 Found variant option:`, variantOption)
      if (variantOption) {
        variantObjects.push({
          type: type,
          name: variantOption.name,
          price: variantOption.price || 0
        })
      }
    })
    
    // Build addons array with full objects (name, price)
    const addonObjects = []
    if (product.categoryName === 'بيتزا' || product.category === 'pizza') {
      selectedAddons.forEach(addonId => {
        console.log(`🔍 Processing addon ${addonId}`)
        const addonOption = addons.find(a => a._id === addonId)
        console.log(`🔍 Found addon option:`, addonOption)
        if (addonOption) {
          addonObjects.push({
            name: addonOption.name,
            price: addonOption.price || 0
          })
        }
      })
    }
    
    const customization = {
      variants: variantObjects,
      addons: addonObjects,
      notes: notes.trim(),
      ...(product.productType === 'half-half' && {
        leftSide,
        rightSide
      })
    }
    
    console.log('📦 Final customization object:', customization)
    
    // Create a product object with the correct calculated price
    const productWithCorrectPrice = {
      ...product,
      price: calculateTotalPrice() / quantity // Get unit price (calculateTotalPrice includes quantity)
    }
    
    onAddToCart(productWithCorrectPrice, quantity, customization)
    onClose()
  }

  const renderHalfSelection = (side, title) => {
    console.log('Rendering half selection for', side, '- Available pizzas:', availablePizzas.length)
    
    if (availablePizzas.length === 0) {
      return (
        <div className="mb-6">
          <h4 className="font-arabic font-bold text-lg mb-3 text-right">{title}</h4>
          <div className="p-4 bg-gray-100 rounded-lg text-center">
            <p className="font-arabic text-gray-600">جاري تحميل البيتزا المتاحة...</p>
          </div>
        </div>
      )
    }
    
    const currentSide = side === 'left' ? leftSide : rightSide
    const setSide = side === 'left' ? setLeftSide : setRightSide
    
    return (
      <div className="mb-6">
        <h4 className="font-arabic font-bold text-lg mb-3 text-right">{title}</h4>
        <p className="font-arabic text-sm text-gray-600 mb-3 text-right">اختار واحد فقط</p>
        <div className="space-y-3">
          {availablePizzas.map((pizza) => (
            <label 
              key={pizza.id}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                currentSide.pizza?.id === pizza.id
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name={`${side}-pizza`}
                value={pizza.id}
                checked={currentSide.pizza?.id === pizza.id}
                onChange={() => setSide({ 
                  pizza: pizza,
                  variants: {},
                  addons: []
                })}
                className="sr-only"
              />
              <div className="flex items-center gap-3 w-full">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={pizza.image}
                    alt={pizza.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-grow text-right">
                  <h5 className="font-arabic font-semibold text-gray-800">{pizza.name}</h5>
                  <p className="font-arabic text-sm text-gray-600">{pizza.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  currentSide.pizza?.id === pizza.id
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300'
                }`}>
                  {currentSide.pizza?.id === pizza.id && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    )
  }

  const renderSizeSection = () => {
    const sizeVariants = variants.size || []
    if (sizeVariants.length === 0) return null
    
    return (
      <div className="mb-6">
        <h4 className="font-arabic font-bold text-lg mb-3 text-right">الحجم</h4>
        <p className="font-arabic text-sm text-gray-600 mb-3 text-right">اختار ولي فقط</p>
        <div className="space-y-2">
          {sizeVariants.map((variant) => (
            <label 
              key={variant._id}
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedVariants.size === variant._id 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="size"
                  value={variant._id}
                  checked={selectedVariants.size === variant._id}
                  onChange={() => handleVariantChange('size', variant._id)}
                  className="w-4 h-4 text-orange-500"
                />
                <span className="font-arabic font-medium">{variant.name}</span>
              </div>
              <span className="font-arabic text-orange-600 font-bold">
                {product.pricing ? 
                  `${variant.price} جنيه` : 
                  `+EGP ${variant.price}.00`
                }
              </span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  const renderCrustSection = () => {
    const crustVariants = variants.crust || []
    if (crustVariants.length === 0) return null
    
    return (
      <div className="mb-6">
        <h4 className="font-arabic font-bold text-lg mb-3 text-right">الأطراف</h4>
        <p className="font-arabic text-sm text-gray-600 mb-3 text-right">اختار واحد فقط</p>
        <div className="space-y-2">
          {crustVariants.map((variant) => (
            <label 
              key={variant._id}
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedVariants.crust === variant._id 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="crust"
                  value={variant._id}
                  checked={selectedVariants.crust === variant._id}
                  onChange={() => handleVariantChange('crust', variant._id)}
                  className="w-4 h-4 text-orange-500"
                />
                <span className="font-arabic font-medium">{variant.name}</span>
              </div>
              <span className="font-arabic text-orange-600 font-bold">
                {variant.price > 0 ? `+EGP ${variant.price}.00` : 'مجاناً'}
              </span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  const renderToppingsSection = () => {
    const toppings = addons.filter(addon => addon.category === 'topping')
    if (toppings.length === 0) return null
    
    return (
      <div className="mb-6">
        <h4 className="font-arabic font-bold text-lg mb-3 text-right">الإضافات</h4>
        <p className="font-arabic text-sm text-gray-600 mb-3 text-right">يمكنك اختيار أكثر من واحد</p>
        <div className="grid grid-cols-3 gap-3">
          {toppings.map((topping) => (
            <label 
              key={topping._id}
              className={`relative flex flex-col items-center p-3 border rounded-xl cursor-pointer transition-all ${
                selectedAddons.includes(topping._id)
                  ? 'border-orange-500 bg-orange-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedAddons.includes(topping._id)}
                onChange={() => handleAddonToggle(topping._id)}
                className="sr-only"
              />
              
              {/* Image */}
              <div className="w-16 h-16 mb-2 relative overflow-hidden rounded-lg">
                {topping.image ? (
                  <Image 
                    src={topping.image} 
                    alt={topping.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <span className="text-2xl">🍕</span>
                  </div>
                )}
              </div>
              
              {/* Name */}
              <span className="font-arabic text-sm font-medium text-center text-gray-800 mb-1">
                {topping.name}
              </span>
              
              {/* Price */}
              <span className="font-arabic text-xs font-bold text-orange-600">
                +EGP {topping.price}.00
              </span>
              
              {/* Selection Indicator */}
              {selectedAddons.includes(topping._id) && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </label>
          ))}
        </div>
      </div>
    )
  }



  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 overflow-y-auto">
        {/* Header */}
        <div className="relative">
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 z-20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Cart Count Badge */}
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center z-20">
            <span className="text-white font-bold text-sm">4</span>
          </div>
          
          {/* Product Image */}
          <div className="relative w-full h-64">
            {product.image ? (
              <Image 
                src={product.image} 
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
                <span className="text-white text-6xl">🍕</span>
              </div>
            )}
          </div>
          
          {/* Product Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
            <h3 className="text-2xl font-bold text-white font-arabic mb-2">{product.name}</h3>
            {product.description && (
              <p className="text-white/90 font-arabic text-sm leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6" dir="rtl">

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              {/* Simple elegant spinner */}
              <div className="relative mb-6">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-l-orange-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              
              <p className="text-lg text-gray-700 font-arabic animate-pulse">جاري تحميل خيارات التخصيص...</p>
            </div>
          ) : (
            <>
              {/* Render different modal versions based on product type */}
              
              {/* Version 1: Half-and-Half Pizza Modal */}
              {product.productType === 'half-half' && (
                <>
                  {renderHalfSelection('left', 'اختار النصف الأول')}
                  {renderHalfSelection('right', 'اختار النصف الثاني')}
                  {renderSizeSection()}
                  {renderCrustSection()}
                  {renderToppingsSection()}
                </>
              )}

              {/* Version 2: Regular Pizza Modal */}
              {product.productType !== 'half-half' && product.categoryName === 'بيتزا' && (
                <>
                  {renderSizeSection()}
                  {renderCrustSection()}
                  {renderToppingsSection()}
                </>
              )}

              {/* Version 3: Other Products Modal (only size) */}
              {product.productType !== 'half-half' && product.categoryName !== 'بيتزا' && (
                <>
                  {renderSizeSection()}
                </>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h4 className="font-arabic font-bold text-lg mb-3">الكمية</h4>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  >
                    -
                  </button>
                  <div className="w-12 h-10 bg-teal-500 text-white rounded flex items-center justify-center font-arabic font-bold">
                    {quantity}
                  </div>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <h4 className="font-arabic font-bold text-lg mb-3">ملاحظات</h4>
                <div className="relative">
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="مثال: بدون إضافة ملح، زيادة سبانخ الخضار"
                    className="w-full p-3 border border-gray-300 rounded-lg font-arabic text-right"
                    dir="rtl"
                  />
                  <div className="absolute left-3 top-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6">
          <button 
            onClick={handleAddToCart}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-arabic font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-3 text-lg"
          >
            <span>أضف للسلة - EGP {calculateTotalPrice().toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  )
}