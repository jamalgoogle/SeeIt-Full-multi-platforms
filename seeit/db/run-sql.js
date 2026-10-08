// Runs a .sql file against the database:  node db/run-sql.js db/extra-titles.sql
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db');

const file = process.argv[2];
if (!file) { console.error('Usage: node db/run-sql.js <file.sql>'); process.exit(1); }

(async () => {
  try {
    await pool.query(fs.readFileSync(path.resolve(file), 'utf8'));
    console.log('Ran', file);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
