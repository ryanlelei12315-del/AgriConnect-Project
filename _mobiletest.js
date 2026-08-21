/* Comprehensive mobile-API integration test against the running backend (:3000) */
const BASE = process.env.BASE_URL || 'http://localhost:3000';
let pass = 0, fail = 0;
const log = (ok, label, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${extra ? '  → ' + extra : ''}`);
  ok ? pass++ : fail++;
};

function req(method, path, { token, csrf, json, cookie } = {}) {
  const headers = { Accept: 'application/json' };
  let body;
  if (json !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(json); }
  if (token) headers.Authorization = `Bearer ${token}`;
  if (csrf) headers['X-CSRF-Token'] = csrf;
  if (cookie) headers.Cookie = cookie;
  return fetch(BASE + path, { method, headers, body }).then(async (r) => ({
    status: r.status, body: await r.json().catch(() => null), setCookie: r.headers.get('set-cookie'),
  }));
}

async function csrfHeaders() {
  const r = await req('GET', '/api/auth/csrf');
  const cookie = (r.setCookie || '').split(';')[0];
  return { csrf: r.body.csrfToken, cookie };
}

async function main() {
  const stamp = Date.now();
  const fEmail = `mf_${stamp}@test.com`;
  const bEmail = `mb_${stamp}@test.com`;

  let c = await csrfHeaders();
  let r = await req('POST', '/api/auth/register', { cookie: c.cookie, csrf: c.csrf, json: { full_name: 'Mobile Farmer', email: fEmail, password: 'Password123!', role: 'farmer', county: 'Kiambu' } });
  log(r.status === 201 && r.body.token, 'register farmer (cookie+csrf)', `status=${r.status}`);
  const farmerToken = r.body.token;

  c = await csrfHeaders();
  r = await req('POST', '/api/auth/register', { cookie: c.cookie, csrf: c.csrf, json: { full_name: 'Mobile Buyer', email: bEmail, password: 'Password123!', role: 'buyer', county: 'Nairobi' } });
  log(r.status === 201 && r.body.token, 'register buyer (cookie+csrf)', `status=${r.status}`);
  const buyerToken = r.body.token;

  c = await csrfHeaders();
  r = await req('POST', '/api/auth/login', { cookie: c.cookie, csrf: c.csrf, json: { email: fEmail, password: 'Password123!' } });
  log(r.status === 200 && r.body.token, 'login farmer', `status=${r.status}`);

  c = await csrfHeaders();
  r = await req('POST', '/api/auth/login', { cookie: c.cookie, csrf: c.csrf, json: { email: fEmail, password: 'wrong' } });
  log(r.status === 401, 'login wrong password → 401', `status=${r.status}`);

  r = await req('GET', '/api/auth/me', { token: farmerToken });
  log(r.status === 200 && r.body.user.role === 'farmer', '/api/auth/me', `role=${r.body.user && r.body.user.role}`);

  r = await req('GET', '/api/listings', { token: farmerToken });
  log(r.status === 200, 'GET /api/listings', `count=${r.body.listings && r.body.listings.length}`);

  // CSRF exemption: Bearer-only POST must now succeed (was 403 before)
  r = await req('POST', '/api/listings', { token: farmerToken, json: { name: 'Test Beans', category: 'Legumes', quantity_kg: 100, price_per_kg_kes: 80, county: 'Kiambu', description: 'mobile test' } });
  log(r.status === 201 && r.body.listing, 'POST /api/listings (Bearer only, CSRF-exempt)', `status=${r.status}`);
  const listingId = r.body.listing ? r.body.listing.id : null;

  // CSRF still enforced without bearer
  r = await req('POST', '/api/listings', { json: { name: 'X', category: 'Legumes', quantity_kg: 1, price_per_kg_kes: 1, county: 'Kiambu' } });
  log(r.status === 403, 'POST /api/listings without auth still CSRF-blocked', `status=${r.status}`);

  r = await req('GET', '/api/m/health', { token: farmerToken });
  log(r.status === 200, 'GET /api/m/health');

  r = await req('GET', '/api/m/services', { token: farmerToken });
  log(r.status === 200, 'GET /api/m/services', `count=${r.body.services && r.body.services.length}`);

  r = await req('GET', '/api/m/market-prices', { token: farmerToken });
  log(r.status === 200, 'GET /api/m/market-prices', `count=${Array.isArray(r.body.prices) ? r.body.prices.length : '?'} demo=${r.body.isDemo}`);

  r = await req('GET', '/api/m/notifications', { token: farmerToken });
  log(r.status === 200, 'GET /api/m/notifications', `count=${r.body.notifications && r.body.notifications.length}`);

  r = await req('GET', '/api/m/profile', { token: farmerToken });
  log(r.status === 200 && r.body.user.fullName === 'Mobile Farmer', 'GET /api/m/profile', `name=${r.body.user && r.body.user.fullName}`);

  r = await req('GET', '/api/m/produce', { token: farmerToken });
  log(r.status === 200, 'GET /api/m/produce (farmer)', `count=${r.body.produce && r.body.produce.length}`);

  r = await req('PUT', '/api/m/profile', { token: farmerToken, json: { fullName: 'Mobile Farmer 2', email: fEmail, phoneNumber: '0711000111', county: 'Kiambu', bio: 'hello' } });
  log(r.status === 200 && r.body.user.fullName === 'Mobile Farmer 2', 'PUT /api/m/profile', `status=${r.status}`);

  // ── Order flow ──────────────────────────────────────────────────
  if (listingId) {
    r = await req('POST', '/api/m/orders', { token: buyerToken, json: { listing_id: listingId, quantity_kg: 10 } });
    log(r.status === 201, 'buyer POST /api/m/orders', `status=${r.status} ${r.body.message || ''}`);
    const orderId = r.body.order ? r.body.order.id : null;

    r = await req('GET', '/api/m/orders', { token: buyerToken });
    log(r.status === 200, 'buyer GET /api/m/orders', `count=${r.body.orders && r.body.orders.length}`);

    if (orderId) {
      r = await req('PATCH', `/api/m/orders/${orderId}/status`, { token: farmerToken, json: { status: 'confirmed' } });
      log(r.status === 200 && r.body.order.status === 'confirmed', 'farmer PATCH order → confirmed', `status=${r.status}`);
      r = await req('PATCH', `/api/m/orders/${orderId}/status`, { token: farmerToken, json: { status: 'completed' } });
      log(r.status === 200, 'PATCH order → completed', `status=${r.status}`);
      r = await req('POST', '/api/m/reviews', { token: buyerToken, json: { order_id: orderId, rating: 5, comment: 'Great produce' } });
      log(r.status === 201, 'buyer POST /api/m/reviews', `status=${r.status}`);
    }
  }

  // ── Service request flow ────────────────────────────────────────
  r = await req('GET', '/api/m/services', { token: farmerToken });
  const svc = r.body.services && r.body.services[0];
  if (svc) {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    r = await req('POST', `/api/m/services/${svc.id}/request`, { token: farmerToken, json: { location: 'Kiambu', requested_date: tomorrow, description: 'Need help' } });
    log(r.status === 201, 'farmer POST /api/m/services/:id/request', `status=${r.status} ${r.body.message || ''}`);
    const reqId = r.body.request ? r.body.request.id : null;
    r = await req('GET', '/api/m/service-requests', { token: farmerToken });
    log(r.status === 200, 'GET /api/m/service-requests (requester)', `count=${r.body.requests && r.body.requests.length}`);
    if (reqId) {
      const pl = await req('POST', '/api/auth/login', { json: { email: 'mary.wanjiku@example.com', password: 'Password123!' } });
      const providerToken = pl.body.token;
      r = await req('PATCH', `/api/m/service-requests/${reqId}/status`, { token: providerToken, json: { status: 'ACCEPTED' } });
      log(r.status === 200 && r.body.request.status === 'ACCEPTED', 'provider PATCH service-request → ACCEPTED', `status=${r.status}`);
    }
  }

  console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('FATAL', e.message); process.exit(1); });