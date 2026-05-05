import React from 'react';
import { createRoot } from 'react-dom/client';
import { useEffect, useMemo, useState } from 'react';
import './styles.css';

const STORAGE_KEY = 'gardenplaner-react-state-v1';

const defaultState = {
  gardenLocation: '',
  plants: [
    {
      id: crypto.randomUUID(),
      name: 'Tomate',
      note: 'Sonnig, Rankhilfe nötig',
      category: 'Gemüse',
      waterIntervalDays: 2,
      lastWateredAt: new Date().toISOString().slice(0, 10)
    },
    {
      id: crypto.randomUUID(),
      name: 'Basilikum',
      note: 'Halbschatten, regelmäßig ernten',
      category: 'Kräuter',
      waterIntervalDays: 1,
      lastWateredAt: new Date().toISOString().slice(0, 10)
    }
  ],
  events: [
    {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      title: 'Aussaat prüfen',
      category: 'Aussaat',
      color: '#8bc34a'
    }
  ],
  todos: [
    {
      id: crypto.randomUUID(),
      task: 'Tomaten wässern',
      type: 'wässern',
      done: false,
      priority: 'hoch',
      dueDate: new Date().toISOString().slice(0, 10),
      plantId: ''
    },
    {
      id: crypto.randomUUID(),
      task: 'Kräuter düngen',
      type: 'düngen',
      done: false,
      priority: 'mittel',
      dueDate: '',
      plantId: ''
    }
  ]
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    const plants = (parsed.plants ?? defaultState.plants).map((plant) => ({
      category: 'Allgemein',
      waterIntervalDays: 2,
      lastWateredAt: '',
      ...plant
    }));
    const events = (parsed.events ?? defaultState.events).map((event) => ({
      category: 'Allgemein',
      color: '#4dd0e1',
      ...event
    }));
    const todos = (parsed.todos ?? defaultState.todos).map((todo) => ({
      priority: 'mittel',
      dueDate: '',
      plantId: '',
      ...todo
    }));
    return {
      ...defaultState,
      ...parsed,
      plants,
      events,
      todos
    };
  } catch {
    return defaultState;
  }
}

function App() {
  const [state, setState] = useState(loadState);
  const [todoFilter, setTodoFilter] = useState('all');
  const [todoSort, setTodoSort] = useState('dueDate');
  const [todoPlantFilter, setTodoPlantFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const sortedEvents = useMemo(
    () =>
      [...state.events]
        .filter((event) => (eventFilter === 'all' ? true : event.category === eventFilter))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [eventFilter, state.events]
  );

  const visibleTodos = useMemo(() => {
    const filtered = state.todos.filter((todo) => {
      if (todoFilter === 'open' && todo.done) return false;
      if (todoFilter === 'dueToday' && todo.dueDate !== today) return false;
      if (todoPlantFilter !== 'all' && todo.plantId !== todoPlantFilter) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      if (todoSort === 'priority') {
        const prio = { hoch: 0, mittel: 1, niedrig: 2 };
        return (prio[a.priority] ?? 3) - (prio[b.priority] ?? 3);
      }
      const aDue = a.dueDate || '9999-99-99';
      const bDue = b.dueDate || '9999-99-99';
      return aDue.localeCompare(bDue);
    });
  }, [state.todos, todoFilter, todoPlantFilter, todoSort, today]);

  const addPlant = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const note = String(formData.get('note') || '').trim();
    const category = String(formData.get('category') || 'Allgemein');
    const waterIntervalDays = Number(formData.get('waterIntervalDays') || 2);
    const lastWateredAt = String(formData.get('lastWateredAt') || '').trim();
    if (!name) return;
    setState((prev) => ({
      ...prev,
      plants: [
        ...prev.plants,
        { id: crypto.randomUUID(), name, note, category, waterIntervalDays, lastWateredAt }
      ]
    }));
    e.currentTarget.reset();
  };

  const addEvent = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = String(formData.get('title') || '').trim();
    const date = String(formData.get('date') || '').trim();
    const category = String(formData.get('category') || 'Allgemein').trim();
    const color = String(formData.get('color') || '#4dd0e1').trim();
    if (!title || !date) return;
    setState((prev) => ({
      ...prev,
      events: [...prev.events, { id: crypto.randomUUID(), title, date, category, color }]
    }));
    e.currentTarget.reset();
  };

  const addTodo = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const task = String(formData.get('task') || '').trim();
    const type = String(formData.get('type') || 'wässern');
    const priority = String(formData.get('priority') || 'mittel');
    const dueDate = String(formData.get('dueDate') || '').trim();
    const plantId = String(formData.get('plantId') || '');
    if (!task) return;
    setState((prev) => ({
      ...prev,
      todos: [...prev.todos, { id: crypto.randomUUID(), task, type, done: false, priority, dueDate, plantId }]
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
                <strong>{plant.name}</strong> <em>({plant.category})</em>
                <span> · Wasser alle {plant.waterIntervalDays} Tage</span>
                {plant.lastWateredAt && <span> · Zuletzt gegossen: {plant.lastWateredAt}</span>}
                {plant.note && <span> — {plant.note}</span>}
              </li>
            ))}
          </ul>
          <form onSubmit={addPlant}>
            <input name="name" placeholder="Pflanzenname" required />
            <input name="category" placeholder="Kategorie (z. B. Gemüse)" defaultValue="Allgemein" />
            <input name="waterIntervalDays" type="number" min="1" defaultValue="2" />
            <input name="lastWateredAt" type="date" />
            <input name="note" placeholder="Notiz" />
            <button type="submit">Pflanze hinzufügen</button>
          </form>
        </article>

        <article className="card">
          <h2>Kalender</h2>
          <ul>
            {sortedEvents.map((event) => (
              <li key={event.id}>
                <strong>{event.date}</strong>: {event.title} ({event.category}){' '}
                <span style={{ color: event.color }}>●</span>
              </li>
            ))}
          </ul>
          <label>
            Kategorie filtern:
            <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
              <option value="all">alle</option>
              {[...new Set(state.events.map((event) => event.category))]
                .filter(Boolean)
                .map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
            </select>
          </label>
          <form onSubmit={addEvent}>
            <input name="title" placeholder="Termin" required />
            <input name="date" type="date" required />
            <input name="category" placeholder="Kategorie" defaultValue="Allgemein" />
            <input name="color" type="color" defaultValue="#4dd0e1" />
            <button type="submit">Termin hinzufügen</button>
          </form>
        </article>

        <article className="card">
          <h2>Todos (Wässern & Düngen)</h2>
          <div>
            <label>
              Filter:
              <select value={todoFilter} onChange={(e) => setTodoFilter(e.target.value)}>
                <option value="all">alle</option>
                <option value="open">nur offen</option>
                <option value="dueToday">heute fällig</option>
              </select>
            </label>
            <label>
              Sortierung:
              <select value={todoSort} onChange={(e) => setTodoSort(e.target.value)}>
                <option value="dueDate">Fälligkeitsdatum</option>
                <option value="priority">Priorität</option>
              </select>
            </label>
            <label>
              Nach Pflanze:
              <select value={todoPlantFilter} onChange={(e) => setTodoPlantFilter(e.target.value)}>
                <option value="all">alle</option>
                {state.plants.map((plant) => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <ul>
            {visibleTodos.map((todo) => (
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
                    [{todo.type}/{todo.priority}] {todo.task}
                    {todo.dueDate && ` · fällig: ${todo.dueDate}`}
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
            <select name="priority" defaultValue="mittel">
              <option value="hoch">hoch</option>
              <option value="mittel">mittel</option>
              <option value="niedrig">niedrig</option>
            </select>
            <input name="dueDate" type="date" />
            <select name="plantId" defaultValue="">
              <option value="">ohne Pflanze</option>
              {state.plants.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {plant.name}
                </option>
              ))}
            </select>
            <button type="submit">Todo hinzufügen</button>
          </form>
        </article>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
