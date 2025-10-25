import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import Order from '../../../models/Order'

export async function POST(request) {
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
      items, 
      totalAmount,
      notes 
    } = body

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
    const deliveryFee = deliveryMethod === 'delivery' ? 20 : 0
    calculatedTotal += deliveryFee

    // Create full address string for delivery
    let fullAddress = ''
    if (deliveryMethod === 'delivery') {
      fullAddress = address
      if (floor) fullAddress += ` - الدور ${floor}`
      if (apartment) fullAddress += ` - شقة ${apartment}`
      if (landmark) fullAddress += ` - علامة مميزة: ${landmark}`
    }

    // Create the order
    const order = new Order({
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: deliveryMethod === 'delivery' ? fullAddress : selectedBranch || '',
      branch: deliveryMethod === 'pickup' ? selectedBranch : 'فرع الرياض الرئيسي',
      items: processedItems,
      totalAmount: totalAmount || calculatedTotal,
      notes: notes || '',
      status: 'pending'
    })

    const savedOrder = await order.save()

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الطلب بنجاح',
      order: {
        id: savedOrder._id,
        orderNumber: savedOrder.orderNumber,
        customerName: savedOrder.customerName,
        phone: savedOrder.phone,
        address: savedOrder.address,
        branch: savedOrder.branch,
        items: savedOrder.items,
        totalAmount: savedOrder.totalAmount,
        status: savedOrder.status,
        createdAt: savedOrder.createdAt,
        notes: savedOrder.notes
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الطلب، يرجى المحاولة مرة أخرى' },
      { status: 500 }
    )
  }
}