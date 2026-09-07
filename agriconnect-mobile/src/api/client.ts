import { API_BASE_URL } from '../constants';
import { getCsrfToken, getToken, setCsrfToken } from '../utils/storage';

/** Uniform error surface so screens can show a safe message. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Called when the session is proven invalid/expired. The app clears auth. */
export let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(fn: (() => void) | null): void {
  onSessionExpired = fn;
}

async function parseBody<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  // Raw JSON payload
  json?: Record<string, unknown>;
  // multipart/form-data payload
  form?: FormData;
  // Set false for unauthenticated endpoints (register/login fetch CSRF themselves)
  auth?: boolean;
  timeoutMs?: number;
  // Attach a manual Cookie header + X-CSRF-Token (used only for register/login)
  withCsrf?: boolean;
}

const jsonHeaders: Record<string, string> = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

/**
 * Core request wrapper. Authenticated calls attach `Authorization: Bearer`.
 * The backend CSRF middleware is bypassed for valid Bearer clients; the only
 * cookie+CSRF dance needed is for /api/auth/register and /api/auth/login.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    json,
    form,
    auth = true,
    timeoutMs = 15000,
    withCsrf = false,
  } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };

  if (withCsrf) {
    // Ensure a fresh CSRF token (initCsrf issues one on GET /api/auth/csrf).
    let csrf = await getCsrfToken();
    if (!csrf) {
      const r = await fetch(`${API_BASE_URL}/api/auth/csrf`, { method: 'GET', headers: { Accept: 'application/json' } });
      const body = await parseBody<{ csrfToken?: string }>(r);
      csrf = body.csrfToken || '';
      if (csrf) await setCsrfToken(csrf);
    }
    if (csrf) {
      headers['X-CSRF-Token'] = csrf;
      // Manual Cookie header so cookie-parser can read _csrf on the server
      // (RN cannot reliably read set-cookie, so we echo the value ourselves).
      headers['Cookie'] = `_csrf=${csrf}`;
    }
  } else if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  if (json !== undefined) Object.assign(headers, jsonHeaders);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: headers as Record<string, string>,
      body:
        form !== undefined
          ? form
          : json !== undefined
            ? JSON.stringify(json)
            : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const aborted = err instanceof Error && err.name === 'AbortError';
    throw new ApiError(0, aborted ? 'The request timed out. Please check your connection and try again.' : 'Network error. Please check your connection and try again.');
  }
  clearTimeout(timer);

  const body = await parseBody<T>(res);

  // Session expired/invalid — let the app react globally.
  if (res.status === 401 && auth && !withCsrf) {
    onSessionExpired?.();
  }

  if (!res.ok) {
    const message =
      (body as { message?: string } | null)?.message ||
      `Request failed (${res.status}).`;
    throw new ApiError(res.status, message);
  }

  return body;
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => apiRequest<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, opts?: RequestOptions) => apiRequest<T>(path, { ...opts, method: 'POST' }),
  put: <T>(path: string, opts?: RequestOptions) => apiRequest<T>(path, { ...opts, method: 'PUT' }),
  patch: <T>(path: string, opts?: RequestOptions) => apiRequest<T>(path, { ...opts, method: 'PATCH' }),
  del: <T>(path: string, opts?: RequestOptions) => apiRequest<T>(path, { ...opts, method: 'DELETE' }),
};
