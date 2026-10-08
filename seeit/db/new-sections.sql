-- Content for the new sections. Safe to run more than once (nothing is overwritten).
--
-- NOTE: images, trailer links and stream links below are PLACEHOLDERS and were not verified.
--   * The gameplay streams all point to one 24/7 live stream so the player can be tested.
--   * Streamer names are made up. Viewer counts are sample numbers.
-- Replace them with your own, for example:
--   UPDATE gameplay_streams SET stream_url = 'https://www.youtube.com/embed/live_stream?channel=UC...&autoplay=1' WHERE id = 'gl1';
--   UPDATE titles SET trailer_url = 'https://www.youtube.com/embed/VIDEO_ID' WHERE id = 'g1';

INSERT INTO titles (id, kind, badge, quality, title, rating, stars, year, duration, description, image_url, trailer_url, sort_order)
VALUES
  ('p1','program','DOCUMENTARY','4K HDR','PLANET EARTH II',9.5,5,2016,'6 Episodes','Breathtaking wildlife and landscapes filmed across every continent.','https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/w7pYhpJaC7E',0),
  ('p2','program','SCIENCE','4K UHD','COSMOS: A SPACETIME ODYSSEY',9.3,5,2014,'13 Episodes','A journey through the universe, from the Big Bang to the far future.','https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/Way9Dexny3w',1),
  ('p3','program','COOKING COMPETITION','FULL HD','MASTERCHEF',7.5,4,2010,'Multiple Seasons','Home cooks compete in high-pressure kitchen challenges.','https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/gCcx85zbxz4',2),
  ('p4','program','MOTORING','FULL HD','TOP GEAR',8.7,5,2002,'Multiple Seasons','Supercars, wild challenges and car reviews with plenty of banter.','https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/zSWdZVtXT7E',3),
  ('p5','program','BUSINESS REALITY','FULL HD','SHARK TANK',7.5,4,2009,'Multiple Seasons','Entrepreneurs pitch their ideas to investors for a chance at funding.','https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/xEQP4VVuyrY',4),
  ('p6','program','MUSIC COMPETITION','FULL HD','THE VOICE',7.0,4,2011,'Multiple Seasons','Singers audition blind, and the coaches pick their teams by voice alone.','https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/6BS27ngZlxg',5),
  ('c1','cartoon','ADVENTURE CLASSIC','HD','AVATAR: THE LAST AIRBENDER',9.3,5,2005,'3 Seasons','A young Airbender and his friends try to end a century-long war.','https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/QkZxoko_hc0',0),
  ('c2','cartoon','CLASSIC COMEDY','HD','TOM AND JERRY',8.3,4,1940,'Classic Series','The endless cat-and-mouse chase that made slapstick famous.','https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/mP0VHJVP0W8',1),
  ('c3','cartoon','FAMILY COMEDY','HD','SPONGEBOB SQUAREPANTS',8.2,4,1999,'Multiple Seasons','A cheerful sea sponge and his friends cause chaos in Bikini Bottom.','https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/fXmAurh072s',2),
  ('c4','cartoon','MYSTERY COMEDY','HD','GRAVITY FALLS',8.9,5,2012,'2 Seasons','Twins spend a summer uncovering the strange secrets of their town.','https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/yAN5uspO_hk',3),
  ('c5','cartoon','FANTASY COMEDY','HD','ADVENTURE TIME',8.6,5,2010,'10 Seasons','A boy and his magical dog explore the colorful Land of Ooo.','https://images.unsplash.com/photo-1528164344705-47542687990d?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/JtqIas3bYhg',4),
  ('c6','cartoon','CLASSIC COMEDY','HD','LOONEY TUNES',8.1,4,1930,'Classic Series','Bugs Bunny, Daffy Duck and friends in timeless short cartoons.','https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/b9EkMc79ZSU',5),
  ('g1','game_video','OFFICIAL GAMEPLAY','4K 60FPS','ELDEN RING',9.0,5,2022,'Gameplay','Explore the Lands Between in a vast open-world action RPG.','https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/w7pYhpJaC7E',0),
  ('g2','game_video','GAMEPLAY REVEAL','4K HDR','CYBERPUNK 2077',8.2,4,2020,'Gameplay','Fight for survival in the neon-soaked streets of Night City.','https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/Way9Dexny3w',1),
  ('g3','game_video','STORY TRAILER','4K HDR','GOD OF WAR RAGNARÖK',9.2,5,2022,'Trailer','Kratos and Atreus face the end of the Norse world.','https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/gCcx85zbxz4',2),
  ('g4','game_video','CINEMATIC TRAILER','4K','THE WITCHER 3: WILD HUNT',9.3,5,2015,'Trailer','Geralt hunts monsters and chases his adopted daughter across a war-torn land.','https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/zSWdZVtXT7E',3),
  ('g5','game_video','LAUNCH TRAILER','4K','RED DEAD REDEMPTION 2',9.2,5,2018,'Trailer','An outlaw gang tries to survive as the Wild West fades away.','https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/xEQP4VVuyrY',4),
  ('g6','game_video','GAMEPLAY TRAILER','4K 60FPS','HADES',9.0,5,2020,'Trailer','Fight out of the underworld in a fast, stylish action roguelike.','https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/6BS27ngZlxg',5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO gameplay_streams (id, streamer, game, title, description, language, viewers_count, thumbnail_url, stream_url, sort_order)
VALUES
  ('gl1','ZED_GAMING','Valorant','Ranked grind to Immortal','Live ranked matches with tactical breakdowns and chat Q&A.','Arabic',18400,'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop','https://www.youtube.com/embed/live_stream?channel=UCSJ4gkVC6NrvII8umztf0Ow&autoplay=1',0),
  ('gl2','NovaQueen','Fortnite','Squad wins with viewers','Join the lobby, drop in and chase Victory Royales together.','English',12700,'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop','https://www.youtube.com/embed/live_stream?channel=UCSJ4gkVC6NrvII8umztf0Ow&autoplay=1',1),
  ('gl3','AbuFahad','EA SPORTS FC','Ultimate Team packs + Weekend League','Pack openings, squad building and ranked football matches.','Arabic',9600,'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=600&auto=format&fit=crop','https://www.youtube.com/embed/live_stream?channel=UCSJ4gkVC6NrvII8umztf0Ow&autoplay=1',2),
  ('gl4','PixelHunter','Minecraft','Hardcore survival: day 100','One life, no mercy. Watch the world build up live.','English',15200,'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop','https://www.youtube.com/embed/live_stream?channel=UCSJ4gkVC6NrvII8umztf0Ow&autoplay=1',3),
  ('gl5','SaraPlays','Elden Ring','Blind run: no summons','First playthrough, no guides, plenty of boss deaths.','Arabic',6800,'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600&auto=format&fit=crop','https://www.youtube.com/embed/live_stream?channel=UCSJ4gkVC6NrvII8umztf0Ow&autoplay=1',4),
  ('gl6','TurboTamer','GTA V','Roleplay city live','Live roleplay server with a full cast of characters.','Arabic',21300,'https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?q=80&w=600&auto=format&fit=crop','https://www.youtube.com/embed/live_stream?channel=UCSJ4gkVC6NrvII8umztf0Ow&autoplay=1',5),
  ('gl7','FrostByte','Counter-Strike 2','Faceit climb','High-level matches and aim training between rounds.','English',8100,'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop','https://www.youtube.com/embed/live_stream?channel=UCSJ4gkVC6NrvII8umztf0Ow&autoplay=1',6),
  ('gl8','KingDuel','Clash Royale','Road to top 1000','Deck breakdowns and ladder pushes, live.','Arabic',5400,'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop','https://www.youtube.com/embed/live_stream?channel=UCSJ4gkVC6NrvII8umztf0Ow&autoplay=1',7)
ON CONFLICT (id) DO NOTHING;

-- Spread the original hero slides out (0,10,20...) so the new ones can sit between them.
-- Running this again changes nothing.
UPDATE hero_slides SET sort_order = sort_order * 10 WHERE sort_order < 10;

INSERT INTO hero_slides (title, rating, quality, genre_label, description, image_url, trailer_url, sort_order, badge, cta_label, rating_source)
SELECT v.* FROM (VALUES
  ('ZED_GAMING LIVE: VALORANT RANKED',NULL,'LIVE · 1080p 60FPS','GAMEPLAY LIVE · FPS','Watch a ranked grind live, with clutch plays, tactical breakdowns and a very active chat.','https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1920&auto=format&fit=crop','https://www.youtube.com/embed/live_stream?channel=UCSJ4gkVC6NrvII8umztf0Ow&autoplay=1',15,'GAMEPLAY LIVE','WATCH LIVE','IMDB'),
  ('AVATAR: THE LAST AIRBENDER',9.3,'3 SEASONS · HD','CARTOON · ADVENTURE','A young Airbender and his friends race to end a century-long war and restore balance to the world.','https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1920&auto=format&fit=crop','https://www.youtube.com/embed/w7pYhpJaC7E',25,'CARTOON','WATCH TRAILER','IMDB'),
  ('ELDEN RING: OFFICIAL GAMEPLAY',9.0,'4K · 60FPS','GAME VIDEO · ACTION RPG','Explore the Lands Between in a vast open-world action RPG from the creators of Dark Souls.','https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1920&auto=format&fit=crop','https://www.youtube.com/embed/zSWdZVtXT7E',35,'GAME VIDEO','WATCH VIDEO','USER SCORE'),
  ('PLANET EARTH II',9.5,'6 EPISODES · 4K HDR','PROGRAM · DOCUMENTARY','Breathtaking wildlife and landscapes, filmed across every continent in stunning detail.','https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop','https://www.youtube.com/embed/6BS27ngZlxg',45,'PROGRAM','WATCH PREVIEW','IMDB')
) AS v(title, rating, quality, genre_label, description, image_url, trailer_url, sort_order, badge, cta_label, rating_source)
WHERE NOT EXISTS (SELECT 1 FROM hero_slides h WHERE h.title = v.title);
