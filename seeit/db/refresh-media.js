// Real trailers + posters from TMDB. Needs only a free TMDB key (no card, no Google account).
//
//   TMDB_API_KEY=...  in .env       (themoviedb.org -> sign up -> Settings -> API -> "API Key")
//   npm run db:media -- --dry-run   preview, saves nothing
//   npm run db:media                do it
//
// Each trailer is checked with YouTube's keyless oEmbed so videos that block embedding are skipped.
// Games and live streams are not on TMDB: put YouTube links in db/my-videos.json, then run `npm run db:videos`.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db');
const { oembed, embedUrl, sleep } = require('./lib/youtube');

const KEY = process.env.TMDB_API_KEY;
const TMDB = process.env.TMDB_API_BASE || 'https://api.themoviedb.org/3';
const DRY = process.argv.includes('--dry-run');
const onlyIds = ((process.argv.find((a) => a.startsWith('--ids=')) || '').split('=')[1] || '').split(',').filter(Boolean);

if (!KEY) {
  console.error('TMDB_API_KEY is missing.\nGet a free one (no card): themoviedb.org -> sign up -> Settings -> API -> request an API key, then add it to .env.\nNo TMDB? Paste YouTube links into db/my-videos.json and run: npm run db:videos');
  process.exit(1);
}

async function tmdb(pathAndQuery) {
  const sep = pathAndQuery.includes('?') ? '&' : '?';
  const res = await fetch(`${TMDB}${pathAndQuery}${sep}api_key=${KEY}`);
  if (res.status === 401) throw new Error('TMDB rejected the key (401). Use the "API Key" value, not the "Read Access Token".');
  if (res.status === 429) throw new Error('TMDB rate limit hit. Wait a minute and run again.');
  if (!res.ok) { const e = new Error(`TMDB request failed (${res.status})`); e.status = res.status; throw e; }
  return res.json();
}

async function findShow(type, title, year) {
  const run = async (withYear) => {
    const qs = new URLSearchParams({ query: title, include_adult: 'false' });
    if (withYear && year) qs.set(type === 'movie' ? 'year' : 'first_air_date_year', year);
    return (await tmdb(`/search/${type}?${qs}`)).results || [];
  };
  let results = await run(true);
  if (!results.length) results = await run(false);   // wrong year hint should never hide a title
  // prefer an exact name match over TMDB's first (most popular) result
  const nameOf = (r) => (r.title || r.name || '').toLowerCase();
  return results.find((r) => nameOf(r) === title.toLowerCase()) || results[0] || null;
}

// official trailers first, then trailers, teasers, clips
const rank = (v) => (v.type === 'Trailer' ? (v.official ? 0 : 1) : v.type === 'Teaser' ? 2 : v.type === 'Clip' ? 3 : 4);

const usable = (list, used) => list.filter((v) => v.site === 'YouTube' && /^[\w-]{11}$/.test(v.key) && !used.has(v.key)).sort((a, b) => rank(a) - rank(b));
const videosAt = async (p) => { try { return (await tmdb(p)).results || []; } catch (e) { if (e.status === 404) return []; throw e; } };

// Looks for trailers in English, then in any language, then (TV) under season 1.
async function pickTrailer(type, tmdbId, used) {
  let list = usable(await videosAt(`/${type}/${tmdbId}/videos?language=en-US&include_video_language=en,null`), used);
  if (!list.length) list = usable(await videosAt(`/${type}/${tmdbId}/videos`), used);
  if (!list.length && type === 'tv') list = usable(await videosAt(`/tv/${tmdbId}/season/1/videos`), used);

  let unverified = null;
  for (const v of list.slice(0, 5)) {
    const check = await oembed(v.key);
    await sleep(350);   // be gentle: YouTube slows down callers that ask too fast
    if (check.ok) return { id: v.key, name: v.name, kind: v.type };
    if (!check.definitive && !unverified) unverified = { id: v.key, name: v.name, kind: v.type, unverified: check.reason };
    if (!check.definitive) break;   // YouTube is not answering, so more checks would not help
  }
  return unverified;   // YouTube would not say: use the best candidate and flag it
}

(async () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'media-queries.json'), 'utf8')).titles;
  const used = new Set();
  const noTrailer = [];
  const unverifiedIds = [];
  let saved = 0;
  try {
    console.log(DRY ? 'DRY RUN (nothing is saved)\n' : 'Updating...\n');
    for (const [id, [type, year]] of Object.entries(cfg).filter(([id]) => !onlyIds.length || onlyIds.includes(id))) {
      const { rows } = await pool.query('SELECT title FROM titles WHERE id = $1', [id]);
      if (!rows[0]) { console.log(`${id}: not in the database, skipped`); continue; }
      const title = rows[0].title;

      const show = await findShow(type, title, year);
      if (!show) { console.log(`${id.padEnd(4)} ${title}: not found on TMDB`); noTrailer.push(id); continue; }

      const trailer = await pickTrailer(type, show.id, used);
      const image = show.backdrop_path ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` : show.poster_path ? `https://image.tmdb.org/t/p/w780${show.poster_path}` : null;
      if (trailer) used.add(trailer.id); else noTrailer.push(id);

      if (trailer && trailer.unverified) unverifiedIds.push(id);
      console.log(`${id.padEnd(4)} ${title}  ->  TMDB: "${show.title || show.name}" (${(show.release_date || show.first_air_date || '?').slice(0, 4)})\n       trailer: ${trailer ? `${trailer.id} ("${trailer.name}", ${trailer.kind})${trailer.unverified ? '  [could not verify: ' + trailer.unverified + ']' : ''}` : 'none found on TMDB (or all removed / embedding disabled)'}\n       image:   ${image ? 'TMDB ' + (show.backdrop_path ? 'backdrop' : 'poster') : 'none (kept the old one)'}`);
      if (!DRY && (trailer || image)) {
        await pool.query('UPDATE titles SET trailer_url = COALESCE($1, trailer_url), image_url = COALESCE($2, image_url) WHERE id = $3', [trailer ? embedUrl(trailer.id) : null, image, id]);
      }
      if (trailer || image) saved++;
      await sleep(120);
    }
    if (!DRY) await pool.query(fs.readFileSync(path.join(__dirname, 'sync-hero-images.sql'), 'utf8'));
    console.log(`\n${DRY ? 'Would update' : 'Updated'} ${saved} titles.`);
    if (unverifiedIds.length) console.log(`\nYouTube would not confirm these (${unverifiedIds.join(', ')}); they were saved anyway. Run  npm run db:check-videos  in a few minutes to verify them.`);
    if (noTrailer.length) console.log(`No usable trailer for: ${noTrailer.join(', ')}\n  -> paste a YouTube link for each into db/my-videos.json (titles section) and run: npm run db:videos`);
  } catch (err) {
    console.error('\nStopped:', err.message, `\n${saved} titles were ${DRY ? 'previewed' : 'already saved'} before this. You can run it again.`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
