require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, '../database/006_application_overhaul.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by semicolons for multiple statements, but let's just let Sequelize run it if it supports multipleStatements.
    // By default, Sequelize raw query might not support multiple statements if not configured.
    // Let's split by statement or use mysql2 directly to enable multiple statements.
    
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });
    
    console.log('Running migration...');
    await connection.query(sql);
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
