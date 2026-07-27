const { Sequelize } = require('sequelize');
require('dotenv').config();

// Determine if we should use MySQL or fall back to local SQLite
const useMySQL = process.env.DB_HOST || process.env.DB_DIALECT === 'mysql';

let sequelize;

if (useMySQL) {
  console.log('🔌 Configuring database with MySQL/MariaDB...');
  sequelize = new Sequelize(
    process.env.DB_NAME || 'Smart_Kilimo',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  console.log('💾 MySQL config not found. Falling back to zero-config local SQLite database (agriconnect.sqlite)...');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './agriconnect.sqlite',
    logging: false
  });
}

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    const dbType = useMySQL ? 'MySQL' : 'SQLite';
    console.log(`✅ ${dbType} Database connection has been established successfully.`);
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
  }
};

module.exports = { sequelize, testConnection };
