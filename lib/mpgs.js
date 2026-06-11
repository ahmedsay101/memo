const MPGS_HOST = process.env.MPGS_HOST_URL || 'qnbalahli.gateway.mastercard.com'
const MPGS_MERCHANT_ID = process.env.MPGS_MERCHANT_ID || 'MEMOSPIZZA'
const MPGS_API_USERNAME = process.env.MPGS_API_USERNAME || `merchant.${MPGS_MERCHANT_ID}`
const MPGS_API_PASSWORD = process.env.MPGS_API_PASSWORD
const MPGS_API_VERSION = process.env.MPGS_API_VERSION || '61'
const MPGS_CURRENCY = process.env.MPGS_CURRENCY || 'EGP'

export function getMpgsConfig() {
  return {
    host: MPGS_HOST,
    merchantId: MPGS_MERCHANT_ID,
    apiVersion: MPGS_API_VERSION,
    currency: MPGS_CURRENCY,
    checkoutScriptUrl: `https://${MPGS_HOST}/checkout/version/${MPGS_API_VERSION}/checkout.js`,
  }
}

function getAuthHeader() {
  if (!MPGS_API_PASSWORD) {
    throw new Error('MPGS API password is not configured')
  }

  const credentials = Buffer.from(`${MPGS_API_USERNAME}:${MPGS_API_PASSWORD}`).toString('base64')
  return `Basic ${credentials}`
}

function getApiBaseUrl() {
  return `https://${MPGS_HOST}/api/rest/version/${MPGS_API_VERSION}/merchant/${MPGS_MERCHANT_ID}`
}

export async function createCheckoutSession({ orderId, amount, returnUrl, description }) {
  const response = await fetch(`${getApiBaseUrl()}/session`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiOperation: 'CREATE_CHECKOUT_SESSION',
      interaction: {
        operation: 'PURCHASE',
        returnUrl,
      },
      order: {
        id: orderId,
        amount: Number(amount).toFixed(2),
        currency: MPGS_CURRENCY,
        reference: orderId,
        description: description || 'Memo Pizza Order',
      },
      transaction: {
        reference: orderId,
      },
    }),
  })

  const data = await response.json()

  if (!response.ok || data.result !== 'SUCCESS') {
    console.error('MPGS session creation failed:', data)
    throw new Error(data.error?.explanation || data.error?.cause || 'Failed to create MPGS checkout session')
  }

  return {
    sessionId: data.session.id,
    successIndicator: data.successIndicator,
  }
}

export async function retrieveOrder(orderId) {
  const response = await fetch(`${getApiBaseUrl()}/order/${orderId}`, {
    method: 'GET',
    headers: {
      Authorization: getAuthHeader(),
    },
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('MPGS order retrieval failed:', data)
    throw new Error(data.error?.explanation || 'Failed to retrieve MPGS order')
  }

  return data
}

export function verifyPaymentResult({ order, expectedAmount, resultIndicator, successIndicator }) {
  if (!resultIndicator || !successIndicator || resultIndicator !== successIndicator) {
    return { valid: false, reason: 'Payment result indicator mismatch' }
  }

  if (order.status !== 'CAPTURED') {
    return { valid: false, reason: `Order status is ${order.status}` }
  }

  const capturedAmount = Number(order.totalCapturedAmount ?? order.amount ?? 0)
  const expected = Number(expectedAmount)

  if (Math.abs(capturedAmount - expected) > 0.01) {
    return {
      valid: false,
      reason: `Amount mismatch: expected ${expected}, captured ${capturedAmount}`,
    }
  }

  return { valid: true }
}
