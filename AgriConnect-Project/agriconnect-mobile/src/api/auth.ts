import { api } from './client';
import { AuthUser } from '../types';

export interface RegisterPayload {
  full_name: string;
  email?: string;
  phone_number?: string;
  password: string;
  role: string;
  county?: string;
}

export interface LoginPayload {
  email?: string;
  phone_number?: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: AuthUser;
}

/**
 * Auth endpoints are the only ones that need the cookie+CSRF dance (no Bearer
 * token exists yet). The client drives this from JSON + a manual Cookie header.
 */

export async function csrfToken(): Promise<string> {
  const body = await api.get<{ csrfToken?: string }>('/api/auth/csrf', { auth: false });
  return body.csrfToken || '';
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/register', {
    withCsrf: true,
    json: { ...payload } as unknown as Record<string, unknown>,
  });
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/login', {
    withCsrf: true,
    json: { ...payload } as unknown as Record<string, unknown>,
  });
}

export async function logout(): Promise<void> {
  await api.post('/api/auth/logout', { withCsrf: true, json: {} });
}

export async function me(): Promise<AuthUser> {
  const body = await api.get<{ user: AuthUser }>('/api/auth/me');
  return body.user;
}

// ── WhatsApp phone verification ─────────────────────────────────────────

export interface PhoneSendResponse {
  success: boolean;
  message?: string;
  code?: string; // dev-only: OTP code echoed back for demo convenience
}

export interface PhoneVerifyResponse {
  success: boolean;
  message?: string;
}

/**
 * Send a 6-digit OTP via WhatsApp.
 * These endpoints are unauthenticated, so use withCsrf (same as register/login).
 */
export async function sendPhoneVerification(
  phone_number: string,
  purpose: 'register' | 'login' | 'verify',
): Promise<PhoneSendResponse> {
  return api.post<PhoneSendResponse>('/api/auth/phone/send', {
    withCsrf: true,
    json: { phone_number, purpose },
  });
}

/**
 * Verify a 6-digit OTP. Returns true/false, not an auth token.
 */
export async function verifyPhoneOTP(
  phone_number: string,
  purpose: 'register' | 'login' | 'verify',
  code: string,
): Promise<PhoneVerifyResponse> {
  return api.post<PhoneVerifyResponse>('/api/auth/phone/verify', {
    withCsrf: true,
    json: { phone_number, purpose, code },
  });
}

/**
 * Passwordless login: validates an OTP (purpose: 'login') and returns a JWT + user.
 */
export async function whatsappLogin(phone_number: string, code: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/phone/login', {
    withCsrf: true,
    json: { phone_number, code },
  });
}
