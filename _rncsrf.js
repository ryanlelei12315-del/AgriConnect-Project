/* Verify RN-style auth: no cookie jar needed. Drive CSRF purely via JSON body + manual Cookie header. */
const BASE = 'http://localhost:3000';
async function jreq(method, path, { token, csrf, cookieHeader, json } = {}) {
  const headers = { Accept: 'application/json' };
  if (json !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  if (csrf) headers['X-CSRF-Token'] = csrf;
  if (cookieHeader) headers.Cookie = cookieHeader;
  return fetch(BASE + path, { method, headers, body: json !== undefined ? JSON.stringify(json) : undefined })
    .then(async (r) => ({ status: r.status, body: await r.json().catch(() => null) }));
}
async function main() {
  // 1) Get csrf token from JSON body only (no cookie parse needed)
  const cs = await jreq('GET', '/api/auth/csrf');
  const csrf = cs.body.csrfToken;
  console.log('csrf from body:', csrf ? 'yes' : 'NO');
  // Build manual Cookie header value from the token (same signed token is the cookie)
  const cookieHeader = `_csrf=${csrf}`;

  // 2) Register using ONLY manual cookie header + csrf header (no cookie jar)
  const email = `rn_${Date.now()}@test.com`;
  const reg = await jreq('POST', '/api/auth/register', { csrf, cookieHeader, json: { full_name: 'RN Farmer', email, password: 'Password123!', role: 'farmer', county: 'Kiambu' } });
  console.log('register (manual cookie):', reg.status, reg.body.message, 'token?', !!reg.body.token);
  const token = reg.body.token;

  // 3) Login same way
  const login = await jreq('POST', '/api/auth/login', { csrf, cookieHeader, json: { email, password: 'Password123!' } });
  console.log('login (manual cookie):', login.status, 'token?', !!login.body.token);

  // 4) Authed call with Bearer only
  const me = await jreq('GET', '/api/auth/me', { token });
  console.log('me (bearer):', me.status, me.body.user && me.body.user.full_name);
}
main().catch((e) => { console.error('FATAL', e.message); process.exit(1); });