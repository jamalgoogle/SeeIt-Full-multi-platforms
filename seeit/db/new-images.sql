-- Topic-matched photos for the new sections (verified Unsplash photo IDs, free to use).
-- Only touches rows created by new-sections.sql. Movies, series, channels and your own rows are not changed.
-- Safe to run more than once.

-- Programs
UPDATE titles SET image_url = 'https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=800&auto=format&fit=crop' WHERE id = 'p1'; -- Planet Earth II: deer in a Yosemite meadow
UPDATE titles SET image_url = 'https://images.unsplash.com/photo-1561951336-659c0e4f1aa5?q=80&w=800&auto=format&fit=crop'    WHERE id = 'p2'; -- Cosmos: Milky Way galaxy at night

-- Cartoons
UPDATE titles SET image_url = 'https://images.unsplash.com/photo-1496196614460-48988a57fccf?q=80&w=800&auto=format&fit=crop' WHERE id = 'c3'; -- SpongeBob: sea turtle swimming in the ocean

-- Gameplay Live thumbnails (gamer setups)
UPDATE gameplay_streams SET thumbnail_url = 'https://images.unsplash.com/photo-1675049651776-7b895d48916b?q=80&w=600&auto=format&fit=crop' WHERE id = 'gl1'; -- Valorant: red 3-monitor setup
UPDATE gameplay_streams SET thumbnail_url = 'https://images.unsplash.com/photo-1706264337407-45faed32590c?q=80&w=600&auto=format&fit=crop' WHERE id = 'gl2'; -- Fortnite: controller + laptop
UPDATE gameplay_streams SET thumbnail_url = 'https://images.unsplash.com/photo-1755436613032-10fd47e60014?q=80&w=600&auto=format&fit=crop' WHERE id = 'gl3'; -- EA FC: computer + console
UPDATE gameplay_streams SET thumbnail_url = 'https://images.unsplash.com/photo-1675049626914-b2e051e92f23?q=80&w=600&auto=format&fit=crop' WHERE id = 'gl4'; -- Minecraft: two-monitor desk
UPDATE gameplay_streams SET thumbnail_url = 'https://images.unsplash.com/photo-1762219214808-154d74e0d761?q=80&w=600&auto=format&fit=crop' WHERE id = 'gl5'; -- Elden Ring: monitors showing game art
UPDATE gameplay_streams SET thumbnail_url = 'https://images.unsplash.com/photo-1640695254597-7ee90eed00fb?q=80&w=600&auto=format&fit=crop' WHERE id = 'gl6'; -- GTA V: blue gaming keyboard
