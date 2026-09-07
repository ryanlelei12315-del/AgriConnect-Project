import { useAuthStore } from '../store/authStore';

export function useAuth() {
  return useAuthStore((s) => ({
    status: s.status,
    user: s.user,
    login: s.login,
    register: s.register,
    logout: s.logout,
    refreshUser: s.refreshUser,
  }));
}


export function useAuthUser() {
  return useAuthStore((s) => s.user);
}


export function useAuthStatus() {
  return useAuthStore((s) => s.status);
}
