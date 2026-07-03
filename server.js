require('dotenv').config();
console.log('DEBUG DB_PASSWORD:', process.env.DB_PASSWORD);
const express = require('express');

const { testConnection } = require('./config/database');
const cors = require('cors');

const path = require('path');
/* const mysql = require('mysql2'); */


const app = express();

// View Engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}); */

// Routes
app.use('/', require('./routes/dashboardRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
// TODO: Uncomment these when the route files are ready
// app.use('/api/produce',  require('./routes/produce'));
// app.use('/api/services', require('./routes/services'));
// app.use('/api/requests', require('./routes/requests'));

// Basic View Routes
app.get('/', (req, res) => res.render('index'));
app.get('/register', (req, res) => res.render('register'));
app.get('/login', (req, res) => res.render('login'));
app.get('/file', (req, res) => res.render('file'));

// Fallback for .html links in existing templates
app.get('/:page.html', (req, res) => {
  res.render(req.params.page, (err, html) => {
    if (err) {
      // If view doesn't exist, fallback to index
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
});
