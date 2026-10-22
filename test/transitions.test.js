/* eslint-env node */
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateTransition,
  LISTING_TRANSITIONS,
  DEMAND_TRANSITIONS,
} = require('../utils/transitions');

// ── Listing transitions ──────────────────────────────────────────────────────

test('LISTED → SOLD is allowed (farmer sells a listing)', () => {
  assert.deepEqual(validateTransition('LISTED', 'SOLD', LISTING_TRANSITIONS), { ok: true });
});

test('LISTED → INACTIVE is allowed (farmer archives a listing)', () => {
  assert.deepEqual(validateTransition('LISTED', 'INACTIVE', LISTING_TRANSITIONS), { ok: true });
});

test('LISTED → PENDING is allowed (farmer drafts a listing)', () => {
  assert.deepEqual(validateTransition('LISTED', 'PENDING', LISTING_TRANSITIONS), { ok: true });
});

test('SOLD → LISTED is NOT allowed (cannot un-sell)', () => {
  const result = validateTransition('SOLD', 'LISTED', LISTING_TRANSITIONS);
  assert.equal(result.ok, false);
  assert.match(result.message, /Cannot transition from SOLD to LISTED/);
});

test('SOLD → INACTIVE is allowed (farmer closes a sold listing)', () => {
  assert.deepEqual(validateTransition('SOLD', 'INACTIVE', LISTING_TRANSITIONS), { ok: true });
});

test('INACTIVE → LISTED is allowed (farmer reactivates a listing)', () => {
  assert.deepEqual(validateTransition('INACTIVE', 'LISTED', LISTING_TRANSITIONS), { ok: true });
});

test('INACTIVE → SOLD is NOT allowed', () => {
  const result = validateTransition('INACTIVE', 'SOLD', LISTING_TRANSITIONS);
  assert.equal(result.ok, false);
});

test('PENDING → LISTED is allowed (farmer publishes a draft)', () => {
  assert.deepEqual(validateTransition('PENDING', 'LISTED', LISTING_TRANSITIONS), { ok: true });
});

test('PENDING → SOLD is NOT allowed (cannot sell from draft)', () => {
  const result = validateTransition('PENDING', 'SOLD', LISTING_TRANSITIONS);
  assert.equal(result.ok, false);
});

test('Unknown state returns ok: false', () => {
  const result = validateTransition('DELETED', 'LISTED', LISTING_TRANSITIONS);
  assert.equal(result.ok, false);
  assert.match(result.message, /unknown state/);
});

// ── Demand transitions ───────────────────────────────────────────────────────

test('OPEN → FULFILLED is allowed', () => {
  assert.deepEqual(validateTransition('OPEN', 'FULFILLED', DEMAND_TRANSITIONS), { ok: true });
});

test('FULFILLED → OPEN is NOT allowed (cannot reopen a fulfilled demand)', () => {
  const result = validateTransition('FULFILLED', 'OPEN', DEMAND_TRANSITIONS);
  assert.equal(result.ok, false);
});

test('CLOSED → OPEN is allowed (buyer reopens demand)', () => {
  assert.deepEqual(validateTransition('CLOSED', 'OPEN', DEMAND_TRANSITIONS), { ok: true });
});
