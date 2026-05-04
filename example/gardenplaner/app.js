const STORAGE_KEY = 'gardenplaner-state-v1';

const gardenForm = document.getElementById('garden-form');
const plantForm = document.getElementById('plant-form');
const reminderForm = document.getElementById('reminder-form');

const gardenSummary = document.getElementById('garden-summary');
const plantList = document.getElementById('plant-list');
const planner = document.getElementById('planner');

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
