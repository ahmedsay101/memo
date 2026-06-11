import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import Order from '../../../models/Order'
import Branch from '../../../models/Branch'
import Settings from '../../../models/Settings'
import { formatOrderResponse, saveOrderSafely } from '../../../lib/orderHelpers'

export async function POST(request) {
  let mpgsOrderId

  try {
    await dbConnect()
    
    const body = await request.json()
    const { 
      customerName, 
      phone, 
      address, 
      floor,
      apartment,
      landmark,
      branch, 
      deliveryMethod,
      selectedBranch,
      paymentMethod,
      paymentStatus,
      items, 
      totalAmount,
      deliveryFee: requestedDeliveryFee,
      zone,
      notes 
    } = body

    mpgsOrderId = body.mpgsOrderId || null

    if (mpgsOrderId) {
      const existingOrder = await Order.findOne({ mpgsOrderId })
      if (existingOrder) {
        return NextResponse.json({
          success: true,
          message: 'الطلب موجود بالفعل',
          order: formatOrderResponse(existingOrder),
        }, { status: 200 })
      }
    }

    // Validate required fields
    if (!customerName || !phone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'اسم العميل ورقم الهاتف وعناصر الطلب مطلوبة' },
        { status: 400 }
      )
    }

    // Validate delivery method specific requirements
    if (deliveryMethod === 'delivery') {
      if (!address) {
        return NextResponse.json(
          { error: 'العنوان مطلوب للتوصيل' },
          { status: 400 }
        )
      }
    } else if (deliveryMethod === 'pickup') {
      if (!selectedBranch) {
        return NextResponse.json(
          { error: 'يجب اختيار الفرع للاستلام' },
          { status: 400 }
        )
      }
    }

    // Resolve delivery fee from configured zones (server-side trust)
    let resolvedDeliveryFee = 0
    if (deliveryMethod === 'delivery') {
      try {
        const zonesSetting = await Settings.findOne({ key: 'deliveryZones' })
        const zones = Array.isArray(zonesSetting?.value) ? zonesSetting.value : []
        if (zone) {
          const matched = zones.find(z => z && z.name === zone)
          if (matched && typeof matched.fee === 'number') {
            resolvedDeliveryFee = matched.fee
          } else if (typeof requestedDeliveryFee === 'number') {
            resolvedDeliveryFee = requestedDeliveryFee
          }
        } else if (typeof requestedDeliveryFee === 'number') {
          resolvedDeliveryFee = requestedDeliveryFee
        }
      } catch (e) {
        console.error('Error resolving delivery zone fee:', e)
        resolvedDeliveryFee = typeof requestedDeliveryFee === 'number' ? requestedDeliveryFee : 0
      }
    }

    // Process cart items to calculate total and format for database
    let calculatedTotal = 0
    const processedItems = items.map(item => {
      let itemPrice = item.price
      let customizationPrice = 0

      // Calculate customization price
      if (item.customization) {
        // Add variant prices
        if (item.customization.variants && Array.isArray(item.customization.variants)) {
          item.customization.variants.forEach(variant => {
            if (variant.price) {
              customizationPrice += variant.price
            }
          })
        }

        // Add addon prices
        if (item.customization.addons && Array.isArray(item.customization.addons)) {
          item.customization.addons.forEach(addon => {
            if (addon.price) {
              customizationPrice += addon.price
            }
          })
        }

        // For half-half pizzas, calculate left and right side prices
        if (item.customization.leftSide || item.customization.rightSide) {
          ['leftSide', 'rightSide'].forEach(side => {
            const sideData = item.customization[side]
            if (sideData) {
              // Add variant prices for this side
              if (sideData.variants && Array.isArray(sideData.variants)) {
                sideData.variants.forEach(variant => {
                  if (variant.price) {
                    customizationPrice += variant.price / 2 // Half pizza, so half price
                  }
                })
              }

              // Add addon prices for this side
              if (sideData.addons && Array.isArray(sideData.addons)) {
                sideData.addons.forEach(addon => {
                  if (addon.price) {
                    customizationPrice += addon.price / 2 // Half pizza, so half price
                  }
                })
              }
            }
          })
        }

        // Store total customization price
        if (item.customization) {
          item.customization.totalCustomizationPrice = customizationPrice
        }
      }

      const finalItemPrice = itemPrice + customizationPrice
      calculatedTotal += finalItemPrice * item.quantity

      return {
        productId: item.id || item.productId,
        name: item.name,
        price: finalItemPrice,
        quantity: item.quantity,
        notes: item.notes || '',
        customization: item.customization || null
      }
    })

    // Add delivery fee if applicable
    const deliveryFee = deliveryMethod === 'delivery' ? resolvedDeliveryFee : 0
    calculatedTotal += deliveryFee

    // Create full address string for delivery
    let fullAddress = ''
    if (deliveryMethod === 'delivery') {
      fullAddress = address
      if (zone) fullAddress = `منطقة ${zone} - ${fullAddress}`
      if (floor) fullAddress += ` - الدور ${floor}`
      if (apartment) fullAddress += ` - شقة ${apartment}`
      if (landmark) fullAddress += ` - علامة مميزة: ${landmark}`
    }

    let resolvedBranch = 'فرع الرياض الرئيسي'
    let pickupAddress = ''

    if (deliveryMethod === 'pickup' && selectedBranch) {
      const branchDoc = await Branch.findById(selectedBranch)
      if (!branchDoc) {
        return NextResponse.json(
          { error: 'الفرع المحدد غير موجود' },
          { status: 400 }
        )
      }
      resolvedBranch = branchDoc.title
      pickupAddress = branchDoc.address
        ? `${branchDoc.title} - ${branchDoc.address}`
        : branchDoc.title
    }

    const isPaidCardOrder = paymentMethod === 'card' && paymentStatus === 'paid'

    // Create the order
    const order = new Order({
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: deliveryMethod === 'delivery' ? fullAddress : pickupAddress,
      branch: resolvedBranch,
      items: processedItems,
      totalAmount: totalAmount || calculatedTotal,
      deliveryFee,
      zone: deliveryMethod === 'delivery' ? (zone || '') : '',
      deliveryMethod: deliveryMethod || 'delivery',
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentStatus || 'unpaid',
      mpgsOrderId: mpgsOrderId || undefined,
      notes: notes || '',
      status: isPaidCardOrder ? 'confirmed' : 'pending'
    })

    const savedOrder = await saveOrderSafely(Order, order, mpgsOrderId)

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الطلب بنجاح',
      order: formatOrderResponse(savedOrder),
    }, { status: 201 })

  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.mpgsOrderId && mpgsOrderId) {
      try {
        await dbConnect()
        const existingOrder = await Order.findOne({ mpgsOrderId })
        if (existingOrder) {
          return NextResponse.json({
            success: true,
            message: 'الطلب موجود بالفعل',
            order: formatOrderResponse(existingOrder),
          }, { status: 200 })
        }
      } catch (lookupError) {
        console.error('Error looking up existing MPGS order:', lookupError)
      }
    }

    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الطلب، يرجى المحاولة مرة أخرى' },
      { status: 500 }
    )
  }
}