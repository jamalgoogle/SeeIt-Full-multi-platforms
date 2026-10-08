-- Extra titles to test the horizontal scroll (6 movies + 6 series).
-- Safe to run more than once. Does not touch users, channels or existing titles.
--
-- NOTE: images and trailer links are PLACEHOLDERS reused from the original page,
-- so they do not match the titles. Replace them with real ones, for example:
--   UPDATE titles SET trailer_url = 'https://www.youtube.com/embed/VIDEO_ID' WHERE id = 'm6';

INSERT INTO titles (id, kind, badge, quality, title, rating, stars, year, duration, description, image_url, trailer_url, sort_order)
VALUES
  ('m6','movie','MIND-BENDING THRILLER','4K UHD','INCEPTION',8.8,5,2010,'2h 28m','A thief who steals secrets through dreams is offered a chance to erase his past by planting an idea instead.','https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/w7pYhpJaC7E',5),
  ('m7','movie','SPACE EPIC','IMAX 4K','INTERSTELLAR',8.7,5,2014,'2h 49m','Explorers travel through a wormhole in search of a new home for humanity.','https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/Way9Dexny3w',6),
  ('m8','movie','CRIME SAGA','4K HDR','THE DARK KNIGHT',9.0,5,2008,'2h 32m','Batman faces the Joker, a criminal mastermind who pushes Gotham toward chaos.','https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/gCcx85zbxz4',7),
  ('m9','movie','NEO-NOIR SCI-FI','DOLBY VISION','BLADE RUNNER 2049',8.0,4,2017,'2h 44m','A young blade runner uncovers a secret that could plunge what remains of society into chaos.','https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/zSWdZVtXT7E',8),
  ('m10','movie','WASTELAND CHASE','4K UHD','MAD MAX: FURY ROAD',8.1,4,2015,'2h 00m','In a desert wasteland, a drifter and a rebel warrior race across the sands to escape a tyrant.','https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/xEQP4VVuyrY',9),
  ('m11','movie','BEST PICTURE','4K HDR','PARASITE',8.5,5,2019,'2h 12m','A poor family schemes its way into the lives of a wealthy household, with unexpected results.','https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/6BS27ngZlxg',10),
  ('s5','series','CRIME DRAMA','4K HDR','BREAKING BAD',9.5,5,2008,'5 Seasons','A chemistry teacher turns to manufacturing drugs after a life-changing diagnosis.','https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/QkZxoko_hc0',4),
  ('s6','series','FANTASY EPIC','4K HDR','GAME OF THRONES',9.2,5,2011,'8 Seasons','Noble families fight for control of the Iron Throne while an ancient threat gathers in the north.','https://images.unsplash.com/photo-1528164344705-47542687990d?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/mP0VHJVP0W8',5),
  ('s7','series','GERMAN SCI-FI','4K UHD','DARK',8.7,5,2017,'3 Seasons','A missing child sets four families on a hunt that reveals a time-travel conspiracy.','https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/fXmAurh072s',6),
  ('s8','series','POST-APOCALYPTIC','DOLBY VISION','THE LAST OF US',8.7,5,2023,'2 Seasons','A hardened survivor escorts a teenage girl across a ruined America.','https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/yAN5uspO_hk',7),
  ('s9','series','WORKPLACE MYSTERY','4K HDR','SEVERANCE',8.7,5,2022,'2 Seasons','Employees whose memories are split between work and home start to question the company.','https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/JtqIas3bYhg',8),
  ('s10','series','LIMITED SERIES','4K UHD','CHERNOBYL',9.3,5,2019,'1 Season','The 1986 nuclear disaster and the people who fought to contain it.','https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop','https://www.youtube.com/embed/b9EkMc79ZSU',9)
ON CONFLICT (id) DO NOTHING;

INSERT INTO title_genres (title_id, genre_id)
SELECT v.title_id, g.id
FROM (VALUES
    ('m6', 'action-scifi'),
    ('m6', 'thriller-mystery'),
    ('m7', 'space-odyssey'),
    ('m7', 'action-scifi'),
    ('m8', 'action-scifi'),
    ('m8', 'thriller-mystery'),
    ('m9', 'cyberpunk'),
    ('m9', 'action-scifi'),
    ('m10', 'action-scifi'),
    ('m11', 'thriller-mystery'),
    ('s5', 'thriller-mystery'),
    ('s6', 'dark-fantasy'),
    ('s7', 'thriller-mystery'),
    ('s7', 'action-scifi'),
    ('s8', 'action-scifi'),
    ('s8', 'dark-fantasy'),
    ('s9', 'thriller-mystery'),
    ('s9', 'action-scifi'),
    ('s10', 'thriller-mystery')
) AS v(title_id, slug)
JOIN genres g ON g.slug = v.slug
ON CONFLICT DO NOTHING;
