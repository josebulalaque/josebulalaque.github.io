const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DATA_DIR = path.join(__dirname, "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "raffler.db");
const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_family INTEGER NOT NULL DEFAULT 0,
    raffle_number INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    location TEXT,
    notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS raffles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    event_id TEXT,
    event_name TEXT,
    raffle_type TEXT NOT NULL DEFAULT 'Minor',
    count INTEGER NOT NULL DEFAULT 1,
    raffle_audience TEXT NOT NULL DEFAULT 'everyone',
    exclude_previous_winners INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL,
    drawn_at TEXT
  );

  CREATE TABLE IF NOT EXISTS raffle_winners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    raffle_id TEXT NOT NULL,
    participant_id TEXT NOT NULL,
    participant_name TEXT NOT NULL,
    raffle_number INTEGER NOT NULL,
    is_pending INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (raffle_id) REFERENCES raffles(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS custom_images (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT,
    mime_type TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// --- Participants ---

const stmtAllParticipants = db.prepare(
  "SELECT id, name, is_family AS isFamily, raffle_number AS raffleNumber, created_at AS createdAt FROM participants ORDER BY created_at DESC"
);

const stmtInsertParticipant = db.prepare(
  "INSERT INTO participants (id, name, is_family, raffle_number, created_at) VALUES (@id, @name, @isFamily, @raffleNumber, @createdAt)"
);

const stmtDeleteParticipant = db.prepare("DELETE FROM participants WHERE id = ?");

const stmtClearParticipants = db.prepare("DELETE FROM participants");

const stmtNextRaffleNumber = db.prepare(
  "SELECT COALESCE(MAX(raffle_number), 0) + 1 AS next FROM participants"
);

function getAllParticipants() {
  return stmtAllParticipants.all().map((row) => ({
    ...row,
    isFamily: !!row.isFamily,
  }));
}

function insertParticipant({ id, name, isFamily, raffleNumber, createdAt }) {
  stmtInsertParticipant.run({
    id,
    name,
    isFamily: isFamily ? 1 : 0,
    raffleNumber,
    createdAt,
  });
}

function deleteParticipant(id) {
  return stmtDeleteParticipant.run(id);
}

function clearParticipants() {
  return stmtClearParticipants.run();
}

function getNextRaffleNumber() {
  return stmtNextRaffleNumber.get().next;
}

const insertManyParticipants = db.transaction((list) => {
  for (const p of list) {
    insertParticipant(p);
  }
});

// --- Events ---

const stmtAllEvents = db.prepare(
  "SELECT id, name, date, time, location, notes, created_at AS createdAt FROM events ORDER BY date ASC"
);

const stmtInsertEvent = db.prepare(
  "INSERT INTO events (id, name, date, time, location, notes, created_at) VALUES (@id, @name, @date, @time, @location, @notes, @createdAt)"
);

const stmtDeleteEvent = db.prepare("DELETE FROM events WHERE id = ?");

function getAllEvents() {
  return stmtAllEvents.all();
}

function insertEvent({ id, name, date, time, location, notes, createdAt }) {
  stmtInsertEvent.run({ id, name, date, time: time || null, location: location || null, notes: notes || null, createdAt });
}

function deleteEvent(id) {
  return stmtDeleteEvent.run(id);
}

// --- Raffles ---

const stmtAllRaffles = db.prepare(
  `SELECT id, title, event_id AS eventId, event_name AS eventName, raffle_type AS raffleType,
          count, raffle_audience AS raffleAudience, exclude_previous_winners AS excludePreviousWinners,
          notes, status, created_at AS createdAt, drawn_at AS drawnAt
   FROM raffles ORDER BY created_at DESC`
);

const stmtInsertRaffle = db.prepare(
  `INSERT INTO raffles (id, title, event_id, event_name, raffle_type, count, raffle_audience, exclude_previous_winners, notes, status, created_at, drawn_at)
   VALUES (@id, @title, @eventId, @eventName, @raffleType, @count, @raffleAudience, @excludePreviousWinners, @notes, @status, @createdAt, @drawnAt)`
);

const stmtUpdateRaffleStatus = db.prepare(
  "UPDATE raffles SET status = @status, drawn_at = @drawnAt WHERE id = @id"
);

const stmtClearRaffles = db.prepare("DELETE FROM raffles");
const stmtClearRaffleWinners = db.prepare("DELETE FROM raffle_winners");

const stmtWinnersForRaffle = db.prepare(
  `SELECT participant_id AS id, participant_name AS name, raffle_number AS raffleNumber, is_pending AS isPending, sort_order AS sortOrder
   FROM raffle_winners WHERE raffle_id = ? ORDER BY sort_order ASC`
);

const stmtInsertWinner = db.prepare(
  `INSERT INTO raffle_winners (raffle_id, participant_id, participant_name, raffle_number, is_pending, sort_order)
   VALUES (@raffleId, @participantId, @participantName, @raffleNumber, @isPending, @sortOrder)`
);

const stmtDeleteWinnersForRaffle = db.prepare(
  "DELETE FROM raffle_winners WHERE raffle_id = ?"
);

const stmtAllPreviousWinnerIds = db.prepare(
  `SELECT DISTINCT participant_id FROM raffle_winners rw
   JOIN raffles r ON rw.raffle_id = r.id
   WHERE r.status = 'drawn' AND rw.is_pending = 0`
);

function getAllRaffles() {
  const rows = stmtAllRaffles.all();
  return rows.map((raffle) => {
    const winners = stmtWinnersForRaffle.all(raffle.id).map((w) => ({
      ...w,
      isPending: !!w.isPending,
    }));
    return {
      ...raffle,
      excludePreviousWinners: !!raffle.excludePreviousWinners,
      winners,
    };
  });
}

function insertRaffle(raffle) {
  stmtInsertRaffle.run({
    id: raffle.id,
    title: raffle.title,
    eventId: raffle.eventId || null,
    eventName: raffle.eventName || null,
    raffleType: raffle.raffleType || "Minor",
    count: raffle.count,
    raffleAudience: raffle.raffleAudience || "everyone",
    excludePreviousWinners: raffle.excludePreviousWinners ? 1 : 0,
    notes: raffle.notes || null,
    status: raffle.status || "pending",
    createdAt: raffle.createdAt,
    drawnAt: raffle.drawnAt || null,
  });
}

function insertWinners(raffleId, winners, isPending = false) {
  const insert = db.transaction((list) => {
    for (let i = 0; i < list.length; i++) {
      stmtInsertWinner.run({
        raffleId,
        participantId: list[i].id,
        participantName: list[i].name,
        raffleNumber: list[i].raffleNumber,
        isPending: isPending ? 1 : 0,
        sortOrder: i,
      });
    }
  });
  insert(winners);
}

function updateRaffleStatus(id, status, drawnAt) {
  stmtUpdateRaffleStatus.run({ id, status, drawnAt: drawnAt || null });
}

function clearRaffles() {
  const clear = db.transaction(() => {
    stmtClearRaffleWinners.run();
    stmtClearRaffles.run();
  });
  clear();
}

function getPreviousWinnerIds() {
  return new Set(stmtAllPreviousWinnerIds.all().map((r) => r.participant_id));
}

function getEligiblePool({ excludePreviousWinners, audience }) {
  const all = getAllParticipants();
  const previousWinners = excludePreviousWinners ? getPreviousWinnerIds() : new Set();
  return all.filter((p) => {
    if (audience === "family" && !p.isFamily) return false;
    if (audience === "non-family" && p.isFamily) return false;
    if (excludePreviousWinners && previousWinners.has(p.id)) return false;
    return true;
  });
}

function pickWinners(count, { excludePreviousWinners, audience }) {
  const pool = getEligiblePool({ excludePreviousWinners, audience });
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).map((p) => ({
    id: p.id,
    name: p.name,
    raffleNumber: p.raffleNumber,
  }));
}

// --- Custom Images ---

const stmtAllImages = db.prepare(
  "SELECT id, filename, original_name AS originalName, mime_type AS mimeType, created_at AS createdAt FROM custom_images ORDER BY created_at ASC"
);

const stmtInsertImage = db.prepare(
  "INSERT INTO custom_images (id, filename, original_name, mime_type, created_at) VALUES (@id, @filename, @originalName, @mimeType, @createdAt)"
);

const stmtDeleteImage = db.prepare("DELETE FROM custom_images WHERE id = ?");
const stmtGetImage = db.prepare("SELECT * FROM custom_images WHERE id = ?");
const stmtClearImages = db.prepare("DELETE FROM custom_images");

function getAllImages() {
  return stmtAllImages.all();
}

function insertImage({ id, filename, originalName, mimeType, createdAt }) {
  stmtInsertImage.run({ id, filename, originalName, mimeType, createdAt });
}

function deleteImage(id) {
  const img = stmtGetImage.get(id);
  stmtDeleteImage.run(id);
  return img;
}

function clearImages() {
  const images = stmtAllImages.all();
  stmtClearImages.run();
  return images;
}

// --- Settings ---

const stmtGetSetting = db.prepare("SELECT value FROM settings WHERE key = ?");
const stmtUpsertSetting = db.prepare(
  "INSERT INTO settings (key, value) VALUES (@key, @value) ON CONFLICT(key) DO UPDATE SET value = @value"
);

function getSetting(key) {
  const row = stmtGetSetting.get(key);
  return row ? row.value : null;
}

function setSetting(key, value) {
  stmtUpsertSetting.run({ key, value });
}

// --- Reveal logic for Major draw ---

const stmtRevealNextWinner = db.prepare(
  `SELECT id, participant_id, participant_name, raffle_number, sort_order
   FROM raffle_winners WHERE raffle_id = ? AND is_pending = 1 ORDER BY sort_order ASC LIMIT 1`
);

const stmtMarkWinnerRevealed = db.prepare(
  "UPDATE raffle_winners SET is_pending = 0 WHERE id = ?"
);

const stmtCountPendingWinners = db.prepare(
  "SELECT COUNT(*) AS cnt FROM raffle_winners WHERE raffle_id = ? AND is_pending = 1"
);

function revealNextWinner(raffleId) {
  const next = stmtRevealNextWinner.get(raffleId);
  if (!next) return null;
  stmtMarkWinnerRevealed.run(next.id);
  const remaining = stmtCountPendingWinners.get(raffleId).cnt;
  if (remaining === 0) {
    updateRaffleStatus(raffleId, "drawn", new Date().toISOString());
  }
  return {
    winner: {
      id: next.participant_id,
      name: next.participant_name,
      raffleNumber: next.raffle_number,
    },
    remaining,
  };
}

module.exports = {
  db,
  getAllParticipants,
  insertParticipant,
  deleteParticipant,
  clearParticipants,
  getNextRaffleNumber,
  insertManyParticipants,
  getAllEvents,
  insertEvent,
  deleteEvent,
  getAllRaffles,
  insertRaffle,
  insertWinners,
  updateRaffleStatus,
  clearRaffles,
  getEligiblePool,
  pickWinners,
  getPreviousWinnerIds,
  getAllImages,
  insertImage,
  deleteImage,
  clearImages,
  getSetting,
  setSetting,
  revealNextWinner,
  stmtDeleteWinnersForRaffle,
};
