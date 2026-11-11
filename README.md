# Rural Venture Navigator — Dual Portal Marketplace & Entrepreneur Studio

> Empowering rural millet entrepreneurs with a dedicated marketplace, business management tools, and PayPal Sandbox integration.

Rural Venture Navigator is a role-based platform designed to connect customers with rural millet entrepreneurs. It provides two separate experiences: a customer marketplace for discovering and purchasing products, and an entrepreneur studio for managing products, orders, customer feedback, and business decisions.

## 🌟 Architecture & Two Distinct Portals

### 1. Customer Portal — `/customer/marketplace`

A dedicated marketplace designed around the customer shopping experience.

- Browse millet products with category filters and keyword search.
- View product details, prices, producer information, and stock availability.
- Add products to a cart and adjust quantities.
- Use Buy Now for direct checkout.
- PayPal JavaScript SDK integration using `@paypal/react-paypal-js`.
- View order history and available order details.
- Submit product reviews covering quality, pricing, and repeat-purchase intent.

The customer portal does not expose entrepreneur management tools.

### 2. Entrepreneur Studio — `/entrepreneur/dashboard`

A separate business-management interface for rural entrepreneurs.

- **Product Management:** Add, edit, and delete products; manage prices, stock, and ingredients.
- **Order Management:** View incoming customer orders and fulfillment details.
- **Customer Feedback:** Review ratings, buyer feedback, and price sentiment.
- **Unit Economics:** Estimate costs, pricing, and business profitability.
- **Demand Testing:** Explore packaging QR-based demand testing.
- **Smart Decision Engine:** Get AI-assisted business guidance.
- **Business Profile:** Manage entrepreneur information.

The entrepreneur portal does not expose customer shopping-cart or checkout functionality.

## 🔐 Role-Based Authentication & Route Protection

The application uses separate customer and entrepreneur access.

- User roles are stored in the backend database.
- JWT-based authentication carries user identity and role information.
- Protected API routes use authentication and role-authorization middleware.
- Customer and entrepreneur routes have separate frontend guards.
- Authenticated users are redirected to their respective portals.
- Logout clears the application's authentication and cart session data.

## 💳 PayPal Sandbox Integration

The application includes a PayPal Sandbox checkout workflow.

- PayPal JavaScript SDK integration on the frontend.
- Backend endpoints for creating and capturing PayPal orders.
- Server-side product and price validation during order creation.
- Sandbox credentials are configured through backend environment variables.
- Order records are maintained by the backend.

**Note:** PayPal Sandbox is intended for testing. Successful payment capture and receipt generation should be verified in the Sandbox environment before treating an order as paid.

## 🚀 Setup & Running Instructions

### Prerequisites

- Node.js and npm
- PayPal Developer Sandbox account
- MongoDB (optional if the local JSON fallback is supported by the configured application)

### 1. Clone the repository

```bash
git clone https://github.com/bhoomi12er-oss/rural-venture-navigator-paypal.git
cd rural-venture-navigator-paypal
```

### 2. Start the backend

```bash
cd server
npm install
```

Create a `server/.env` file using your own local configuration:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here

PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_CURRENCY=USD
EXCHANGE_RATE_INR_TO_USD=0.012
PAYPAL_MOCK_FALLBACK=false
```

Keep actual credentials private. Never commit `.env` files or expose the PayPal Client Secret in frontend code.

Start the backend:

```bash
npm start
```

### 3. Start the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal. The default development port is usually `5173`, but Vite may select another available port.

## 📡 API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a customer or entrepreneur |
| POST | `/api/auth/login` | Public | Authenticate and receive a JWT |
| GET | `/api/auth/me` | Authenticated | Retrieve the current user |
| GET | `/api/orders/paypal-config` | Public | Retrieve public PayPal configuration |
| POST | `/api/orders/create-paypal-order` | Authenticated | Create a PayPal order |
| POST | `/api/orders/capture-paypal-order` | Authenticated | Request PayPal order capture |
| GET | `/api/orders` | Authenticated | Retrieve role-specific orders |
| GET | `/api/products` | Public | List marketplace products |
| GET | `/api/products/my` | Entrepreneur | List the entrepreneur's products |
| POST | `/api/products` | Entrepreneur | Add a product |
| PUT | `/api/products/:id` | Entrepreneur | Update a product |
| DELETE | `/api/products/:id` | Entrepreneur | Delete a product |
| POST | `/api/feedback` | Authenticated | Submit product feedback |
| GET | `/api/feedback/my` | Entrepreneur | Retrieve feedback for the entrepreneur's products |

## 🛠️ Technology Stack

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with local JSON fallback where configured
- **Authentication:** JWT
- **Payments:** PayPal JavaScript SDK and PayPal Sandbox APIs
- **AI:** AI-assisted business decision support

## 🛡️ Security Considerations

- PayPal Client Secret and other private credentials belong in backend environment variables.
- The frontend should not be trusted to determine final order totals.
- Protected backend routes should validate authentication and user roles.
- Do not commit `.env` files, private credentials, or local
