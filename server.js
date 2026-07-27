/* eslint-env node */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

const { sequelize, testConnection } = require('./config/database');

// Import all models to register them with Sequelize before syncing
const { User } = require('./models/User');
const { Farm_Fields } = require('./models/Farm_Fields');
const { Crop_Production_Cycles } = require('./models/Crop_Production_Cycles');
const { Order } = require('./models/Order');
const { Message } = require('./models/Message');

// We will import Produce and Service models too once they are created
// To handle circular dependencies or simple imports, importing them directly works perfectly:
const { Produce } = require('./models/Produce');
const { Service } = require('./models/Service');

const app = express();

// View Engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (BUT wait: we will handle index.html bypass in step 4!)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/dashboardRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/produce', require('./routes/produceRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));

// Basic View Routes
app.get('/', (req, res) => res.render('index'));
app.get('/register', (req, res) => res.render('register'));
app.get('/login', (req, res) => res.render('login'));
app.get('/file', (req, res) => res.render('file', { files: [] }));

// Fallback for .html links in existing templates
app.get('/:page.html', (req, res) => {
  res.render(req.params.page, (err, html) => {
    if (err) {
      return res.render('index');
    }
    res.send(html);
  });
});

// Any other unknown route
app.get('*', (req, res) => {
  res.render('index');
});

// Connect DB and start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  await testConnection();

  try {
    console.log('🔄 Syncing models with database (auto-migrations)...');
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✨ Database models synchronized successfully.');

    // We will call the seed function here in Step 5 to seed sample data!
    const { seedData } = require('./config/seed');
    await seedData();
  } catch (err) {
    console.error('❌ Error during database sync/seed:', err.message);
  }
});
