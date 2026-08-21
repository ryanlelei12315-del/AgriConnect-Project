import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Token storage — the JWT is sensitive, so it lives in Expo SecureStore
 * (Keychain/Keystore), never in plain AsyncStorage. Non-sensitive app state
 * (e.g. last-selected role, cached filter preferences) can use AsyncStorage.
 */

const TOKEN_KEY = 'agri_token';
const CSRF_KEY = 'agri_csrf';
const USER_KEY = 'agri_user_cache';

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
  await SecureStore.deleteItemAsync(CSRF_KEY).catch(() => {});
  await AsyncStorage.removeItem(USER_KEY).catch(() => {});
}

/**
 * The CSRF token is non-sensitive (it is the double-submit value only). It is
 * cached so register/login can be driven from JSON + a manual Cookie header
 * without re-fetching on every attempt.
 */
export async function getCsrfToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(CSRF_KEY);
  } catch {
    return null;
  }
}

export async function setCsrfToken(token: string): Promise<void> {
  await AsyncStorage.setItem(CSRF_KEY, token);
}

export async function cacheUser(json: string): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, json);
}

export async function getCachedUser(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(USER_KEY);
  } catch {
    return null;
  }
}
