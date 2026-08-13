/* eslint-env node */
/**
 * One-off helper to apply database/008_add_user_active.sql and verify
 * the users.is_active column. Kept minimal and idempotent (the migration
 * itself guards against the column already existing).
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Load .env from the project root so this works regardless of the CWD,
// even when invoked from inside the scripts/ directory.
require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
});

async function main() {
  const file = path.join(__dirname, '..', 'database', '008_add_user_active.sql');
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

  const [rows] = await conn.query("SHOW COLUMNS FROM users LIKE 'is_active'");
  console.log(
    '\nis_active present:',
    rows.length > 0,
    rows[0]
      ? '| type: ' + rows[0].Type + ' | null: ' + rows[0].Null + ' | default: ' + rows[0].Default
      : ''
  );

  await conn.end();
}

main().catch((err) => {
  console.error('❌ FAILED:', err.message);
  process.exit(1);
});
