/* eslint-env node */
require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { testConnection } = require('./config/database');

// Load Sequelize model associations (registers belongsTo/hasMany)
require('./models/associations');

const app = express();

// ── Environment validation ───────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error(
    '❌ FATAL: JWT_SECRET is missing or too short. Set it to at least 32 random characters.'
  );
  process.exit(1);
}

const corsOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? '' : '*');
const isProd = process.env.NODE_ENV === 'production';

// ── View Engine ────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Security & parsing middleware ──────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // EJS inline scripts; tighten for prod CSP separately
  })
);
app.use(
  cors({
    origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ── CSRF (signed double-submit cookie) ─────────────────────────────────────
// initCsrf gives every response a token cookie + res.locals.csrfToken so all
// EJS views can embed hidden inputs. csrfProtect rejects state-changing
// requests that lack a valid matching token.
const { initCsrf, csrfProtect } = require('./middlewares/csrf');
app.use(initCsrf);
app.use(csrfProtect);

// ── Rate limiting ───────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

const mutatingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down and try again.' },
});

// ── Routes ─────────────────────────────────────────────────────────────────
const { requireAuthPage, redirectIfAuthed } = require('./middlewares/pageAuth');

app.use('/', require('./routes/dashboardRoutes'));
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/listings', mutatingLimiter, require('./routes/listingRoutes'));
app.use('/services', mutatingLimiter, require('./routes/serviceRoutes'));
app.use('/orders', mutatingLimiter, require('./routes/orderRoutes'));
app.use('/api/messages', mutatingLimiter, require('./routes/messageRoutes'));

// Messages page (server-side guarded)
const messageCtrl = require('./controllers/messageController');
app.get('/messages', requireAuthPage, messageCtrl.renderMessagesPage);
app.get('/messages/:userId', requireAuthPage, messageCtrl.renderMessagesPage);
app.use('/produce', mutatingLimiter, require('./routes/produceRoutes'));
app.use('/market-prices', require('./routes/marketPriceRoutes'));
app.use('/profile', mutatingLimiter, require('./routes/profileRoutes'));
app.use('/notifications', require('./routes/notificationRoutes'));

// Reviews + public farmer profiles
app.use('/reviews', mutatingLimiter, require('./routes/reviewRoutes'));
app.use('/farmers', require('./routes/farmerRoutes'));

// Admin (authenticated + admin role enforced in the route file)
app.use('/admin', mutatingLimiter, require('./routes/adminRoutes'));

// Mobile JSON API (additive — reuses existing models and services)
app.use('/api/m', require('./routes/mobileRoutes'));

app.use('/', require('./routes/marketplace'));

app.get('/why-us', (req, res) => res.render('why-us', { activeNav: 'why-us' }));

// ── Page routes (server-side guarded) ───────────────────────────────────────
// Landing page: real platform data (all queries degrade gracefully so the
// landing never fails because a table is empty or the DB hiccups).
app.get('/', redirectIfAuthed, async (req, res, next) => {
  try {
    const { ProduceListing, ServiceListing, MarketPrice, User } = require('./models/associations');
    const softFail = (fallback) => (e) => {
      console.error('[Landing] data query failed:', e.message);
      return fallback;
    };

    const [produce, services, marketPrices, produceCount, serviceCount] = await Promise.all([
      ProduceListing.findAll({
        where: { status: 'LISTED' },
        include: [{ model: User, as: 'farmer', attributes: ['id', 'fullName'] }],
        order: [['createdAt', 'DESC']],
        limit: 6,
      }).catch(softFail([])),
      ServiceListing.findAll({
        where: { availability: 'AVAILABLE' },
        include: [{ model: User, as: 'provider', attributes: ['id', 'fullName'] }],
        order: [['createdAt', 'DESC']],
        limit: 4,
      }).catch(softFail([])),
      MarketPrice.findAll({ order: [['recordedAt', 'DESC']], limit: 6 }).catch(softFail([])),
      ProduceListing.count({ where: { status: 'LISTED' } }).catch(softFail(0)),
      ServiceListing.count({ where: { availability: 'AVAILABLE' } }).catch(softFail(0)),
    ]);

    res.render('index', {
      produce,
      services,
      marketPrices,
      produceCount,
      serviceCount,
    });
  } catch (err) {
    next(err);
  }
});

app.get('/login', redirectIfAuthed, (req, res) => res.render('login'));

app.get('/register', redirectIfAuthed, (req, res) => res.render('register'));

// ── 404 + centralized error handler ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('index', { notFound: true });
});

const { errorHandler } = require('./middlewares/errorHandler');
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 AgriConnect running at http://localhost:${PORT}`);
  console.log(`   NODE_ENV=${isProd ? 'production' : 'development'}`);
  console.log(`   CORS_ORIGIN=${corsOrigin}`);
  await testConnection();
});

module.exports = app;
