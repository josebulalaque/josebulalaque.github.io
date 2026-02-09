# Changelog

All notable changes to this project will be documented in this file.

## 2026-02-09
- Migrated data storage from browser localStorage to a server-side SQLite database.
- Added Node.js + Express backend (`raffler-backend/`) with 17 REST API endpoints.
- Database uses better-sqlite3 with WAL journal mode and foreign keys.
- Winner-picking logic (Fisher-Yates shuffle) now runs server-side with audience filtering and previous-winner exclusion via SQL.
- Major draw reworked: winners are stored with `is_pending` flag and revealed one at a time via a dedicated `/reveal` endpoint, replacing the client-side `setInterval` approach.
- Custom images now uploaded to the server filesystem via multer instead of stored as base64 in localStorage, removing the storage quota limitation.
- Nginx configured as reverse proxy (`/api/*` to Express on port 3000) and serves uploaded images from `/uploads/`.
- Backend runs as a systemd service (`raffler-api.service`) with auto-restart on failure.
- Frontend `app.js` rewritten: all `localStorage` calls replaced with `fetch()` to `/api/*` endpoints, mutation functions converted to async, initialization uses `Promise.all` for parallel data loading.
- Data now persists across browser cache clears and is accessible from any device on the network.
- Moved `raffler-backend/` inside the main project directory.
- Backend auto-creates `data/` and `uploads/images/` directories on startup for fresh-clone compatibility.
- Added `install.sh` — automated setup script that installs Node.js, nginx, npm dependencies, and configures nginx + systemd. Idempotent and path-aware.
- Added `.gitignore` to exclude `node_modules/`, `raffler-backend/data/`, and `raffler-backend/uploads/images/`.
- Added `CLAUDE.md` project guide with architecture, schema, API reference, and development notes.

## 2026-02-04
- Added custom image upload for Number Generator to replace default food emojis.
- Users can upload multiple images which are stored in localStorage as base64.
- Preview thumbnails display uploaded images below the generator controls.
- Mixed mode: if fewer than 25 images uploaded, remaining slots filled with emojis.
- Clear All button to remove all uploaded images and revert to default emojis.
- Images persist across page refreshes.
- Added automatic image resizing (max 150x150, JPEG 80% quality) to reduce storage usage.
- Added image count display showing number of uploaded images.
- Added error handling for localStorage quota exceeded with user alert.
- Added display mode toggles to choose between images only, emojis only, or both.
- Replaced checkboxes with styled toggle switches for a more modern look.

## 2026-02-03
- Added Number Generator page with food-themed random number reveal animation.
- Large food emojis (96px) cover the display and scatter/fly away with a slow, dramatic animation.
- Number randomizes behind the food emojis, then settles on the final result after the reveal.
- Includes min/max range inputs and recent numbers history.

## 2026-01-26
- Built the participant registration flow with auto-incrementing raffle numbers.
- Added dashboard stats and recent activity.
- Added Events and Raffles pages with draft and draw workflows.
- Implemented Major draw suspense reveal (winner-by-winner) with inline loading.
- Added Show Winners on drawn raffles with a large-screen popup display.
- Added raffle draw types (Minor/Major) and eligible participant count indicator.
- Added raffle audience targeting (everyone, family, non-family).
- Expanded theme system with multiple presets, including Barrio Fiesta variants.
- Improved mobile responsiveness across navigation, panels, and forms.
- Added CSV export, search, and localStorage persistence.
- Refined dashboard copy and brand subtitle for a more festive tone.
