const express = require('express');
const { z } = require('zod');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler, validate } = require('../middleware/helpers');

const router = express.Router();

// GET /api/gameplay-live  (public: the list is visible, stream URLs are not)
router.get('/', asyncHandler(async (_req, res) => {
  const { rows } = await db.query(
    `SELECT id, streamer, game, title, description, language, viewers_count AS viewers, thumbnail_url AS "thumbnailUrl"
     FROM gameplay_streams ORDER BY sort_order`
  );
  res.json({ streams: rows, totalViewers: rows.reduce((sum, r) => sum + r.viewers, 0) });
}));

// GET /api/gameplay-live/:id/stream  (login required)
router.get('/:id/stream', requireAuth,
  validate(z.object({ id: z.string().regex(/^[a-z0-9]{1,12}$/, 'Invalid id') }), 'params'),
  asyncHandler(async (req, res) => {
    const { rows } = await db.query(
      'SELECT id, streamer, game, stream_url AS "streamUrl" FROM gameplay_streams WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Stream not found' });
    res.json(rows[0]);
  })
);

module.exports = router;
