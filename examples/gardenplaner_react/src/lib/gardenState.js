export const STORAGE_KEY = 'gardenplaner-react-state-v1';

export const defaultGardenState = {
  gardenLocation: '',
  plants: [
    { id: crypto.randomUUID(), name: 'Tomate', note: 'Sonnig, Rankhilfe nötig' },
    { id: crypto.randomUUID(), name: 'Basilikum', note: 'Halbschatten, regelmäßig ernten' }
  ],
  events: [{ id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), title: 'Aussaat prüfen' }],
  todos: [
    { id: crypto.randomUUID(), task: 'Tomaten wässern', type: 'wässern', done: false },
    { id: crypto.randomUUID(), task: 'Kräuter düngen', type: 'düngen', done: false }
  ]
};

export function loadGardenState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultGardenState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultGardenState,
      ...parsed,
      plants: parsed.plants ?? defaultGardenState.plants,
      events: parsed.events ?? defaultGardenState.events,
      todos: parsed.todos ?? defaultGardenState.todos
    };
  } catch {
    return defaultGardenState;
  }
}
