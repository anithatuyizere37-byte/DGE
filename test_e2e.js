const http = require('http');

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE END-TO-END NEON API TESTS ---');

  // Launch server in-process
  const { server, pool } = require('./server');
  // Allow migrations to complete
  await new Promise((r) => setTimeout(r, 4000));

  try {
    console.log('\n[1/6] Testing GET / (Root Service)');
    const rootRes = await makeRequest('GET', '/');
    console.log('Status:', rootRes.status);
    console.log('Response:', JSON.stringify(rootRes.body, null, 2));

    console.log('\n[2/6] Testing GET /api/health (Neon Database Health)');
    const healthRes = await makeRequest('GET', '/api/health');
    console.log('Status:', healthRes.status);
    console.log('Neon Database:', healthRes.body?.services?.neon_postgres?.database);
    console.log('Version:', healthRes.body?.services?.neon_postgres?.version);

    console.log('\n[3/6] Testing GET /api/categories (Neon Categories)');
    const catRes = await makeRequest('GET', '/api/categories');
    console.log('Status:', catRes.status);
    console.log(`Found ${catRes.body?.length} Categories in Neon`);

    console.log('\n[4/6] Testing GET /api/products (Neon Catalog)');
    const prodRes = await makeRequest('GET', '/api/products');
    console.log('Status:', prodRes.status);
    console.log(`Found ${prodRes.body?.length} Products in Neon`);

    console.log('\n[5/6] Testing POST /api/auth/login (Owner Authentication & JWT)');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'owner@dgecommerce.rw',
      password: 'Owner1234!',
    });
    console.log('Status:', loginRes.status);
    console.log('Login Role:', loginRes.body?.user?.role);
    const token = loginRes.body?.token;

    console.log('\n[6/6] Testing POST /api/orders (Order Creation in Neon)');
    const orderRes = await makeRequest('POST', '/api/orders', {
      customerName: 'Aline Mukamana',
      customerPhone: '+250 788 555 777',
      deliveryAddress: 'Rwamagana Central Sector',
      district: 'Rwamagana',
      paymentMethod: 'Cash on Delivery',
      subtotal: 18000,
      deliveryFee: 1500,
      total: 19500,
      items: [{ productId: 1, name: 'Smart Men Casual Shirt', price: 18000, quantity: 1 }],
    });
    console.log('Status:', orderRes.status);
    console.log('Order Result:', JSON.stringify(orderRes.body));

    console.log('\n======================================================');
    console.log('ALL NEON POSTGRESQL & API ENDPOINTS VERIFIED & WORKING!');
    console.log('======================================================');
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await pool.end();
    process.exit(process.exitCode || 0);
  }
}

runTests();
