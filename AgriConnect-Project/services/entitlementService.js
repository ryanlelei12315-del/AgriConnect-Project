/* eslint-env node */
/**
 * Central marketplace entitlement boundary.
 *
 * The free entitlement deliberately has no dependency on the optional billing
 * tables so a partially migrated installation still enforces the safe default.
 * Paid limits are resolved only from an active, unexpired subscription.
 */
const { QueryTypes } = require('sequelize');

const FREE_ACTIVE_LISTING_LIMIT = 10;

function isMissingOptionalTable(error) {
  return error && ['ER_NO_SUCH_TABLE', '42P01'].includes(error.original && error.original.code || error.parent && error.parent.code);
}

async function resolveActiveListingLimit({ sequelize, userId, transaction }) {
  try {
    const rows = await sequelize.query(
      `SELECT p.max_listings AS maxListings
       FROM subscriptions s
       INNER JOIN plans p ON p.id = s.plan_id
       WHERE s.user_id = :userId
         AND s.status = 'ACTIVE'
         AND s.end_at > CURRENT_TIMESTAMP
         AND p.is_active = TRUE
       ORDER BY s.end_at DESC
       LIMIT 1`,
      { replacements: { userId }, type: QueryTypes.SELECT, transaction }
    );
    const limit = rows[0] && Number(rows[0].maxListings);
    return Number.isInteger(limit) && limit >= 0 ? limit : FREE_ACTIVE_LISTING_LIMIT;
  } catch (error) {
    if (isMissingOptionalTable(error)) return FREE_ACTIVE_LISTING_LIMIT;
    throw error;
  }
}

async function createPublishedListing({ sequelize, User, ProduceListing, userId, attributes }) {
  return sequelize.transaction(async (transaction) => {
    // Locking the user's row serializes listing creation for that user. The
    // subsequent count and insert share the transaction, closing the usual
    // concurrent-request bypass without relying on client-side accounting.
    const user = await User.findByPk(userId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!user) {
      const error = new Error('User not found.');
      error.status = 404;
      throw error;
    }

    const [activeCount, limit] = await Promise.all([
      ProduceListing.count({ where: { farmerId: userId, status: 'LISTED' }, transaction }),
      resolveActiveListingLimit({ sequelize, userId, transaction }),
    ]);

    if (activeCount >= limit) {
      const error = new Error(`You have reached your active listing limit (${activeCount}/${limit}). Archive or sell a listing, or upgrade your plan.`);
      error.status = 403;
      error.code = 'ACTIVE_LISTING_LIMIT_REACHED';
      error.usage = { active: activeCount, limit };
      throw error;
    }

    const listing = await ProduceListing.create(
      { farmerId: userId, ...attributes, status: 'LISTED' },
      { transaction }
    );
    return { listing, usage: { active: activeCount + 1, limit } };
  });
}

module.exports = {
  FREE_ACTIVE_LISTING_LIMIT,
  resolveActiveListingLimit,
  createPublishedListing,
};
