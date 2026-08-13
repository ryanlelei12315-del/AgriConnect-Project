/* eslint-env node */
/**
 * Server-side validation helpers.
 *
 * Every helper returns `{ ok: true, value }` on success or
 * `{ ok: false, error }` on failure so controllers can render a safe,
 * human-readable message instead of leaking a raw Sequelize error.
 * These helpers are deliberately dependency-free and unit-testable.
 */

/** @typedef {{ok: boolean, value?: *, error?: string}} Result */

const VALID_STATUSES = {
  produce: ['LISTED', 'PENDING', 'SOLD', 'INACTIVE'],
  order: ['pending', 'confirmed', 'shipped', 'completed', 'canceled'],
  serviceRequest: ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
  serviceAvailability: ['AVAILABLE', 'BOOKED', 'UNAVAILABLE'],
};

const VALID_CATEGORIES = [
  'Vegetables',
  'Cereals',
  'Root Crops',
  'Legumes',
  'Fruits',
  'Dairy',
  'Poultry',
  'Livestock',
  'Other',
];

const VALID_SERVICE_CATEGORIES = ['Machinery', 'Transport', 'Infrastructure', 'Labour', 'Agronomy', 'Other'];

/** Out of bounds guards prevent passing unusable lengths to the DB. */
const LIMITS = {
  produceName: 100,
  description: 2000,
  serviceTitle: 100,
  county: 50,
  location: 100,
  fullName: 100,
  email: 150,
  phone: 20,
  messageContent: 2000,
};

function positiveNumber(value, name, { integer = false, min = 0, max = null } = {}) {
  if (value === undefined || value === null || value === '') {
    return { ok: false, error: `${name} is required.` };
  }
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) {
    return { ok: false, error: `Please enter a valid ${name}.` };
  }
  if (integer && !Number.isInteger(num)) {
    return { ok: false, error: `${name} must be a whole number.` };
  }
  if (num <= min) {
    return { ok: false, error: min === 0 ? `${name} must be greater than 0.` : `${name} must be greater than ${min}.` };
  }
  if (max != null && num > max) {
    return { ok: false, error: `${name} must not exceed ${max}.` };
  }
  return { ok: true, value: num };
}

function requiredString(value, name, { maxLen = null, minLen = 1 } = {}) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return { ok: false, error: `${name} is required.` };
  }
  const str = String(value).trim();
  if (str.length < minLen) {
    return { ok: false, error: `${name} is too short.` };
  }
  if (maxLen != null && str.length > maxLen) {
    return { ok: false, error: `${name} must be ${maxLen} characters or fewer.` };
  }
  return { ok: true, value: str };
}

function email(value) {
  const str = String(value || '').trim();
  if (!str) return { ok: false, error: 'Email is required.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) return { ok: false, error: 'Please enter a valid email address.' };
  if (str.length > LIMITS.email) return { ok: false, error: `Email must be ${LIMITS.email} characters or fewer.` };
  return { ok: true, value: str };
}

function phone(value) {
  const str = String(value || '').trim();
  if (!str) return { ok: false, error: 'Phone number is required.' };
  if (!/^[0-9+\-()\s]{9,20}$/.test(str)) {
    return { ok: false, error: 'Please enter a valid phone number (e.g. 0712345678).' };
  }
  if (str.length > LIMITS.phone) return { ok: false, error: `Phone number must be ${LIMITS.phone} characters or fewer.` };
  return { ok: true, value: str };
}

function password(value) {
  const str = String(value || '');
  if (!str) return { ok: false, error: 'Password is required.' };
  if (str.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
  if (str.length > 72) return { ok: false, error: 'Password must be 72 characters or fewer.' };
  return { ok: true, value: str };
}

function enumValue(value, allowed, name = 'value') {
  if (!allowed.includes(value)) {
    return { ok: false, error: `Invalid ${name}.` };
  }
  return { ok: true, value };
}

function integerId(value, name = 'id') {
  if (/^\d+$/.test(String(value))) return { ok: true, value: Number(value) };
  return { ok: false, error: `Invalid ${name}.` };
}

function dateNotInPast(value, name = 'date') {
  if (!value) return { ok: false, error: `${name} is required.` };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { ok: false, error: `Please enter a valid ${name}.` };
  const midnightToday = new Date();
  midnightToday.setHours(0, 0, 0, 0);
  if (d.getTime() < midnightToday.getTime()) return { ok: false, error: `${name} cannot be in the past.` };
  return { ok: true, value };
}

module.exports = {
  positiveNumber,
  requiredString,
  email,
  phone,
  password,
  enumValue,
  integerId,
  dateNotInPast,
  VALID_STATUSES,
  VALID_CATEGORIES,
  VALID_SERVICE_CATEGORIES,
  LIMITS,
};