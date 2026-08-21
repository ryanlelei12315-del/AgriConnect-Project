/**
 * Client-side validation mirroring the AgriConnect backend rules so the user
 * gets fast feedback before a round-trip. The server remains the source of truth.
 */

export function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function isValidPhone(v: string): boolean {
  return /^[0-9+\-\s()]{9,20}$/.test(v.trim());
}

export function isValidPassword(v: string): boolean {
  return v.length >= 8 && v.length <= 72;
}

export function validateRegister(values: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role: string;
  county: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.fullName.trim()) errors.fullName = 'Full name is required.';
  else if (values.fullName.trim().length > 100) errors.fullName = 'Max 100 characters.';

  if (!values.email.trim() && !values.phoneNumber.trim()) {
    errors.email = 'Provide an email or phone number.';
  }
  if (values.email.trim() && !isValidEmail(values.email)) errors.email = 'Enter a valid email.';
  if (values.phoneNumber.trim() && !isValidPhone(values.phoneNumber)) errors.phoneNumber = 'Enter a valid phone number.';

  if (!isValidPassword(values.password)) errors.password = 'Password must be 8-72 characters.';
  if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match.';
  if (!values.role) errors.role = 'Choose a role.';
  if (!values.county) errors.county = 'Choose a county.';
  return errors;
}

export function validateLogin(values: { identifier: string; password: string }): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.identifier.trim()) errors.identifier = 'Email or phone is required.';
  if (!values.password) errors.password = 'Password is required.';
  return errors;
}

export function validateProduce(values: {
  name: string;
  category: string;
  quantity: string;
  price: string;
  county: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.name.trim()) errors.name = 'Produce name is required.';
  const qty = Number(values.quantity);
  if (!values.quantity || !Number.isFinite(qty) || qty <= 0) errors.quantity = 'Quantity must be greater than 0.';
  const price = Number(values.price);
  if (!values.price || !Number.isFinite(price) || price <= 0) errors.price = 'Price must be greater than 0.';
  if (!values.category) errors.category = 'Choose a category.';
  if (!values.county) errors.county = 'Choose a location.';
  return errors;
}

export function validateServiceRequest(values: {
  location: string;
  requestedDate: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.location.trim()) errors.location = 'Location is required.';
  if (!values.requestedDate) errors.requestedDate = 'Requested date is required.';
  else {
    const d = new Date(values.requestedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(d.getTime()) || d.getTime() < today.getTime()) errors.requestedDate = 'Date cannot be in the past.';
  }
  return errors;
}

export function validateOrder(values: { quantity: string }): Record<string, string> {
  const errors: Record<string, string> = {};
  const qty = Number(values.quantity);
  if (!values.quantity || !Number.isFinite(qty) || qty <= 0) errors.quantity = 'Quantity must be greater than 0.';
  return errors;
}
