import { create } from 'zustand';
import { AuthUser } from '../types';
import * as authApi from '../api/auth';
import * as storage from '../utils/storage';
import { setSessionExpiredHandler } from '../api/client';

interface AuthState {
  status: 'restoring' | 'authenticated' | 'unauthenticated';
  user: AuthUser | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (payload: authApi.RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'restoring',
  user: null,

  login: async (identifier, password) => {
    const isEmail = identifier.includes('@');
    const res = await authApi.login({
      ...(isEmail ? { email: identifier } : { phone_number: identifier }),
      password,
    });
    await storage.setToken(res.token);
    set({ status: 'authenticated', user: res.user });
  },

  register: async (payload) => {
    const res = await authApi.register(payload);
    await storage.setToken(res.token);
    set({ status: 'authenticated', user: res.user });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the server call fails, clear local session.
    }
    await storage.clearToken();
    set({ status: 'unauthenticated', user: null });
  },

  restoreSession: async () => {
    const token = await storage.getToken();
    if (!token) {
      set({ status: 'unauthenticated', user: null });
      return;
    }
    try {
      const user = await authApi.me();
      set({ status: 'authenticated', user });
    } catch {
      // Token invalid/expired — clear it.
      await storage.clearToken();
      set({ status: 'unauthenticated', user: null });
    }
  },

  refreshUser: async () => {
    try {
      const user = await authApi.me();
      set({ user });
    } catch {
      /* keep current user on transient failure; session handler covers expiry */
    }
  },
}));

// Wire the global "session expired" hook to log the user out.
setSessionExpiredHandler(() => {
  const store = useAuthStore.getState();
  if (store.status === 'authenticated') {
    // Don't call the API again (network may be the issue); just clear locally.
    storage.clearToken().then(() => store.logout);
    store.logout();
  }
});
