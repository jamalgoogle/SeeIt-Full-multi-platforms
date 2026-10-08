-- Makes each new hero slide use the same photo AND trailer as its title / stream.
-- Run again after changing a title's image or trailer.
UPDATE hero_slides h
SET image_url   = regexp_replace(t.image_url, 'w=\d+', 'w=1920'),
    trailer_url = t.trailer_url
FROM titles t
WHERE (h.title, t.id) IN (VALUES
  ('AVATAR: THE LAST AIRBENDER', 'c1'),
  ('ELDEN RING: OFFICIAL GAMEPLAY', 'g1'),
  ('PLANET EARTH II', 'p1'));

UPDATE hero_slides h
SET image_url   = regexp_replace(g.thumbnail_url, 'w=\d+', 'w=1920'),
    trailer_url = g.stream_url
FROM gameplay_streams g
WHERE h.badge = 'GAMEPLAY LIVE' AND g.id = 'gl1';
