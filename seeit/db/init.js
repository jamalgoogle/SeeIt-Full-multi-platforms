// Creates the tables.  Use `--drop` to wipe everything first.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db');

(async () => {
  try {
    if (process.argv.includes('--drop')) {
      await pool.query(
        'DROP TABLE IF EXISTS reminders, watchlist, title_genres, coming_soon, live_channels, titles, hero_slides, genres, users CASCADE'
      );
      console.log('Dropped existing tables');
    }
    await pool.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
    console.log('Schema ready');
  } catch (err) {
    console.error('Init failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
