/* eslint-env node */
const { ServiceListing } = require('../models/ServiceListing');
const { ServiceRequest } = require('../models/ServiceRequest');
const { User } = require('../models/User');
const { Notification } = require('../models/Notification');
const { getToken, verifyToken } = require('../middlewares/pageAuth');

const VALID_CATEGORIES = [
  'Machinery',
  'Transport',
  'Infrastructure',
  'Labour',
  'Agronomy',
  'Other',
];

module.exports = {
  renderIndex: async (req, res) => {
    try {
      const { category, search } = req.query;
      const where = { availability: 'AVAILABLE' };
      
      if (category && category !== 'All') where.category = category;

      const services = await ServiceListing.findAll({
        where,
        order: [['createdAt', 'DESC']],
        include: [
          { model: User, as: 'provider', attributes: ['id', 'fullName', 'county'] },
        ],
      });

      let filteredServices = services;
      if (search) {
        const lowerSearch = search.toLowerCase();
        filteredServices = services.filter(s => s.title.toLowerCase().includes(lowerSearch));
      }

      // Optional Auth for UI
      const token = getToken(req);
      const user = token ? verifyToken(token) : null;

      res.render('services/index', {
        user,
        services: filteredServices,
        category: category || 'All',
        search: search || '',
        error: null
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  },

  renderShow: async (req, res) => {
    try {
      const service = await ServiceListing.findByPk(req.params.id, {
        include: [{ model: User, as: 'provider', attributes: ['id', 'fullName', 'county', 'phoneNumber'] }]
      });

      if (!service) return res.status(404).send('Service not found');

      const token = getToken(req);
      const user = token ? verifyToken(token) : null;

      res.render('services/show', { user, service });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  },

  renderNewRequest: async (req, res) => {
    try {
      const service = await ServiceListing.findByPk(req.params.id, {
        include: [{ model: User, as: 'provider' }]
      });

      if (!service) return res.status(404).send('Service not found');
      if (service.providerId === req.user.id) return res.redirect('/services/' + service.id);

      res.render('services/request', { user: req.user, service });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  },

  createRequest: async (req, res) => {
    try {
      const { location, requested_date, description } = req.body;
      const serviceId = req.params.id;

      const service = await ServiceListing.findByPk(serviceId);
      if (!service || service.availability !== 'AVAILABLE') {
        return res.status(400).send('Service is not available.');
      }

      const request = await ServiceRequest.create({
        serviceId: service.id,
        requesterId: req.user.id,
        providerId: service.providerId,
        location,
        requestedDate: requested_date,
        description,
        status: 'PENDING'
      });

      // Notify the provider
      await Notification.create({
        userId: service.providerId,
        title: 'New Service Request',
        message: `You have received a new request for ${service.title} on ${requested_date}.`,
        type: 'SERVICE_REQUEST',
        relatedId: request.id
      });

      res.redirect('/dashboard?request=success');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  },
  
  // Kept for APIs if needed
  VALID_CATEGORIES
};
