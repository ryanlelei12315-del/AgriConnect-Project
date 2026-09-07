/* eslint-env node */
/**
 * One-off helper to apply database/010_add_unit_to_listings.sql
 * and verify the produce_listings.unit column exists.
 * Idempotent (the migration guards against the column already existing).
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  const file = path.join(__dirname, '..', 'database', '010_add_unit_to_listings.sql');
  const sql = fs.readFileSync(file, 'utf8');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  console.log('⚙️  Applying', path.basename(file), '…');
  await conn.query(sql);
  console.log('✔ Migration executed.');

  const [unitCol] = await conn.query("SHOW COLUMNS FROM produce_listings LIKE 'unit'");
  console.log('\nunit present:', unitCol.length > 0);

  await conn.end();
}

main().catch((err) => {
  console.error('❌ FAILED:', err.message);
  process.exit(1);
});
