const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
require('dotenv').config();

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';

// ── Register ────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { full_name, email, phone_number, password, role } = req.body;

    // Basic validation
    if (!full_name || !password || (!email && !phone_number)) {
      return res.status(400).json({
        success: false,
        message: 'full_name, password, and either email or phone_number are required.',
      });
    }

    // Valid roles
    const validRoles = ['farmer', 'buyer', 'provider'];
    const userRole = validRoles.includes(role) ? role : 'farmer';

    // Check for existing user
    if (email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already registered.' });
      }
    }
    if (phone_number) {
      const existing = await User.findOne({ where: { phone_number } });
      if (existing) {
        return res
          .status(409)
          .json({ success: false, message: 'Phone number already registered.' });
      }
    }

    // Hash password
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await User.create({
      full_name,
      email: email || null,
      phone_number: phone_number || null,
      password: hashed,
      role: userRole,
    });

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// ── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, phone_number, password } = req.body;

    if (!password || (!email && !phone_number)) {
      return res.status(400).json({
        success: false,
        message: 'password and either email or phone_number are required.',
      });
    }

    // Find user
    const whereClause = email ? { email } : { phone_number };
    const user = await User.findOne({ where: whereClause });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};
