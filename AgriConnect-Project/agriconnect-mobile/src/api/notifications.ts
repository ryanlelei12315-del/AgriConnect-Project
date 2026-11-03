import { api } from './client';
import { NotificationItem } from '../types';

export async function getNotifications(): Promise<NotificationItem[]> {
  const body = await api.get<{ notifications: NotificationItem[] }>('/api/m/notifications');
  return body.notifications;
}

export async function markNotificationRead(id: number): Promise<void> {
  await api.patch<{ success: boolean }>(`/api/m/notifications/${id}/read`);
}

export async function getDashboardStats(): Promise<{ produce: number; orders: number; messages: number }> {
  return api.get<{ produce: number; orders: number; messages: number }>('/api/dashboard/stats');
}
