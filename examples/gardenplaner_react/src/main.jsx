import React from 'react';
import { createRoot } from 'react-dom/client';
import { useEffect, useMemo, useState } from 'react';
import './styles.css';

const STORAGE_KEY_V1 = 'gardenplaner-react-state-v1';
const STORAGE_KEY_V2 = 'gardenplaner-react-state-v2';

const VALID_TODO_TYPES = new Set(['wässern', 'düngen']);

const defaultState = {
  schemaVersion: 2,
  gardenLocation: '',
  plants: [
    { id: crypto.randomUUID(), name: 'Tomate', note: 'Sonnig, Rankhilfe nötig', category: 'Gemüse' },
    { id: crypto.randomUUID(), name: 'Basilikum', note: 'Halbschatten, regelmäßig ernten', category: 'Kräuter' }
  ],
  events: [
    {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      title: 'Aussaat prüfen',
      done: false
    }
  ],
  todos: [
    { id: crypto.randomUUID(), task: 'Tomaten wässern', type: 'wässern', done: false, priority: 'normal' },
    { id: crypto.randomUUID(), task: 'Kräuter düngen', type: 'düngen', done: false, priority: 'normal' }
  ]
};

const asNonEmptyString = (value, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};

const normalizePlant = (plant) => {
  if (!plant || typeof plant !== 'object') return null;
  const name = asNonEmptyString(plant.name);
  if (!name) return null;

  return {
    id: asNonEmptyString(plant.id, crypto.randomUUID()),
    name,
    note: typeof plant.note === 'string' ? plant.note.trim() : '',
    category: asNonEmptyString(plant.category, 'Allgemein')
  };
};

const normalizeEvent = (event) => {
  if (!event || typeof event !== 'object') return null;
  const title = asNonEmptyString(event.title);
  const date = asNonEmptyString(event.date);
  if (!title || !date) return null;

  return {
    id: asNonEmptyString(event.id, crypto.randomUUID()),
    title,
    date,
    done: typeof event.done === 'boolean' ? event.done : false
  };
};

const normalizeTodo = (todo) => {
  if (!todo || typeof todo !== 'object') return null;
  const task = asNonEmptyString(todo.task);
  if (!task) return null;

  const rawType = asNonEmptyString(todo.type, 'wässern');
  return {
    id: asNonEmptyString(todo.id, crypto.randomUUID()),
    task,
    type: VALID_TODO_TYPES.has(rawType) ? rawType : 'wässern',
    done: typeof todo.done === 'boolean' ? todo.done : false,
    priority: asNonEmptyString(todo.priority, 'normal')
  };
};

function migrateState(rawState) {
  if (!rawState || typeof rawState !== 'object') return defaultState;

  const plants = Array.isArray(rawState.plants)
    ? rawState.plants.map(normalizePlant).filter(Boolean)
    : [];
  const events = Array.isArray(rawState.events)
    ? rawState.events.map(normalizeEvent).filter(Boolean)
    : [];
  const todos = Array.isArray(rawState.todos)
    ? rawState.todos.map(normalizeTodo).filter(Boolean)
    : [];

  return {
    schemaVersion: 2,
    gardenLocation: typeof rawState.gardenLocation === 'string' ? rawState.gardenLocation : '',
    plants: plants.length ? plants : defaultState.plants,
    events: events.length ? events : defaultState.events,
    todos: todos.length ? todos : defaultState.todos
  };
}

function loadState() {
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY_V2);
    if (rawV2) {
      return migrateState(JSON.parse(rawV2));
    }

    const rawV1 = localStorage.getItem(STORAGE_KEY_V1);
    if (rawV1) {
      return migrateState(JSON.parse(rawV1));
    }

    return defaultState;
  } catch {
    return defaultState;
  }
}

function App() {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(state));
  }, [state]);

  const sortedEvents = useMemo(
    () => [...state.events].sort((a, b) => a.date.localeCompare(b.date)),
    [state.events]
  );

  const addPlant = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const note = String(formData.get('note') || '').trim();
    if (!name) return;
    setState((prev) => ({
      ...prev,
      plants: [...prev.plants, { id: crypto.randomUUID(), name, note, category: 'Allgemein' }]
    }));
    e.currentTarget.reset();
  };

  const addEvent = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = String(formData.get('title') || '').trim();
    const date = String(formData.get('date') || '').trim();
    if (!title || !date) return;
    setState((prev) => ({ ...prev, events: [...prev.events, { id: crypto.randomUUID(), title, date, done: false }] }));
    e.currentTarget.reset();
  };

  const addTodo = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const task = String(formData.get('task') || '').trim();
    const type = String(formData.get('type') || 'wässern');
    if (!task) return;
    setState((prev) => ({
      ...prev,
      todos: [...prev.todos, { id: crypto.randomUUID(), task, type, done: false, priority: 'normal' }]
    }));
    e.currentTarget.reset();
  };

  return (
    <main className="container">
      <h1>🌱 Gartenplaner (React)</h1>

      <section className="card">
        <h2>Standort des Gartens</h2>
        <input
          type="text"
          placeholder="z. B. Hinterhof Berlin"
          value={state.gardenLocation}
          onChange={(e) => setState((prev) => ({ ...prev, gardenLocation: e.target.value }))}
        />
      </section>

      <section className="grid">
        <article className="card">
          <h2>Meine Pflanzen</h2>
          <ul>
            {state.plants.map((plant) => (
              <li key={plant.id}>
                <strong>{plant.name}</strong>
                {plant.note && <span> — {plant.note}</span>}
              </li>
            ))}
          </ul>
          <form onSubmit={addPlant}>
            <input name="name" placeholder="Pflanzenname" required />
            <input name="note" placeholder="Notiz" />
            <button type="submit">Pflanze hinzufügen</button>
          </form>
        </article>

        <article className="card">
          <h2>Kalender</h2>
          <ul>
            {sortedEvents.map((event) => (
              <li key={event.id}>
                <strong>{event.date}</strong>: {event.title}
              </li>
            ))}
          </ul>
          <form onSubmit={addEvent}>
            <input name="title" placeholder="Termin" required />
            <input name="date" type="date" required />
            <button type="submit">Termin hinzufügen</button>
          </form>
        </article>

        <article className="card">
          <h2>Todos (Wässern & Düngen)</h2>
          <ul>
            {state.todos.map((todo) => (
              <li key={todo.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() =>
                      setState((prev) => ({
                        ...prev,
                        todos: prev.todos.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t))
                      }))
                    }
                  />{' '}
                  <span className={todo.done ? 'done' : ''}>
                    [{todo.type}] {todo.task}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <form onSubmit={addTodo}>
            <input name="task" placeholder="Aufgabe" required />
            <select name="type" defaultValue="wässern">
              <option value="wässern">wässern</option>
              <option value="düngen">düngen</option>
            </select>
            <button type="submit">Todo hinzufügen</button>
          </form>
        </article>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
