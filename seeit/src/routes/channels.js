const express = require('express');
const { z } = require('zod');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler, validate } = require('../middleware/helpers');

const router = express.Router();

// GET /api/channels  (public: the guide is visible, the stream URLs are not)
router.get('/', asyncHandler(async (_req, res) => {
  const { rows } = await db.query(
    `SELECT id, name, logo, category, show_title AS show, description, viewers_count AS viewers,
            bg_image AS "bgImage", program_name AS program, minutes_left AS "minutesLeft",
            progress_percent AS "progressPercent", resolution, audio_language AS "audioLanguage"
     FROM live_channels ORDER BY sort_order`
  );
  const totalViewers = rows.reduce((sum, c) => sum + c.viewers, 0);
  res.json({ channels: rows, totalViewers });
}));

// GET /api/channels/:id/stream  (login required)
router.get('/:id/stream', requireAuth,
  validate(z.object({ id: z.string().regex(/^[a-z0-9]{1,12}$/, 'Invalid id') }), 'params'),
  asyncHandler(async (req, res) => {
    const { rows } = await db.query('SELECT id, name, stream_url AS "streamUrl" FROM live_channels WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Channel not found' });
    res.json(rows[0]);
  })
);

module.exports = router;
