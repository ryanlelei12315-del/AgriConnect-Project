/* Baseline test #2 — mobile-style manual cookie carry for register/login */
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

// Fetch CSRF token + capture cookie, then carry both on the mutation.
async function csrfHeaders() {
  const r = await req('GET', '/api/auth/csrf');
  const raw = r.setCookie || '';
  const cookie = raw.split(';')[0]; // _csrf=....
  return { csrf: r.body.csrfToken, cookie };
}

async function main() {
  const email = `mobile_${Date.now()}@test.com`;
  const c1 = await csrfHeaders();
  const reg = await req('POST', '/api/auth/register', {
    cookie: c1.cookie, csrf: c1.csrf,
    json: { full_name: 'Mobile Tester', email, password: 'Password123!', role: 'farmer', county: 'Kiambu' },
  });
  console.log('REGISTER (mobile flow):', reg.status, reg.body.message, 'token?', !!reg.body.token);
  const token = reg.body.token;

  // Mutating call with a FRESH csrf via cookie carry
  const c2 = await csrfHeaders();
  const login = await req('POST', '/api/auth/login', {
    cookie: c2.cookie, csrf: c2.csrf,
    json: { email, password: 'Password123!' },
  });
  console.log('LOGIN (mobile flow):', login.status, 'token?', !!login.body.token, login.body.user && login.body.user.role);

  // GET endpoints with Bearer
  const me = await req('GET', '/api/auth/me', { token });
  console.log('ME (Bearer):', me.status, me.body.user && me.body.user.full_name);
  const listings = await req('GET', '/api/listings', { token });
  console.log('LISTINGS (Bearer):', listings.status, 'count=', listings.body.listings && listings.body.listings.length);
}
main().catch((e) => { console.error('FATAL', e.message); process.exit(1); });