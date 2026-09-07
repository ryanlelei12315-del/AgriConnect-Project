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
