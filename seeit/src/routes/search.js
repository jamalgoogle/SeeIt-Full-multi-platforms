const express = require('express');
const { z } = require('zod');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler, validate } = require('../middleware/helpers');

const router = express.Router();

const querySchema = z.object({
  q: z.string().trim().min(2, 'Type at least 2 characters').max(60, 'Search is too long'),
});

// GET /api/search?q=...   (login required)
router.get('/', requireAuth, validate(querySchema, 'query'), asyncHandler(async (req, res) => {
  // escape LIKE wildcards so "100%" is searched literally
  const pattern = `%${req.query.q.replace(/[\\%_]/g, '\\$&')}%`;

  const [titles, channels, upcoming, genres, streams] = await Promise.all([
    db.query(
      `SELECT t.id, t.kind, t.title, t.year, t.rating::float AS rating, t.duration, t.image_url AS "imageUrl"
       FROM titles t
       WHERE t.title ILIKE $1 OR t.description ILIKE $1 OR t.badge ILIKE $1
          OR EXISTS (SELECT 1 FROM title_genres tg JOIN genres g ON g.id = tg.genre_id
                     WHERE tg.title_id = t.id AND g.name ILIKE $1)
       ORDER BY t.rating DESC LIMIT 10`, [pattern]),
    db.query(
      `SELECT id, name, show_title AS show, category FROM live_channels
       WHERE name ILIKE $1 OR show_title ILIKE $1 OR category ILIKE $1 ORDER BY sort_order LIMIT 10`, [pattern]),
    db.query(
      `SELECT id, title, upper(to_char(release_date, 'FMMonth YYYY')) AS "releaseLabel" FROM coming_soon
       WHERE title ILIKE $1 OR description ILIKE $1 ORDER BY sort_order LIMIT 10`, [pattern]),
    db.query('SELECT slug, name FROM genres WHERE name ILIKE $1 ORDER BY sort_order LIMIT 10', [pattern]),
    db.query(
      `SELECT id, streamer, game, title FROM gameplay_streams
       WHERE streamer ILIKE $1 OR game ILIKE $1 OR title ILIKE $1 ORDER BY viewers_count DESC LIMIT 10`, [pattern]),
  ]);

  res.json({
    query: req.query.q,
    titles: titles.rows,
    channels: channels.rows,
    upcoming: upcoming.rows,
    genres: genres.rows,
    streams: streams.rows,
  });
}));

module.exports = router;
