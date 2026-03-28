'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import ProductCustomizationModal from './ProductCustomizationModal'

// Flag display config: label, emoji, gradient colours
const FLAG_CONFIG = {
  'جديد':           { label: 'جديد',            emoji: '🆕', bg: 'from-blue-500 to-indigo-600',    badge: 'bg-blue-500' },
  'الأكثر مبيعاً': { label: 'الأكثر مبيعاً',  emoji: '🔥', bg: 'from-orange-500 to-red-600',     badge: 'bg-orange-500' },
  'عرض خاص':       { label: 'عرض خاص',         emoji: '🎉', bg: 'from-purple-500 to-pink-600',    badge: 'bg-purple-500' },
  'حصري':          { label: 'حصري',             emoji: '⭐', bg: 'from-amber-500 to-yellow-600',   badge: 'bg-amber-500' },
  'ترشيحات':       { label: 'ترشيحات',          emoji: '👌', bg: 'from-teal-500 to-green-600',     badge: 'bg-teal-500' },
}

const DEFAULT_CONFIG = { label: '', emoji: '🏷️', bg: 'from-gray-500 to-gray-700', badge: 'bg-gray-500' }

function ProductCard({ product, onProductClick }) {
  const defaultPrice = product.sizes?.find(s => s.isDefault)?.price ?? product.sizes?.[0]?.price ?? product.price ?? 0

  return (
    <div
      className="flex-shrink-0 w-44 cursor-pointer group"
      onClick={() => onProductClick(product)}
    >
      <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white">
        {/* Image */}
        <div className="relative w-full h-36 bg-gradient-to-br from-orange-100 to-red-100">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
              <span className="text-4xl">🍕</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="font-arabic font-bold text-gray-800 text-sm leading-tight line-clamp-2 mb-1" dir="rtl">
            {product.name}
          </p>
          <p className="font-arabic text-orange-500 font-bold text-sm">
            EGP {defaultPrice.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}

function FlagRow({ flag, products, onProductClick }) {
  const config = FLAG_CONFIG[flag] || { ...DEFAULT_CONFIG, label: flag }

  return (
    <div className="mb-12">
      {/* Row header */}
      <div className="flex items-center gap-3 mb-5" dir="rtl">
        <span className="text-2xl">{config.emoji}</span>
        <h3 className="text-2xl font-bold text-gray-800 font-arabic">{config.label}</h3>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide" dir="rtl">
        {products.map(product => (
          <ProductCard key={product.id} product={product} onProductClick={onProductClick} />
        ))}
      </div>
    </div>
  )
}

export default function FlaggedProductsSection() {
  const [flagGroups, setFlagGroups] = useState([]) // [{ flag, products }]
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [showNotification, setShowNotification] = useState(false)
  const [notificationProduct, setNotificationProduct] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('memoCart')
    if (saved) setCartItems(JSON.parse(saved))
  }, [])

  useEffect(() => {
    const fetchFlaggedProducts = async () => {
      try {
        // Fetch all available products that have at least one flag
        const res = await fetch('/api/products?available=true')
        const data = await res.json()
        if (!data.success) return

        const products = data.products.filter(p => p.flags && p.flags.length > 0)

        // Group by flag — a product with multiple flags appears in each
        const groups = {}
        products.forEach(product => {
          product.flags.forEach(flag => {
            if (!groups[flag]) groups[flag] = []
            groups[flag].push(product)
          })
        })

        // Sort by predefined order, then alphabetically for unknown flags
        const knownOrder = Object.keys(FLAG_CONFIG)
        const sorted = Object.entries(groups).sort(([a], [b]) => {
          const ai = knownOrder.indexOf(a)
          const bi = knownOrder.indexOf(b)
          if (ai === -1 && bi === -1) return a.localeCompare(b, 'ar')
          if (ai === -1) return 1
          if (bi === -1) return -1
          return ai - bi
        })

        setFlagGroups(sorted)
      } catch (err) {
        console.error('Error fetching flagged products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFlaggedProducts()
  }, [])

  const handleProductClick = (product) => {
    setSelectedProduct(product)
    setShowModal(true)
  }

  const addToCart = (product, quantity = 1, customization = null) => {
    try {
      const existingCart = JSON.parse(localStorage.getItem('memoCart') || '[]')
      const productKey = customization
        ? `${product.id}-${JSON.stringify(customization)}`
        : product.id

      const existing = existingCart.find(i => i.productKey === productKey)
      if (existing) {
        existing.quantity += quantity
      } else {
        existingCart.push({
          productKey,
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
          description: product.description,
          customization,
        })
      }

      localStorage.setItem('memoCart', JSON.stringify(existingCart))
      setCartItems(existingCart)
      window.dispatchEvent(new CustomEvent('cartUpdated'))

      setNotificationProduct(product.name)
      setShowNotification(true)
      setTimeout(() => {
        setShowNotification(false)
        setNotificationProduct('')
      }, 3000)
    } catch (err) {
      console.error('Error adding to cart:', err)
    }
  }

  // Nothing to show
  if (!loading && flagGroups.length === 0) return null

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        {/* Section title */}
        <div className="text-center mb-12" dir="rtl">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 font-arabic mb-4">
            اكتشف المزيد
          </h2>
          <p className="text-gray-500 font-arabic text-lg">
            تشكيلة مختارة من أفضل منتجاتنا
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : (
          flagGroups.map(([flag, products]) => (
            <FlagRow
              key={flag}
              flag={flag}
              products={products}
              onProductClick={handleProductClick}
            />
          ))
        )}
      </div>

      {/* Add-to-cart notification */}
      {showNotification && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg font-arabic text-sm animate-fade-in">
          ✓ تمت إضافة {notificationProduct} للسلة
        </div>
      )}

      {/* Customization modal */}
      {showModal && selectedProduct && (
        <ProductCustomizationModal
          product={selectedProduct}
          isOpen={showModal}
          onClose={() => { setShowModal(false); setSelectedProduct(null) }}
          onAddToCart={(product, quantity, customization) => {
            addToCart(product, quantity, customization)
            setShowModal(false)
            setSelectedProduct(null)
          }}
        />
      )}
    </section>
  )
}
