import { api } from './client';
import { AuthUser } from '../types';

export async function getProfile(): Promise<AuthUser> {
  const body = await api.get<{ user: AuthUser }>('/api/m/profile');
  return body.user;
}

export async function updateProfile(payload: {
  fullName: string;
  email: string;
  phoneNumber: string;
  county: string;
  bio?: string;
}): Promise<AuthUser> {
  const body = await api.put<{ user: AuthUser }>('/api/m/profile', {
    json: { ...payload } as unknown as Record<string, unknown>,
  });
  return body.user;
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.put('/api/m/profile/password', { json: { currentPassword, newPassword } });
}

export async function uploadProfileImage(uri: string): Promise<AuthUser> {
  const form = new FormData();
  const filename = uri.split('/').pop() || 'avatar.jpg';
  form.append('image', { uri, name: filename, type: 'image/jpeg' } as unknown as Blob);
  const body = await api.post<{ user: AuthUser }>('/api/m/profile/image', { form });
  return body.user;
}
