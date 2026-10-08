// Put YouTube links you picked into the database. No API key needed.
//
//   1. Open db/my-videos.json and paste a YouTube link next to each id
//   2. npm run db:videos                 (add  -- --dry-run  to preview)
//
//   npm run db:videos -- --links         prints a YouTube search link for every empty entry
//   npm run db:videos -- --images        also replace the image of normal titles with the video's thumbnail
//                                        (game videos and live streams always get the thumbnail)
//
// Every link is checked first: removed videos and videos that block embedding are rejected.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db');
const { parseVideoId, oembed, embedUrl, sleep } = require('./lib/youtube');

const DRY = process.argv.includes('--dry-run');
const LINKS = process.argv.includes('--links');
const FORCE_IMAGES = process.argv.includes('--images');
const SECTIONS = ['titles', 'gameplay_streams', 'live_channels'];

const search = (q, live) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}${live ? '&sp=EgJAAQ%253D%253D' : ''}`;

async function label(section, id) {
  if (section === 'titles') { const { rows } = await pool.query('SELECT title, kind FROM titles WHERE id = $1', [id]); return rows[0] && { name: rows[0].title, query: `${rows[0].title} official ${rows[0].kind === 'game_video' ? 'gameplay trailer' : 'trailer'}`, live: false, kind: rows[0].kind }; }
  if (section === 'gameplay_streams') { const { rows } = await pool.query('SELECT game, streamer FROM gameplay_streams WHERE id = $1', [id]); return rows[0] && { name: `${rows[0].game} (${rows[0].streamer})`, query: `${rows[0].game} live gameplay`, live: true }; }
  const { rows } = await pool.query('SELECT name FROM live_channels WHERE id = $1', [id]); return rows[0] && { name: rows[0].name, query: `${rows[0].name} live`, live: true };
}

(async () => {
  const file = JSON.parse(fs.readFileSync(path.join(__dirname, 'my-videos.json'), 'utf8'));
  let ok = 0, bad = 0, skipped = 0;
  try {
    for (const section of SECTIONS) {
      for (const [id, value] of Object.entries(file[section] || {})) {
        const info = await label(section, id);
        if (!info) { console.log(`${section}.${id}: not in the database, skipped`); continue; }

        if (LINKS) {
          if (!String(value).trim()) console.log(`${id.padEnd(4)} ${info.name}\n       ${search(info.query, info.live)}`);
          continue;
        }
        if (!String(value).trim()) { skipped++; continue; }

        const vid = parseVideoId(value);
        if (!vid) { console.log(`FAIL ${id.padEnd(4)} ${info.name}: "${value}" is not a YouTube link`); bad++; continue; }
        const check = await oembed(vid);
        if (!check.ok && check.definitive) { console.log(`FAIL ${id.padEnd(4)} ${info.name}: ${vid} - ${check.reason}. Pick another video.`); bad++; continue; }
        if (!check.ok) { console.log(`WARN ${id.padEnd(4)} ${info.name}: ${vid} - YouTube would not confirm it (${check.reason}); saving anyway, check it on the page.`); check.title = check.title || info.name; check.author = check.author || info.name; check.thumbnail = check.thumbnail || `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`; }
        else console.log(`OK   ${id.padEnd(4)} ${info.name}  <-  "${check.title}" (${check.author})`);
        if (!DRY) {
          if (section === 'titles') {
            const withImage = FORCE_IMAGES || info.kind === 'game_video';
            await pool.query(`UPDATE titles SET trailer_url = $1${withImage ? ', image_url = $3' : ''} WHERE id = $2`,
              withImage ? [embedUrl(vid), id, `https://i.ytimg.com/vi/${vid}/maxresdefault.jpg`] : [embedUrl(vid), id]);
          } else if (section === 'gameplay_streams') {
            await pool.query('UPDATE gameplay_streams SET stream_url = $1, thumbnail_url = $2, streamer = $3, title = $4 WHERE id = $5',
              [embedUrl(vid, true), check.thumbnail, check.author.slice(0, 60), check.title.slice(0, 140), id]);
          } else {
            await pool.query('UPDATE live_channels SET stream_url = $1 WHERE id = $2', [embedUrl(vid, true), id]);
          }
        }
        ok++;
        await sleep(150);
      }
    }
    if (LINKS) { console.log('\nOpen a link, pick an official video, copy its address into db/my-videos.json.'); return; }
    if (!DRY) {
      await pool.query(fs.readFileSync(path.join(__dirname, 'sync-hero-images.sql'), 'utf8'));
      // keep the hero's live slide in step with the real streamer
      await pool.query(`UPDATE hero_slides h SET title = left(upper(g.streamer || ' LIVE: ' || g.game), 120), description = left('Live now on ' || g.game || ': ' || g.title, 400)
                          FROM gameplay_streams g WHERE h.badge = 'GAMEPLAY LIVE' AND g.id = 'gl1' AND $1::boolean`, [Boolean((file.gameplay_streams || {}).gl1 && String(file.gameplay_streams.gl1).trim())]);
    }
    console.log(`\n${DRY ? 'Would save' : 'Saved'} ${ok}${bad ? `, ${bad} rejected (fix those links and run again)` : ''}${skipped ? `, ${skipped} empty entries skipped` : ''}.`);
    if (bad) process.exitCode = 1;
  } catch (err) {
    console.error('Stopped:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
