-- Adds PUBG, Fortnite, Call of Duty, FIFA and PES to the Game Videos row.
-- Safe to run more than once. Existing rows are never changed.
--
-- The image and trailer here are PLACEHOLDERS until you paste each game's official YouTube link into
-- db/my-videos.json and run  npm run db:videos  (that replaces both with the real trailer and its thumbnail).
-- Ratings are sample numbers.

INSERT INTO titles (id, kind, badge, quality, title, rating, stars, year, duration, description, image_url, trailer_url, sort_order)
VALUES
  ('g7',  'game_video', 'BATTLE ROYALE', '4K 60FPS', 'PUBG: BATTLEGROUNDS',          7.5, 4, 2017, 'Trailer', 'Drop onto an island with 99 other players and fight to be the last one standing.', 'https://plus.unsplash.com/premium_photo-1677870728119-52aef052d7ef?q=80&w=1170&auto=format&fit=crop', 'https://www.youtube.com/embed/w7pYhpJaC7E', 6),
  ('g8',  'game_video', 'BATTLE ROYALE', '4K 60FPS', 'FORTNITE',                     7.8, 4, 2017, 'Trailer', 'Drop in, build, and outlast everyone in the massive battle royale.',                'https://images.unsplash.com/photo-1675049626914-b2e051e92f23?q=80&w=800&auto=format&fit=crop', 'https://www.youtube.com/embed/w7pYhpJaC7E', 7),
  ('g9',  'game_video', 'FPS SHOOTER',   '4K 60FPS', 'CALL OF DUTY: MODERN WARFARE II', 7.6, 4, 2022, 'Trailer', 'Fast, cinematic first-person combat across a global campaign and online multiplayer.',   'https://images.unsplash.com/photo-1675049651776-7b895d48916b?q=80&w=800&auto=format&fit=crop', 'https://www.youtube.com/embed/w7pYhpJaC7E', 8),
  ('g10', 'game_video', 'FOOTBALL',      '4K 60FPS', 'FIFA 23',                      7.4, 4, 2022, 'Trailer', 'Play with the biggest stars and leagues in the last game released under the FIFA name.', 'https://images.unsplash.com/photo-1706264337407-45faed32590c?q=80&w=800&auto=format&fit=crop', 'https://www.youtube.com/embed/w7pYhpJaC7E', 9),
  ('g11', 'game_video', 'FOOTBALL',      '4K 60FPS', 'PES 2021',                     7.3, 4, 2020, 'Trailer', 'Konami''s football series, known for its realistic ball physics and match feel.',     'https://images.unsplash.com/photo-1755436613032-10fd47e60014?q=80&w=800&auto=format&fit=crop', 'https://www.youtube.com/embed/w7pYhpJaC7E', 10)
ON CONFLICT (id) DO NOTHING;
