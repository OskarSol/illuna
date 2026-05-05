import React from 'react';
import { createRoot } from 'react-dom/client';
import { useEffect, useMemo, useState } from 'react';
import './styles.css';

const STORAGE_KEY = 'gardenplaner-react-state-v1';

const defaultState = {
  gardenLocation: '',
  plants: [
    { id: crypto.randomUUID(), name: 'Tomate', note: 'Sonnig, Rankhilfe nötig' },
    { id: crypto.randomUUID(), name: 'Basilikum', note: 'Halbschatten, regelmäßig ernten' }
  ],
  events: [
    { id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), title: 'Aussaat prüfen' }
  ],
  todos: [
    { id: crypto.randomUUID(), task: 'Tomaten wässern', type: 'wässern', done: false },
    { id: crypto.randomUUID(), task: 'Kräuter düngen', type: 'düngen', done: false }
  ]
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      plants: parsed.plants ?? defaultState.plants,
      events: parsed.events ?? defaultState.events,
      todos: parsed.todos ?? defaultState.todos
    };
  } catch {
    return defaultState;
  }
}

function App() {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
      plants: [...prev.plants, { id: crypto.randomUUID(), name, note }]
    }));
    e.currentTarget.reset();
  };

  const addEvent = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = String(formData.get('title') || '').trim();
    const date = String(formData.get('date') || '').trim();
    if (!title || !date) return;
    setState((prev) => ({ ...prev, events: [...prev.events, { id: crypto.randomUUID(), title, date }] }));
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
      todos: [...prev.todos, { id: crypto.randomUUID(), task, type, done: false }]
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
