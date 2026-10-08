-- Adds the hero badge to an existing database. Safe to run more than once.
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS badge VARCHAR(60);
UPDATE hero_slides SET badge = 'GOLDEN GLOBE NOMINEE' WHERE badge IS NULL;
