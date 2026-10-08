// Small keyless YouTube helpers (no API key, no Google account).
const OEMBED = process.env.YOUTUBE_OEMBED_BASE || 'https://www.youtube.com/oembed';
const ID = /^[\w-]{11}$/;

// Accepts a full link (watch, youtu.be, embed, live, shorts) or a bare 11-character id.
function parseVideoId(input) {
  if (!input) return null;
  const s = String(input).trim();
  if (ID.test(s)) return s;
  let u;
  try { u = new URL(s); } catch { return null; }
  const host = u.hostname.replace(/^(www|m)\./, '');
  let id = null;
  if (host === 'youtu.be') id = u.pathname.split('/')[1];
  else if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    id = u.searchParams.get('v') || (u.pathname.match(/^\/(?:embed|live|shorts|v)\/([\w-]{11})/) || [])[1];
  }
  return id && ID.test(id) ? id : null;
}

// oEmbed tells us, without a key, whether a video exists (404 = gone) and may be embedded (401 = owner said no).
// If YouTube is just busy (429, 5xx) or unreachable we retry, and if it still will not answer we say "unverified"
// (definitive: false) instead of pretending the video is bad.
const RETRY_MS = parseInt(process.env.YOUTUBE_RETRY_DELAY_MS || '800', 10);
async function oembed(id) {
  let last = 'no answer';
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(`${OEMBED}?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`);
      if (res.ok) {
        const j = await res.json();
        return { ok: true, definitive: true, title: j.title, author: j.author_name, thumbnail: j.thumbnail_url };
      }
      if (res.status === 401) return { ok: false, definitive: true, status: 401, reason: 'the owner disabled embedding' };
      if (res.status === 404 || res.status === 400) return { ok: false, definitive: true, status: res.status, reason: 'removed, private or wrong id' };
      last = `YouTube answered ${res.status} (busy)`;
    } catch (err) {
      last = `could not reach YouTube (${err.message})`;
    }
    await sleep(RETRY_MS * (attempt + 1));
  }
  return { ok: false, definitive: false, status: 0, reason: last };
}

const embedUrl = (id, autoplay = false) => `https://www.youtube.com/embed/${id}${autoplay ? '?autoplay=1' : ''}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = { parseVideoId, oembed, embedUrl, sleep };
