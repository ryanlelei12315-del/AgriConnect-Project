const BASE = 'http://localhost:3000';
async function req(method, path, { token, csrf, json, cookie } = {}) {
  const headers = { Accept: 'application/json' };
  if (json !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  if (csrf) headers['X-CSRF-Token'] = csrf;
  if (cookie) headers.Cookie = cookie;
  return fetch(BASE + path, { method, headers, body: json !== undefined ? JSON.stringify(json) : undefined })
    .then(async (r) => ({ status: r.status, body: await r.json().catch(() => null), setCookie: r.headers.get('set-cookie') }));
}
async function csrfHeaders() { const r = await req('GET', '/api/auth/csrf'); return { csrf: r.body.csrfToken, cookie: (r.setCookie || '').split(';')[0] }; }

async function main() {
  const c = await csrfHeaders();
  const login = await req('POST', '/api/auth/login', { cookie: c.cookie, csrf: c.csrf, json: { email: 'mary.wanjiku@example.com', password: 'Password123!' } });
  console.log('mary login status=', login.status, 'token?', !!login.body.token, 'user=', login.body.user);
  const t = login.body.token;
  if (t) {
    const me = await req('GET', '/api/auth/me', { token: t });
    console.log('mary /me id=', me.body.user && me.body.user.id, 'role=', me.body.user && me.body.user.role);
    // find a service request
    const svcs = await req('GET', '/api/m/services', { token: t });
    const svc = svcs.body.services && svcs.body.services[0];
    console.log('first service id=', svc && svc.id, 'providerId=', svc && svc.provider && svc.provider.id);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const fLogin = await (async () => { const c2 = await csrfHeaders(); const r = await req('POST', '/api/auth/register', { cookie: c2.cookie, csrf: c2.csrf, json: { full_name: 'Helper Farmer', email: `hf_${Date.now()}@test.com`, password: 'Password123!', role: 'farmer', county: 'Nairobi' } }); return r; })();
    const ft = fLogin.body.token;
    const mk = await req('POST', `/api/m/services/${svc.id}/request`, { token: ft, json: { location: 'Nairobi', requested_date: tomorrow, description: 'x' } });
    console.log('create request status=', mk.status);
    const reqId = mk.body.request && mk.body.request.id;
    console.log('request id=', reqId);
    const upd = await req('PATCH', `/api/m/service-requests/${reqId}/status`, { token: t, json: { status: 'ACCEPTED' } });
    console.log('provider accept status=', upd.status, upd.body.message || '');
  }
}
main().catch((e) => { console.error('FATAL', e.message); process.exit(1); });