const express = require('express');
const { z } = require('zod');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler, validate } = require('../middleware/helpers');

const router = express.Router();
router.use(requireAuth); // every watchlist action needs a login

const titleParam = z.object({ titleId: z.string().regex(/^[a-z0-9]{1,12}$/, 'Invalid id') });

// GET /api/watchlist
router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT t.id, t.kind, t.title, t.rating::float AS rating, t.stars, t.year, t.duration, t.image_url AS "imageUrl",
            w.added_at AS "addedAt"
     FROM watchlist w JOIN titles t ON t.id = w.title_id
     WHERE w.user_id = $1 ORDER BY w.added_at DESC`,
    [req.user.id]
  );
  res.json({ watchlist: rows });
}));

// POST /api/watchlist/:titleId
router.post('/:titleId', validate(titleParam, 'params'), asyncHandler(async (req, res) => {
  const exists = await db.query('SELECT 1 FROM titles WHERE id = $1', [req.params.titleId]);
  if (!exists.rowCount) return res.status(404).json({ error: 'Title not found' });
  await db.query(
    'INSERT INTO watchlist (user_id, title_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [req.user.id, req.params.titleId]
  );
  res.status(201).json({ inWatchlist: true });
}));

// DELETE /api/watchlist/:titleId
router.delete('/:titleId', validate(titleParam, 'params'), asyncHandler(async (req, res) => {
  await db.query('DELETE FROM watchlist WHERE user_id = $1 AND title_id = $2', [req.user.id, req.params.titleId]);
  res.json({ inWatchlist: false });
}));

module.exports = router;
