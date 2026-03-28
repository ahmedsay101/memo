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
  const [recommendedProducts, setRecommendedProducts] = useState([])
  
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
        
        if (product.sizes && product.sizes.length > 0) {
          // Use new dynamic sizes structure
          sizeVariants.push(...product.sizes.map(size => ({
            _id: size.name.toLowerCase(),
            name: size.name,
            price: size.price,
            isDefault: size.isDefault
          })))
        } else if (product.pricing) {
          // Fallback to old pricing system
          if (product.pricing.small !== undefined) sizeVariants.push({ _id: 'small', name: 'صغير', price: product.pricing.small, isDefault: true })
          if (product.pricing.medium !== undefined) sizeVariants.push({ _id: 'medium', name: 'وسط', price: product.pricing.medium })
          if (product.pricing.large !== undefined) sizeVariants.push({ _id: 'large', name: 'كبير', price: product.pricing.large })
        } else {
          // Default fallback
          sizeVariants.push(
            { _id: 'small', name: 'صغير', price: 0, isDefault: true },
            { _id: 'medium', name: 'وسط', price: 15 },
            { _id: 'large', name: 'كبير', price: 30 }
          )
        }
        
        setVariants({
          size: sizeVariants
        })
        
        // Set default size variant
        const defaultSize = sizeVariants.find(s => s.isDefault) || sizeVariants[0]
        setSelectedVariants({
          size: defaultSize?._id || 'small'
        })
        
        // Fetch all available addons + crust options in parallel
        const [addonsResponse, crustResponse] = await Promise.all([
          fetch('/api/addons'),
          fetch('/api/addons?category=crust')
        ])
        const addonsData = await addonsResponse.json()
        const crustData = await crustResponse.json()

        if (addonsData.success) {
          setAddons(addonsData.addons || [])
        }

        // Build crust variants from API, fall back to built-in defaults
        if (crustData.success && crustData.addons && crustData.addons.length > 0) {
          const crustVariants = crustData.addons.map(a => ({
            _id: a._id,
            name: a.name,
            price: a.sizes?.[0]?.price ?? a.price ?? 0,
            isDefault: false
          }))
          crustVariants[0].isDefault = true
          setVariants(prev => ({ ...prev, crust: crustVariants }))
          setSelectedVariants(prev => ({ ...prev, crust: crustVariants[0]._id }))
        } else {
          // Fallback hardcoded values when no crust addons are configured
          const fallback = [
            { _id: 'regular', name: 'أطراف عادية', price: 0, isDefault: true },
            { _id: 'stuffed', name: 'أطراف محشية', price: 10 }
          ]
          setVariants(prev => ({ ...prev, crust: fallback }))
          setSelectedVariants(prev => ({ ...prev, crust: 'regular' }))
        }

      } else {
        // Other products - fetch all available addons
        const addonsResponse = await fetch(`/api/addons`)
        const addonsData = await addonsResponse.json()
        if (addonsData.success) {
          setAddons(addonsData.addons || [])
        }

        const sizeVariants = []
        
        if (product.sizes && product.sizes.length > 0) {
          // Use new dynamic sizes structure
          sizeVariants.push(...product.sizes.map(size => ({
            _id: size.name.toLowerCase(),
            name: size.name,
            price: size.price,
            isDefault: size.isDefault
          })))
        } else if (product.pricing) {
          // Fallback to old pricing system - use small and large for non-pizza
          if (product.pricing.small !== undefined) sizeVariants.push({ _id: 'small', name: 'صغير', price: product.pricing.small, isDefault: true })
          if (product.pricing.large !== undefined) sizeVariants.push({ _id: 'large', name: 'كبير', price: product.pricing.large })
        } else {
          // Default fallback
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
        
      }
      
      // Fetch recommended products (flag: ترشيحات)
      try {
        const recRes = await fetch('/api/products?flag=ترشيحات&available=true')
        const recData = await recRes.json()
        if (recData.success) {
          setRecommendedProducts(
            (recData.products || []).filter(p => p.id !== product.id)
          )
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err)
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
      setRecommendedProducts([])
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

  const handleAddonToggle = (addonId, sizeId = null) => {
    setSelectedAddons(prev => {
      const existingIndex = prev.findIndex(item =>
        typeof item === 'string' ? item === addonId : item.addonId === addonId
      )

      // Already selected + new size clicked → update size only, don't remove
      if (existingIndex !== -1 && sizeId !== null) {
        return prev.map((item, i) =>
          i === existingIndex ? { addonId, sizeId } : item
        )
      }

      // Already selected + no size → deselect (toggle off)
      if (existingIndex !== -1) {
        return prev.filter((_, i) => i !== existingIndex)
      }

      // Not yet selected → add
      const addon = addons.find(a => a._id === addonId)
      if (addon && addon.sizes && addon.sizes.length > 0) {
        const defaultSize = addon.sizes.find(s => s.isDefault) || addon.sizes[0]
        return [...prev, { addonId, sizeId: sizeId || defaultSize.name.toLowerCase() }]
      }
      return [...prev, addonId]
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
      if (product.sizes && product.sizes.length > 0) {
        // Use new dynamic sizes structure - size determines the base price
        const selectedSizeVariant = Object.values(variants).flat().find(v => v._id === selectedVariants.size)
        total = selectedSizeVariant ? selectedSizeVariant.price : product.sizes[0].price
        
        // Add other variant prices (like crust)
        Object.entries(selectedVariants).forEach(([variantType, variantId]) => {
          if (variantType !== 'size') { // Skip size as it's already the base price
            const variant = Object.values(variants).flat().find(v => v._id === variantId)
            if (variant) total += variant.price
          }
        })
      } else if (product.pricing) {
        // Use old pricing system - size determines the base price
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
      
      // Add addon prices for all product types
      selectedAddons.forEach(addonSelection => {
        if (typeof addonSelection === 'string') {
          const addon = addons.find(a => a._id === addonSelection)
          if (addon) total += addon.price || 0
        } else {
          const addon = addons.find(a => a._id === addonSelection.addonId)
          if (addon) {
            if (addon.sizes && addon.sizes.length > 0) {
              const selectedSize = addon.sizes.find(s => s.name.toLowerCase() === addonSelection.sizeId)
              total += selectedSize ? selectedSize.price : addon.sizes[0].price
            } else {
              total += addon.price || 0
            }
          }
        }
      })
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
    
    // Build addons array with full objects (name, price, size)
    const addonObjects = []
    if (product.categoryName === 'بيتزا' || product.category === 'pizza') {
      selectedAddons.forEach(addonSelection => {
        if (typeof addonSelection === 'string') {
          // Old format - just addon ID
          console.log(`🔍 Processing addon (old format) ${addonSelection}`)
          const addonOption = addons.find(a => a._id === addonSelection)
          console.log(`🔍 Found addon option:`, addonOption)
          if (addonOption) {
            addonObjects.push({
              name: addonOption.name,
              price: addonOption.price || 0,
              size: 'عادي'
            })
          }
        } else {
          // New format - addon with size selection
          console.log(`🔍 Processing addon (new format)`, addonSelection)
          const addonOption = addons.find(a => a._id === addonSelection.addonId)
          console.log(`🔍 Found addon option:`, addonOption)
          if (addonOption) {
            let sizePrice = addonOption.price || 0
            let sizeName = 'عادي'
            
            if (addonOption.sizes && addonOption.sizes.length > 0) {
              const selectedSize = addonOption.sizes.find(s => s.name.toLowerCase() === addonSelection.sizeId)
              if (selectedSize) {
                sizePrice = selectedSize.price
                sizeName = selectedSize.name
              } else {
                // Fallback to first size
                sizePrice = addonOption.sizes[0].price
                sizeName = addonOption.sizes[0].name
              }
            }
            
            addonObjects.push({
              name: addonOption.name,
              price: sizePrice,
              size: sizeName
            })
          }
        }
      })
    }
    
    // Validate half-and-half: both halves must be selected
    if (product.productType === 'half-half' && (!leftSide.pizza || !rightSide.pizza)) {
      return
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

  const isAddonSelected = (addonId) => {
    return selectedAddons.some(selection => 
      typeof selection === 'string' ? selection === addonId : selection.addonId === addonId
    )
  }

  const getSelectedAddonSize = (addonId) => {
    const selection = selectedAddons.find(selection => 
      typeof selection !== 'string' && selection.addonId === addonId
    )
    return selection ? selection.sizeId : null
  }

  // Generic function to render addon sections for any category
  const renderAddonSection = (categoryType, titleArabic, emoji) => {
    const categoryAddons = addons.filter(addon => addon.category === categoryType)
    if (categoryAddons.length === 0) return null

    return (
      <div className="mb-6">
        <h4 className="font-arabic font-bold text-lg mb-2 text-right">{titleArabic}</h4>
        <p className="font-arabic text-xs text-gray-500 mb-3 text-right">يمكنك اختيار أكثر من واحد</p>
        <div className="space-y-2">
          {categoryAddons.map((addon) => {
            const selected = isAddonSelected(addon._id)
            const selectedSizeId = getSelectedAddonSize(addon._id)
            const hasMultipleSizes = addon.sizes && addon.sizes.length > 1
            const hasSizes = addon.sizes && addon.sizes.length > 0

            return (
              <div
                key={addon._id}
                className={`border rounded-xl transition-all overflow-hidden ${
                  selected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'
                }`}
              >
                {/* Main row — clicking toggles the addon (for all types) */}
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer"
                  onClick={() => handleAddonToggle(addon._id)}
                >
                  {/* Image */}
                  <div className="w-12 h-12 flex-shrink-0 relative overflow-hidden rounded-lg">
                    {addon.image ? (
                      <Image src={addon.image} alt={addon.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center rounded-lg">
                        <span className="text-xl">{emoji}</span>
                      </div>
                    )}
                  </div>

                  {/* Name & price */}
                  <div className="flex-1 text-right">
                    <p className="font-arabic font-semibold text-gray-800 text-sm">{addon.name}</p>
                    {hasSizes && !hasMultipleSizes && (
                      <p className="font-arabic text-xs text-orange-600 font-bold mt-0.5">+{addon.sizes[0].price} جنيه</p>
                    )}
                    {!hasSizes && (
                      <p className="font-arabic text-xs text-orange-600 font-bold mt-0.5">+{addon.price} جنيه</p>
                    )}
                    {hasMultipleSizes && !selected && (
                      <p className="font-arabic text-xs text-gray-500 mt-0.5">اختر الحجم بعد الإضافة</p>
                    )}
                  </div>

                  {/* Checkbox indicator */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    selected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                  }`}>
                    {selected && (
                      <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Size pills — shown when addon is selected and has multiple sizes */}
                {selected && hasMultipleSizes && (
                  <div className="px-3 pb-3 border-t border-orange-200 pt-2">
                    <p className="font-arabic text-xs text-gray-500 text-right mb-2">اختر الحجم:</p>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {addon.sizes.map((size) => {
                        const active = selectedSizeId === size.name.toLowerCase()
                        return (
                          <button
                            key={size.name}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddonToggle(addon._id, size.name.toLowerCase())
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-arabic font-bold border transition-all ${
                              active
                                ? 'bg-orange-500 text-white border-orange-500'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400 hover:text-orange-500'
                            }`}
                          >
                            {size.name}&nbsp;·&nbsp;{size.price} جنيه
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Specific render functions for each category
  const renderRecommendedSection = () => {
    if (recommendedProducts.length === 0) return null
    return (
      <div className="mb-6">
        <h4 className="font-arabic font-bold text-lg mb-3">⭐ ترشيحات</h4>
        <div className="flex flex-col gap-3">
          {recommendedProducts.map(rec => {
            const recPrice = rec.sizes?.find(s => s.isDefault)?.price ?? rec.price ?? 0
            return (
              <div key={rec.id} className="flex items-center gap-3 border border-orange-100 rounded-lg p-3 bg-orange-50">
                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                  {rec.image ? (
                    <Image src={rec.image} alt={rec.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
                      <span className="text-2xl">🍕</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-arabic font-bold text-gray-800 text-sm truncate">{rec.name}</p>
                  <p className="font-arabic text-orange-500 text-sm font-bold">EGP {recPrice.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => {
                    const recWithPrice = { ...rec, price: recPrice }
                    onAddToCart(recWithPrice, 1, { variants: [], addons: [], notes: '' })
                  }}
                  className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-xs font-arabic font-bold px-3 py-2 rounded-lg transition-colors"
                >
                  أضف
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderToppingsSection = () => renderAddonSection('topping', 'الإضافات', '🍕')
  const renderDrinksSection = () => renderAddonSection('drink', 'المشروبات', '🥤')
  const renderSidesSection = () => renderAddonSection('side', 'الأطباق الجانبية', '🍟')
  const renderDessertsSection = () => renderAddonSection('dessert', 'الحلويات', '🍰')
  const renderSaucesSection = () => renderAddonSection('sauce', 'الصلصات', '🥫')



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
                  {renderDrinksSection()}
                  {renderSidesSection()}
                  {renderDessertsSection()}
                  {renderSaucesSection()}
                </>
              )}

              {/* Version 2: Regular Pizza Modal */}
              {product.productType !== 'half-half' && product.categoryName === 'بيتزا' && (
                <>
                  {renderSizeSection()}
                  {renderCrustSection()}
                  {renderToppingsSection()}
                  {renderDrinksSection()}
                  {renderSidesSection()}
                  {renderDessertsSection()}
                  {renderSaucesSection()}
                </>
              )}

              {/* Version 3: Other Products Modal (size + addons) */}
              {product.productType !== 'half-half' && product.categoryName !== 'بيتزا' && (
                <>
                  {renderSizeSection()}
                  {renderToppingsSection()}
                  {renderDrinksSection()}
                  {renderSidesSection()}
                  {renderDessertsSection()}
                  {renderSaucesSection()}
                </>
              )}

              {/* Recommended Products */}
              {renderRecommendedSection()}

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
          {product.productType === 'half-half' && (!leftSide.pizza || !rightSide.pizza) && (
            <p className="text-center text-sm text-orange-500 font-arabic mb-3">
              يرجى اختيار النصفين لإضافة البيتزا للسلة
            </p>
          )}
          <button 
            onClick={handleAddToCart}
            disabled={loading || (product.productType === 'half-half' && (!leftSide.pizza || !rightSide.pizza))}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-arabic font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-3 text-lg"
          >
            <span>أضف للسلة - EGP {calculateTotalPrice().toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  )
}