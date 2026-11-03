require('dotenv').config();
const { sequelize } = require('./config/database');
sequelize
  .authenticate()
  .then(() => {
    console.log('DB_OK');
    return sequelize.query('SELECT COUNT(*) AS n FROM users');
  })
  .then(([r]) => {
    console.log('USERS', r[0].n);
    process.exit(0);
  })
  .catch((e) => {
    console.error('DB_FAIL', e.message);
    process.exit(1);
  });