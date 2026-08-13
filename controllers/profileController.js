/* eslint-env node */
const bcrypt = require('bcryptjs');
const { User } = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const { requiredString, email, phone, password, enumValue } = require('../utils/validation');

const SALT_ROUNDS = 10;

// Counties used across the app (kept in sync with registration options).
const VALID_COUNTIES = [
  'Uasin Gishu', 'Nakuru', 'Trans Nzoia', 'Meru', 'Kiambu', 'Kajiado',
  'Nairobi', 'Mombasa', 'Kisumu', 'Eldoret', 'Embu', 'Naivasha',
  'Kakamega', 'Kericho', 'Murang\u0027a', 'Other',
];

module.exports = {
  renderProfile: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) return next(new ApiError(404, 'User not found.'));
      res.render('profile', { user });
    } catch (err) {
      next(err);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const { fullName, email: emailValue, phoneNumber, county } = req.body;

      const fullRes = requiredString(fullName, 'Full name', { maxLen: 100 });
      if (!fullRes.ok) throw new ApiError(400, fullRes.error);

      const emailRes = email(emailValue);
      if (!emailRes.ok) throw new ApiError(400, emailRes.error);

      const phoneRes = phone(phoneNumber);
      if (!phoneRes.ok) throw new ApiError(400, phoneRes.error);

      if (!VALID_COUNTIES.includes(county)) {
        throw new ApiError(400, 'Please choose a valid county.');
      }

      const user = await User.findByPk(req.user.id);
      if (!user) throw new ApiError(404, 'User not found.');

      // Prevent email/phone collisions with other accounts.
      const emailClash = await User.findOne({ where: { email: emailRes.value, id: { [require('sequelize').Op.ne]: user.id } } });
      if (emailClash) throw new ApiError(409, 'That email is already registered to another account.');

      const phoneClash = await User.findOne({ where: { phoneNumber: phoneRes.value, id: { [require('sequelize').Op.ne]: user.id } } });
      if (phoneClash) throw new ApiError(409, 'That phone number is already registered to another account.');

      await user.update({
        fullName: fullRes.value,
        email: emailRes.value,
        phoneNumber: phoneRes.value,
        county,
      });

      res.redirect('/profile?updated=success');
    } catch (err) {
      next(err);
    }
  },

  updatePassword: async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const pwRes = password(newPassword);
      if (!pwRes.ok) throw new ApiError(400, pwRes.error);

      const user = await User.findByPk(req.user.id);
      if (!user) throw new ApiError(404, 'User not found.');

      const isMatch = await bcrypt.compare(String(currentPassword || ''), user.password);
      if (!isMatch) throw new ApiError(400, 'Your current password is incorrect.');

      user.password = await bcrypt.hash(pwRes.value, SALT_ROUNDS);
      await user.save();

      res.redirect('/profile?password=success');
    } catch (err) {
      next(err);
    }
  },
};