/**
 * PayPal Sandbox Integration Service
 * Handles OAuth2 authentication, order creation, and payment capture via PayPal REST APIs (v2).
 */

const PAYPAL_SANDBOX_BASE = 'https://api-m.sandbox.paypal.com';
const PAYPAL_LIVE_BASE = 'https://api-m.paypal.com';

let cachedAccessToken = null;
let tokenExpiresAt = 0;

/**
 * Check if real PayPal credentials are provided and not placeholders
 */
const isConfigured = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  return Boolean(
    clientId &&
    clientSecret &&
    !clientId.includes('your_') &&
    !clientId.includes('placeholder') &&
    !clientSecret.includes('your_') &&
    !clientSecret.includes('placeholder')
  );
};

const getBaseUrl = () => {
  const mode = (process.env.PAYPAL_MODE || 'sandbox').toLowerCase();
  return mode === 'live' ? PAYPAL_LIVE_BASE : PAYPAL_SANDBOX_BASE;
};

/**
 * Fetch OAuth2 access token from PayPal using client credentials
 */
const getAccessToken = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials missing: Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in server/.env');
  }

  // Return cached token if valid (buffer 60 seconds)
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedAccessToken;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const baseUrl = getBaseUrl();

  try {
    const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      body: 'grant_type=client_credentials',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      const errDetail = data.error_description || data.message || JSON.stringify(data);
      throw new Error(`PayPal OAuth authentication failed: ${errDetail}`);
    }

    cachedAccessToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in * 1000);
    return cachedAccessToken;
  } catch (err) {
    console.error('PayPal OAuth Error:', err.message);
    throw err;
  }
};

/**
 * Create a PayPal Checkout Order (v2)
 *
 * @param {Object} params
 * @param {Array} params.items - Validated product items from server
 * @param {Number} params.totalAmount - Server-calculated total in PayPal currency
 * @param {String} params.currency - e.g. 'USD'
 * @param {String} params.referenceId - Internal reference ID
 * @param {Object} params.customData - Metadata payload
 */
const createOrder = async ({ items, totalAmount, currency = 'USD', referenceId, customData }) => {
  // If not configured with live/sandbox keys and mock fallback is explicitly allowed for local offline demo
  if (!isConfigured()) {
    if (process.env.PAYPAL_MOCK_FALLBACK === 'true') {
      const mockOrderId = `MOCK_SANDBOX_ORDER_${Date.now()}`;
      return {
        id: mockOrderId,
        status: 'CREATED',
        isMock: true,
        links: [{ href: '#', rel: 'approve', method: 'GET' }]
      };
    }
    throw new Error('PayPal Sandbox credentials not configured. Please supply PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in server/.env');
  }

  const accessToken = await getAccessToken();
  const baseUrl = getBaseUrl();

  const formattedTotal = Number(totalAmount).toFixed(2);

  const purchaseUnits = [
    {
      reference_id: referenceId || `RVN_${Date.now()}`,
      description: 'Rural Venture Navigator - Millet Marketplace Order',
      custom_id: customData ? JSON.stringify(customData) : undefined,
      amount: {
        currency_code: currency,
        value: formattedTotal,
        breakdown: {
          item_total: {
            currency_code: currency,
            value: formattedTotal,
          },
        },
      },
      items: items.map((item) => ({
        name: (item.productName || 'Millet Product').slice(0, 127),
        unit_amount: {
          currency_code: currency,
          value: Number(item.unitPriceInCurrency).toFixed(2),
        },
        quantity: String(item.quantity),
        category: 'PHYSICAL_GOODS',
      })),
    },
  ];

  const payload = {
    intent: 'CAPTURE',
    purchase_units: purchaseUnits,
    application_context: {
      brand_name: 'Rural Venture Navigator',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      shipping_preference: 'NO_SHIPPING',
    },
  };

  const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    const detail = data.details ? JSON.stringify(data.details) : data.message || 'Failed to create PayPal order';
    throw new Error(`PayPal Order Creation Failed: ${detail}`);
  }

  return data;
};

/**
 * Capture a PayPal Order by orderId (v2)
 *
 * @param {String} orderId - PayPal Order ID
 */
const captureOrder = async (orderId) => {
  // Support mock capture if this was a mock order
  if (orderId && orderId.startsWith('MOCK_SANDBOX_ORDER_')) {
    return {
      id: orderId,
      status: 'COMPLETED',
      isMock: true,
      purchase_units: [
        {
          payments: {
            captures: [
              {
                id: `MOCK_CAPTURE_${Date.now()}`,
                status: 'COMPLETED',
                amount: {
                  currency_code: process.env.PAYPAL_CURRENCY || 'USD',
                  value: '1.00',
                },
              },
            ],
          },
        },
      ],
      payer: {
        email_address: 'sandbox-customer@ruralventure.org',
        name: {
          given_name: 'Test',
          surname: 'Customer',
        },
      },
    };
  }

  if (!isConfigured()) {
    throw new Error('PayPal Sandbox credentials not configured. Please supply PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in server/.env');
  }

  const accessToken = await getAccessToken();
  const baseUrl = getBaseUrl();

  const res = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
  });

  const data = await res.json();

  if (!res.ok) {
    const detail = data.details ? JSON.stringify(data.details) : data.message || 'Failed to capture PayPal order';
    throw new Error(`PayPal Order Capture Failed: ${detail}`);
  }

  return data;
};

module.exports = {
  isConfigured,
  getBaseUrl,
  getAccessToken,
  createOrder,
  captureOrder,
};

