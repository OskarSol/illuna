const STORAGE_KEY = 'gardenplaner-state-v1';

const gardenForm = document.getElementById('garden-form');
const plantForm = document.getElementById('plant-form');
const reminderForm = document.getElementById('reminder-form');

const gardenSummary = document.getElementById('garden-summary');
const plantList = document.getElementById('plant-list');
const planner = document.getElementById('planner');
const weatherWidget = document.getElementById('weather-widget');

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
    reminders: { ...defaultReminders }
  };
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
        ...defaultReminders,
        ...(parsed.reminders || {})
      }
    };
  } catch {
    return createInitialState();
  }
}

const state = loadState();

function renderSummary() {
  const data = state.garden;

  gardenSummary.innerHTML = `
    <strong>${data.icon || '🌿'} ${data.title || 'Unnamed Garden'}</strong><br>
    Location: ${data.location || '-'}<br>
    Soil: ${data.soil}<br>
    Lawn: ${data.lawn}<br>
    Description: ${data.description || '-'}
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

  months.forEach((month) => {
    const block = document.createElement('div');
    block.className = 'month-block';

    const tasks = state.reminders[month] || [];
    const lis = tasks.map((t) => `<li>${t}</li>`).join('');

    block.innerHTML = `<h3>${month}</h3><ul>${lis || '<li>No Tasks</li>'}</ul>`;
    planner.appendChild(block);
  });
}

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
  state.reminders[month].push(text);

  saveState();
  reminderForm.reset();
  renderPlanner();
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
    const tasks = state.reminders[month] || [];
    return tasks.length
      ? `Für ${month} empfehle ich: ${tasks.join(' • ')}`
      : `Für ${month} hast du noch keine Aufgaben. Lege eine Erinnerung im Planer an.`;
  }

  if (normalized.includes('mai')) {
    const tasks = state.reminders.May || [];
    return tasks.length
      ? `Im Mai passt: ${tasks.join(' • ')}`
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
