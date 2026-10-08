require('dotenv').config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('JWT_SECRET is missing or too short. Copy .env.example to .env and set a long random value.');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing. Copy .env.example to .env and set it.');
  process.exit(1);
}

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const db = require('./db');

const app = express();
app.disable('x-powered-by');

app.use(helmet({
  // The page loads Tailwind's Play CDN and uses inline scripts, which a strict CSP would block.
  // Turn this on after you compile Tailwind and move the inline script to a file.
  contentSecurityPolicy: false,
  // YouTube embeds refuse to play when no referrer is sent (helmet's default is "no-referrer").
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

if (process.env.CLIENT_ORIGIN) {
  app.use(cors({ origin: process.env.CLIENT_ORIGIN.split(',').map((s) => s.trim()) }));
}
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'database unavailable' });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/channels', require('./routes/channels'));
app.use('/api/gameplay-live', require('./routes/gameplay'));
app.use('/api/coming-soon', require('./routes/comingSoon'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/search', require('./routes/search'));
app.use('/api', require('./routes/content')); // hero-slides, genres, movies, series, titles

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// The SeeIt page itself
app.use(express.static(path.join(__dirname, '..', 'public')));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.status && err.status < 500) return res.status(err.status).json({ error: 'Bad request' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our side' });
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`SeeIt running on http://localhost:${port}`));

process.on('SIGTERM', () => server.close(() => db.pool.end()));
