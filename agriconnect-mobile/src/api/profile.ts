import { api } from './client';
import { User } from '../types';

export async function getProfile(): Promise<User> {
  const body = await api.get<{ user: User }>('/api/m/profile');
  return body.user;
}

export async function updateProfile(payload: {
  fullName: string;
  email: string;
  phoneNumber: string;
  county?: string | null;
  bio?: string;
}): Promise<User> {
  const body = await api.put<{ user: User }>('/api/m/profile', {
    json: { ...payload } as unknown as Record<string, unknown>,
  });
  return body.user;
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.put('/api/m/profile/password', { json: { currentPassword, newPassword } });
}

export async function uploadProfileImage(uri: string): Promise<User> {
  const form = new FormData();
  const filename = uri.split('/').pop() || 'avatar.jpg';
  form.append('image', { uri, name: filename, type: 'image/jpeg' } as unknown as Blob);
  const body = await api.post<{ user: User }>('/api/m/profile/image', { form });
  return body.user;
}
