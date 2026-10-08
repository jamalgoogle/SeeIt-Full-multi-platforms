// Home-screen content: hero slider, genres, movies, series, title details.
// Lists are public. Anything that unlocks playback or deeper browsing needs a login.
const express = require('express');
const db = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { asyncHandler, validate, idParam } = require('../middleware/helpers');
const { z } = require('zod');

const router = express.Router();

const TITLE_COLUMNS = `
  t.id, t.kind, t.badge, t.quality, t.title, t.rating::float AS rating, t.stars, t.year, t.duration,
  t.description, t.image_url AS "imageUrl"`;

const inWatchlist = (userParam) => `
  EXISTS (SELECT 1 FROM watchlist w WHERE w.title_id = t.id AND w.user_id = ${userParam}::int) AS "inWatchlist"`;

// ---- Hero slider ----------------------------------------------------------

// GET /api/hero-slides  (public, no trailer URLs)
router.get('/hero-slides', asyncHandler(async (_req, res) => {
  const { rows } = await db.query(
    `SELECT id, title, rating::float AS rating, rating_source AS "ratingSource", quality, genre_label AS genre,
            badge, cta_label AS "ctaLabel", description, image_url AS image
     FROM hero_slides ORDER BY sort_order`
  );
  res.json({ slides: rows });
}));

// GET /api/hero-slides/:id/trailer  (login required)
router.get('/hero-slides/:id/trailer', requireAuth, validate(idParam, 'params'), asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT id, title, trailer_url AS "trailerUrl" FROM hero_slides WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Slide not found' });
  res.json(rows[0]);
}));

// ---- Genres ---------------------------------------------------------------

// GET /api/genres  (public)
router.get('/genres', asyncHandler(async (_req, res) => {
  const { rows } = await db.query(
    'SELECT slug, name, title_count AS "titleCount", image_url AS "imageUrl" FROM genres ORDER BY sort_order'
  );
  res.json({ genres: rows });
}));

// GET /api/genres/:slug/titles  (login required)
router.get('/genres/:slug/titles', requireAuth,
  validate(z.object({ slug: z.string().regex(/^[a-z0-9-]{1,40}$/) }), 'params'),
  asyncHandler(async (req, res) => {
    const genre = await db.query('SELECT id, slug, name FROM genres WHERE slug = $1', [req.params.slug]);
    if (!genre.rows[0]) return res.status(404).json({ error: 'Genre not found' });
    const { rows } = await db.query(
      `SELECT ${TITLE_COLUMNS}, ${inWatchlist('$2')}
       FROM titles t JOIN title_genres tg ON tg.title_id = t.id
       WHERE tg.genre_id = $1 ORDER BY t.kind, t.sort_order`,
      [genre.rows[0].id, req.user.id]
    );
    res.json({ genre: { slug: genre.rows[0].slug, name: genre.rows[0].name }, titles: rows });
  })
);

// ---- Movies / series ------------------------------------------------------

const listByKind = (kind, key) => asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT ${TITLE_COLUMNS}, ${inWatchlist('$2')}
     FROM titles t WHERE t.kind = $1 ORDER BY t.sort_order`,
    [kind, req.user ? req.user.id : null]
  );
  res.json({ [key]: rows });
});

// GET /api/movies, /series, /programs, /cartoons, /game-videos  (public; inWatchlist is filled in when a valid token is sent)
router.get('/movies', optionalAuth, listByKind('movie', 'movies'));
router.get('/series', optionalAuth, listByKind('series', 'series'));
router.get('/programs', optionalAuth, listByKind('program', 'programs'));
router.get('/cartoons', optionalAuth, listByKind('cartoon', 'cartoons'));
router.get('/game-videos', optionalAuth, listByKind('game_video', 'gameVideos'));

const titleIdParam = z.object({ id: z.string().regex(/^[a-z0-9]{1,12}$/, 'Invalid id') });

// GET /api/titles/:id  (login required)
router.get('/titles/:id', requireAuth, validate(titleIdParam, 'params'), asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT ${TITLE_COLUMNS}, ${inWatchlist('$2')},
            COALESCE((SELECT json_agg(json_build_object('slug', g.slug, 'name', g.name) ORDER BY g.sort_order)
                      FROM title_genres tg JOIN genres g ON g.id = tg.genre_id WHERE tg.title_id = t.id), '[]'::json) AS genres
     FROM titles t WHERE t.id = $1`,
    [req.params.id, req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Title not found' });
  res.json(rows[0]);
}));

// GET /api/titles/:id/trailer  (login required)
router.get('/titles/:id/trailer', requireAuth, validate(titleIdParam, 'params'), asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT id, kind, title, trailer_url AS "trailerUrl" FROM titles WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Title not found' });
  res.json(rows[0]);
}));

module.exports = router;
