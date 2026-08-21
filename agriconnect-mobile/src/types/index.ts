import type { Role } from '../constants';

export interface User {
  id: number;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  county: string | null;
  role: Role | 'admin';
  bio?: string | null;
  profileImage?: string | null;
  isActive?: boolean;
  createdAt?: string;
}

/** Shape returned by /api/auth/me and /api/m/profile (publicUser). */
export interface AuthUser {
  id: number;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  county: string | null;
  role: Role | 'admin';
}

export interface FarmerRef {
  id: number;
  fullName?: string;
  full_name?: string;
  county?: string | null;
  phoneNumber?: string;
}

export interface ProduceListing {
  id: number;
  farmerId: number;
  name: string;
  category: string;
  quantityKg: number | string;
  pricePerKgKes: number | string;
  county: string;
  description?: string | null;
  imageUrl?: string | null;
  status: string;
  createdAt?: string;
  farmer?: FarmerRef;
  sales?: { kgSold: number; revenue: number };
}

export interface ServiceListing {
  id: number;
  providerId: number;
  category: string;
  title: string;
  priceKes: number | string;
  county: string;
  description?: string | null;
  availability: string;
  createdAt?: string;
  provider?: FarmerRef;
}

export interface ServiceRequest {
  id: number;
  serviceId: number;
  requesterId: number;
  providerId: number;
  location: string;
  requestedDate: string;
  description?: string | null;
  status: string;
  createdAt?: string;
  service?: { id: number; title: string; category: string; priceKes: number | string };
  requester?: FarmerRef;
  provider?: FarmerRef;
}

export interface OrderItem {
  id: number;
  orderId: number;
  listingId: number;
  quantityKg: number | string;
  unitPriceKes: number | string;
  totalKes: number | string;
  listing?: ProduceListing;
}

export interface Order {
  id: number;
  userId: number;
  sellerId: number | null;
  status: string;
  totalKes: number | string | null;
  createdAt?: string;
  items?: OrderItem[];
  buyer?: FarmerRef;
  seller?: FarmerRef;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  relatedId?: number | null;
  isRead: boolean;
  createdAt?: string;
}

export interface MarketPrice {
  produceName: string;
  category: string;
  marketName: string;
  county: string;
  price: number;
  unit: string;
  priceChange?: number;
  source?: string;
  recordedAt?: string;
}

export interface Review {
  id: number;
  reviewerId: number;
  revieweeId: number;
  rating: number;
  comment?: string | null;
  createdAt?: string;
}

export interface Conversation {
  user: FarmerRef;
  lastMessage: string;
  lastAt?: string;
  unread: number;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  createdAt?: string;
  sender?: { id: number; fullName: string };
  recipient?: { id: number; fullName: string };
}

export interface DashboardStats {
  produce: number;
  orders: number;
  messages: number;
}
