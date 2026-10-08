// Finds a topic-matched photo for each row in db/image-keywords.json using the Unsplash API,
// and saves the image URL in Postgres.
//
//   1. Create a free app at https://unsplash.com/developers and copy its Access Key
//   2. Put it in .env:  UNSPLASH_ACCESS_KEY=xxxx
//   3. npm run db:images:fetch            (add  -- --dry-run  to preview without saving)
//
// Edit db/image-keywords.json to change what each title searches for.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db');

const KEY = process.env.UNSPLASH_ACCESS_KEY;
const BASE = process.env.UNSPLASH_API_BASE || 'https://api.unsplash.com';
const DRY = process.argv.includes('--dry-run');

// table -> [image column, width]. A fixed list, so the keywords file can never choose a table.
const TARGETS = { titles: ['image_url', 800], gameplay_streams: ['thumbnail_url', 600] };

if (!KEY) {
  console.error('UNSPLASH_ACCESS_KEY is missing. Get a free key at https://unsplash.com/developers and add it to .env');
  process.exit(1);
}

const headers = { Authorization: `Client-ID ${KEY}`, 'Accept-Version': 'v1' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const keywords = JSON.parse(fs.readFileSync(path.join(__dirname, 'image-keywords.json'), 'utf8'));
  const used = new Set();   // never give two rows the same photo
  let updated = 0, failed = 0;

  try {
    for (const [table, rows] of Object.entries(keywords)) {
      if (!TARGETS[table]) { console.error(`Skipping unknown table "${table}"`); continue; }
      const [column, width] = TARGETS[table];

      for (const [id, query] of Object.entries(rows)) {
        const res = await fetch(`${BASE}/search/photos?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape&content_filter=high`, { headers });
        if (res.status === 401) throw new Error('Unsplash rejected the key (401). Check UNSPLASH_ACCESS_KEY.');
        if (res.status === 403 || res.status === 429) throw new Error('Unsplash rate limit reached (about 50 requests/hour for new apps). Wait an hour and run again.');
        if (!res.ok) { console.error(`  ${table}.${id}: search failed (${res.status})`); failed++; continue; }

        const { results = [] } = await res.json();
        const photo = results.find((p) => !used.has(p.id));
        if (!photo) { console.error(`  ${table}.${id}: no photo found for "${query}"`); failed++; continue; }
        used.add(photo.id);

        const raw = photo.urls.raw;
        const url = `${raw}${raw.includes('?') ? '&' : '?'}q=80&w=${width}&auto=format&fit=crop`;
        console.log(`${table}.${id}  "${query}"  ->  ${photo.id}  (photo by ${photo.user?.name || 'unknown'})`);

        if (!DRY) {
          await pool.query(`UPDATE ${table} SET ${column} = $1 WHERE id = $2`, [url, id]);
          // Unsplash API guideline: report that the photo is being used
          if (photo.links?.download_location) fetch(photo.links.download_location, { headers }).catch(() => {});
        }
        updated++;
        await sleep(250);
      }
    }
    if (!DRY) await pool.query(fs.readFileSync(path.join(__dirname, 'sync-hero-images.sql'), 'utf8'));
    console.log(`\n${DRY ? 'Would update' : 'Updated'} ${updated} images${failed ? `, ${failed} failed` : ''}.`);
  } catch (err) {
    console.error('Stopped:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
