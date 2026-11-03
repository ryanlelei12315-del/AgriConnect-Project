/* eslint-env node */
/**
 * State-transition validation helpers.
 *
 * Pure functions with no dependencies — unit-testable without a database.
 * Keeps transition rules in a single place shared by listing and demand
 * controllers so the rules can be validated independently.
 */

/** @typedef {Record<string, string[]>} TransitionTable */

/**
 * Check whether a state transition is allowed.
 * @param {string} from - current state
 * @param {string} to - desired next state
 * @param {TransitionTable} table - allowlist mapping current state → allowed next states
 * @returns {{ok: true} | {ok: false, message: string}}
 */
function validateTransition(from, to, table) {
  if (!table[from]) {
    return { ok: false, message: `Cannot transition from ${from} (unknown state).` };
  }
  if (!table[from].includes(to)) {
    return { ok: false, message: `Cannot transition from ${from} to ${to}.` };
  }
  return { ok: true };
}

/**
 * Produce listing state-transition allowlist.
 * LISTED → browseable; PENDING → draft; SOLD → completed; INACTIVE → archived.
 */
const LISTING_TRANSITIONS = {
  LISTED: ['PENDING', 'SOLD', 'INACTIVE'],
  PENDING: ['LISTED', 'INACTIVE'],
  SOLD: ['INACTIVE'],
  INACTIVE: ['LISTED'],
};

/**
 * Buyer-demand state-transition allowlist.
 * Mirrors the inline logic in buyerDemandController.updateStatus.
 */
const DEMAND_TRANSITIONS = {
  OPEN: ['CLOSED', 'FULFILLED'],
  CLOSED: ['OPEN'],
  FULFILLED: [],
};

module.exports = {
  validateTransition,
  LISTING_TRANSITIONS,
  DEMAND_TRANSITIONS,
};
