# Raffler — Project Guide

## Overview

Raffler is a raffle/lottery management web app. The frontend is a single-page app (HTML/CSS/JS) served by nginx. The backend is a Node.js + Express API with SQLite for persistence, running as a systemd service behind nginx reverse proxy.

## Architecture

```
Browser  -->  Nginx (port 80)  -->  Static files (HTML/CSS/JS)
                                -->  /api/*  -->  Express (port 3000)  -->  SQLite
                                -->  /uploads/*  -->  filesystem (images)
```

- **Server**: Ubuntu 24.04 at 192.168.122.145
- **User**: jojoadmin
- **Project root**: `/home/jojoadmin/josebulalaque.github.io/`

## Directory Structure

```
josebulalaque.github.io/
├── index.html          # Single-page app shell
├── app.js              # Frontend logic (fetches from /api/*)
├── styles.css          # All styles + theme variables
├── palette.JPG         # Design reference
├── install.sh          # Automated setup script (Node.js, nginx, systemd)
├── .gitignore          # Excludes node_modules, data, uploaded images
├── raffler-backend/
│   ├── server.js       # Express API (21 endpoints, listens 127.0.0.1:3000)
│   ├── database.js     # SQLite schema, prepared statements, helpers
│   ├── package.json
│   ├── package-lock.json
│   ├── data/           # Auto-created on startup (gitignored)
│   │   └── raffler.db  # SQLite database (WAL mode)
│   ├── uploads/        # Auto-created on startup
│   │   └── images/     # Uploaded custom images (gitignored)
│   └── node_modules/   # gitignored, restored via npm install
├── CLAUDE.md
├── README.md
└── CHANGELOGS.md
```

## Tech Stack

- **Frontend**: Vanilla JS (no framework), single HTML file, CSS custom properties for theming
- **Backend**: Node.js 20.x, Express, better-sqlite3, multer (file uploads), uuid
- **Database**: SQLite with WAL journal mode, foreign keys enabled
- **Web server**: Nginx reverse proxy
- **Process manager**: systemd (`raffler-api.service`)

## Database Schema (6 tables)

- **participants** — id, name, is_family, raffle_number, created_at
- **events** — id, name, date, time, location, notes, created_at
- **raffles** — id, title, event_id, event_name, raffle_type, count, raffle_audience, exclude_previous_winners, notes, status, created_at, drawn_at
- **raffle_winners** — id, raffle_id, participant_id, participant_name, raffle_number, is_pending, sort_order
- **custom_images** — id, filename, original_name, mime_type, created_at
- **settings** — key, value (used for theme)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/participants | List all participants + nextRaffleNumber |
| POST | /api/participants | Add a participant |
| DELETE | /api/participants/:id | Remove a participant |
| POST | /api/participants/seed | Add dummy participants for testing |
| GET | /api/participants/export | Download CSV export |
| DELETE | /api/participants | Clear all participants |
| GET | /api/events | List all events |
| POST | /api/events | Create an event |
| DELETE | /api/events/:id | Remove an event |
| GET | /api/raffles | List all raffles with winners |
| POST | /api/raffles | Create a raffle draft (pending) |
| PUT | /api/raffles/:id/draw | Draw winners (Minor=instant, Major=pending reveal) |
| PUT | /api/raffles/:id/reveal | Reveal next winner in a Major draw |
| DELETE | /api/raffles | Clear all raffles |
| GET | /api/stats | Dashboard statistics |
| GET | /api/images | List uploaded images |
| POST | /api/images | Upload images (multipart, field: "images") |
| DELETE | /api/images/:id | Delete a single image |
| DELETE | /api/images | Clear all images |
| GET | /api/theme | Get current theme |
| PUT | /api/theme | Set theme |

## Key Concepts

- **Minor draw**: Winners picked and revealed instantly via Fisher-Yates shuffle.
- **Major draw**: Winners picked server-side but stored with `is_pending=1`. Frontend calls `/reveal` to show winners one at a time. Status transitions: pending → drawing → drawn.
- **Audience filtering**: Draws can target "everyone", "family", or "non-family".
- **Previous winner exclusion**: When enabled, participants who won in any completed raffle are excluded from the eligible pool.
- **Custom images**: Uploaded via multer to `uploads/images/`, served by nginx. Used in raffle draw overlay animations.

## Service Management

```bash
# API service
sudo systemctl start raffler-api
sudo systemctl stop raffler-api
sudo systemctl restart raffler-api
sudo systemctl status raffler-api
journalctl -u raffler-api -f

# Nginx
sudo systemctl reload nginx
sudo nginx -t
```

## Config Locations

- **Nginx**: `/etc/nginx/sites-available/raffler`
- **Systemd**: `/etc/systemd/system/raffler-api.service`
- **SQLite DB**: `/home/jojoadmin/josebulalaque.github.io/raffler-backend/data/raffler.db`

## Fresh Install

```bash
git clone <repo-url> josebulalaque.github.io
cd josebulalaque.github.io
sudo bash install.sh
```

The script installs Node.js 20.x, nginx, npm dependencies, writes the nginx site config and systemd service (with paths derived from the project directory), sets home directory permissions for nginx access, and starts everything. It is idempotent — safe to re-run.

## Development Notes

- The frontend has no build step — edit `app.js`, `styles.css`, or `index.html` directly and reload.
- Backend changes require `sudo systemctl restart raffler-api`.
- All frontend state (`participants`, `events`, `raffles`, `customImages`, `activeTheme`) is loaded from the API on page load via `initApp()` using `Promise.all`.
- The frontend `api()` helper automatically sets `Content-Type: application/json` and parses responses.
- Image uploads use `FormData` (not JSON) — the `api()` helper is bypassed for that endpoint.
- Themes are applied via `data-theme` attribute on `<body>` and CSS custom properties.
