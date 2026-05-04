const STORAGE_KEY = 'gardenplaner-state-v1';
const SETTINGS_STORAGE_KEY = 'gardenplaner-settings-v1';
const KEY_DB_NAME = 'gardenplaner-secure-db';
const KEY_STORE_NAME = 'keys';
const KEY_ID = 'settings-key';

const gardenForm = document.getElementById('garden-form');
const plantForm = document.getElementById('plant-form');
const reminderForm = document.getElementById('reminder-form');

const gardenHeaderWidget = document.getElementById('garden-header-widget');
const plantList = document.getElementById('plant-list');
const planner = document.getElementById('planner');
const weatherWidget = document.getElementById('weather-widget');
const openGardenMenuButton = document.getElementById('open-garden-menu');
const gardenMenuDialog = document.getElementById('garden-menu-dialog');
const openSettingsButton = document.getElementById('open-settings');
const settingsDialog = document.getElementById('settings-dialog');
const settingsForm = document.getElementById('settings-form');

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const defaultReminders = {
  January: ['Check and clean tools'],
  February: ['Prepare cold frames'],
  March: ['Loosen soil and plan first sowing'],
  April: ['Mow the lawn for the first time', 'Start spring fertilization'],
  May: ['Regularly check for slugs'],
  June: ['Mulch to prevent drying out'],
  July: ['Water early in the morning during heat'],
  August: ['Prune faded flowers'],
  September: ['Plant autumn vegetables'],
  October: ['Compost fallen leaves'],
  November: ['Protect container plants from frost'],
  December: ['Garden rest & planning for next year']
};

function normalizeReminderEntries(entries = []) {
  return entries
    .map((entry) => {
      if (typeof entry === 'string') return { text: entry, done: false };
      if (entry && typeof entry.text === 'string') {
        return { text: entry.text, done: Boolean(entry.done) };
      }
      return null;
    })
    .filter((entry) => entry && entry.text.trim());
}

function normalizeRemindersMap(reminders = {}) {
  const normalized = {};
  months.forEach((month) => {
    normalized[month] = normalizeReminderEntries(reminders[month] || defaultReminders[month] || []);
  });
  return normalized;
}

function createInitialState() {
  return {
    garden: {
      title: '',
      icon: '',
      location: '',
      soil: 'Loamy',
      lawn: 'Yes',
      description: ''
    },
    plants: [],
    reminders: normalizeRemindersMap(defaultReminders)
  };
}

function createInitialSettings() {
  return {
    language: 'de',
    appId: '',
    clientSecret: ''
  };
}

function openKeyDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(KEY_DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(KEY_STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getOrCreateCryptoKey() {
  const db = await openKeyDatabase();
  const key = await new Promise((resolve, reject) => {
    const tx = db.transaction(KEY_STORE_NAME, 'readwrite');
    const store = tx.objectStore(KEY_STORE_NAME);
    const getReq = store.get(KEY_ID);

    getReq.onsuccess = async () => {
      if (getReq.result) {
        resolve(getReq.result);
        return;
      }
      const newKey = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      const addReq = store.put(newKey, KEY_ID);
      addReq.onsuccess = () => resolve(newKey);
      addReq.onerror = () => reject(addReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
  db.close();
  return key;
}

function bytesToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBytes(base64) {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

async function encryptSettings(settings) {
  const key = await getOrCreateCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(settings));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return {
    iv: bytesToBase64(iv),
    data: bytesToBase64(ciphertext)
  };
}

async function decryptSettings(payload) {
  const key = await getOrCreateCryptoKey();
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(payload.iv) },
    key,
    base64ToBytes(payload.data)
  );
  return JSON.parse(new TextDecoder().decode(plaintext));
}

async function saveSettings(settings) {
  const encrypted = await encryptSettings(settings);
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(encrypted));
}

async function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) return createInitialSettings();

  try {
    const parsed = JSON.parse(raw);
    const decrypted = await decryptSettings(parsed);
    return {
      ...createInitialSettings(),
      ...decrypted
    };
  } catch {
    return createInitialSettings();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createInitialState();

  try {
    const parsed = JSON.parse(raw);
    return {
      garden: {
        ...createInitialState().garden,
        ...(parsed.garden || {})
      },
      plants: Array.isArray(parsed.plants) ? parsed.plants : [],
      reminders: {
        ...normalizeRemindersMap(defaultReminders),
        ...normalizeRemindersMap(parsed.reminders || {})
      }
    };
  } catch {
    return createInitialState();
  }
}

const state = loadState();
let settings = createInitialSettings();

function renderSummary() {
  const data = state.garden;

  gardenHeaderWidget.innerHTML = `
    <strong>${data.icon || '🌿'} ${data.title || 'Unnamed Garden'}</strong>
    <p>${data.location || 'Ort nicht gesetzt'}</p>
    <p>Boden: ${data.soil} • Rasen: ${data.lawn}</p>
  `;
}

function fillGardenForm() {
  document.getElementById('garden-title').value = state.garden.title;
  document.getElementById('garden-icon').value = state.garden.icon;
  document.getElementById('garden-location').value = state.garden.location;
  document.getElementById('garden-soil').value = state.garden.soil;
  document.getElementById('garden-lawn').value = state.garden.lawn;
  document.getElementById('garden-description').value = state.garden.description;
}

function renderWeatherMessage(title, detail) {
  weatherWidget.innerHTML = `<strong>${title}</strong><p>${detail}</p>`;
}

function weatherCodeLabel(code) {
  const map = {
    0: 'Klar',
    1: 'Überwiegend klar',
    2: 'Teilweise bewölkt',
    3: 'Bewölkt',
    45: 'Nebel',
    48: 'Reifnebel',
    51: 'Leichter Nieselregen',
    53: 'Mäßiger Nieselregen',
    55: 'Starker Nieselregen',
    61: 'Leichter Regen',
    63: 'Mäßiger Regen',
    65: 'Starker Regen',
    71: 'Leichter Schneefall',
    73: 'Mäßiger Schneefall',
    75: 'Starker Schneefall',
    80: 'Leichte Regenschauer',
    81: 'Mäßige Regenschauer',
    82: 'Heftige Regenschauer',
    95: 'Gewitter'
  };
  return map[code] || 'Unbekannt';
}

async function fetchAndRenderLocalWeather() {
  const location = state.garden.location?.trim();
  if (!location) {
    renderWeatherMessage('Lokales Wetter', 'Ort speichern, um Wetter zu laden.');
    return;
  }

  renderWeatherMessage('Lokales Wetter', 'Wetter wird geladen ...');

  try {
    const geocodeResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=de&format=json`
    );
    const geocodeData = await geocodeResponse.json();
    const hit = geocodeData?.results?.[0];

    if (!hit) {
      renderWeatherMessage('Lokales Wetter', `Kein Wetter für „${location}“ gefunden.`);
      return;
    }

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${hit.latitude}&longitude=${hit.longitude}&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m&timezone=auto`
    );
    const weatherData = await weatherResponse.json();
    const current = weatherData?.current;

    if (!current) {
      renderWeatherMessage('Lokales Wetter', 'Aktuelle Wetterdaten sind gerade nicht verfügbar.');
      return;
    }

    const cityLabel = [hit.name, hit.country].filter(Boolean).join(', ');
    const detail = `${cityLabel}: ${Math.round(current.temperature_2m)}°C, ${weatherCodeLabel(current.weathercode)}, gefühlt ${Math.round(current.apparent_temperature)}°C, Wind ${Math.round(current.windspeed_10m)} km/h`;
    renderWeatherMessage('Lokales Wetter', detail);
  } catch {
    renderWeatherMessage('Lokales Wetter', 'Wetterdaten konnten nicht geladen werden.');
  }
}

function renderPlants() {
  plantList.innerHTML = '';

  state.plants.forEach((plant) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${plant.name}</strong> (${plant.category})<br>
      Water Need: ${plant.water} • Location: ${plant.sun}<br>
      Note: ${plant.note || '-'}
    `;
    plantList.appendChild(li);
  });
}

function renderPlanner() {
  planner.innerHTML = '';
  const currentMonthIndex = new Date().getMonth();

  months.forEach((month, index) => {
    const block = document.createElement('div');
    block.className = 'month-block';
    if (index === currentMonthIndex) block.classList.add('current-month');
    if (index < currentMonthIndex) block.classList.add('past-month');

    const tasks = normalizeReminderEntries(state.reminders[month] || []);
    if (!state.reminders[month]) state.reminders[month] = tasks;
    const taskItems = tasks.length
      ? tasks
        .map((task, taskIndex) => `
          <li>
            <button class="task-toggle ${task.done ? 'is-done' : ''}" data-month="${month}" data-task-index="${taskIndex}" type="button">
              ${task.text}
            </button>
          </li>
        `)
        .join('')
      : '<li class="empty-state">No Tasks</li>';

    block.innerHTML = `<h3>${month}</h3><ul>${taskItems}</ul>`;
    planner.appendChild(block);
  });
}

planner.addEventListener('click', (event) => {
  const taskButton = event.target.closest('.task-toggle');
  if (!taskButton) return;

  const month = taskButton.dataset.month;
  const taskIndex = Number(taskButton.dataset.taskIndex);
  const monthTasks = state.reminders[month];
  if (!monthTasks || Number.isNaN(taskIndex) || !monthTasks[taskIndex]) return;

  monthTasks[taskIndex].done = !monthTasks[taskIndex].done;
  saveState();
  renderPlanner();
openGardenMenuButton.addEventListener('click', () => {
  fillGardenForm();
  gardenMenuDialog.showModal();
});

document.getElementById('close-garden-menu').addEventListener('click', () => {
  gardenMenuDialog.close();
});

gardenForm.addEventListener('submit', (event) => {
  event.preventDefault();

  state.garden = {
    title: document.getElementById('garden-title').value.trim(),
    icon: document.getElementById('garden-icon').value.trim(),
    location: document.getElementById('garden-location').value.trim(),
    soil: document.getElementById('garden-soil').value,
    lawn: document.getElementById('garden-lawn').value,
    description: document.getElementById('garden-description').value.trim()
  };

  saveState();
  renderSummary();
  fetchAndRenderLocalWeather();
  gardenMenuDialog.close();
});

plantForm.addEventListener('submit', (event) => {
  event.preventDefault();

  state.plants.push({
    name: document.getElementById('plant-name').value.trim(),
    category: document.getElementById('plant-category').value,
    water: document.getElementById('plant-water').value,
    sun: document.getElementById('plant-sun').value,
    note: document.getElementById('plant-note').value.trim()
  });

  saveState();
  plantForm.reset();
  renderPlants();
});

reminderForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const month = document.getElementById('reminder-month').value;
  const text = document.getElementById('reminder-text').value.trim();
  if (!text) return;

  if (!state.reminders[month]) state.reminders[month] = [];
  state.reminders[month].push({ text, done: false });

  saveState();
  reminderForm.reset();
  renderPlanner();
});

function fillSettingsForm() {
  document.getElementById('settings-language').value = settings.language;
  document.getElementById('settings-app-id').value = settings.appId;
  document.getElementById('settings-client-secret').value = settings.clientSecret;
}

openSettingsButton.addEventListener('click', () => {
  fillSettingsForm();
  settingsDialog.showModal();
});

document.getElementById('close-settings').addEventListener('click', () => {
  settingsDialog.close();
});

settingsForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  settings = {
    language: document.getElementById('settings-language').value,
    appId: document.getElementById('settings-app-id').value.trim(),
    clientSecret: document.getElementById('settings-client-secret').value.trim()
  };

  await saveSettings(settings);
  settingsDialog.close();
});

fillGardenForm();
renderSummary();
renderPlants();
renderPlanner();
fetchAndRenderLocalWeather();


const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

function appendChatMessage(role, text) {
  const bubble = document.createElement('div');
  bubble.className = `chat-message ${role}`;
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getCurrentMonthName() {
  return months[new Date().getMonth()];
}

function buildAssistantReply(message) {
  const normalized = message.toLowerCase();

  if (normalized.includes('zusammenfassung') || normalized.includes('garten')) {
    const title = state.garden.title || 'dein Garten';
    const plantCount = state.plants.length;
    return `${state.garden.icon || '🌿'} ${title}: ${plantCount} Pflanzen eingetragen, Boden ${state.garden.soil}, Standort ${state.garden.location || 'nicht gesetzt'}.`;
  }

  if (normalized.includes('heute') || normalized.includes('diesen monat') || normalized.includes('aktuell')) {
    const month = getCurrentMonthName();
    const tasks = normalizeReminderEntries(state.reminders[month] || []);
    const openTasks = tasks.filter((task) => !task.done).map((task) => task.text);
    return openTasks.length
      ? `Für ${month} empfehle ich: ${openTasks.join(' • ')}`
      : `Für ${month} hast du noch keine Aufgaben. Lege eine Erinnerung im Planer an.`;
  }

  if (normalized.includes('mai')) {
    const tasks = normalizeReminderEntries(state.reminders.May || []);
    const openTasks = tasks.filter((task) => !task.done).map((task) => task.text);
    return openTasks.length
      ? `Im Mai passt: ${openTasks.join(' • ')}`
      : 'Für Mai sind noch keine Aufgaben hinterlegt.';
  }

  if (normalized.includes('pflanz') || normalized.includes('idee')) {
    const soil = state.garden.soil;
    if (soil === 'Sandy') return 'Bei sandigem Boden passen z. B. Lavendel, Salbei und Thymian sehr gut.';
    if (soil === 'Humus-rich') return 'Bei humusreichem Boden sind Tomaten, Zucchini und Hortensien oft dankbar.';
    return 'Als einfache Starter eignen sich Kräuter wie Schnittlauch, Petersilie und Minze.';
  }

  if (normalized.includes('wasser')) {
    const high = state.plants.filter((p) => p.water === 'High').map((p) => p.name);
    return high.length
      ? `Diese Pflanzen brauchen mehr Wasser: ${high.join(', ')}.`
      : 'Aktuell ist keine Pflanze mit hohem Wasserbedarf eingetragen.';
  }

  return 'Ich kann dir bei Monatsaufgaben, Pflanzideen, Wasserbedarf und einer Garten-Zusammenfassung helfen.';
}

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const message = chatInput.value.trim();
  if (!message) return;

  appendChatMessage('user', message);
  const reply = buildAssistantReply(message);
  appendChatMessage('assistant', reply);

  chatInput.value = '';
  chatInput.focus();
});

appendChatMessage('assistant', 'Hallo! Ich bin dein Garten-Chat. Frag mich z. B. nach Aufgaben im aktuellen Monat.');
loadSettings().then((loadedSettings) => {
  settings = loadedSettings;
  fillSettingsForm();
});
