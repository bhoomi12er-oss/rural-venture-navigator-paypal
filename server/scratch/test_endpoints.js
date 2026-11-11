const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const makeRequest = (path, method, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    
    if (body) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }
    
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path.startsWith('/api') ? path : `/api${path}`,
      method: method,
      headers: reqHeaders
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (body) {
      req.write(payload);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('====================================================');
  console.log('       STARTING BACKEND API VERIFICATION TESTS      ');
  console.log('====================================================');
  
  let passedCount = 0;
  let totalCount = 0;

  const assertTest = (name, condition, details = '') => {
    totalCount++;
    if (condition) {
      passedCount++;
      console.log(`  [PASS] ${name} ${details ? `(${details})` : ''}`);
    } else {
      console.error(`  [FAIL] ${name} ${details ? `(${details})` : ''}`);
      throw new Error(`Assertion failed for test: ${name}`);
    }
  };

  // 1. Health Check
  console.log('\n--- 1. Testing Health Check Endpoints ---');
  const health = await makeRequest('/', 'GET');
  assertTest('API Health Check GET /api', health.status === 200 && health.body.success !== false, `status: ${health.status}`);
  
  const timestamp = Date.now();
  const mockSellerPhone = `900${String(timestamp).slice(-7)}`;
  const mockCustomerPhone = `911${String(timestamp).slice(-7)}`;

  // 2. Authentication: Register & Login
  console.log('\n--- 2. Testing Auth Endpoints (Register & Login) ---');
  
  // Register Seller
  const sellerReg = await makeRequest('/auth/register', 'POST', {
    name: 'Lakshmi Devi SHG',
    phone: mockSellerPhone,
    password: 'password123',
    role: 'entrepreneur'
  });
  assertTest('Register Entrepreneur POST /auth/register', (sellerReg.status === 201 || sellerReg.status === 200) && sellerReg.body.token, `status: ${sellerReg.status}`);
  const sellerToken = sellerReg.body.token;

  // Register Customer
  const customerReg = await makeRequest('/auth/register', 'POST', {
    name: 'Gaurav Kumar',
    phone: mockCustomerPhone,
    password: 'password123',
    role: 'customer'
  });
  assertTest('Register Customer POST /auth/register', (customerReg.status === 201 || customerReg.status === 200) && customerReg.body.token, `status: ${customerReg.status}`);
  const customerToken = customerReg.body.token;

  // Login Customer
  const customerLogin = await makeRequest('/auth/login', 'POST', {
    phone: mockCustomerPhone,
    password: 'password123'
  });
  assertTest('Login Customer POST /auth/login', customerLogin.status === 200 && customerLogin.body.token, `status: ${customerLogin.status}`);

  // Login Seller
  const sellerLogin = await makeRequest('/auth/login', 'POST', {
    phone: mockSellerPhone,
    password: 'password123'
  });
  assertTest('Login Entrepreneur POST /auth/login', sellerLogin.status === 200 && sellerLogin.body.token, `status: ${sellerLogin.status}`);

  // Get Me (Protected)
  const getMeRes = await makeRequest('/auth/me', 'GET', null, { 'Authorization': `Bearer ${sellerToken}` });
  assertTest('Get Current User Profile GET /auth/me', getMeRes.status === 200 && getMeRes.body.user.phone === mockSellerPhone, `status: ${getMeRes.status}`);

  // 3. Products Endpoints
  console.log('\n--- 3. Testing Product Endpoints ---');
  
  // Create Product (by Seller)
  const createProd = await makeRequest('/products', 'POST', {
    productName: 'Ragi Almond Crunch Cookies',
    description: 'Crispy, protein-rich ragi flour cookies.',
    category: 'cookies',
    price: 35,
    ingredients: 'Ragi flour, Almonds, Organic Jaggery, Cow Ghee',
    availableQuantity: 200
  }, { 'Authorization': `Bearer ${sellerToken}` });
  assertTest('Create Product (Entrepreneur) POST /products', (createProd.status === 201 || createProd.status === 200) && createProd.body.product, `status: ${createProd.status}`);
  const productId = createProd.body.product._id;

  // Get Public Products
  const getProds = await makeRequest('/products', 'GET');
  assertTest('Get Public Product Catalog GET /products', getProds.status === 200 && Array.isArray(getProds.body.products), `count: ${getProds.body.products.length}`);

  // Get Product by ID
  const getSingleProd = await makeRequest(`/products/${productId}`, 'GET');
  assertTest('Get Product By ID GET /products/:id', getSingleProd.status === 200 && getSingleProd.body.product._id === productId, `status: ${getSingleProd.status}`);

  // Get Seller's Own Products
  const getMyProds = await makeRequest('/products/my', 'GET', null, { 'Authorization': `Bearer ${sellerToken}` });
  assertTest('Get Seller Own Products GET /products/my', getMyProds.status === 200 && getMyProds.body.products.length >= 1, `count: ${getMyProds.body.products.length}`);

  // 4. Orders Endpoints
  console.log('\n--- 4. Testing Order Endpoints ---');
  
  // Place Order (as Customer)
  const placeOrder = await makeRequest('/orders', 'POST', {
    productId: productId,
    quantity: 3
  }, { 'Authorization': `Bearer ${customerToken}` });
  assertTest('Place Order (Customer) POST /orders', (placeOrder.status === 201 || placeOrder.status === 200) && placeOrder.body.order.totalAmount === 105, `total: ${placeOrder.body.order.totalAmount}`);

  // Get Orders (as Customer)
  const custOrders = await makeRequest('/orders', 'GET', null, { 'Authorization': `Bearer ${customerToken}` });
  assertTest('Get Customer Orders GET /orders', custOrders.status === 200 && custOrders.body.orders.length >= 1, `count: ${custOrders.body.orders.length}`);

  // Get Orders (as Seller)
  const sellerOrders = await makeRequest('/orders', 'GET', null, { 'Authorization': `Bearer ${sellerToken}` });
  assertTest('Get Seller Orders GET /orders', sellerOrders.status === 200 && sellerOrders.body.orders.length >= 1, `count: ${sellerOrders.body.orders.length}`);

  // 5. Feedback Endpoints
  console.log('\n--- 5. Testing Feedback Endpoints ---');
  
  // Submit Feedback (with Customer Auth)
  const sendReviewAuth = await makeRequest('/feedback', 'POST', {
    productId: productId,
    rating: 5,
    wouldBuyAgain: true,
    priceReasonable: 'reasonable',
    comment: 'Organic and healthy, really loved the taste!'
  }, { 'Authorization': `Bearer ${customerToken}` });
  assertTest('Submit Feedback (Authenticated) POST /feedback', (sendReviewAuth.status === 201 || sendReviewAuth.status === 200) && sendReviewAuth.body.feedback, `status: ${sendReviewAuth.status}`);

  // Submit Feedback (Anonymous/Public)
  const sendReviewAnon = await makeRequest('/feedback', 'POST', {
    productId: productId,
    rating: 4,
    wouldBuyAgain: true,
    priceReasonable: 'reasonable',
    comment: 'Scanned from packaging QR, very nice.'
  });
  assertTest('Submit Feedback (Anonymous QR) POST /feedback', (sendReviewAnon.status === 201 || sendReviewAnon.status === 200) && sendReviewAnon.body.feedback, `status: ${sendReviewAnon.status}`);

  // Get Feedback (as Seller)
  const sellerFeedback = await makeRequest('/feedback/my', 'GET', null, { 'Authorization': `Bearer ${sellerToken}` });
  assertTest('Get Seller Feedbacks GET /feedback/my', sellerFeedback.status === 200 && sellerFeedback.body.feedbacks.length >= 1, `count: ${sellerFeedback.body.feedbacks.length}`);

  // 6. Protected Entrepreneur & Customer Routes Access Control
  console.log('\n--- 6. Testing Protected Routes & Role Authorization ---');

  // Entrepreneur Profile GET
  const getProf = await makeRequest('/entrepreneur/profile', 'GET', null, { 'Authorization': `Bearer ${sellerToken}` });
  assertTest('Entrepreneur Profile GET /entrepreneur/profile', getProf.status === 200 && getProf.body.profile, `status: ${getProf.status}`);

  // Entrepreneur Profile POST (Update)
  const updateProf = await makeRequest('/entrepreneur/profile', 'POST', {
    businessName: 'Lakshmi Self Help Group',
    category: 'cookies',
    location: 'Raipur, Chhattisgarh'
  }, { 'Authorization': `Bearer ${sellerToken}` });
  assertTest('Entrepreneur Profile Update POST /entrepreneur/profile', updateProf.status === 200 && updateProf.body.profile.businessName === 'Lakshmi Self Help Group', `status: ${updateProf.status}`);

  // Customer blocked from Entrepreneur Profile (403 Forbidden)
  const custForbiddenProf = await makeRequest('/entrepreneur/profile', 'GET', null, { 'Authorization': `Bearer ${customerToken}` });
  assertTest('Customer blocked from Entrepreneur Profile (403 Forbidden)', custForbiddenProf.status === 403, `status: ${custForbiddenProf.status}`);

  // Customer blocked from Creating Product (403 Forbidden)
  const custForbiddenProd = await makeRequest('/products', 'POST', {
    productName: 'Illegal Product',
    category: 'cookies',
    price: 50,
    ingredients: 'Flour',
    description: 'Test'
  }, { 'Authorization': `Bearer ${customerToken}` });
  assertTest('Customer blocked from Creating Product (403 Forbidden)', custForbiddenProd.status === 403, `status: ${custForbiddenProd.status}`);

  // Unauthenticated user blocked from Protected Route (401 Unauthorized)
  const unauthProf = await makeRequest('/entrepreneur/profile', 'GET');
  assertTest('Unauthenticated request blocked (401 Unauthorized)', unauthProf.status === 401, `status: ${unauthProf.status}`);

  console.log('\n====================================================');
  console.log(`   ALL ${passedCount}/${totalCount} API VERIFICATION TESTS PASSED SUCCESSFULLY!  `);
  console.log('====================================================');
};

runTests().catch(err => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
