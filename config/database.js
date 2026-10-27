const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

let sequelize;

if (process.env.DB_DIALECT === 'sqlite' || !process.env.DB_NAME || !process.env.DB_USER) {
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '..', 'agriconnect.sqlite'),
        logging: false
    });
} else {
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD || '',
        {
            host: process.env.DB_HOST || 'localhost',
            dialect: process.env.DB_DIALECT || 'mysql',
            logging: false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
}

// Test the connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log(`✅ Database connection (${sequelize.getDialect()}) has been established successfully.`);
    } catch (error) {
        console.error('⚠️ MySQL connection failed, falling back to SQLite:', error.message);
        sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: path.join(__dirname, '..', 'agriconnect.sqlite'),
            logging: false
        });
        await sequelize.authenticate();
        console.log('✅ SQLite Database fallback connection established successfully.');
    }
};

module.exports = { sequelize, testConnection };
