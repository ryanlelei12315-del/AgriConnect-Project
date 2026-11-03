/* eslint-env node */
/**
 * AgriConnect KE — WhatsApp Verification Service
 *
 * Sends one-time passcodes (OTP) via the WhatsApp Business Cloud API
 * (Meta Graph API) and validates them in-memory with a short TTL.
 *
 * ── Configuration (env) ───────────────────────────────────────
 *   WHATSAPP_ACCESS_TOKEN  – Permanent access token from Meta App
 *   WHATSAPP_PHONE_NUMBER_ID – WhatsApp Business Account phone-number ID
 *   WHATSAPP_VERSION       – Graph API version (default v19.0)
 *   WHATSAPP_TEMPLATE_NAME – Template name for OTP message (default: verify_code)
 *
 * When the credentials are NOT set (development / demo), the service falls
 * back to logging the OTP to the console so the flow is fully testable
 * without a real WhatsApp Business Account. This mirrors the fallback
 * strategy used by kamisService / shabaRecordsService.
 */

const axios = require('axios');
const NodeCache = require('node-cache');
const crypto = require('crypto');

// ── Constants ─────────────────────────────────────────────────────────
const OTP_TTL_SECONDS = 300; // 5 minutes
const OTP_RESEND_INTERVAL_MS = 30_000; // minimum 30 s between sends
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 3600; // 1 hour lockout after MAX_ATTEMPTS failures
const CODE_LENGTH = 6;

const cache = new NodeCache({ stdTTL: OTP_TTL_SECONDS, checkperiod: 60 });

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * Normalise a Kenyan phone number to E.164 international format.
 * Accepts: 0712345678, +254712345678, 254712345678, 0112345678
 * Returns the normalised string or throws if it cannot be parsed.
 */
function normalizePhone(raw) {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Phone number is required.');
  }
  let digits = raw.trim().replace(/\s+/g, '');

  // Strip leading + if present
  if (digits.startsWith('+')) digits = digits.slice(1);

  if (!/^\d+$/.test(digits)) {
    throw new Error('Phone number contains invalid characters.');
  }

  // Kenyan numbers: normalise to +254XXXXXXXXX
  if (digits.startsWith('254')) {
    // already in international form without the +
  } else if (digits.startsWith('0')) {
    digits = '254' + digits.slice(1);
  } else if (digits.length === 9 && ['7', '1'].includes(digits[0])) {
    // bare 9-digit local number e.g. 712345678
    digits = '254' + digits;
  } else {
    throw new Error('Unrecognised phone number format.');
  }

  if (!/^254\d{9}$/.test(digits)) {
    throw new Error('Phone number must be a valid Kenyan number.');
  }

  return '+' + digits;
}

/**
 * Build the cache key for a given phone number + purpose.
 * Purpose scopes codes so a "login" code can't be used for "registration".
 */
function cacheKey(phone, purpose) {
  return `otp:${purpose}:${phone}`;
}

function attemptsKey(phone, purpose) {
  return `otp_attempts:${purpose}:${phone}`;
}

/**
 * Generate a cryptographically-random 6-digit numeric OTP.
 */
function generateCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += crypto.randomInt(0, 10).toString();
  }
  code = code.padStart(CODE_LENGTH, '0');
  return code;
}

// ── Public API ────────────────────────────────────────────────────────

/**
 * Check whether the WhatsApp service is configured with real credentials.
 * When false, the service falls back to dev-mode (console logging).
 */
function isConfigured() {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

/**
 * Send a verification code via WhatsApp to the given (normalised) phone number.
 *
 * @param {string} phoneE164  – E.164 number, e.g. +254712345678
 * @param {string} purpose      – 'register' | 'login' | 'verify'
 * @param {string} code         – Optional pre-generated code (used for testing).
 * @returns {Promise<{ success: boolean, code?: string, message: string }>}
 */
async function sendVerificationCode(phoneE164, purpose, code) {
  const key = cacheKey(phoneE164, purpose);

  // Enforce per-number resend cooldown
  const existing = cache.get(key);
  if (existing) {
    const elapsed = Date.now() - existing.createdAt;
    if (elapsed < OTP_RESEND_INTERVAL_MS) {
      const remaining = Math.ceil((OTP_RESEND_INTERVAL_MS - elapsed) / 1000);
      return {
        success: false,
        message: `Please wait ${remaining}s before requesting another code.`,
      };
    }
  }

  // Enforce attempt lockout
  const attempts = cache.get(attemptsKey(phoneE164, purpose)) || 0;
  if (attempts >= MAX_ATTEMPTS) {
    return {
      success: false,
      message: 'Too many verification attempts. Please try again later.',
    };
  }

  const otp = code || generateCode();

  cache.set(key, {
    code: otp,
    createdAt: Date.now(),
    attempts: 0,
  });

  if (isConfigured()) {
    try {
      await sendViaWhatsAppApi(phoneE164, otp);
    } catch (err) {
      console.error('[WhatsApp] sendVerificationCode API error:', err.message);
      console.log(`[WhatsApp] DEV MODE — OTP for ${phoneE164} (${purpose}): ${otp}`);
    }
  } else {
    // Development / demo fallback
    console.log(`[WhatsApp] DEV MODE — OTP for ${phoneE164} (${purpose}): ${otp}`);
  }

  return {
    success: true,
    message: 'Verification code sent via WhatsApp.',
    code: isConfigured() ? undefined : otp, // expose code only in dev fallback
  };
}

/**
 * Call the WhatsApp Business Cloud API to send a template message.
 */
async function sendViaWhatsAppApi(phoneE164, code) {
  const version = process.env.WHATSAPP_VERSION || 'v19.0';
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'verify_code';

  const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;

  const response = await axios.post(
    url,
    {
      messaging_product: 'whatsapp',
      to: phoneE164.replace('+', ''),
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [{ type: 'text', text: code }],
          },
        ],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }
  );

  if (response.data?.error) {
    throw new Error(`WhatsApp API error: ${response.data.error.message || 'unknown'}`);
  }

  return response.data;
}

/**
 * Validate an OTP submitted by the user.
 *
 * @param {string} phoneE164
 * @param {string} purpose  – must match the purpose used when sending
 * @param {string} code     – the code the user typed
 * @returns {{ ok: boolean, error?: string }}
 */
function validateCode(phoneE164, purpose, code) {
  if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code.trim())) {
    return { ok: false, error: 'Please enter the 6-digit code.' };
  }

  const key = cacheKey(phoneE164, purpose);
  const entry = cache.get(key);

  if (!entry) {
    return { ok: false, error: 'Code has expired or was not requested. Please request a new code.' };
  }

  // Increment attempt counter
  const attemptsKeyStr = attemptsKey(phoneE164, purpose);
  const attempts = (cache.get(attemptsKeyStr) || 0) + 1;
  cache.set(attemptsKeyStr, attempts, LOCKOUT_SECONDS);

  if (attempts > MAX_ATTEMPTS) {
    cache.del(key);
    cache.del(attemptsKeyStr);
    return { ok: false, error: 'Too many attempts. Please try again later.' };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    cache.del(key);
    cache.del(attemptsKeyStr);
    return { ok: false, error: 'Too many attempts. Please try again later.' };
  }

  if (code.trim() !== entry.code) {
    entry.attempts += 1;
    cache.set(key, entry);
    return { ok: false, error: 'Incorrect code. Please try again.' };
  }

  // Success — consume the code so it can't be reused
  cache.del(key);
  cache.del(attemptsKeyStr);
  return { ok: true };
}

/**
 * Clear any cached OTP for a phone number (e.g. after successful registration).
 */
function clearCode(phoneE164, purpose) {
  cache.del(cacheKey(phoneE164, purpose));
  cache.del(attemptsKey(phoneE164, purpose));
}

/**
 * Check whether a phone number currently has a pending, valid (non-expired) code.
 */
function hasValidCode(phoneE164, purpose) {
  return Boolean(cache.get(cacheKey(phoneE164, purpose)));
}

module.exports = {
  normalizePhone,
  generateCode,
  isConfigured,
  sendVerificationCode,
  validateCode,
  clearCode,
  hasValidCode,
  cache,
  OTP_TTL_SECONDS,
  MAX_ATTEMPTS,
};