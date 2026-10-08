-- Upgrade: adds Programs, Cartoons, Game Videos and Gameplay Live.
-- Only adds columns/tables. Existing rows are never deleted or modified.
-- Safe to run more than once.

-- 1) titles can now also be programs, cartoons and game videos
ALTER TABLE titles DROP CONSTRAINT IF EXISTS titles_kind_check;
ALTER TABLE titles ADD CONSTRAINT titles_kind_check
  CHECK (kind IN ('movie', 'series', 'program', 'cartoon', 'game_video'));

-- 2) hero slides can show a category badge, a custom button label,
--    and a rating source (or no rating at all, for live streams)
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS badge         VARCHAR(60);   -- already present if hero-badge.sql was run
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS cta_label     VARCHAR(30) NOT NULL DEFAULT 'WATCH TRAILER';
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS rating_source VARCHAR(20) NOT NULL DEFAULT 'IMDB';
ALTER TABLE hero_slides ALTER COLUMN rating DROP NOT NULL;

-- 3) live gameplay streams by gamers
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
