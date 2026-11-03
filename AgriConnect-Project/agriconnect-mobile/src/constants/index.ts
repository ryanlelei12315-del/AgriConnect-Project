import Constants from 'expo-constants';

/**
 * Resolve the backend base URL.
 * Priority: EXPO_PUBLIC_API_URL env (build-time) > app.json "extra.apiUrl".
 * Kept centralised so it can be overridden in one place.
 */
export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL || (Constants.expoConfig?.extra?.apiUrl as string | undefined) || 'http://10.0.2.2:3000';

export const ROLES = ['farmer', 'buyer', 'provider'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  farmer: 'Farmer',
  buyer: 'Buyer',
  provider: 'Service Provider',
};

export const PRODUCE_CATEGORIES = [
  'Vegetables',
  'Cereals',
  'Root Crops',
  'Legumes',
  'Fruits',
  'Dairy',
  'Poultry',
  'Livestock',
  'Other',
] as const;

export const SERVICE_CATEGORIES = [
  'Machinery',
  'Transport',
  'Infrastructure',
  'Labour',
  'Agronomy',
  'Other',
] as const;

export const COUNTIES = [
  'Uasin Gishu', 'Nakuru', 'Trans Nzoia', 'Meru', 'Kiambu', 'Kajiado',
  'Nairobi', 'Mombasa', 'Kisumu', 'Eldoret', 'Embu', 'Naivasha',
  'Kakamega', 'Kericho', "Murang'a", 'Other',
] as const;

export const LISTING_STATUS: Record<string, string> = {
  LISTED: 'Listed',
  PENDING: 'Pending',
  SOLD: 'Sold',
  INACTIVE: 'Inactive',
};

export const ORDER_STATUS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  completed: 'Completed',
  canceled: 'Canceled',
};

export const REQUEST_STATUS: Record<string, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};
