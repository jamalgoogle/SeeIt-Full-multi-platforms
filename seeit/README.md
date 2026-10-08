# SeeIt: Express + PostgreSQL backend

The page (`public/index.html`) is your SeeIt design with every piece of hard-coded data removed. It loads everything from `/api/...`.

## Run it

```bash
npm install
# create the database once (psql, pgAdmin, or:)
psql -U postgres -c "CREATE DATABASE seeit;"

copy .env.example .env        # macOS/Linux: cp .env.example .env
# edit .env: set DATABASE_URL and a long random JWT_SECRET

npm run db:setup              # creates tables + loads the catalog
npm run dev                   # http://localhost:3000
```

`npm run db:reset` drops everything and reseeds. Re-running `npm run db:seed` replaces the catalog and keeps users.

## What needs a login

Browsing the home screen is public. Every action needs a token (`Authorization: Bearer <token>`).
Trailer and stream URLs are never included in public responses, so they cannot be read without an account.

| Section on the page | Public (home screen) | Needs login |
|---|---|---|
| Auth | | `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me` (signup/login are open by nature) |
| Hero slider | `GET /api/hero-slides` | `GET /api/hero-slides/:id/trailer` |
| Genres | `GET /api/genres` | `GET /api/genres/:slug/titles` |
| Feature Movies | `GET /api/movies` | `GET /api/titles/:id`, `GET /api/titles/:id/trailer` |
| TV Series | `GET /api/series` | same two endpoints |
| Watchlist "+" button | | `GET /api/watchlist`, `POST /api/watchlist/:titleId`, `DELETE /api/watchlist/:titleId` |
| TV programs | `GET /api/programs` | same two title endpoints |
| Cartoons | `GET /api/cartoons` | same two title endpoints |
| Game videos | `GET /api/game-videos` | same two title endpoints |
| Live channels | `GET /api/channels` | `GET /api/channels/:id/stream` |
| Gameplay live | `GET /api/gameplay-live` | `GET /api/gameplay-live/:id/stream` |
| Coming soon | `GET /api/coming-soon` | `POST /api/coming-soon/:id/remind`, `DELETE /api/coming-soon/:id/remind` |
| Search box | | `GET /api/search?q=` |
| | `GET /api/health` | |

`GET /api/movies`, `/api/series` and `/api/coming-soon` also return `inWatchlist` / `reminded` for the logged-in user when a token is sent.

## Notes

- Passwords are hashed with bcrypt (cost 12). Login errors are identical for "wrong password" and "unknown email". Signup/login are rate-limited (20 per 15 minutes per IP).
- The token is a 7-day JWT kept in `localStorage`. That is simple, but any XSS bug could read it. The page escapes all API data before rendering.
- Helmet's CSP is off because the page uses the Tailwind Play CDN and an inline script. Turn it on after compiling Tailwind.
- The original page had no genre tags per title, so `db/seed.js` assigns some (edit the `titleGenres` map). Only the first live channel had real "now airing" details; the others use placeholders.

## Adding more content later

`npm run db:more` runs `db/extra-titles.sql` (6 extra movies + 6 extra series). It is safe to run repeatedly and does not touch users or channels. `npm run db:setup` already includes it. For any other change, edit the rows in Postgres directly.

## Upgrading a database you already have (keeps all data)

Back up first, then run the upgrade. It only adds columns, a table and rows; it never deletes or edits what is there.

```
pg_dump -U postgres seeit > seeit-backup.sql
npm run db:upgrade
```

This adds TV programs, cartoons, game videos, gameplay live streams and 4 new hero slides. It is safe to run again.
Do **not** use `db:setup`, `db:seed` or `db:reset` on a database you want to keep: they reload the original catalog.

Images, trailer links and stream links in `db/new-sections.sql` are placeholders. Replace them with real ones in Postgres.

## Images for the new sections

- `npm run db:images` applies verified, topic-matched photos (Planet Earth II, Cosmos, SpongeBob and 6 gamer setups) and makes the new hero slides use the same photo as their title. It only touches rows created by `new-sections.sql`.
- `npm run db:images:fetch` finds a photo for each remaining title by keyword (`db/image-keywords.json`) through the Unsplash API. It needs a free `UNSPLASH_ACCESS_KEY` in `.env`. Add `-- --dry-run` to preview without saving. It never gives two rows the same photo, and prints the photographer's name for each one.
- To change one by hand: `UPDATE titles SET image_url = 'https://images.unsplash.com/photo-...?q=80&w=800&auto=format&fit=crop' WHERE id = 'c2';` then `npm run db:images` is not needed, but run `node db/run-sql.js db/sync-hero-images.sql` if it is a hero title.

## Real images and trailers (no Google account needed)

Three tools, none of them needs a cloud account. Your original 9 movies/series, live channels, users and watchlists are never touched.

**1. `npm run db:media`: trailers + posters from TMDB** (programs, cartoons and the 12 extra movies/series)
Needs one free key with no card: themoviedb.org, sign up, Settings, API, copy the "API Key" into `.env` as `TMDB_API_KEY=...`.
It takes the official trailer, checks that YouTube allows embedding it (skipping any that do not), and saves the real poster or backdrop. For each title it prints which TMDB entry it matched and which trailer it picked, so a wrong match is easy to spot. It looks for trailers in English, then any language, then under Season 1. If YouTube is busy and will not confirm a video, the script retries, and if it still gets no answer it saves the trailer and marks it "could not verify" (run `npm run db:check-videos` later). Titles it cannot match are listed at the end.
Preview first with `npm run db:media -- --dry-run`. Redo only some titles with `npm run db:media -- --ids=p1,m6`.

**2. `npm run db:videos`: paste a YouTube link yourself** (game videos, Gameplay Live streams, live channels, anything the first tool missed)
Open `db/my-videos.json`, paste a link next to each id, run the command. Each link is checked first; removed videos and videos that block embedding are rejected with the reason.
- `npm run db:videos -- --links` prints a YouTube search link for every empty entry, so you can open it, pick the official video and copy its address.
- Game videos and live streams get the video's own thumbnail as their image (and real channel name and title for streams). Add `--images` to do the same for normal titles.
- For a live stream, search YouTube with the "Live" filter and paste the watch link. Live streams end, so repeat it whenever one goes offline.

**3. `npm run db:check-videos`: find broken links**
Tests every trailer and stream link in the database and lists the ones that will not play, then tells you how to replace them.

Notes: the checks use YouTube's public oEmbed endpoint, which needs no key. It cannot see every restriction (for example a video blocked only in some countries), so still look at each one on your page. If you publish the site, TMDB requires the notice: "This product uses the TMDB API but is not endorsed or certified by TMDB."
