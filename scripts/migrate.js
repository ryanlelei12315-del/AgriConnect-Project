/* eslint-env node */
/**
 * AgriConnect KE — Universal Migration Runner
 *
 * Applies numbered SQL migrations in database/ in order, tracking which
 * have already been applied in a schema_migrations table. Safe to run
 * repeatedly.
 *
 *   Usage: node scripts/migrate.js [--db=Smart_Kilimo_Test]
 *
 * The --db flag overrides DB_NAME so tests can migrate a dedicated test
 * database without touching the development data.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'database');

// Parse --db=... style CLI args
const dbOverrideArg = process.argv.find((a) => a.startsWith('--db='));
const dbName = (dbOverrideArg && dbOverrideArg.split('=')[1]) || process.env.DB_NAME;

async function main() {
  if (!dbName) {
    console.error('❌ DB_NAME is not set. Check .env');
    process.exit(1);
  }

  console.log(`⚙️  Migrating database: ${dbName}`);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbName,
    multipleStatements: true,
  });

  // Ensure the migrations tracking table exists
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  // Gather .sql files, sort naturally (001, 002, ... 010)
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const [appliedRows] = await connection.query('SELECT filename FROM schema_migrations');
  const appliedSet = new Set(appliedRows.map((r) => r.filename));

  // Numbered migrations predate the tracking table. Do not guess which
  // historical DDL has already run on a populated installation: the old files
  // include ALTER statements that are deliberately not re-applied. A new
  // database starts from database.sql, where this table is absent.
  if (appliedSet.size === 0) {
    const [tables] = await connection.query(
      `SELECT COUNT(*) AS count FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name = 'produce_listings'`
    );
    if (Number(tables[0]?.count || 0) > 0) {
      throw new Error(
        'This database has application tables but no migration history. Refusing to guess its schema state. ' +
        'Back up the database, record its verified migration baseline in schema_migrations, then rerun.'
      );
    }
  }

  let appliedCount = 0;
  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`  ↳ Skipping ${file} (already applied)`);
      continue;
    }

    console.log(`  ⚡ Applying ${file} …`);
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

    try {
      await connection.query(sql);
      await connection.query('INSERT INTO schema_migrations (filename) VALUES (?)', [file]);
      appliedCount++;
      console.log(`  ✔ ${file} applied.`);
    } catch (err) {
      console.error(`  ❌ Migration ${file} FAILED:`, err.message);
      console.error('     (Transaction not rolled back — MySQL DDL is non-transactional.)');
      console.error('     Resolve the error, then re-run. Already-applied files are skipped.');
      await connection.end();
      process.exit(1);
    }
  }

  await connection.end();
  console.log(
    appliedCount > 0
      ? `\n✅ Migration complete — ${appliedCount} new migration(s) applied.`
      : '\n✅ All migrations already applied — nothing to do.'
  );
}

main().catch((err) => {
  console.error('❌ Migration runner error:', err.message);
  process.exit(1);
});
