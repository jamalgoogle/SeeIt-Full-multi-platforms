// Loads the catalog (everything that used to be hard-coded in SeeIt.html).
// Re-running replaces the catalog. Users are kept; their watchlists/reminders are cleared
// because the catalog rows they point to are replaced.
require('dotenv').config();
const { pool } = require('../src/db');
const data = require('./seed-data.json');

const img = (id, w = 600) => `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`;

const genres = [
  { slug: 'action-scifi',     name: 'Action & Sci-Fi',    count: 1240, image: img('1518709268805-4e9042af9f23') },
  { slug: 'cyberpunk',        name: 'Cyberpunk',          count: 850,  image: img('1509198397868-475647b2a1e5') },
  { slug: 'space-odyssey',    name: 'Space Odyssey',      count: 620,  image: img('1451187580459-43490279c0fa') },
  { slug: 'thriller-mystery', name: 'Thriller & Mystery', count: 940,  image: img('1509281373149-e957c6296406') },
  { slug: 'anime-art',        name: 'Anime & Art',        count: 1100, image: img('1563089145-599997674d42') },
  { slug: 'dark-fantasy',     name: 'Dark Fantasy',       count: 780,  image: img('1579783900882-c0d3dad7b119') },
];

// The page had no genre tags per title, so this mapping is a starting point. Edit freely.
const titleGenres = {
  m1: ['action-scifi', 'cyberpunk'],
  m5: ['action-scifi', 'space-odyssey'],
  s1: ['anime-art', 'dark-fantasy'],
  s2: ['thriller-mystery'],
  s3: ['cyberpunk', 'anime-art'],
  s4: ['thriller-mystery', 'action-scifi'],
};

const comingSoon = [
  { title: 'AVATAR: FIRE & ASH',       date: '2026-12-01', image: img('1618005182384-a83a8bd57fbe', 400), description: 'The saga continues on Pandora introducing the volcanic ash clan.' },
  { title: 'CYBERPUNK: EDGERUNNERS 2', date: '2026-11-01', image: img('1578632767115-351597cf2477', 400), description: 'Return to Night City for an all-new cybernetic revolution saga.' },
  { title: 'GLADIATOR II',             date: '2026-10-01', image: img('1518709268805-4e9042af9f23', 400), description: "Years after Maximus's death, Lucius steps into the Colosseum arena." },
];

// Only ch1 had real panel details on the page. The rest are placeholders; edit as needed.
const channelExtras = {
  ch1: { program: 'EPISODE 8 - LIVE AUDITIONS', minutesLeft: 42, progress: 65, audio: 'Arabic / English' },
  ch2: { program: null, minutesLeft: 55, progress: 40, audio: 'Arabic' },
  ch3: { program: null, minutesLeft: 20, progress: 80, audio: 'English' },
  ch4: { program: null, minutesLeft: 75, progress: 25, audio: 'Arabic / English' },
  ch5: { program: null, minutesLeft: 35, progress: 60, audio: 'English' },
};

const parseViewers = (s) => Math.round(parseFloat(s) * (/k/i.test(s) ? 1000 : 1));
const countStars = (s) => (s.match(/★/g) || []).length;

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'TRUNCATE reminders, watchlist, title_genres, coming_soon, live_channels, titles, hero_slides, genres RESTART IDENTITY CASCADE'
    );

    const genreIds = {};
    for (const [i, g] of genres.entries()) {
      const r = await client.query(
        'INSERT INTO genres (slug, name, title_count, image_url, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING id',
        [g.slug, g.name, g.count, g.image, i]
      );
      genreIds[g.slug] = r.rows[0].id;
    }

    for (const [i, s] of data.heroSlides.entries()) {
      await client.query(
        `INSERT INTO hero_slides (title, rating, quality, genre_label, badge, description, image_url, trailer_url, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [s.title, parseFloat(s.rating.replace(/[^\d.]/g, '')), s.quality, s.genre, 'GOLDEN GLOBE NOMINEE', s.desc, s.image, s.trailer, i]
      );
    }

    const insertTitle = async (kind, t, i) => {
      await client.query(
        `INSERT INTO titles (id, kind, badge, quality, title, rating, stars, year, duration, description, image_url, trailer_url, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [t.id, kind, t.badge, t.quality, t.title, parseFloat(t.rating), countStars(t.stars), parseInt(t.year, 10), t.duration, t.desc, t.image, t.trailer, i]
      );
      for (const slug of titleGenres[t.id] || []) {
        await client.query('INSERT INTO title_genres (title_id, genre_id) VALUES ($1,$2)', [t.id, genreIds[slug]]);
      }
    };
    for (const [i, t] of data.movies.entries()) await insertTitle('movie', t, i);
    for (const [i, t] of data.series.entries()) await insertTitle('series', t, i);

    for (const [i, c] of data.channels.entries()) {
      const x = channelExtras[c.id];
      await client.query(
        `INSERT INTO live_channels (id, name, logo, category, show_title, description, viewers_count, stream_url, bg_image,
                                    program_name, minutes_left, progress_percent, audio_language, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [c.id, c.name, c.logo, c.category, c.show, c.desc, parseViewers(c.viewers), c.streamUrl, c.bgImg,
         x.program || c.show, x.minutesLeft, x.progress, x.audio, i]
      );
    }

    for (const [i, c] of comingSoon.entries()) {
      await client.query(
        'INSERT INTO coming_soon (title, release_date, description, image_url, sort_order) VALUES ($1,$2,$3,$4,$5)',
        [c.title, c.date, c.description, c.image, i]
      );
    }

    await client.query('COMMIT');
    console.log(`Seeded: ${genres.length} genres, ${data.heroSlides.length} hero slides, ${data.movies.length} movies, ${data.series.length} series, ${data.channels.length} channels, ${comingSoon.length} upcoming`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
