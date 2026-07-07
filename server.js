/* eslint-env node */
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { testConnection } = require('./config/database');
console.log('DEBUG DB_PASSWORD:', process.env.DB_PASSWORD);

const app = express();

// View Engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // __dirname works automatically here

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dbconnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Routes
app.use('/', require('./routes/dashboardRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Basic View Routes
app.get('/', (req, res) => res.render('index'));
app.get('/register', (req, res) =>
  dbconnection.query('SELECT * FROM users', (err, results) => {
    if (err) throw err;
    res.render('register', { users: results });
  })
);
app.post('/register', (req, res) => {
  const { full_name, phone_number, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const query = 'INSERT INTO users (full_name,phone_number, email, password) VALUES (?, ?, ?, ?)';
  dbconnection.query(query, [full_name, phone_number, email, hashedPassword], (err, results) => {
    if (err) throw err;
    res.redirect('/login');
  });
});

app.get('/login', (req, res) =>
  dbconnection.query('SELECT * FROM users', (err, results) => {
    if (err) throw err;
    res.render('login', { users: results });
  })
);

app.get('/file', (req, res) =>
  dbconnection.query('SELECT * FROM files', (err, results) => {
    if (err) throw err;
    res.render('file', { files: results });
  })
);

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
});
