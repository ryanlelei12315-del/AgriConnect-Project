/* eslint-env node */
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseSort, normalizePage, SORT_FIELDS, PAGE_SIZE } = require('../services/marketplaceService');

// ── parseSort ──────────────────────────────────────────────────────────────────

test('parseSort defaults to createdAt DESC when no input', () => {
  assert.deepEqual(parseSort(undefined), [['createdAt', 'DESC']]);
  assert.deepEqual(parseSort(''), [['createdAt', 'DESC']]);
  assert.deepEqual(parseSort(null), [['createdAt', 'DESC']]);
});

test('parseSort honors valid field:direction', () => {
  assert.deepEqual(parseSort('pricePerKgKes:asc'), [['pricePerKgKes', 'ASC']]);
  assert.deepEqual(parseSort('quantityKg:desc'), [['quantityKg', 'DESC']]);
  assert.deepEqual(parseSort('name:asc'), [['name', 'ASC']]);
  assert.deepEqual(parseSort('createdAt:asc'), [['createdAt', 'ASC']]);
});

test('parseSort defaults direction to DESC when omitted', () => {
  assert.deepEqual(parseSort('pricePerKgKes'), [['pricePerKgKes', 'DESC']]);
});

test('parseSort rejects unknown fields — safe fallback', () => {
  // A malicious user tries to sort by a column that isn't in the allowlist
  assert.deepEqual(parseSort('password:asc'), [['createdAt', 'DESC']]);
  assert.deepEqual(parseSort('id:asc'), [['createdAt', 'DESC']]);
  assert.deepEqual(parseSort('1; DROP TABLE users;'), [['createdAt', 'DESC']]);
});

test('parseSort rejects invalid directions — safe fallback', () => {
  assert.deepEqual(parseSort('pricePerKgKes:drop'), [['pricePerKgKes', 'DESC']]);
  assert.deepEqual(parseSort('pricePerKgKes:ASC;'), [['pricePerKgKes', 'DESC']]);
});

test('SORT_FIELDS only exposes safe columns', () => {
  const keys = Object.keys(SORT_FIELDS);
  assert.ok(keys.includes('createdAt'));
  assert.ok(keys.includes('updatedAt'));
  assert.ok(keys.includes('pricePerKgKes'));
  assert.ok(keys.includes('quantityKg'));
  assert.ok(keys.includes('name'));
  assert.ok(!keys.includes('id'));
  assert.ok(!keys.includes('farmerId'));
  assert.ok(!keys.includes('password'));
  assert.ok(!keys.includes('farmer.password'));
});

// ── normalizePage ───────────────────────────────────────────────────────────────

test('normalizePage rejects NaN and negative values — defaults to 1', () => {
  assert.equal(normalizePage('abc'), 1);
  assert.equal(normalizePage('-5'), 1);
  assert.equal(normalizePage('0'), 1);
  assert.equal(normalizePage(undefined), 1);
  assert.equal(normalizePage(null), 1);
});

test('normalizePage parses valid positive integers', () => {
  assert.equal(normalizePage('1'), 1);
  assert.equal(normalizePage('3'), 3);
  assert.equal(normalizePage('10'), 10);
});

// ── PAGE_SIZE ───────────────────────────────────────────────────────────────────

test('PAGE_SIZE is a reasonable positive integer', () => {
  assert.equal(PAGE_SIZE, 12);
  assert.ok(PAGE_SIZE > 0 && Number.isInteger(PAGE_SIZE));
});
