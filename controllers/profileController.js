/* eslint-env node */
const { User } = require('../models/User');

module.exports = {
  renderProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      res.render('profile', { user });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { fullName, email, phoneNumber, county } = req.body;
      const user = await User.findByPk(req.user.id);

      await user.update({
        fullName,
        email,
        phoneNumber,
        county
      });

      // Simple implementation. In a real app we'd likely need to update the JWT if it contained these fields.
      // Currently, the JWT probably only contains id, email, role based on authMiddleware.js.
      
      res.redirect('/profile?updated=success');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error updating profile');
    }
  },

  updatePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findByPk(req.user.id);
      
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).send('Incorrect current password');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.redirect('/profile?password=success');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error updating password');
    }
  }
};
