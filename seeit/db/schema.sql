-- SeeIt schema (safe to run more than once)

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(60)  NOT NULL,
  email         VARCHAR(254) NOT NULL UNIQUE,      -- stored lowercased
  password_hash TEXT         NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- "Explore Genres" section
CREATE TABLE IF NOT EXISTS genres (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(40) NOT NULL UNIQUE,
  name        VARCHAR(80) NOT NULL,
  title_count INT         NOT NULL DEFAULT 0,      -- the "1,240+ Titles" marketing number
  image_url   TEXT        NOT NULL,
  sort_order  INT         NOT NULL DEFAULT 0
);

-- Hero slider
CREATE TABLE IF NOT EXISTS hero_slides (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(120)  NOT NULL,
  rating      NUMERIC(3,1)  CHECK (rating BETWEEN 0 AND 10),   -- NULL for live streams
  quality     VARCHAR(60)   NOT NULL,              -- "2h 18m · 4K ULTRA HD"
  genre_label VARCHAR(80)   NOT NULL,
  badge       VARCHAR(60),                         -- e.g. "GOLDEN GLOBE NOMINEE" (optional)
  description TEXT          NOT NULL,
  image_url   TEXT          NOT NULL,
  trailer_url TEXT          NOT NULL,
  sort_order  INT           NOT NULL DEFAULT 0,
  cta_label     VARCHAR(30)   NOT NULL DEFAULT 'WATCH TRAILER',
  rating_source VARCHAR(20)   NOT NULL DEFAULT 'IMDB'
);

-- "Feature Movies" and "Trending TV Series" share one table
CREATE TABLE IF NOT EXISTS titles (
  id          VARCHAR(12)  PRIMARY KEY,
  kind        VARCHAR(12)  NOT NULL CHECK (kind IN ('movie', 'series', 'program', 'cartoon', 'game_video')),
  badge       VARCHAR(60)  NOT NULL,
  quality     VARCHAR(40)  NOT NULL,
  title       VARCHAR(120) NOT NULL,
  rating      NUMERIC(3,1) NOT NULL CHECK (rating BETWEEN 0 AND 10),
  stars       SMALLINT     NOT NULL CHECK (stars BETWEEN 1 AND 5),
  year        SMALLINT     NOT NULL,
  duration    VARCHAR(40)  NOT NULL,
  description TEXT         NOT NULL,
  image_url   TEXT         NOT NULL,
  trailer_url TEXT         NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_titles_kind ON titles (kind, sort_order);

CREATE TABLE IF NOT EXISTS title_genres (
  title_id VARCHAR(12) NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  genre_id INT         NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (title_id, genre_id)
);

-- Live TV channels
CREATE TABLE IF NOT EXISTS live_channels (
  id               VARCHAR(12)  PRIMARY KEY,
  name             VARCHAR(80)  NOT NULL,
  logo             VARCHAR(40)  NOT NULL,
  category         VARCHAR(80)  NOT NULL,
  show_title       VARCHAR(120) NOT NULL,
  description      TEXT         NOT NULL,
  viewers_count    INT          NOT NULL DEFAULT 0,
  stream_url       TEXT         NOT NULL,
  bg_image         TEXT,
  program_name     VARCHAR(120) NOT NULL,
  minutes_left     INT          NOT NULL DEFAULT 0,
  progress_percent INT          NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  resolution       VARCHAR(30)  NOT NULL DEFAULT '1080p Full HD',
  audio_language   VARCHAR(40)  NOT NULL DEFAULT 'Arabic / English',
  sort_order       INT          NOT NULL DEFAULT 0
);

-- "Coming Soon / New Releases"
CREATE TABLE IF NOT EXISTS coming_soon (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(120) NOT NULL,
  release_date DATE         NOT NULL,
  description  TEXT         NOT NULL,
  image_url    TEXT         NOT NULL,
  sort_order   INT          NOT NULL DEFAULT 0
);

-- Per-user state: the "+" watchlist button and the "Remind Me" button
CREATE TABLE IF NOT EXISTS watchlist (
  user_id  INT         NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  title_id VARCHAR(12) NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, title_id)
);

CREATE TABLE IF NOT EXISTS reminders (
  user_id        INT         NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
  coming_soon_id INT         NOT NULL REFERENCES coming_soon(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, coming_soon_id)
);

-- for databases created before the badge column existed
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS badge VARCHAR(60);

-- Live gameplay streams by gamers
CREATE TABLE IF NOT EXISTS gameplay_streams (
  id            VARCHAR(12)  PRIMARY KEY,
  streamer      VARCHAR(60)  NOT NULL,
  game          VARCHAR(80)  NOT NULL,
  title         VARCHAR(140) NOT NULL,
  description   TEXT         NOT NULL,
  language      VARCHAR(30)  NOT NULL DEFAULT 'Arabic',
  viewers_count INT          NOT NULL DEFAULT 0,
  thumbnail_url TEXT         NOT NULL,
  stream_url    TEXT         NOT NULL,
  sort_order    INT          NOT NULL DEFAULT 0
);
