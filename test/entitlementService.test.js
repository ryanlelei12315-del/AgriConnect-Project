const test = require('node:test');
const assert = require('node:assert/strict');
const {
  FREE_ACTIVE_LISTING_LIMIT,
  createPublishedListing,
} = require('../services/entitlementService');

function dependencies(activeCount) {
  const transaction = { LOCK: { UPDATE: 'UPDATE' } };
  const sequelize = {
    transaction: (callback) => callback(transaction),
    query: async () => [], // No paid subscription: use the free entitlement.
  };
  const User = { findByPk: async () => ({ id: 42 }) };
  const ProduceListing = {
    count: async () => activeCount,
    create: async (attributes) => ({ id: 77, ...attributes }),
  };
  return { sequelize, User, ProduceListing };
}

test('creates the tenth active listing for a free user and returns usage', async () => {
  const result = await createPublishedListing({
    ...dependencies(9),
    userId: 42,
    attributes: { name: 'Beans' },
  });

  assert.equal(FREE_ACTIVE_LISTING_LIMIT, 10);
  assert.equal(result.listing.status, 'LISTED');
  assert.deepEqual(result.usage, { active: 10, limit: 10 });
});

test('rejects an eleventh active listing for a free user', async () => {
  await assert.rejects(
    createPublishedListing({
      ...dependencies(10),
      userId: 42,
      attributes: { name: 'Beans' },
    }),
    (error) => error.code === 'ACTIVE_LISTING_LIMIT_REACHED' && error.status === 403
  );
});
