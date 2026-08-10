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

// ── View Engine ────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Security & parsing middleware ──────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // EJS inline scripts; tighten for prod CSP separately
  })
);
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ── Rate limiting (protect auth endpoints) ─────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

// ── Routes ─────────────────────────────────────────────────────────────────
const { requireAuthPage, redirectIfAuthed } = require('./middlewares/pageAuth');

app.use('/', require('./routes/dashboardRoutes'));
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/services', require('./routes/serviceRoutes'));
app.use('/orders', require('./routes/orderRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Messages page (server-side guarded)
const messageCtrl = require('./controllers/messageController');
app.get('/messages', requireAuthPage, messageCtrl.renderMessagesPage);
app.get('/messages/:userId', requireAuthPage, messageCtrl.renderMessagesPage);
app.use('/produce', require('./routes/produceRoutes'));
app.use('/market-prices', require('./routes/marketPriceRoutes'));
app.use('/profile', require('./routes/profileRoutes'));
app.use('/notifications', require('./routes/notificationRoutes'));
app.use('/', require('./routes/marketplace'));

app.get('/why-us', (req, res) => res.render('why-us'));

// ── Page routes (server-side guarded) ───────────────────────────────────────
app.get('/', redirectIfAuthed, (req, res) => res.render('index'));

// Auth pages (redirect authed users to dashboard)
app.get('/login', redirectIfAuthed, (req, res) => res.render('login'));
app.get('/register', redirectIfAuthed, (req, res) => res.render('register'));

// Protected app pages removed here since they are handled by their own modular routers

// ── 404 + centralized error handler ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('index', { notFound: true }); // TODO: proper 404 page in Sprint 3 UI
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message,
  });
});

// ── Start server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 AgriConnect running at http://localhost:${PORT}`);
  await testConnection();
});
