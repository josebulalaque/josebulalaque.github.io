const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const db = require("./database");

const app = express();
const PORT = 3000;
const HOST = "127.0.0.1";

app.use(express.json());

// --- Multer config for image uploads ---
const UPLOADS_DIR = path.join(__dirname, "uploads", "images");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// ===================== PARTICIPANTS =====================

// GET /api/participants
app.get("/api/participants", (_req, res) => {
  const participants = db.getAllParticipants();
  const nextNumber = db.getNextRaffleNumber();
  res.json({ participants, nextRaffleNumber: nextNumber });
});

// POST /api/participants
app.post("/api/participants", (req, res) => {
  const { name, isFamily } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }
  const id = uuidv4();
  const raffleNumber = db.getNextRaffleNumber();
  const createdAt = new Date().toISOString();
  db.insertParticipant({
    id,
    name: name.trim(),
    isFamily: !!isFamily,
    raffleNumber,
    createdAt,
  });
  res.status(201).json({
    id,
    name: name.trim(),
    isFamily: !!isFamily,
    raffleNumber,
    createdAt,
  });
});

// PUT /api/participants/:id
app.put("/api/participants/:id", (req, res) => {
  const { name, isFamily } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }
  const result = db.updateParticipant(req.params.id, { name: name.trim(), isFamily: !!isFamily });
  if (result.changes === 0) {
    return res.status(404).json({ error: "Participant not found" });
  }
  const participants = db.getAllParticipants();
  const updated = participants.find((p) => p.id === req.params.id);
  res.json(updated);
});

// DELETE /api/participants/:id
app.delete("/api/participants/:id", (req, res) => {
  const result = db.deleteParticipant(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Participant not found" });
  }
  res.json({ ok: true });
});

// POST /api/participants/seed
app.post("/api/participants/seed", (req, res) => {
  const count = Number(req.body.count) || 400;
  const startNumber = db.getNextRaffleNumber();
  const now = Date.now();
  const familyQuota = Math.min(40, count);
  const generated = Array.from({ length: count }, (_, index) => {
    const raffleNumber = startNumber + index;
    const nameSuffix = String(raffleNumber).padStart(3, "0");
    return {
      id: uuidv4(),
      name: `Test Participant ${nameSuffix}`,
      isFamily: index < familyQuota,
      raffleNumber,
      createdAt: new Date(now - index * 1000).toISOString(),
    };
  });
  db.insertManyParticipants(generated);
  res.status(201).json({ added: count, nextRaffleNumber: db.getNextRaffleNumber() });
});

// GET /api/participants/export
app.get("/api/participants/export", (_req, res) => {
  const participants = db.getAllParticipants();
  const header = ["Raffle Number", "Name", "Family Member", "Created At"];
  const rows = participants.map((p) => [
    p.raffleNumber,
    p.name,
    p.isFamily ? "Yes" : "No",
    p.createdAt,
  ]);
  const csv = [header, ...rows]
    .map((row) =>
      row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=participants.csv");
  res.send(csv);
});

// DELETE /api/participants
app.delete("/api/participants", (_req, res) => {
  db.clearParticipants();
  res.json({ ok: true });
});

// ===================== EVENTS =====================

// GET /api/events
app.get("/api/events", (_req, res) => {
  res.json(db.getAllEvents());
});

// POST /api/events
app.post("/api/events", (req, res) => {
  const { name, date, time, location, notes } = req.body;
  if (!name || !date) {
    return res.status(400).json({ error: "Name and date are required" });
  }
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  db.insertEvent({ id, name: name.trim(), date, time: time || "", location: location || "", notes: notes || "", createdAt });
  res.status(201).json({ id, name: name.trim(), date, time: time || "", location: location || "", notes: notes || "", createdAt });
});

// DELETE /api/events/:id
app.delete("/api/events/:id", (req, res) => {
  const result = db.deleteEvent(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Event not found" });
  }
  res.json({ ok: true });
});

// ===================== RAFFLES =====================

// GET /api/raffles
app.get("/api/raffles", (_req, res) => {
  res.json(db.getAllRaffles());
});

// POST /api/raffles — create a draft (pending) raffle
app.post("/api/raffles", (req, res) => {
  const { title, eventId, eventName, raffleType, count, raffleAudience, excludePreviousWinners, notes } = req.body;
  if (!title || !count || count < 1) {
    return res.status(400).json({ error: "Title and count are required" });
  }
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const raffle = {
    id,
    title: title.trim(),
    eventId: eventId || "",
    eventName: eventName || "",
    raffleType: raffleType || "Minor",
    count,
    raffleAudience: raffleAudience || "everyone",
    excludePreviousWinners: !!excludePreviousWinners,
    notes: notes || "",
    status: "pending",
    createdAt,
    drawnAt: null,
  };
  db.insertRaffle(raffle);
  res.status(201).json({ ...raffle, winners: [] });
});

// PUT /api/raffles/:id/draw — draw winners for a pending raffle
app.put("/api/raffles/:id/draw", (req, res) => {
  const raffles = db.getAllRaffles();
  const raffle = raffles.find((r) => r.id === req.params.id);
  if (!raffle) {
    return res.status(404).json({ error: "Raffle not found" });
  }
  if (raffle.status === "drawn") {
    return res.status(400).json({ error: "Raffle already drawn" });
  }

  const pool = db.getEligiblePool({
    excludePreviousWinners: raffle.excludePreviousWinners,
    audience: raffle.raffleAudience,
  });

  if (pool.length < raffle.count) {
    return res.status(400).json({ error: "Not enough eligible participants" });
  }

  const winners = db.pickWinners(raffle.count, {
    excludePreviousWinners: raffle.excludePreviousWinners,
    audience: raffle.raffleAudience,
  });

  // Delete any existing winners (in case of re-draw from "drawing" state)
  db.stmtDeleteWinnersForRaffle.run(raffle.id);

  if (raffle.raffleType === "Major") {
    // Major draw: winners start as pending (to be revealed one by one)
    db.insertWinners(raffle.id, winners, true);
    db.updateRaffleStatus(raffle.id, "drawing", null);
    const updated = db.getAllRaffles().find((r) => r.id === raffle.id);
    return res.json(updated);
  }

  // Minor draw: all winners revealed immediately
  db.insertWinners(raffle.id, winners, false);
  const drawnAt = new Date().toISOString();
  db.updateRaffleStatus(raffle.id, "drawn", drawnAt);
  const updated = db.getAllRaffles().find((r) => r.id === raffle.id);
  res.json(updated);
});

// PUT /api/raffles/:id/reveal — reveal next winner in a Major draw
app.put("/api/raffles/:id/reveal", (req, res) => {
  const result = db.revealNextWinner(req.params.id);
  if (!result) {
    return res.status(400).json({ error: "No pending winners to reveal" });
  }
  const updated = db.getAllRaffles().find((r) => r.id === req.params.id);
  res.json({ revealed: result.winner, remaining: result.remaining, raffle: updated });
});

// DELETE /api/raffles
app.delete("/api/raffles", (_req, res) => {
  db.clearRaffles();
  res.json({ ok: true });
});

// ===================== STATS =====================

// GET /api/stats
app.get("/api/stats", (_req, res) => {
  const participants = db.getAllParticipants();
  const events = db.getAllEvents();
  const raffles = db.getAllRaffles();

  const pending = raffles.filter(
    (r) => r.status === "pending" || r.status === "drawing"
  ).length;

  const drawn = raffles
    .filter((r) => r.status === "drawn")
    .map((r) => r.drawnAt || r.createdAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  res.json({
    totalParticipants: participants.length,
    nextRaffleNumber: db.getNextRaffleNumber(),
    lastAdded: participants.length > 0 ? participants[0].createdAt : null,
    totalEvents: events.length,
    totalRaffles: raffles.length,
    pendingDraws: pending,
    lastDraw: drawn.length > 0 ? drawn[0] : null,
  });
});

// ===================== IMAGES =====================

// GET /api/images
app.get("/api/images", (_req, res) => {
  const images = db.getAllImages().map((img) => ({
    ...img,
    url: `/uploads/images/${img.filename}`,
  }));
  res.json(images);
});

// POST /api/images
app.post("/api/images", upload.array("images", 20), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No images uploaded" });
  }
  const saved = req.files.map((file) => {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    db.insertImage({
      id,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      createdAt,
    });
    return {
      id,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      createdAt,
      url: `/uploads/images/${file.filename}`,
    };
  });
  res.status(201).json(saved);
});

// DELETE /api/images/:id
app.delete("/api/images/:id", (req, res) => {
  const img = db.deleteImage(req.params.id);
  if (!img) {
    return res.status(404).json({ error: "Image not found" });
  }
  // Remove file from disk
  const filePath = path.join(UPLOADS_DIR, img.filename);
  try {
    fs.unlinkSync(filePath);
  } catch (e) {
    // File may already be gone
  }
  res.json({ ok: true });
});

// DELETE /api/images
app.delete("/api/images", (_req, res) => {
  const images = db.clearImages();
  // Remove all files from disk
  for (const img of images) {
    try {
      fs.unlinkSync(path.join(UPLOADS_DIR, img.filename));
    } catch (e) {
      // Ignore
    }
  }
  res.json({ ok: true });
});

// ===================== THEME =====================

// GET /api/theme
app.get("/api/theme", (_req, res) => {
  const theme = db.getSetting("theme") || "default";
  res.json({ theme });
});

// PUT /api/theme
app.put("/api/theme", (req, res) => {
  const { theme } = req.body;
  if (!theme) {
    return res.status(400).json({ error: "Theme is required" });
  }
  db.setSetting("theme", theme);
  res.json({ theme });
});

// ===================== Error handler =====================

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, HOST, () => {
  console.log(`Raffler API listening on http://${HOST}:${PORT}`);
});
