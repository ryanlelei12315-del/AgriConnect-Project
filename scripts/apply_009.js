/* eslint-env node */
/**
 * One-off helper to apply database/009_add_profile_customization.sql
 * and verify the users.profile_image / users.bio columns exist.
 * Idempotent (the migration guards against the columns already existing).
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  const file = path.join(__dirname, '..', 'database', '009_add_profile_customization.sql');
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

  const [profile] = await conn.query("SHOW COLUMNS FROM users LIKE 'profile_image'");
  const [bio] = await conn.query("SHOW COLUMNS FROM users LIKE 'bio'");
  console.log(
    '\nprofile_image present:', profile.length > 0,
    '| bio present:', bio.length > 0
  );

  await conn.end();
}

main().catch((err) => {
  console.error('❌ FAILED:', err.message);
  process.exit(1);
});
