// Tests every trailer and stream link in the database and lists the ones that will not play.
// No API key. Uses YouTube's public oEmbed check.   npm run db:check-videos
require('dotenv').config();
const { pool } = require('../src/db');
const { parseVideoId, oembed, sleep } = require('./lib/youtube');

const SOURCES = [
  ['titles', 'title', 'trailer_url'],
  ['hero_slides', 'title', 'trailer_url'],
  ['gameplay_streams', "streamer || ' - ' || game", 'stream_url'],
  ['live_channels', 'name', 'stream_url'],
];

(async () => {
  const cache = new Map();
  const problems = [];
  const unverified = [];
  let checked = 0, channelEmbeds = 0;
  try {
    for (const [table, labelSql, urlCol] of SOURCES) {
      const { rows } = await pool.query(`SELECT id, ${labelSql} AS label, ${urlCol} AS url FROM ${table} ORDER BY 1`);
      for (const r of rows) {
        if (/live_stream\?channel=/.test(r.url)) { channelEmbeds++; continue; }   // "channel's current live" embeds cannot be checked this way
        const vid = parseVideoId(r.url);
        if (!vid) { problems.push({ table, id: r.id, label: r.label, reason: 'not a YouTube video link' }); continue; }
        if (!cache.has(vid)) { cache.set(vid, await oembed(vid)); await sleep(120); }
        checked++;
        const res = cache.get(vid);
        if (!res.ok) (res.definitive ? problems : unverified).push({ table, id: r.id, label: r.label, reason: `${vid}: ${res.reason}` });
      }
    }
    console.log(`Checked ${checked} links${channelEmbeds ? ` (${channelEmbeds} "channel live" embeds can't be checked this way)` : ''}.`);
    if (unverified.length) {
      console.log(`\n${unverified.length} could not be checked because YouTube did not answer (try again in a few minutes):`);
      for (const p of unverified) console.log(`  ${p.table}.${p.id}  ${String(p.label).slice(0, 40).padEnd(40)}  ${p.reason}`);
    }
    if (!problems.length) { if (!unverified.length) console.log('All links look good.'); return; }
    console.log(`\n${problems.length} will not play:\n`);
    for (const p of problems) console.log(`  ${p.table}.${p.id}  ${String(p.label).slice(0, 40).padEnd(40)}  ${p.reason}`);
    console.log('\nFix: paste a replacement YouTube link into db/my-videos.json and run  npm run db:videos');
    process.exitCode = 1;
  } catch (err) {
    console.error('Stopped:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
