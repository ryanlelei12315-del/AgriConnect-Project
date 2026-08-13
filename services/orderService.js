/* eslint-env node */
/**
 * Order business logic, extracted so it can be unit-tested without an HTTP
 * round trip. Dependencies (models + sequelize) are injected; tests pass
 * in-memory fakes, the controllers pass the real ones.
 *
 * Concurrency note: the listing is read inside a transaction with a
 * row-level lock (`SELECT ... FOR UPDATE` under MySQL/InnoDB), so two
 * simultaneous buyers cannot both observe the same remaining stock.
 */
const { ApiError } = require('../utils/ApiError');
const { positiveNumber, integerId, enumValue } = require('../utils/validation');

/** Explicit order status state machine. */
const ORDER_FLOW = {
  pending: ['confirmed', 'canceled'],
  confirmed: ['shipped', 'canceled'],
  shipped: ['completed'],
  completed: [],
  canceled: [],
};

/** Human-friendly order status labels for notifications. */
const ORDER_LABELS = {
  pending: 'pending',
  confirmed: 'confirmed',
  shipped: 'shipped',
  completed: 'completed',
  canceled: 'canceled',
};

/**
 * Create an order for `listingId` of `quantityKg`.
 * All prices/stock are read from the DB — never from the client.
 *
 * @param {object} deps
 * @param {object} deps.sequelize Sequelize instance
 * @param {object} deps.ProduceListing model
 * @param {object} deps.Order model
 * @param {object} deps.OrderItem model
 * @param {object} deps.Notification model
 * @param {number} deps.userId buyer id
 * @param {number} deps.listingId listing to purchase
 * @param {string|number} deps.quantityKg requested quantity (kg)
 * @returns {Promise<object>} the created order
 */
async function createOrder({ sequelize, ProduceListing, Order, OrderItem, Notification, userId, listingId, quantityKg }) {
  const idRes = integerId(listingId, 'listing');
  if (!idRes.ok) throw new ApiError(400, idRes.error);

  const qtyRes = positiveNumber(quantityKg, 'quantity', { min: 0 });
  if (!qtyRes.ok) throw new ApiError(400, qtyRes.error);
  const quantity = qtyRes.value;

  const t = await sequelize.transaction();
  try {
    // Row-level lock: SELECT ... FOR UPDATE — serializes concurrent buyers.
    const listing = await ProduceListing.findByPk(idRes.value, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!listing) throw new ApiError(404, 'Produce listing not found.');
    if (listing.status !== 'LISTED') throw new ApiError(400, 'This listing is no longer available.');

    if (listing.farmerId === userId) {
      throw new ApiError(400, 'You cannot order your own produce.');
    }

    const availableKg = Number(listing.quantityKg);
    if (quantity > availableKg) {
      throw new ApiError(400, `Only ${availableKg} kg is available. Please enter a smaller quantity.`);
    }

    // Server-side pricing — never trust client-supplied price/stock.
    const unitPrice = Number(listing.pricePerKgKes);
    const totalKes = Math.round(quantity * unitPrice * 100) / 100;

    const order = await Order.create(
      { userId, sellerId: listing.farmerId, status: 'pending', totalKes },
      { transaction: t }
    );

    await OrderItem.create(
      {
        orderId: order.id,
        listingId: listing.id,
        quantityKg: quantity,
        unitPriceKes: unitPrice,
        totalKes,
      },
      { transaction: t }
    );

    // Atomic stock decrement.
    const newQuantity = availableKg - quantity;
    await ProduceListing.update(
      {
        quantityKg: newQuantity,
        status: newQuantity <= 0 ? 'SOLD' : listing.status,
      },
      { where: { id: listing.id }, transaction: t }
    );

    await Notification.create(
      {
        userId: listing.farmerId,
        title: 'New Order Received',
        message: `You received an order for ${quantity} kg of ${listing.name} (KES ${totalKes.toLocaleString()}).`,
        type: 'ORDER',
        relatedId: order.id,
      },
      { transaction: t }
    );

    await t.commit();
    return order;
  } catch (err) {
    await t.rollback();
    if (err instanceof ApiError) throw err;
    console.error('[orderService.createOrder]', err);
    throw new ApiError(500, 'Unable to place the order. Please try again.', { cause: err });
  }
}

/**
 * Validate + apply an order status transition.
 *
 * Allowed transitions (state machine):
 *   pending   → confirmed | canceled
 *   confirmed → shipped   | canceled
 *   shipped   → completed
 *   completed / canceled → (terminal)
 *
 * @param {object} deps
 * @param {object} deps.Order model
 * @param {object} deps.OrderItem model
 * @param {object} deps.ProduceListing model
 * @param {object} deps.Notification model
 * @param {object} deps.sequelize Sequelize instance
 * @param {number} deps.orderId
 * @param {string} deps.nextStatus requested status
 * @param {object} deps.actor {id}
 * @returns {Promise<object>} updated order
 */
async function updateStatus({ Order, OrderItem, ProduceListing, Notification, sequelize, orderId, nextStatus, actor }) {
  const idRes = integerId(orderId, 'order');
  if (!idRes.ok) throw new ApiError(400, idRes.error);

  const statusRes = enumValue(String(nextStatus).toLowerCase(), Object.keys(ORDER_FLOW), 'status');
  if (!statusRes.ok) throw new ApiError(400, statusRes.error);

  const order = await Order.findByPk(idRes.value);
  if (!order) throw new ApiError(404, 'Order not found.');

  const isBuyer = order.userId === actor.id;
  const isSeller = order.sellerId === actor.id;
  if (!isBuyer && !isSeller) throw new ApiError(403, 'You are not authorized to update this order.');

  const current = order.status;
  const requested = statusRes.value;

  // The state machine rejects impossible transitions (e.g. completed → pending).
  if (!ORDER_FLOW[current] || !ORDER_FLOW[current].includes(requested)) {
    throw new ApiError(400, `Order status cannot change from "${current}" to "${requested}".`);
  }

  // Seller controls confirm/ship/complete.
  const sellerOnly = ['confirmed', 'shipped', 'completed'];
  if (sellerOnly.includes(requested) && !isSeller) {
    throw new ApiError(403, 'Only the seller can confirm, ship or complete an order.');
  }

  // Apply the transition in a transaction so notification + restock are atomic.
  const t = await sequelize.transaction();
  try {
    order.status = requested;
    await order.save({ transaction: t });

    // Cancelling restores the reserved stock to the listing (if it still exists).
    if (requested === 'canceled') {
      const item = await OrderItem.findOne({ where: { orderId: order.id }, transaction: t });
      if (item) {
        const listing = await ProduceListing.findByPk(item.listingId, { transaction: t });
        if (listing && listing.status !== 'INACTIVE') {
          await ProduceListing.update(
            {
              quantityKg: Number(listing.quantityKg) + Number(item.quantityKg),
              status: 'LISTED',
            },
            { where: { id: listing.id }, transaction: t }
          );
        }
      }
    }

    const notifyUserId = isSeller ? order.userId : order.sellerId;
    await Notification.create(
      {
        userId: notifyUserId,
        title: 'Order Status Updated',
        message: `Order #ORD-${order.id} is now ${ORDER_LABELS[requested]}.`,
        type: 'ORDER',
        relatedId: order.id,
      },
      { transaction: t }
    );

    await t.commit();
    return order;
  } catch (err) {
    await t.rollback();
    if (err instanceof ApiError) throw err;
    console.error('[orderService.updateStatus]', err);
    throw new ApiError(500, 'Unable to update the order. Please try again.', { cause: err });
  }
}

module.exports = { createOrder, updateStatus, ORDER_FLOW };