export function clearCartStorage() {
  if (typeof window === 'undefined') return

  localStorage.removeItem('pendingOrder')
  localStorage.removeItem('mpgsCheckout')
  localStorage.removeItem('memoCart')
  localStorage.removeItem('memoOrderData')
  localStorage.removeItem('memoCurrentStep')
  window.dispatchEvent(new CustomEvent('cartUpdated'))
}
