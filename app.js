const STORAGE_KEY = "raffler_participants";
const EVENTS_KEY = "raffler_events";
const RAFFLES_KEY = "raffler_raffles";
const THEME_KEY = "raffler_theme";

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

let participants = loadParticipants();
let raffleCounter = getNextRaffleNumber();
let events = loadEvents();
let raffles = loadRaffles();
let activeTheme = loadTheme();
let drawInProgress = false;

function loadParticipants() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function loadEvents() {
  const raw = localStorage.getItem(EVENTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function loadRaffles() {
  const raw = localStorage.getItem(RAFFLES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveParticipants() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(participants));
}

function saveEvents() {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

function saveRaffles() {
  localStorage.setItem(RAFFLES_KEY, JSON.stringify(raffles));
}

function loadTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  return stored || "default";
}

function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

function getNextRaffleNumber() {
  if (participants.length === 0) return 1;
  const max = participants.reduce((currentMax, entry) => {
    const value = Number(entry.raffleNumber) || 0;
    return Math.max(currentMax, value);
  }, 0);
  return max + 1;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatEventDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatEventTime(timeValue) {
  if (!timeValue) return "";
  const [hours, minutes] = timeValue.split(":");
  if (!hours || !minutes) return timeValue;
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderStats() {
  statTotal.textContent = participants.length;
  if (statNext) {
    statNext.textContent = raffleCounter;
  }
  const last = participants[0];
  statLast.textContent = last ? formatDate(last.createdAt) : "-";
  if (statEvents) {
    statEvents.textContent = events.length;
  }
  if (statRaffles) {
    statRaffles.textContent = raffles.length;
  }
  if (statPending) {
    statPending.textContent = raffles.filter((raffle) => {
      const statusValue =
        raffle.status || (raffle.winners && raffle.winners.length > 0 ? "drawn" : "pending");
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
      showButton.addEventListener("click", () => showWinnerModal(raffle.winners || []));
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
    } else {
      const winners = document.createElement("div");
      winners.className = "raffle-winners";

      if (statusValue === "drawing") {
        const loadingRow = document.createElement("div");
        loadingRow.className = "raffle-loading";
        const spinner = document.createElement("div");
        spinner.className = "spinner";
        const label = document.createElement("div");
        label.textContent = "Drawing winners...";
        loadingRow.appendChild(spinner);
        loadingRow.appendChild(label);
        winners.appendChild(loadingRow);
      }

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
    items.push({
      title: "Participant added",
      meta: entry.name,
      time: entry.createdAt,
    });
  });

  events.forEach((eventItem) => {
    items.push({
      title: "Event created",
      meta: eventItem.name,
      time: eventItem.createdAt || eventItem.date,
    });
  });

  raffles.forEach((raffle) => {
    const statusValue =
      raffle.status || (raffle.winners && raffle.winners.length > 0 ? "drawn" : "pending");
    if (statusValue === "drawn") {
      items.push({
        title: `Raffle drawn`,
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
  return participants.filter((entry) => {
    if (audience === "family" && !entry.isFamily) return false;
    if (audience === "non-family" && entry.isFamily) return false;
    if (excludePreviousWinners && getPreviousWinnerIds().has(entry.id)) return false;
    return true;
  });
}

function getEligibleCount(excludePreviousWinners, audience) {
  return getEligiblePool({ excludePreviousWinners, audience }).length;
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

function applyTheme(theme) {
  activeTheme = theme;
  document.body.dataset.theme = theme;
  themeCards.forEach((card) => {
    card.classList.toggle("is-active", card.dataset.theme === theme);
  });
}

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

function addParticipant(entry) {
  participants = [entry, ...participants];
  saveParticipants();
  raffleCounter = getNextRaffleNumber();
  renderStats();
  renderList();
  updateEligibleCount();
}

function addEvent(eventItem) {
  events = [...events, eventItem];
  saveEvents();
  renderEvents();
  renderStats();
}

function addRaffle(raffle) {
  raffles = [raffle, ...raffles];
  saveRaffles();
  renderRaffles();
  updateEligibleCount();
  renderStats();
}

function clearRaffles() {
  const confirmed = window.confirm("Clear all recent draws? This cannot be undone.");
  if (!confirmed) return;
  raffles = [];
  saveRaffles();
  renderRaffles();
  updateEligibleCount();
  renderStats();
  showRaffleHint("All draws cleared.", false);
}

function showRaffleModal(number) {
  if (!raffleModal || !raffleNumberDisplay) return;
  raffleNumberDisplay.textContent = `#${number}`;
  raffleModal.classList.add("is-visible");
  raffleModal.setAttribute("aria-hidden", "false");
  if (closeRaffleModal) {
    closeRaffleModal.focus();
  }
}

function hideRaffleModal() {
  if (!raffleModal) return;
  raffleModal.classList.remove("is-visible");
  raffleModal.setAttribute("aria-hidden", "true");
  if (document.getElementById("view-participants")?.classList.contains("is-active") && nameInput) {
    requestAnimationFrame(() => nameInput.focus());
  }
}

function showWinnerModal(winners) {
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
      winnerNumbers.appendChild(badge);
    });
  }
  winnerModal.classList.add("is-visible");
  winnerModal.setAttribute("aria-hidden", "false");
}

function hideWinnerModal() {
  if (!winnerModal) return;
  winnerModal.classList.remove("is-visible");
  winnerModal.setAttribute("aria-hidden", "true");
}

function removeParticipant(id) {
  participants = participants.filter((entry) => entry.id !== id);
  saveParticipants();
  raffleCounter = getNextRaffleNumber();
  renderStats();
  renderList();
  updateEligibleCount();
}

function removeEvent(id) {
  events = events.filter((eventItem) => eventItem.id !== id);
  saveEvents();
  renderEvents();
  renderStats();
}

function handleSubmit(event) {
  event.preventDefault();
  resetHint();

  const data = new FormData(form);
  const name = String(data.get("name")).trim();
  const isFamily = data.get("isFamily") === "on";

  if (!name) {
    showHint("Please enter a name.");
    return;
  }

  const entry = {
    id: crypto.randomUUID(),
    name,
    isFamily,
    raffleNumber: raffleCounter,
    createdAt: new Date().toISOString(),
  };

  addParticipant(entry);
  form.reset();
  showHint("Participant added.", false);
  showRaffleModal(entry.raffleNumber);
}

function seedParticipants(count = 400) {
  const confirmed = window.confirm(
    `Add ${count} dummy participants for testing? This will append to your current list.`
  );
  if (!confirmed) return;

  const startNumber = raffleCounter;
  const now = Date.now();
  const familyQuota = Math.min(40, count);
  const generated = Array.from({ length: count }, (_, index) => {
    const raffleNumber = startNumber + index;
    const nameSuffix = String(raffleNumber).padStart(3, "0");
    return {
      id: crypto.randomUUID(),
      name: `Test Participant ${nameSuffix}`,
      isFamily: index < familyQuota,
      raffleNumber,
      createdAt: new Date(now - index * 1000).toISOString(),
    };
  });

  participants = [...generated, ...participants];
  saveParticipants();
  raffleCounter = getNextRaffleNumber();
  renderStats();
  renderList();
  updateEligibleCount();
  showHint(`${count} dummy participants added.`, false);
}

function handleEventSubmit(event) {
  event.preventDefault();
  if (!eventForm) return;
  if (eventHint) {
    eventHint.textContent = "";
  }

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

  const eventItem = {
    id: crypto.randomUUID(),
    name,
    date,
    time,
    location,
    notes,
    createdAt: new Date().toISOString(),
  };

  addEvent(eventItem);
  eventForm.reset();
  showEventHint("Event added.", false);
}

function getPreviousWinnerIds() {
  return new Set(
    raffles.flatMap((raffle) => raffle.winners.map((winner) => winner.id))
  );
}

function pickWinners(count, { excludePreviousWinners, audience } = {}) {
  const pool = getEligiblePool({ excludePreviousWinners, audience });
  return shuffle(pool).slice(0, count).map((entry) => ({
    id: entry.id,
    name: entry.name,
    raffleNumber: entry.raffleNumber,
  }));
}

function shuffle(list) {
  const pool = [...list];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

function handleRaffleSubmit(event) {
  event.preventDefault();
  if (raffleHint) {
    raffleHint.textContent = "";
  }

  const raffleData = getRaffleFormData();
  if (!raffleData) return;

  const eligibleCount = getEligibleCount(raffleData.excludePreviousWinners, raffleData.raffleAudience);
  if (eligibleCount < raffleData.count) {
    showRaffleHint("Not enough eligible participants for that many winners.");
    return;
  }

  const winners = pickWinners(raffleData.count, {
    excludePreviousWinners: raffleData.excludePreviousWinners,
    audience: raffleData.raffleAudience,
  });

  const raffle = {
    id: crypto.randomUUID(),
    ...raffleData,
    winners,
    status: "drawn",
    createdAt: new Date().toISOString(),
    drawnAt: new Date().toISOString(),
  };

  addRaffle(raffle);
  raffleForm.reset();
  showRaffleHint("Winners drawn!", false);
}

function handleRaffleDraft() {
  if (raffleHint) {
    raffleHint.textContent = "";
  }

  const raffleData = getRaffleFormData();
  if (!raffleData) return;

  const raffle = {
    id: crypto.randomUUID(),
    ...raffleData,
    winners: [],
    status: "pending",
    createdAt: new Date().toISOString(),
    drawnAt: null,
  };

  addRaffle(raffle);
  raffleForm.reset();
  showRaffleHint("Draft saved. Draw when ready.", false);
}

function drawRaffleNow(raffleId) {
  const raffleIndex = raffles.findIndex((entry) => entry.id === raffleId);
  if (raffleIndex === -1) return;
  const raffle = raffles[raffleIndex];
  if (raffle.status === "drawn" || (raffle.winners && raffle.winners.length > 0)) return;

  if (drawInProgress) return;

  const eligibleCount = getEligibleCount(raffle.excludePreviousWinners, raffle.raffleAudience);
  if (eligibleCount < raffle.count) {
    showRaffleHint("Not enough eligible participants for that many winners.");
    return;
  }

  if (raffle.raffleType === "Major") {
    startMajorDraw(raffleId);
    return;
  }

  completeRaffleDraw(raffleId);
}

function completeRaffleDraw(raffleId) {
  const raffleIndex = raffles.findIndex((entry) => entry.id === raffleId);
  if (raffleIndex === -1) return;
  const raffle = raffles[raffleIndex];
  if (raffle.status === "drawn" || (raffle.winners && raffle.winners.length > 0)) return;

  const eligibleCount = getEligibleCount(raffle.excludePreviousWinners);
  if (eligibleCount < raffle.count) {
    showRaffleHint("Not enough eligible participants for that many winners.");
    return;
  }

  const winners = pickWinners(raffle.count, {
    excludePreviousWinners: raffle.excludePreviousWinners,
    audience: raffle.raffleAudience,
  });

  const updated = {
    ...raffle,
    winners,
    status: "drawn",
    drawnAt: new Date().toISOString(),
  };

  raffles = raffles.map((entry) => (entry.id === raffleId ? updated : entry));
  saveRaffles();
  renderRaffles();
  updateEligibleCount();
  renderStats();
  showRaffleHint("Winners drawn!", false);
}

function startMajorDraw(raffleId) {
  drawInProgress = true;
  const raffleIndex = raffles.findIndex((entry) => entry.id === raffleId);
  if (raffleIndex === -1) {
    drawInProgress = false;
    return;
  }
  const raffle = raffles[raffleIndex];

  const eligibleCount = getEligibleCount(raffle.excludePreviousWinners, raffle.raffleAudience);
  if (eligibleCount < raffle.count) {
    showRaffleHint("Not enough eligible participants for that many winners.");
    drawInProgress = false;
    return;
  }

  const pendingWinners = pickWinners(raffle.count, {
    excludePreviousWinners: raffle.excludePreviousWinners,
    audience: raffle.raffleAudience,
  });

  let revealed = [];
  const updated = {
    ...raffle,
    winners: revealed,
    pendingWinners,
    status: "drawing",
    drawnAt: null,
  };

  raffles = raffles.map((entry) => (entry.id === raffleId ? updated : entry));
  saveRaffles();
  renderRaffles();

  const timer = setInterval(() => {
    const current = raffles.find((entry) => entry.id === raffleId);
    if (!current || !current.pendingWinners || current.pendingWinners.length === 0) {
      clearInterval(timer);
      const finished = {
        ...current,
        status: "drawn",
        pendingWinners: [],
        drawnAt: new Date().toISOString(),
      };
      raffles = raffles.map((entry) => (entry.id === raffleId ? finished : entry));
      saveRaffles();
      renderRaffles();
      updateEligibleCount();
      renderStats();
      showRaffleHint("Winners drawn!", false);
      drawInProgress = false;
      return;
    }

    const nextWinner = current.pendingWinners[0];
    revealed = [...(current.winners || []), nextWinner];
    const remaining = current.pendingWinners.slice(1);
    const partial = {
      ...current,
      winners: revealed,
      pendingWinners: remaining,
      status: "drawing",
    };
    raffles = raffles.map((entry) => (entry.id === raffleId ? partial : entry));
    saveRaffles();
    renderRaffles();

    if (remaining.length === 0) {
      clearInterval(timer);
      const finished = {
        ...partial,
        status: "drawn",
        pendingWinners: [],
        drawnAt: new Date().toISOString(),
      };
      raffles = raffles.map((entry) => (entry.id === raffleId ? finished : entry));
      saveRaffles();
      renderRaffles();
      updateEligibleCount();
      renderStats();
      showRaffleHint("Winners drawn!", false);
      drawInProgress = false;
    }
  }, 3000);
}

function exportParticipants() {
  if (participants.length === 0) {
    showHint("Add participants before exporting.");
    return;
  }

  const header = ["Raffle Number", "Name", "Family Member", "Created At"];
  const rows = participants.map((entry) => [
    entry.raffleNumber,
    entry.name,
    entry.isFamily ? "Yes" : "No",
    entry.createdAt,
  ]);

  const csv = [header, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "participants.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function clearParticipants() {
  const confirmed = window.confirm("Clear all participants? This cannot be undone.");
  if (!confirmed) return;
  participants = [];
  raffleCounter = 1;
  saveParticipants();
  renderStats();
  renderList();
  updateEligibleCount();
  showHint("All participants cleared.", false);
}

function setActiveView(viewId) {
  views.forEach((view) => {
    view.classList.toggle("is-active", view.id === viewId);
  });
  navItems.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.view === viewId.replace("view-", ""));
  });
  if (viewId === "view-participants" && nameInput) {
    requestAnimationFrame(() => nameInput.focus());
  }
  if (viewId === "view-events" && eventNameInput) {
    requestAnimationFrame(() => eventNameInput.focus());
  }
  if (viewId === "view-raffles" && raffleCountInput) {
    requestAnimationFrame(() => raffleCountInput.focus());
  }
}

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
if (filterFamily) {
  filterFamily.addEventListener("change", renderList);
}
exportCsv.addEventListener("click", exportParticipants);
clearAll.addEventListener("click", clearParticipants);
if (seedParticipantsButton) {
  seedParticipantsButton.addEventListener("click", () => seedParticipants(400));
}
if (eventForm) {
  eventForm.addEventListener("submit", handleEventSubmit);
}
if (createRaffleDraftButton) {
  createRaffleDraftButton.addEventListener("click", handleRaffleDraft);
}
if (raffleForm) {
  raffleForm.addEventListener("reset", () => {
    requestAnimationFrame(updateEligibleCount);
  });
}
if (clearRafflesButton) {
  clearRafflesButton.addEventListener("click", clearRaffles);
}
if (raffleExcludeToggle) {
  raffleExcludeToggle.addEventListener("change", updateEligibleCount);
}
if (raffleAudienceSelect) {
  raffleAudienceSelect.addEventListener("change", updateEligibleCount);
}

renderStats();
renderList();
renderEvents();
renderRaffles();
applyTheme(activeTheme);
setActiveView("view-dashboard");
updateEligibleCount();

// Number Generator
const genMin = document.getElementById("genMin");
const genMax = document.getElementById("genMax");
const generateBtn = document.getElementById("generateBtn");
const generatorNumber = document.getElementById("generatorNumber");
const foodOverlay = document.getElementById("foodOverlay");
const generatorHistory = document.getElementById("generatorHistory");

const FOOD_EMOJIS = [
  "🍕", "🍔", "🍟", "🌭", "🍿", "🧀", "🥓", "🍗", "🍖", "🥩",
  "🍤", "🍳", "🥚", "🥞", "🧇", "🥐", "🍞", "🥯", "🧁", "🍰",
  "🍩", "🍪", "🎂", "🍫", "🍬", "🍭", "🍮", "🍦", "🍨", "🍧",
  "🥝", "🍓", "🍒", "🍑", "🍊", "🍋", "🍌", "🍉", "🍇", "🍎"
];

let generatorHistoryList = [];

function createFoodOverlay() {
  foodOverlay.innerHTML = "";
  const count = 25; // Number of food items

  for (let i = 0; i < count; i++) {
    const food = document.createElement("span");
    food.className = "food-item";
    food.textContent = FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];

    // Random position within the display area
    const x = Math.random() * 80 + 10; // 10-90%
    const y = Math.random() * 80 + 10;
    food.style.left = `${x}%`;
    food.style.top = `${y}%`;
    food.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 40 - 20}deg)`;

    foodOverlay.appendChild(food);
  }
}

function scatterFood() {
  const items = foodOverlay.querySelectorAll(".food-item");

  items.forEach((item, index) => {
    // Random scatter direction
    const angle = Math.random() * 360;
    const distance = 400 + Math.random() * 300;
    const tx = Math.cos(angle * Math.PI / 180) * distance;
    const ty = Math.sin(angle * Math.PI / 180) * distance;
    const rotation = Math.random() * 720 - 360;

    // Staggered animation
    setTimeout(() => {
      item.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${rotation}deg)`;
      item.classList.add("is-scattered");
    }, index * 30);
  });
}

function generateNumber() {
  const min = parseInt(genMin.value) || 1;
  const max = parseInt(genMax.value) || 100;

  if (min >= max) {
    return;
  }

  // Generate random number
  const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;

  // Reset display
  generatorNumber.classList.add("is-hidden");
  createFoodOverlay();

  // Animate after brief pause
  setTimeout(() => {
    generatorNumber.textContent = randomNum;
    scatterFood();

    setTimeout(() => {
      generatorNumber.classList.remove("is-hidden");
    }, 400);
  }, 500);

  // Add to history
  generatorHistoryList.unshift(randomNum);
  if (generatorHistoryList.length > 10) {
    generatorHistoryList.pop();
  }
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
      ${generatorHistoryList.map(num => `<span class="history-item">${num}</span>`).join("")}
    </div>
  `;
}

// Event listeners
if (generateBtn) {
  generateBtn.addEventListener("click", generateNumber);
}

// Initialize
renderGeneratorHistory();
