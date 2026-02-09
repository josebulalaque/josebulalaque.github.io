# Raffler

Raffler is a web app for managing raffle participants, events, and draws. It features a Node.js + Express backend with SQLite for persistent storage, served behind nginx.

## What it does

- Register participants with an auto-incrementing raffle number.
- Manage events and keep notes for upcoming sessions.
- Create raffle drafts, then draw winners later.
- Draw Minor raffles instantly or Major raffles with a suspense reveal (winner-by-winner).
- Optionally exclude previous winners from future draws with an eligible count indicator.
- Target raffle draws to everyone, family-only, or non-family participants.
- Generate random numbers with a fun food-themed reveal animation (randomizing number with dramatic emoji scatter). Optionally upload custom images to replace the default emojis.
- Export participant lists as CSV.
- Switch between multiple UI themes (Default, Light, Dark, Barrio Fiesta variants, and more).
- Mobile-friendly layout across pages.
- Dashboard with live stats and recent activity.

## Architecture

```
Browser  -->  Nginx (port 80)  -->  Static files (HTML/CSS/JS)
                                -->  /api/*  -->  Express (port 3000)  -->  SQLite
                                -->  /uploads/*  -->  filesystem (images)
```

## Pages

- **Dashboard**: live stats and recent activity.
- **Participants**: add names, search/filter, and view the list.
- **Events**: create and manage events.
- **Raffles**: create drafts, draw winners (Minor or Major), and review results (Show Winners popup).
- **Number Generator**: generate random numbers with a dramatic food reveal animation. Upload custom images to personalize the reveal.
- **Settings**: choose a theme.

## Tech stack

- **Frontend**: Vanilla JavaScript, single HTML page, CSS custom properties for theming
- **Backend**: Node.js 20.x, Express, better-sqlite3, multer, uuid
- **Database**: SQLite (WAL mode)
- **Web server**: Nginx (reverse proxy + static files)
- **Process manager**: systemd

## Setup

### Prerequisites

- Ubuntu 24.04 (or similar)

### Quick install

The included install script handles everything — Node.js, nginx, npm dependencies, nginx config, and the systemd service:

```bash
git clone <repo-url> josebulalaque.github.io
cd josebulalaque.github.io
sudo bash install.sh
```

The script is idempotent — safe to re-run on a machine that already has some or all dependencies installed.

### Manual setup

If you prefer to set things up yourself:

1. Install Node.js 20.x and nginx.
2. Install backend dependencies:
   ```bash
   cd raffler-backend && npm install
   ```
3. Configure nginx to proxy `/api/*` to `http://127.0.0.1:3000`, serve `/uploads/` from `raffler-backend/uploads/`, and serve static files from the project root.
4. Create a systemd service to run `node server.js` in `raffler-backend/`.
5. Enable and start both services.

The backend auto-creates `data/` and `uploads/images/` directories on first startup — no manual `mkdir` needed.

## Data storage

All data is stored server-side in a SQLite database (`raffler-backend/data/raffler.db`). Uploaded images are stored on the filesystem in `raffler-backend/uploads/images/`. Data persists across page refreshes and works across multiple browsers/devices.

## API

See [CLAUDE.md](CLAUDE.md) for the full API endpoint reference.
