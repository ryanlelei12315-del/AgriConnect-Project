/* eslint-env node */
const { ServiceListing } = require('../models/ServiceListing');
const { ServiceRequest } = require('../models/ServiceRequest');
const { User } = require('../models/User');
const { Notification } = require('../models/Notification');
const { getToken, verifyToken } = require('../middlewares/pageAuth');
const { ApiError } = require('../utils/ApiError');
const { requiredString, dateNotInPast, enumValue, LIMITS } = require('../utils/validation');

const { Op } = require('sequelize');

const VALID_CATEGORIES = [
  'Machinery',
  'Transport',
  'Infrastructure',
  'Labour',
  'Agronomy',
  'Other',
];
// Service request lifecycle.
const REQUEST_FLOW = {
  PENDING: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['COMPLETED', 'CANCELLED'],
  REJECTED: [],
  COMPLETED: [],
  CANCELLED: [],
};

module.exports = {
  VALID_CATEGORIES,
  REQUEST_FLOW,

  // GET /services
  renderIndex: async (req, res, next) => {
    try {
      const { category, search } = req.query;
      const where = { availability: 'AVAILABLE' };

      if (category && category !== 'All' && VALID_CATEGORIES.includes(category)) {
        where.category = category;
      }
      if (search && String(search).trim() !== '') {
        where.title = { [Op.like]: `%${String(search).trim()}%` };
      }

      const services = await ServiceListing.findAll({
        where,
        order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'provider', attributes: ['id', 'fullName', 'county'] }],
      });

      const token = getToken(req);
      const user = token ? verifyToken(token) : null;

      res.render('services/index', {
        user,
        services,
        category: category || 'All',
        search: search || '',
        error: null,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /services/:id
  renderShow: async (req, res, next) => {
    try {
      const service = await ServiceListing.findByPk(req.params.id, {
        include: [
          { model: User, as: 'provider', attributes: ['id', 'fullName', 'county', 'phoneNumber'] },
        ],
      });
      if (!service) return next(new ApiError(404, 'Service not found.'));

      const token = getToken(req);
      const user = token ? verifyToken(token) : null;

      res.render('services/show', { user, service });
    } catch (err) {
      next(err);
    }
  },

  // GET /services/:id/request
  renderNewRequest: async (req, res, next) => {
    try {
      const service = await ServiceListing.findByPk(req.params.id, {
        include: [{ model: User, as: 'provider' }],
      });
      if (!service) return next(new ApiError(404, 'Service not found.'));

      if (service.providerId === req.user.id)
        throw new ApiError(400, 'You cannot request your own service.');

      res.render('services/request', { user: req.user, service, error: null });
    } catch (err) {
      next(err);
    }
  },

  // POST /services/:id/request
  createRequest: async (req, res, next) => {
    try {
      const { location, requested_date, description } = req.body;

      const loc = requiredString(location, 'Location', { maxLen: LIMITS.location });
      if (!loc.ok) throw new ApiError(400, loc.error);
      const date = dateNotInPast(requested_date, 'Requested date');
      if (!date.ok) throw new ApiError(400, date.error);
      if (description && String(description).length > LIMITS.description) {
        throw new ApiError(400, `Details must be ${LIMITS.description} characters or fewer.`);
      }

      const service = await ServiceListing.findByPk(req.params.id);
      if (!service) throw new ApiError(404, 'Service not found.');
      if (service.availability !== 'AVAILABLE')
        throw new ApiError(400, 'This service is not available.');

      const request = await ServiceRequest.create({
        serviceId: service.id,
        requesterId: req.user.id,
        providerId: service.providerId,
        location: loc.value,
        requestedDate: date.value,
        description: description ? String(description).trim() : null,
        status: 'PENDING',
      });

      await Notification.create({
        userId: service.providerId,
        title: 'New Service Request',
        message: `You received a new request for "${service.title}" on ${date.value}.`,
        type: 'SERVICE_REQUEST',
        relatedId: request.id,
      });

      res.redirect('/dashboard?request=success');
    } catch (err) {
      next(err);
    }
  },

  // GET /services/requests/mine — inbox for service providers
  renderMyRequests: async (req, res, next) => {
    try {
      const requests = await ServiceRequest.findAll({
        where: { providerId: req.user.id },
        include: [
          {
            model: ServiceListing,
            as: 'service',
            attributes: ['id', 'title', 'category', 'priceKes'],
          },
          { model: User, as: 'requester', attributes: ['id', 'fullName', 'county', 'phoneNumber'] },
        ],
        order: [['createdAt', 'DESC']],
      });
      res.render('services/requests', { user: req.user, requests });
    } catch (err) {
      next(err);
    }
  },

  // POST /services/requests/:id/status — provider accepts/rejects/completes
  updateRequestStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const st = enumValue(String(status).toUpperCase(), Object.keys(REQUEST_FLOW), 'status');
      if (!st.ok) throw new ApiError(400, st.error);

      const request = await ServiceRequest.findByPk(id);
      if (!request) throw new ApiError(404, 'Request not found.');

      // Only the provider who owns the service can manage this request.
      if (request.providerId !== req.user.id) {
        throw new ApiError(403, 'You are not authorized to update this request.');
      }

      // State machine — reject invalid transitions.
      if (!REQUEST_FLOW[request.status] || !REQUEST_FLOW[request.status].includes(st.value)) {
        throw new ApiError(
          400,
          `Request status cannot change from "${request.status}" to "${st.value}".`
        );
      }

      request.status = st.value;
      await request.save();

      await Notification.create({
        userId: request.requesterId,
        title: 'Service Request Updated',
        message: `Your request (${request.id}) is now ${st.value.toLowerCase()}.`,
        type: 'SERVICE_REQUEST',
        relatedId: request.id,
      });

      res.redirect('/services/requests/mine');
    } catch (err) {
      next(err);
    }
  },
};
