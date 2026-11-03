/* Integration baseline test — runs against the running backend on :3000 */
const BASE = process.env.BASE_URL || 'http://localhost:3000';

function req(method, path, { token, csrf, json, cookie } = {}) {
  const headers = { Accept: 'application/json' };
  if (json !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  if (csrf) headers['X-CSRF-Token'] = csrf;
  if (cookie) headers.Cookie = cookie;
  const body = json !== undefined ? JSON.stringify(json) : undefined;
  return fetch(BASE + path, { method, headers, body }).then(async (r) => ({
    status: r.status,
    body: await r.json().catch(() => null),
    setCookie: r.headers.get('set-cookie'),
  }));
}

async function main() {
  // 1. Register/login a throwaway farmer
  const email = `mobile_${Date.now()}@test.com`;
  const reg = await req('POST', '/api/auth/register', {
    json: { full_name: 'Mobile Tester', email, password: 'Password123!', role: 'farmer', county: 'Kiambu' },
  });
  console.log('REGISTER (no csrf):', reg.status, reg.body && reg.body.message);

  // 2. Login with csrf token via cookie flow
  const csrfGet = await req('GET', '/api/auth/csrf');
  const csrfToken = csrfGet.body.csrfToken;
  const csrfCookie = (csrfGet.setCookie || '').split(';')[0];
  console.log('CSRF cookie set:', !!csrfCookie);
  const login = await req('POST', '/api/auth/login', {
    cookie: csrfCookie, csrf: csrfToken,
    json: { email, password: 'Password123!' },
  });
  const token = login.body.token;
  console.log('LOGIN (csrf):', login.status, 'token?', !!token, 'role=', login.body.user && login.body.user.role);

  // 3. GET /api/auth/me with Bearer
  const me = await req('GET', '/api/auth/me', { token });
  console.log('ME (Bearer):', me.status, me.body.user && me.body.user.full_name);

  // 4. GET /api/listings with Bearer
  const listings = await req('GET', '/api/listings', { token });
  console.log('LISTINGS (Bearer):', listings.status, 'count=', listings.body.listings && listings.body.listings.length);

  // 5. POST /api/listings with Bearer only (no cookie) — expect CSRF failure today
  const create = await req('POST', '/api/listings', {
    token,
    json: { name: 'Test Maize', category: 'Cereals', quantity_kg: 50, price_per_kg_kes: 60, county: 'Kiambu', description: 'test' },
  });
  console.log('CREATE LISTING (Bearer only):', create.status, create.body.message);
}

main().catch((e) => { console.error('FATAL', e.message); process.exit(1); });