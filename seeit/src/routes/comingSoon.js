const express = require('express');
const db = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { asyncHandler, validate, idParam } = require('../middleware/helpers');

const router = express.Router();

// GET /api/coming-soon  (public; `reminded` is filled in when a valid token is sent)
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT c.id, c.title, c.description, c.image_url AS "imageUrl",
            upper(to_char(c.release_date, 'FMMonth YYYY')) AS "releaseLabel",
            EXISTS (SELECT 1 FROM reminders r WHERE r.coming_soon_id = c.id AND r.user_id = $1::int) AS reminded
     FROM coming_soon c ORDER BY c.sort_order`,
    [req.user ? req.user.id : null]
  );
  res.json({ comingSoon: rows });
}));

async function ensureExists(id) {
  const { rowCount } = await db.query('SELECT 1 FROM coming_soon WHERE id = $1', [id]);
  return rowCount > 0;
}

// POST /api/coming-soon/:id/remind  (login required)
router.post('/:id/remind', requireAuth, validate(idParam, 'params'), asyncHandler(async (req, res) => {
  if (!(await ensureExists(req.params.id))) return res.status(404).json({ error: 'Release not found' });
  await db.query(
    'INSERT INTO reminders (user_id, coming_soon_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [req.user.id, req.params.id]
  );
  res.status(201).json({ reminded: true });
}));

// DELETE /api/coming-soon/:id/remind  (login required)
router.delete('/:id/remind', requireAuth, validate(idParam, 'params'), asyncHandler(async (req, res) => {
  await db.query('DELETE FROM reminders WHERE user_id = $1 AND coming_soon_id = $2', [req.user.id, req.params.id]);
  res.json({ reminded: false });
}));

module.exports = router;
