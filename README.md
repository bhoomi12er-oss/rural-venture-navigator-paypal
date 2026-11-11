# Rural Venture Navigator — Dual Portal Marketplace & Entrepreneur Studio

> **Empowering Rural Women Entrepreneurs with a Global PayPal Sandbox Payment Gateway & Specialized Business Studio**  
> Rural Venture Navigator is a specialized platform designed for Self-Help Groups (SHGs) and rural millet entrepreneurs in Dhamtari district, Chhattisgarh.

---

## 🌟 Architecture & Two Distinct Portals

The application is cleanly partitioned into two genuinely separate portals with strict role-based access control (RBAC):

### 1. 🛒 Customer Portal (`/customer/marketplace`)
* **Dedicated E-Commerce Layout**: Clean, consumer-first marketplace with header, category filter pills, real-time keyword search, and customer profile pill.
* **Rich Product Cards**: Displays image category badges, product titles, SHG producer details, prices in ₹ and PayPal USD, live inventory stock status, ingredients, and buyer repeat-purchase percentages.
* **Cart & PayPal Checkout**:
  * Slide-out cart drawer with itemized line totals and quantity adjustment (+ / -).
  * Direct **"Buy Now"** button for immediate checkout.
  * Official **PayPal JavaScript SDK buttons** powered by `@paypal/react-paypal-js`.
  * Real-time server-side price validation (zero-trust client totals).
* **Customer Orders & Receipts**:
  * Confirmed order receipts with `✓ Paid via PayPal Sandbox` badges.
  * PayPal Order ID (`5O19...`) and PayPal Capture ID (`CAP_...`).
* **Post-Purchase Review Modal**:
  * Direct feedback submission on flavor/quality (1-5 stars), price reasonability, and repeat purchase intent.
* **No Business Tools**: No cost calculators, QR tests, or entrepreneur management tools are visible.

### 2. 💼 Shopkeeper / Entrepreneur Studio (`/entrepreneur/dashboard`)
* **Dedicated SaaS Dashboard Layout**: Sidebar navigation customized specifically for rural millet business management.
* **Product Catalog & Stock Management (`/entrepreneur/products`)**:
  * Full CRUD inventory management: Add new product, edit existing product price/stock/ingredients, or delete a product.
  * Real-time stock level monitoring (In Stock vs Low Stock alerts).
* **Incoming Customer Orders (`/entrepreneur/orders`)**:
  * Comprehensive fulfillment ledger displaying all incoming customer orders.
  * Customer name, phone number, product name, quantity, total amount (₹), payment status, and verified PayPal Capture IDs.
* **Customer Feedback & Sentiment Studio (`/entrepreneur/feedback`)**:
  * Aggregated review ratings, repeat-buy percentages, price sentiment breakdown (Reasonable / Expensive / Cheap), and full buyer review logs.
* **Business Analytics & Economics**:
  * Unit Economics Calculator (`/entrepreneur/calculator`)
  * Packaging QR Demand Testing (`/entrepreneur/demand-test`)
  * Smart Decision Engine (`/entrepreneur/decision`)
  * Business Profile (`/entrepreneur/profile`)
* **No Customer Shopping Cart or Buy Buttons**: The shopkeeper portal strictly manages the business without buyer shopping cart widgets.

---

## 🔐 Role-Based Authentication & Route Protection

* **Backend-Verified Roles**: Stored in MongoDB / local JSON database (`users.json`). The role is signed into the JWT payload (`id`, `role`, `name`) and checked on every protected API call via `protect` and `authorize('entrepreneur')` middleware.
* **Frontend Route Guards (`RoleRoute.jsx`)**:
  * `<CustomerRoute>`: Blocks non-customers and unauthenticated users. If a logged-in entrepreneur navigates to customer routes, they are redirected to `/entrepreneur/dashboard`.
  * `<EntrepreneurRoute>`: Blocks non-entrepreneurs and unauthenticated users. If a customer attempts to access `/entrepreneur/*`, `/dashboard`, `/calculator`, etc., they are redirected to `/customer/marketplace`.
  * `<PublicOnlyRoute>`: Automatically redirects already logged-in users away from `/login` and `/register` directly to their respective portals.
* **Clean Session State**: Logging out clears `rvn_token`, `rvn_user`, and `rvn_cart`, preventing session bleeding when switching accounts.

---

## 🧪 Pre-Configured Test Accounts

| Role | Name | Phone Number | Password | Default Portal |
|---|---|---|---|---|
| **Customer / Buyer** | Anita Devi | `9876543210` | `password123` | `/customer/marketplace` |
| **Entrepreneur / Seller** | Bhoomi Kumari | `9123456789` | `password123` | `/entrepreneur/dashboard` |

You can also register brand-new Customer or Entrepreneur accounts via the Registration screen (`/register`).

---

## 🚀 Setup & Running Instructions

### 1. Backend Setup
```powershell
cd "Rural venture PayPal/server"
npm install
npm start
# Runs Express on port 5000
```

### 2. Frontend Setup
```powershell
cd "Rural venture PayPal/client"
npm install
npm run dev
# Vite runs on http://localhost:5173
```

### 3. PayPal Sandbox Configuration
Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here

PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret_here
PAYPAL_CURRENCY=USD
EXCHANGE_RATE_INR_TO_USD=0.012
PAYPAL_MOCK_FALLBACK=true
```

---

## 📡 API Reference

| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Registers user with selected role (`customer` or `entrepreneur`). |
| `POST` | `/api/auth/login` | Public | Authenticates user and returns JWT with verified role. |
| `GET` | `/api/auth/me` | Authenticated | Returns current authenticated user and role. |
| `GET` | `/api/orders/paypal-config` | Public | Returns public PayPal `clientId`, `currency`, and `exchangeRate`. |
| `POST` | `/api/orders/create-paypal-order` | Authenticated | Server calculates trusted totals from DB and initiates PayPal order. |
| `POST` | `/api/orders/capture-paypal-order` | Authenticated | Captures authorized order via PayPal API and records completed order. |
| `GET` | `/api/orders` | Authenticated | Lists orders for authenticated user (customers see their purchases; entrepreneurs see incoming orders). |
| `GET` | `/api/products` | Public | Lists active millet products for the customer marketplace. |
| `GET` | `/api/products/my` | Entrepreneur Only | Lists products belonging to the logged-in entrepreneur. |
| `POST` | `/api/products` | Entrepreneur Only | Adds a new product to the catalog. |
| `PUT` | `/api/products/:id` | Entrepreneur Only | Updates price, stock, ingredients, or description of a product. |
| `DELETE` | `/api/products/:id` | Entrepreneur Only | Deletes a product from the catalog. |
| `POST` | `/api/feedback` | Authenticated | Submits customer review on product taste, price, and repeat buy intent. |
| `GET` | `/api/feedback/my` | Entrepreneur Only | Retrieves customer reviews for the logged-in entrepreneur's products. |

---

## 🛡️ Security & Integrity Guarantee
* **Original Folder Untouched**: The original `Rural venture` folder remains 100% clean and unmodified.
* **Zero Client Price Trust**: All prices and conversions are calculated strictly on the backend.
* **Secret Isolation**: `PAYPAL_CLIENT_SECRET` is kept strictly on the backend.
