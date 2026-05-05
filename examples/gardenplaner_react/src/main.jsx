import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
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
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
      <header className="mb-6 rounded-3xl border border-garden-line/80 bg-gradient-to-r from-garden-primary/15 via-garden-lavender/15 to-garden-sun/20 p-6 shadow-soft">
        <h1 className="text-3xl font-bold tracking-tight">🌱 Gartenplaner (React)</h1>
        <p className="mt-2 text-sm text-garden-muted">Garden playful Theme mit Design Tokens & Tailwind Utilities.</p>
      </header>

      <section className="rounded-3xl border border-garden-line/80 bg-garden-surface p-5 shadow-soft backdrop-blur-sm sm:p-6">
        <h2 className="text-lg font-semibold">Standort des Gartens</h2>
        <input
          className="field mt-3"
          type="text"
          placeholder="z. B. Hinterhof Berlin"
          value={state.gardenLocation}
          onChange={(e) => setState((prev) => ({ ...prev, gardenLocation: e.target.value }))}
        />
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-3xl border border-garden-line/80 bg-garden-surface p-5 shadow-soft backdrop-blur-sm sm:p-6">
          <h2 className="text-lg font-semibold">Meine Pflanzen</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {state.plants.map((plant) => (
              <li key={plant.id} className="rounded-2xl border border-garden-line/70 bg-white/70 p-3">
                <strong>{plant.name}</strong>
                {plant.note && <span className="text-garden-muted"> — {plant.note}</span>}
              </li>
            ))}
          </ul>
          <form className="mt-4 grid gap-2.5" onSubmit={addPlant}>
            <input className="field" name="name" placeholder="Pflanzenname" required />
            <input className="field" name="note" placeholder="Notiz" />
            <button className="btn-primary" type="submit">Pflanze hinzufügen</button>
          </form>
        </article>

        <article className="rounded-3xl border border-garden-line/80 bg-garden-surface p-5 shadow-soft backdrop-blur-sm sm:p-6">
          <h2 className="text-lg font-semibold">Kalender</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {sortedEvents.map((event) => (
              <li key={event.id} className="rounded-2xl border border-garden-line/70 bg-white/70 p-3">
                <strong>{event.date}</strong>: {event.title}
              </li>
            ))}
          </ul>
          <form className="mt-4 grid gap-2.5" onSubmit={addEvent}>
            <input className="field" name="title" placeholder="Termin" required />
            <input className="field" name="date" type="date" required />
            <button className="btn-primary" type="submit">Termin hinzufügen</button>
          </form>
        </article>

        <article className="rounded-3xl border border-garden-line/80 bg-garden-surface p-5 shadow-soft backdrop-blur-sm sm:p-6 md:col-span-2 xl:col-span-1">
          <h2 className="text-lg font-semibold">Todos (Wässern & Düngen)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {state.todos.map((todo) => (
              <li key={todo.id} className="rounded-2xl border border-garden-line/70 bg-white/70 p-3">
                <label className="flex items-center gap-2">
                  <input
                    className="h-4 w-4 rounded border-garden-line text-garden-primary focus:ring-garden-primary/40"
                    type="checkbox"
                    checked={todo.done}
                    onChange={() =>
                      setState((prev) => ({
                        ...prev,
                        todos: prev.todos.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t))
                      }))
                    }
                  />
                  <span className={todo.done ? 'text-garden-muted line-through opacity-70' : ''}>
                    [{todo.type}] {todo.task}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <form className="mt-4 grid gap-2.5" onSubmit={addTodo}>
            <input className="field" name="task" placeholder="Aufgabe" required />
            <select className="field" name="type" defaultValue="wässern">
              <option value="wässern">wässern</option>
              <option value="düngen">düngen</option>
            </select>
            <button className="btn-primary" type="submit">Todo hinzufügen</button>
          </form>
        </article>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
