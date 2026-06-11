export function formatOrderResponse(order) {
  return {
    id: order._id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    branch: order.branch,
    items: order.items,
    totalAmount: order.totalAmount,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    notes: order.notes,
  }
}

export async function saveOrderSafely(Order, order, mpgsOrderId) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) order.orderNumber = undefined
      return await order.save()
    } catch (saveError) {
      if (saveError.code === 11000) {
        if (saveError.keyPattern?.mpgsOrderId && mpgsOrderId) {
          const existing = await Order.findOne({ mpgsOrderId })
          if (existing) return existing
        }
        if (saveError.keyPattern?.orderNumber && attempt < 2) {
          continue
        }
      }
      throw saveError
    }
  }
}
