/* ===== API helper ===== */
async function api(path, opts = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json", ...opts.headers },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res;
}

/* ===== DOM refs (unchanged) ===== */
const form = document.getElementById("participantForm");
const formHint = document.getElementById("formHint");
const nameInput = document.getElementById("name");
const list = document.getElementById("participantList");
const searchInput = document.getElementById("search");
const filterFamily = document.getElementById("filterFamily");
const exportCsv = document.getElementById("exportCsv");
const clearAll = document.getElementById("clearAll");
const seedParticipantsButton = document.getElementById("seedParticipants");
const navItems = Array.from(document.querySelectorAll(".nav-item[data-view]"));
const views = Array.from(document.querySelectorAll(".view"));
const raffleModal = document.getElementById("raffleModal");
const raffleNumberDisplay = document.getElementById("raffleNumberDisplay");
const closeRaffleModal = document.getElementById("closeRaffleModal");
const winnerModal = document.getElementById("winnerModal");
const winnerNumbers = document.getElementById("winnerNumbers");
const drawOverlay = document.getElementById("drawOverlay");
const eventForm = document.getElementById("eventForm");
const eventHint = document.getElementById("eventHint");
const eventNameInput = document.getElementById("eventName");
const eventDateInput = document.getElementById("eventDate");
const eventTimeInput = document.getElementById("eventTime");
const eventLocationInput = document.getElementById("eventLocation");
const eventNotesInput = document.getElementById("eventNotes");
const eventList = document.getElementById("eventList");
const raffleForm = document.getElementById("raffleForm");
const raffleHint = document.getElementById("raffleHint");
const raffleTitleInput = document.getElementById("raffleTitle");
const raffleEventSelect = document.getElementById("raffleEvent");
const raffleTypeSelect = document.getElementById("raffleType");
const raffleAudienceSelect = document.getElementById("raffleAudience");
const raffleCountInput = document.getElementById("raffleCount");
const raffleNotesInput = document.getElementById("raffleNotes");
const raffleList = document.getElementById("raffleList");
const clearRafflesButton = document.getElementById("clearRaffles");
const raffleExcludeToggle = document.getElementById("raffleExcludeWinners");
const eligibleCount = document.getElementById("eligibleCount");
const createRaffleDraftButton = document.getElementById("createRaffleDraft");
const themeCards = Array.from(document.querySelectorAll(".theme-card[data-theme]"));

const statTotal = document.getElementById("statTotal");
const statNext = document.getElementById("statNext");
const statLast = document.getElementById("statLast");
const statEvents = document.getElementById("statEvents");
const statRaffles = document.getElementById("statRaffles");
const statPending = document.getElementById("statPending");
const statLastDraw = document.getElementById("statLastDraw");
const activityList = document.getElementById("activityList");

// Number Generator elements
const genMin = document.getElementById("genMin");
const genMax = document.getElementById("genMax");
const generateBtn = document.getElementById("generateBtn");
const generatorNumber = document.getElementById("generatorNumber");
const foodOverlay = document.getElementById("foodOverlay");
const generatorHistory = document.getElementById("generatorHistory");

// Image upload elements
const imageUpload = document.getElementById("imageUpload");
const clearImagesBtn = document.getElementById("clearImages");
const imagesPreview = document.getElementById("imagesPreview");
const modeImagesToggle = document.getElementById("modeImages");
const modeEmojisToggle = document.getElementById("modeEmojis");

/* ===== State (loaded from API) ===== */
let participants = [];
let raffleCounter = 1;
let events = [];
let raffles = [];
let activeTheme = "default";
let drawInProgress = false;
let customImages = [];   // array of { id, url, ... }

/* ===== Data loaders ===== */
async function loadParticipants() {
  const data = await api("/participants");
  participants = data.participants;
  raffleCounter = data.nextRaffleNumber;
}

async function loadEvents() {
  events = await api("/events");
}

async function loadRaffles() {
  raffles = await api("/raffles");
}

async function loadTheme() {
  const data = await api("/theme");
  activeTheme = data.theme;
}

async function loadCustomImages() {
  customImages = await api("/images");
}

/* ===== Formatting helpers (unchanged) ===== */
function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function formatEventDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function formatEventTime(timeValue) {
  if (!timeValue) return "";
  const [hours, minutes] = timeValue.split(":");
  if (!hours || !minutes) return timeValue;
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/* ===== Render functions (unchanged except image URLs) ===== */
function renderStats() {
  statTotal.textContent = participants.length;
  if (statNext) statNext.textContent = raffleCounter;
  const last = participants[0];
  statLast.textContent = last ? formatDate(last.createdAt) : "-";
  if (statEvents) statEvents.textContent = events.length;
  if (statRaffles) statRaffles.textContent = raffles.length;
  if (statPending) {
    statPending.textContent = raffles.filter((raffle) => {
      const statusValue = raffle.status || (raffle.winners && raffle.winners.length > 0 ? "drawn" : "pending");
      return statusValue === "pending" || statusValue === "drawing";
    }).length;
  }
  if (statLastDraw) {
    const drawn = raffles
      .filter((raffle) => raffle.status === "drawn" || (raffle.winners && raffle.winners.length > 0))
      .map((raffle) => raffle.drawnAt || raffle.createdAt)
      .filter(Boolean)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    statLastDraw.textContent = drawn.length > 0 ? formatDate(drawn[0]) : "-";
  }
  renderActivity();
}

function renderList() {
  const term = searchInput.value.trim().toLowerCase();
  const familyFilter = filterFamily ? filterFamily.value : "all";

  const filtered = participants.filter((entry) => {
    const matchesName = entry.name.toLowerCase().includes(term);
    const matchesFamily =
      familyFilter === "all" ||
      (familyFilter === "family" && entry.isFamily) ||
      (familyFilter === "non-family" && !entry.isFamily);
    return matchesName && matchesFamily;
  });
  const ordered = [...filtered];

  list.innerHTML = "";

  if (ordered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No participants yet. Add someone to get started.";
    list.appendChild(empty);
    return;
  }

  ordered.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "participant";

    const info = document.createElement("div");
    info.className = "participant-info";

    const name = document.createElement("div");
    name.className = "participant-name";
    const number = document.createElement("span");
    number.className = "raffle-number";
    number.textContent = `#${entry.raffleNumber}`;
    const nameText = document.createElement("span");
    nameText.textContent = entry.name;
    name.appendChild(number);
    name.appendChild(nameText);

    const meta = document.createElement("div");
    meta.className = "participant-meta";
    meta.innerHTML = `
      <span>Registered ${formatDate(entry.createdAt)}</span>
      ${entry.isFamily ? "<span class=\"tag\">Family</span>" : ""}
    `;

    info.appendChild(name);
    info.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "participant-actions";

    const removeButton = document.createElement("button");
    removeButton.className = "icon-button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => removeParticipant(entry.id));

    actions.appendChild(removeButton);

    item.appendChild(info);
    item.appendChild(actions);
    list.appendChild(item);
  });
}

function renderEvents() {
  if (!eventList) return;
  eventList.innerHTML = "";

  if (events.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No events yet. Add one to get started.";
    eventList.appendChild(empty);
    return;
  }

  events.forEach((eventItem) => {
    const card = document.createElement("div");
    card.className = "event-card";

    const title = document.createElement("div");
    title.className = "event-title";
    title.textContent = eventItem.name;

    const meta = document.createElement("div");
    meta.className = "event-meta";
    const dateText = formatEventDate(eventItem.date);
    const timeText = formatEventTime(eventItem.time);
    const dateLabel = timeText ? `${dateText} · ${timeText}` : dateText;
    meta.innerHTML = `
      <span class="event-chip">${dateLabel}</span>
      <span>${eventItem.location || "Location TBA"}</span>
    `;

    const notes = document.createElement("div");
    notes.className = "participant-meta";
    notes.textContent = eventItem.notes || "No notes";

    const actions = document.createElement("div");
    actions.className = "event-actions";
    const removeButton = document.createElement("button");
    removeButton.className = "icon-button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => removeEvent(eventItem.id));
    actions.appendChild(removeButton);

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(notes);
    card.appendChild(actions);
    eventList.appendChild(card);
  });

  renderRaffleEventOptions();
}

function renderRaffleEventOptions() {
  if (!raffleEventSelect) return;
  const selected = raffleEventSelect.value;
  raffleEventSelect.innerHTML = "<option value=\"\">No event</option>";
  events.forEach((eventItem) => {
    const option = document.createElement("option");
    option.value = eventItem.id;
    option.textContent = eventItem.name;
    raffleEventSelect.appendChild(option);
  });
  raffleEventSelect.value = selected;
}

function renderRaffles() {
  if (!raffleList) return;
  raffleList.innerHTML = "";

  if (raffles.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No raffle draws yet. Create one to see winners.";
    raffleList.appendChild(empty);
    return;
  }

  raffles.forEach((raffle) => {
    const card = document.createElement("div");
    card.className = "raffle-card";
    const statusValue =
      raffle.status || (raffle.winners && raffle.winners.length > 0 ? "drawn" : "pending");

    const header = document.createElement("div");
    header.className = "raffle-header";
    const titleWrap = document.createElement("div");
    titleWrap.className = "raffle-title-wrap";
    const title = document.createElement("div");
    title.className = "raffle-title";
    title.textContent = raffle.title;
    titleWrap.appendChild(title);
    const headerRight = document.createElement("div");
    headerRight.className = "raffle-header-right";
    const meta = document.createElement("div");
    meta.className = "raffle-meta";
    const dateLabel =
      statusValue === "drawn" && raffle.drawnAt
        ? `Drawn ${formatDate(raffle.drawnAt)}`
        : `Created ${formatDate(raffle.createdAt)}`;
    meta.textContent = dateLabel;
    const status = document.createElement("div");
    const statusClass =
      statusValue === "pending"
        ? "is-pending"
        : statusValue === "drawing"
          ? "is-drawing"
          : "is-drawn";
    status.className = `status-pill ${statusClass}`;
    status.textContent =
      statusValue === "pending" ? "Pending" : statusValue === "drawing" ? "Drawing" : "Drawn";
    if (statusValue === "drawn") {
      const showButton = document.createElement("button");
      showButton.className = "button ghost raffle-show";
      showButton.textContent = "Show Winners";
      showButton.addEventListener("click", () => showWinnerModal(raffle.winners || [], raffle.title));
      titleWrap.appendChild(showButton);
    }
    header.appendChild(titleWrap);
    headerRight.appendChild(meta);
    headerRight.appendChild(status);
    header.appendChild(headerRight);

    const detail = document.createElement("div");
    detail.className = "event-meta";
    const eventName = raffle.eventName || "No event";
    const repeatLabel = raffle.excludePreviousWinners ? " · No repeats" : "";
    const typeLabel = raffle.raffleType ? ` · ${raffle.raffleType}` : "";
    const audienceLabel =
      raffle.raffleAudience && raffle.raffleAudience !== "everyone"
        ? raffle.raffleAudience === "family"
          ? " · Family only"
          : " · Non-family"
        : "";
    detail.textContent = `${eventName} · ${raffle.count} winner${raffle.count === 1 ? "" : "s"}${typeLabel}${audienceLabel}${repeatLabel}`;

    card.appendChild(header);
    card.appendChild(detail);

    if (statusValue === "pending") {
      const pending = document.createElement("div");
      pending.className = "raffle-pending";
      pending.textContent = "Not drawn yet.";

      const actions = document.createElement("div");
      actions.className = "raffle-actions";
      const drawButton = document.createElement("button");
      drawButton.className = "button primary";
      drawButton.textContent = "Draw now";
      drawButton.addEventListener("click", () => drawRaffleNow(raffle.id));
      actions.appendChild(drawButton);

      card.appendChild(pending);
      card.appendChild(actions);
    } else if (statusValue === "drawing") {
      const winners = document.createElement("div");
      winners.className = "raffle-winners";

      const loadingRow = document.createElement("div");
      loadingRow.className = "raffle-loading";
      const spinner = document.createElement("div");
      spinner.className = "spinner";
      const label = document.createElement("div");
      label.textContent = "Drawing winners...";
      loadingRow.appendChild(spinner);
      loadingRow.appendChild(label);
      winners.appendChild(loadingRow);

      // Show already-revealed winners
      const revealedWinners = (raffle.winners || []).filter((w) => !w.isPending);
      revealedWinners.forEach((winner) => {
        const row = document.createElement("div");
        row.className = "raffle-winner";
        row.innerHTML = `<span>#${winner.raffleNumber}</span>${winner.name}`;
        winners.appendChild(row);
      });

      const actions = document.createElement("div");
      actions.className = "raffle-actions";
      const revealButton = document.createElement("button");
      revealButton.className = "button primary";
      revealButton.textContent = "Reveal next winner";
      revealButton.addEventListener("click", () => revealNextWinner(raffle.id));
      actions.appendChild(revealButton);

      card.appendChild(winners);
      card.appendChild(actions);
    } else {
      const winners = document.createElement("div");
      winners.className = "raffle-winners";

      (raffle.winners || []).forEach((winner) => {
        const row = document.createElement("div");
        row.className = "raffle-winner";
        row.innerHTML = `<span>#${winner.raffleNumber}</span>${winner.name}`;
        winners.appendChild(row);
      });

      card.appendChild(winners);
    }
    raffleList.appendChild(card);
  });
}

function renderActivity() {
  if (!activityList) return;
  const items = [];

  participants.forEach((entry) => {
    items.push({ title: "Participant added", meta: entry.name, time: entry.createdAt });
  });

  events.forEach((eventItem) => {
    items.push({ title: "Event created", meta: eventItem.name, time: eventItem.createdAt || eventItem.date });
  });

  raffles.forEach((raffle) => {
    const statusValue = raffle.status || (raffle.winners && raffle.winners.length > 0 ? "drawn" : "pending");
    if (statusValue === "drawn") {
      items.push({
        title: "Raffle drawn",
        meta: `${raffle.title} · ${raffle.count} winner${raffle.count === 1 ? "" : "s"}`,
        time: raffle.drawnAt || raffle.createdAt,
      });
    } else {
      items.push({
        title: "Raffle draft",
        meta: `${raffle.title} · Pending draw`,
        time: raffle.createdAt,
      });
    }
  });

  const sorted = items
    .filter((item) => item.time)
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6);

  activityList.innerHTML = "";
  if (sorted.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No recent activity yet.";
    activityList.appendChild(empty);
    return;
  }

  sorted.forEach((item) => {
    const row = document.createElement("div");
    row.className = "activity-item";
    const main = document.createElement("div");
    main.className = "activity-main";
    const title = document.createElement("div");
    title.className = "activity-title";
    title.textContent = item.title;
    const meta = document.createElement("div");
    meta.className = "activity-meta";
    meta.textContent = item.meta;
    main.appendChild(title);
    main.appendChild(meta);
    const time = document.createElement("div");
    time.className = "activity-time";
    time.textContent = formatDateTime(item.time);
    row.appendChild(main);
    row.appendChild(time);
    activityList.appendChild(row);
  });
}

function updateEligibleCount() {
  if (!eligibleCount) return;
  const exclude = raffleExcludeToggle?.checked;
  const audience = raffleAudienceSelect ? raffleAudienceSelect.value : "everyone";
  const count = getEligibleCount(exclude, audience);
  eligibleCount.textContent = `Eligible participants: ${count}`;
  eligibleCount.style.display = "block";
}

function getEligiblePool({ excludePreviousWinners, audience } = {}) {
  const previousWinnerIds = excludePreviousWinners ? getPreviousWinnerIds() : new Set();
  return participants.filter((entry) => {
    if (audience === "family" && !entry.isFamily) return false;
    if (audience === "non-family" && entry.isFamily) return false;
    if (excludePreviousWinners && previousWinnerIds.has(entry.id)) return false;
    return true;
  });
}

function getEligibleCount(excludePreviousWinners, audience) {
  return getEligiblePool({ excludePreviousWinners, audience }).length;
}

function getPreviousWinnerIds() {
  return new Set(
    raffles
      .filter((r) => r.status === "drawn")
      .flatMap((raffle) => (raffle.winners || []).map((winner) => winner.id))
  );
}

function getRaffleFormData() {
  if (!raffleForm) return null;
  const data = new FormData(raffleForm);
  const title = String(data.get("raffleTitle")).trim();
  const eventId = String(data.get("raffleEvent") || "").trim();
  const raffleType = String(data.get("raffleType") || "Minor").trim() || "Minor";
  const count = Number(data.get("raffleCount"));
  const raffleAudience = String(data.get("raffleAudience") || "everyone").trim() || "everyone";
  const excludePreviousWinners = data.get("raffleExcludeWinners") === "on";
  const notes = String(data.get("raffleNotes")).trim();

  if (!title || !Number.isFinite(count) || count < 1) {
    showRaffleHint("Provide a raffle name and winner count.");
    return null;
  }

  return {
    title,
    eventId,
    eventName: events.find((eventItem) => eventItem.id === eventId)?.name || "",
    raffleType,
    count,
    raffleAudience,
    excludePreviousWinners,
    notes,
  };
}

/* ===== Theme ===== */
function applyTheme(theme) {
  activeTheme = theme;
  document.body.dataset.theme = theme;
  themeCards.forEach((card) => {
    card.classList.toggle("is-active", card.dataset.theme === theme);
  });
}

async function saveTheme(theme) {
  await api("/theme", { method: "PUT", body: JSON.stringify({ theme }) });
}

/* ===== Hint helpers (unchanged) ===== */
function showHint(message, isError = true) {
  formHint.textContent = message;
  formHint.style.color = isError ? "var(--danger)" : "var(--success)";
}

function showEventHint(message, isError = true) {
  if (!eventHint) return;
  eventHint.textContent = message;
  eventHint.style.color = isError ? "var(--danger)" : "var(--success)";
}

function showRaffleHint(message, isError = true) {
  if (!raffleHint) return;
  raffleHint.textContent = message;
  raffleHint.style.color = isError ? "var(--danger)" : "var(--success)";
}

function resetHint() {
  formHint.textContent = "";
}

/* ===== Modals ===== */
function showRaffleModal(number) {
  if (!raffleModal || !raffleNumberDisplay) return;
  raffleNumberDisplay.textContent = `#${number}`;
  raffleModal.classList.add("is-visible");
  raffleModal.setAttribute("aria-hidden", "false");
  if (closeRaffleModal) closeRaffleModal.focus();
}

function hideRaffleModal() {
  if (!raffleModal) return;
  raffleModal.classList.remove("is-visible");
  raffleModal.setAttribute("aria-hidden", "true");
  if (document.getElementById("view-participants")?.classList.contains("is-active") && nameInput) {
    requestAnimationFrame(() => nameInput.focus());
  }
}

function makeBadgeClickable(badge, name, raffleNumber) {
  badge.style.cursor = "pointer";
  badge.addEventListener("click", (e) => {
    e.stopPropagation();
    // Remove any existing popup
    const existing = document.querySelector(".badge-popup-backdrop");
    if (existing) existing.remove();

    const backdrop = document.createElement("div");
    backdrop.className = "badge-popup-backdrop";
    const popup = document.createElement("div");
    popup.className = "badge-popup";
    popup.innerHTML =
      `<div class="badge-popup-number">#${raffleNumber}</div>` +
      `<div class="badge-popup-name">${name}</div>`;
    backdrop.appendChild(popup);
    document.body.appendChild(backdrop);

    backdrop.addEventListener("click", () => backdrop.remove());
    popup.addEventListener("click", (ev) => ev.stopPropagation());
  });
}

function showWinnerModal(winners, title) {
  if (!winnerModal || !winnerNumbers) return;
  winnerNumbers.innerHTML = "";
  if (winners.length === 0) {
    winnerNumbers.textContent = "-";
  } else {
    winners.forEach((winner, index) => {
      const badge = document.createElement("div");
      badge.className = "winner-badge";
      badge.dataset.seq = String(index + 1);
      badge.textContent = `#${winner.raffleNumber}`;
      makeBadgeClickable(badge, winner.name, winner.raffleNumber);
      winnerNumbers.appendChild(badge);
    });
  }
  const label = title ? `Winners of ${title}` : "Winners";
  winnerModal.querySelector(".modal-label").textContent = label;
  winnerModal.classList.add("is-visible");
  winnerModal.setAttribute("aria-hidden", "false");
}

function hideWinnerModal() {
  if (!winnerModal) return;
  winnerModal.classList.remove("is-visible");
  winnerModal.setAttribute("aria-hidden", "true");
  if (drawOverlay) drawOverlay.innerHTML = "";
}

/* ===== Mutation functions (now async) ===== */
async function addParticipant(name, isFamily) {
  const entry = await api("/participants", {
    method: "POST",
    body: JSON.stringify({ name, isFamily }),
  });
  participants = [entry, ...participants];
  raffleCounter = entry.raffleNumber + 1;
  renderStats();
  renderList();
  updateEligibleCount();
  return entry;
}

async function removeParticipant(id) {
  await api(`/participants/${id}`, { method: "DELETE" });
  participants = participants.filter((entry) => entry.id !== id);
  raffleCounter = participants.length > 0
    ? Math.max(...participants.map((p) => p.raffleNumber)) + 1
    : 1;
  renderStats();
  renderList();
  updateEligibleCount();
}

async function addEvent(eventItem) {
  const created = await api("/events", {
    method: "POST",
    body: JSON.stringify(eventItem),
  });
  events = [...events, created];
  renderEvents();
  renderStats();
}

async function removeEvent(id) {
  await api(`/events/${id}`, { method: "DELETE" });
  events = events.filter((eventItem) => eventItem.id !== id);
  renderEvents();
  renderStats();
}

async function handleSubmit(event) {
  event.preventDefault();
  resetHint();

  const data = new FormData(form);
  const name = String(data.get("name")).trim();
  const isFamily = data.get("isFamily") === "on";

  if (!name) {
    showHint("Please enter a name.");
    return;
  }

  try {
    const entry = await addParticipant(name, isFamily);
    form.reset();
    showHint("Participant added.", false);
    showRaffleModal(entry.raffleNumber);
  } catch (err) {
    showHint(err.message);
  }
}

async function seedParticipants(count = 400) {
  const confirmed = window.confirm(
    `Add ${count} dummy participants for testing? This will append to your current list.`
  );
  if (!confirmed) return;

  try {
    await api("/participants/seed", {
      method: "POST",
      body: JSON.stringify({ count }),
    });
    await loadParticipants();
    renderStats();
    renderList();
    updateEligibleCount();
    showHint(`${count} dummy participants added.`, false);
  } catch (err) {
    showHint(err.message);
  }
}

async function handleEventSubmit(event) {
  event.preventDefault();
  if (!eventForm) return;
  if (eventHint) eventHint.textContent = "";

  const data = new FormData(eventForm);
  const name = String(data.get("eventName")).trim();
  const date = String(data.get("eventDate")).trim();
  const time = String(data.get("eventTime")).trim();
  const location = String(data.get("eventLocation")).trim();
  const notes = String(data.get("eventNotes")).trim();

  if (!name || !date) {
    showEventHint("Please provide an event name and date.");
    return;
  }

  try {
    await addEvent({ name, date, time, location, notes });
    eventForm.reset();
    showEventHint("Event added.", false);
  } catch (err) {
    showEventHint(err.message);
  }
}

async function handleRaffleDraft() {
  if (raffleHint) raffleHint.textContent = "";

  const raffleData = getRaffleFormData();
  if (!raffleData) return;

  try {
    const created = await api("/raffles", {
      method: "POST",
      body: JSON.stringify(raffleData),
    });
    raffles = [created, ...raffles];
    renderRaffles();
    updateEligibleCount();
    renderStats();
    raffleForm.reset();
    showRaffleHint("Draft saved. Draw when ready.", false);
  } catch (err) {
    showRaffleHint(err.message);
  }
}

/* ===== Draw overlay (emoji/image scatter in winner modal) ===== */
function createDrawOverlay() {
  if (!drawOverlay) return;
  drawOverlay.innerHTML = "";

  const showImages = modeImagesToggle ? modeImagesToggle.checked : true;
  const showEmojis = modeEmojisToggle ? modeEmojisToggle.checked : true;

  const useImages = showImages && customImages.length > 0;
  const useEmojis = showEmojis || (!showImages && customImages.length === 0);

  const cols = 6;
  const rows = 5;
  const totalItems = cols * rows;
  const cellWidth = 80 / cols;
  const cellHeight = 80 / rows;
  const jitter = 6;

  const items = [];

  if (useImages) {
    customImages.forEach((img) => {
      items.push({ type: "image", src: img.url });
    });
  }

  if (useEmojis) {
    while (items.length < totalItems) {
      items.push({
        type: "emoji",
        content: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)]
      });
    }
  } else if (useImages && items.length < totalItems) {
    const imageCount = customImages.length;
    while (items.length < totalItems) {
      const img = customImages[items.length % imageCount];
      items.push({ type: "image", src: img.url });
    }
  }

  // Shuffle
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  let itemIndex = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const food = document.createElement("span");
      food.className = "food-item";

      const item = items[itemIndex++];
      if (item.type === "image") {
        const imgEl = document.createElement("img");
        imgEl.src = item.src;
        imgEl.alt = "Custom image";
        food.appendChild(imgEl);
      } else {
        food.textContent = item.content;
      }

      const baseX = 10 + col * cellWidth + cellWidth / 2;
      const baseY = 10 + row * cellHeight + cellHeight / 2;
      const x = baseX + (Math.random() * jitter * 2 - jitter);
      const y = baseY + (Math.random() * jitter * 2 - jitter);

      food.style.left = `${x}%`;
      food.style.top = `${y}%`;
      food.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 40 - 20}deg)`;

      drawOverlay.appendChild(food);
    }
  }
}

function scatterDrawOverlay() {
  if (!drawOverlay) return;
  const items = drawOverlay.querySelectorAll(".food-item");

  items.forEach((item, index) => {
    const angle = Math.random() * 360;
    const distance = 500 + Math.random() * 400;
    const tx = Math.cos(angle * Math.PI / 180) * distance;
    const ty = Math.sin(angle * Math.PI / 180) * distance;
    const rotation = Math.random() * 720 - 360;

    setTimeout(() => {
      item.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${rotation}deg)`;
      item.classList.add("is-scattered");
    }, index * 40);
  });
}

/* ===== Animated raffle draw ===== */
async function drawRaffleNow(raffleId) {
  if (drawInProgress) return;
  drawInProgress = true;

  const raffle = raffles.find((r) => r.id === raffleId);
  const count = raffle ? raffle.count : 1;
  const maxNum = (raffleCounter - 1) || 100;

  // Open the winner modal immediately with animating placeholder badges
  winnerNumbers.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const badge = document.createElement("div");
    badge.className = "winner-badge is-animating";
    badge.textContent = "#?";
    winnerNumbers.appendChild(badge);
  }
  winnerModal.querySelector(".modal-label").textContent = `Drawing ${raffle.title}...`;
  winnerModal.classList.add("is-visible");
  winnerModal.setAttribute("aria-hidden", "false");

  // Fill modal with emoji/image overlay
  createDrawOverlay();

  // Start randomizing each badge
  const badges = [...winnerNumbers.querySelectorAll(".winner-badge")];
  const intervals = badges.map((badge) =>
    setInterval(() => {
      badge.textContent = "#" + (Math.floor(Math.random() * maxNum) + 1);
    }, 50)
  );

  const modalOpenedAt = Date.now();

  try {
    // Fire API call (runs during animation)
    const updated = await api(`/raffles/${raffleId}/draw`, { method: "PUT" });

    // Collect final winners
    let finalWinners;
    if (updated.status === "drawing") {
      // Major draw — reveal all pending winners via API
      finalWinners = [];
      const pendingCount = (updated.winners || []).filter((w) => w.isPending).length;
      let latestRaffle = updated;
      for (let i = 0; i < pendingCount; i++) {
        const result = await api(`/raffles/${raffleId}/reveal`, { method: "PUT" });
        finalWinners.push(result.revealed);
        if (result.remaining === 0) {
          latestRaffle = result.raffle;
        }
      }
      raffles = raffles.map((r) => (r.id === raffleId ? latestRaffle : r));
    } else {
      // Minor draw — winners already in response
      finalWinners = updated.winners || [];
      raffles = raffles.map((r) => (r.id === raffleId ? updated : r));
    }

    // Scatter the overlay away before revealing badges
    const elapsed = Date.now() - modalOpenedAt;
    const scatterDelay = Math.max(800 - elapsed, 100);
    setTimeout(() => scatterDrawOverlay(), scatterDelay);

    // Staggered reveal left to right
    const minDelay = Math.max(1500 - elapsed, 200);
    let delay = minDelay;

    badges.forEach((badge, i) => {
      const winner = finalWinners[i];
      setTimeout(() => {
        clearInterval(intervals[i]);
        badge.textContent = `#${winner.raffleNumber}`;
        badge.dataset.seq = String(i + 1);
        badge.classList.remove("is-animating");
        badge.classList.add("is-revealed");
        makeBadgeClickable(badge, winner.name, winner.raffleNumber);

        // On last badge, finalize
        if (i === badges.length - 1) {
          winnerModal.querySelector(".modal-label").textContent = `Winners of ${raffle.title}`;
          renderRaffles();
          updateEligibleCount();
          renderStats();
          drawInProgress = false;
        }
      }, delay);

      delay += 300 + Math.random() * 400; // 300-700ms between each
    });
  } catch (err) {
    // On error: stop all animations, clear overlay, close modal, show error
    intervals.forEach(clearInterval);
    if (drawOverlay) drawOverlay.innerHTML = "";
    hideWinnerModal();
    showRaffleHint(err.message);
    drawInProgress = false;
  }
}

async function revealNextWinner(raffleId) {
  try {
    const result = await api(`/raffles/${raffleId}/reveal`, { method: "PUT" });
    raffles = raffles.map((r) => (r.id === raffleId ? result.raffle : r));
    renderRaffles();
    updateEligibleCount();
    renderStats();
    if (result.remaining === 0) {
      showRaffleHint("All winners revealed!", false);
    }
  } catch (err) {
    showRaffleHint(err.message);
  }
}

async function clearRaffles() {
  const confirmed = window.confirm("Clear all recent draws? This cannot be undone.");
  if (!confirmed) return;

  await api("/raffles", { method: "DELETE" });
  raffles = [];
  renderRaffles();
  updateEligibleCount();
  renderStats();
  showRaffleHint("All draws cleared.", false);
}

async function clearParticipants() {
  const confirmed = window.confirm("Clear all participants? This cannot be undone.");
  if (!confirmed) return;

  await api("/participants", { method: "DELETE" });
  participants = [];
  raffleCounter = 1;
  renderStats();
  renderList();
  updateEligibleCount();
  showHint("All participants cleared.", false);
}

async function exportParticipants() {
  if (participants.length === 0) {
    showHint("Add participants before exporting.");
    return;
  }
  // Download CSV from server
  const link = document.createElement("a");
  link.href = "/api/participants/export";
  link.download = "participants.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/* ===== Image handling (now using server uploads) ===== */
async function handleImageUpload(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("images", file));

  try {
    const res = await fetch("/api/images", { method: "POST", body: formData });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Upload failed");
    }
    const saved = await res.json();
    customImages = [...customImages, ...saved];
    renderImagesPreview();
  } catch (err) {
    alert(err.message);
  }

  event.target.value = "";
}

async function clearCustomImages() {
  if (!confirm("Clear all uploaded images?")) return;
  await api("/images", { method: "DELETE" });
  customImages = [];
  renderImagesPreview();
}

function renderImagesPreview() {
  if (!imagesPreview) return;

  if (customImages.length === 0) {
    imagesPreview.innerHTML = '<span class="empty">No custom images. Using default emojis.</span>';
    return;
  }

  const countLabel = `<div class="preview-count">${customImages.length} image${customImages.length === 1 ? "" : "s"} uploaded</div>`;
  const thumbs = customImages
    .map((img) => `<img src="${img.url}" class="preview-thumb" alt="Custom image" />`)
    .join("");
  imagesPreview.innerHTML = countLabel + `<div class="preview-thumbs">${thumbs}</div>`;
}

/* ===== View navigation (unchanged) ===== */
function setActiveView(viewId) {
  views.forEach((view) => {
    view.classList.toggle("is-active", view.id === viewId);
  });
  navItems.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.view === viewId.replace("view-", ""));
  });
  if (viewId === "view-participants" && nameInput) requestAnimationFrame(() => nameInput.focus());
  if (viewId === "view-events" && eventNameInput) requestAnimationFrame(() => eventNameInput.focus());
  if (viewId === "view-raffles" && raffleCountInput) requestAnimationFrame(() => raffleCountInput.focus());
}

/* ===== Number Generator (unchanged except image URLs) ===== */
const FOOD_EMOJIS = [
  "\u{1F355}", "\u{1F354}", "\u{1F35F}", "\u{1F32D}", "\u{1F37F}", "\u{1F9C0}", "\u{1F953}", "\u{1F357}", "\u{1F356}", "\u{1F969}",
  "\u{1F364}", "\u{1F373}", "\u{1F95A}", "\u{1F95E}", "\u{1F9C7}", "\u{1F950}", "\u{1F35E}", "\u{1F96F}", "\u{1F9C1}", "\u{1F370}",
  "\u{1F369}", "\u{1F36A}", "\u{1F382}", "\u{1F36B}", "\u{1F36C}", "\u{1F36D}", "\u{1F36E}", "\u{1F366}", "\u{1F368}", "\u{1F367}",
  "\u{1F95D}", "\u{1F353}", "\u{1F352}", "\u{1F351}", "\u{1F34A}", "\u{1F34B}", "\u{1F34C}", "\u{1F349}", "\u{1F347}", "\u{1F34E}"
];

let generatorHistoryList = [];
let numberAnimationInterval = null;

function createFoodOverlay() {
  if (!foodOverlay) return;
  foodOverlay.innerHTML = "";

  const showImages = modeImagesToggle ? modeImagesToggle.checked : true;
  const showEmojis = modeEmojisToggle ? modeEmojisToggle.checked : true;

  const useImages = showImages && customImages.length > 0;
  const useEmojis = showEmojis || (!showImages && customImages.length === 0);

  const cols = 5;
  const rows = 5;
  const totalItems = cols * rows;
  const cellWidth = 80 / cols;
  const cellHeight = 80 / rows;
  const jitter = 6;

  const items = [];

  if (useImages) {
    customImages.forEach((img) => {
      items.push({ type: "image", src: img.url });
    });
  }

  if (useEmojis) {
    while (items.length < totalItems) {
      items.push({
        type: "emoji",
        content: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)]
      });
    }
  } else if (useImages && items.length < totalItems) {
    const imageCount = customImages.length;
    while (items.length < totalItems) {
      const img = customImages[items.length % imageCount];
      items.push({ type: "image", src: img.url });
    }
  }

  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  let itemIndex = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const food = document.createElement("span");
      food.className = "food-item";

      const item = items[itemIndex++];
      if (item.type === "image") {
        const imgEl = document.createElement("img");
        imgEl.src = item.src;
        imgEl.alt = "Custom image";
        food.appendChild(imgEl);
      } else {
        food.textContent = item.content;
      }

      const baseX = 10 + col * cellWidth + cellWidth / 2;
      const baseY = 10 + row * cellHeight + cellHeight / 2;
      const x = baseX + (Math.random() * jitter * 2 - jitter);
      const y = baseY + (Math.random() * jitter * 2 - jitter);

      food.style.left = `${x}%`;
      food.style.top = `${y}%`;
      food.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 40 - 20}deg)`;

      foodOverlay.appendChild(food);
    }
  }
}

function scatterFood() {
  if (!foodOverlay) return;
  const items = foodOverlay.querySelectorAll(".food-item");

  items.forEach((item, index) => {
    const angle = Math.random() * 360;
    const distance = 400 + Math.random() * 300;
    const tx = Math.cos(angle * Math.PI / 180) * distance;
    const ty = Math.sin(angle * Math.PI / 180) * distance;
    const rotation = Math.random() * 720 - 360;

    setTimeout(() => {
      item.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${rotation}deg)`;
      item.classList.add("is-scattered");
    }, index * 50);
  });
}

function startNumberAnimation(min, max) {
  if (!generatorNumber) return;
  if (numberAnimationInterval) clearInterval(numberAnimationInterval);
  numberAnimationInterval = setInterval(() => {
    const randomDisplay = Math.floor(Math.random() * (max - min + 1)) + min;
    generatorNumber.textContent = randomDisplay;
  }, 50);
}

function stopNumberAnimation(finalNumber) {
  if (numberAnimationInterval) {
    clearInterval(numberAnimationInterval);
    numberAnimationInterval = null;
  }
  if (generatorNumber) generatorNumber.textContent = finalNumber;
}

function generateNumber() {
  if (!genMin || !genMax || !generatorNumber) return;

  const min = parseInt(genMin.value) || 1;
  const max = parseInt(genMax.value) || 100;

  if (min >= max) return;

  const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;

  generatorNumber.classList.remove("is-hidden");
  startNumberAnimation(min, max);
  createFoodOverlay();

  setTimeout(() => {
    scatterFood();
    setTimeout(() => {
      stopNumberAnimation(randomNum);
    }, 1500);
  }, 600);

  generatorHistoryList.unshift(randomNum);
  if (generatorHistoryList.length > 10) generatorHistoryList.pop();
  renderGeneratorHistory();
}

function renderGeneratorHistory() {
  if (!generatorHistory) return;
  if (generatorHistoryList.length === 0) {
    generatorHistory.innerHTML = '<div class="empty">No numbers generated yet.</div>';
    return;
  }
  generatorHistory.innerHTML = `
    <div class="history-list">
      ${generatorHistoryList.map((num) => `<span class="history-item">${num}</span>`).join("")}
    </div>
  `;
}

/* ===== Event listeners ===== */
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const target = item.dataset.view;
    if (!target) return;
    setActiveView(`view-${target}`);
  });
});

themeCards.forEach((card) => {
  card.addEventListener("click", () => {
    const theme = card.dataset.theme || "default";
    applyTheme(theme);
    saveTheme(theme);
  });
});

if (raffleModal) {
  raffleModal.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.close) {
      hideRaffleModal();
    }
  });
}

if (winnerModal) {
  winnerModal.addEventListener("click", () => {
    if (drawInProgress) return; // Don't allow closing during draw animation
    hideWinnerModal();
  });
}

if (closeRaffleModal) {
  closeRaffleModal.addEventListener("click", hideRaffleModal);
}

document.addEventListener("keydown", (event) => {
  if (!raffleModal || !raffleModal.classList.contains("is-visible")) return;
  if (event.key === "Enter") {
    event.preventDefault();
    hideRaffleModal();
  }
});

form.addEventListener("submit", handleSubmit);
searchInput.addEventListener("input", renderList);
if (filterFamily) filterFamily.addEventListener("change", renderList);
exportCsv.addEventListener("click", exportParticipants);
clearAll.addEventListener("click", clearParticipants);
if (seedParticipantsButton) seedParticipantsButton.addEventListener("click", () => seedParticipants(400));
if (eventForm) eventForm.addEventListener("submit", handleEventSubmit);
if (createRaffleDraftButton) createRaffleDraftButton.addEventListener("click", handleRaffleDraft);
if (raffleForm) raffleForm.addEventListener("reset", () => requestAnimationFrame(updateEligibleCount));
if (clearRafflesButton) clearRafflesButton.addEventListener("click", clearRaffles);
if (raffleExcludeToggle) raffleExcludeToggle.addEventListener("change", updateEligibleCount);
if (raffleAudienceSelect) raffleAudienceSelect.addEventListener("change", updateEligibleCount);
if (generateBtn) generateBtn.addEventListener("click", generateNumber);
if (imageUpload) imageUpload.addEventListener("change", handleImageUpload);
if (clearImagesBtn) clearImagesBtn.addEventListener("click", clearCustomImages);

/* ===== Async init ===== */
async function initApp() {
  try {
    await Promise.all([
      loadParticipants(),
      loadEvents(),
      loadRaffles(),
      loadTheme(),
      loadCustomImages(),
    ]);
  } catch (err) {
    console.error("Failed to load data from API:", err);
  }

  renderStats();
  renderList();
  renderEvents();
  renderRaffles();
  applyTheme(activeTheme);
  setActiveView("view-dashboard");
  updateEligibleCount();
  renderGeneratorHistory();
  renderImagesPreview();
}

initApp();
