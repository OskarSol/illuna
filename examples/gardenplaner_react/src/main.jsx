import React from 'react';
import { createRoot } from 'react-dom/client';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import App from './App';
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

const cardMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut' }
};

const itemTransition = { duration: 0.25, ease: 'easeOut' };

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
  const [activeTab, setActiveTab] = useState('dashboard');

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
  const openTodos = useMemo(() => state.todos.filter((todo) => !todo.done).length, [state.todos]);
  const nextEvent = sortedEvents.find((event) => event.date >= new Date().toISOString().slice(0, 10));
  const doneToday = state.todos.filter((todo) => todo.done).length;
  const totalTodos = state.todos.length;
  const progress = totalTodos === 0 ? 0 : Math.round((doneToday / totalTodos) * 100);

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
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
      <header className="mb-6 rounded-3xl border border-garden-line/80 bg-gradient-to-r from-garden-primary/15 via-garden-lavender/15 to-garden-sun/20 p-6 shadow-soft">
        <h1 className="text-3xl font-bold tracking-tight">🌱 Gartenplaner (React)</h1>
        <p className="mt-2 text-sm text-garden-muted">Garden playful Theme mit Design Tokens & Tailwind Utilities.</p>
      </header>

      <section className="quick-actions card">
        <h2>Schnellzugriff</h2>
        <p>Wichtige Aktionen direkt oben, besonders für Mobilgeräte.</p>
        <div className="action-row">
          <button type="button" className="primary" onClick={() => setActiveTab('plants')}>Pflanze hinzufügen</button>
          <button type="button" className="primary" onClick={() => setActiveTab('events')}>Termin planen</button>
          <button type="button" className="primary" onClick={() => setActiveTab('tasks')}>Aufgabe erfassen</button>
        </div>
      </section>

      <section className="card">
      <motion.section className="card" {...cardMotion}>
        <h2>Standort des Gartens</h2>
      <section className="rounded-3xl border border-garden-line/80 bg-garden-surface p-5 shadow-soft backdrop-blur-sm sm:p-6">
        <h2 className="text-lg font-semibold">Standort des Gartens</h2>
        <input
          className="field mt-3"
          type="text"
          placeholder="z. B. Hinterhof Berlin"
          value={state.gardenLocation}
          onChange={(e) => setState((prev) => ({ ...prev, gardenLocation: e.target.value }))}
        />
      </motion.section>

      <motion.section className="card" {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.05 }}>
        <h2>Heute erledigt</h2>
        <div className="progress-row">
          <span>{doneToday} von {totalTodos} Aufgaben</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-track" aria-label="Fortschritt heute">
          <motion.div className="progress-fill" animate={{ width: `${progress}%` }} transition={{ duration: 0.35 }} />
        </div>
      </motion.section>

      <nav className="tabs" aria-label="Hauptbereiche">
        <button type="button" className={activeTab === 'dashboard' ? 'tab active' : 'tab'} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button type="button" className={activeTab === 'plants' ? 'tab active' : 'tab'} onClick={() => setActiveTab('plants')}>Pflanzen</button>
        <button type="button" className={activeTab === 'events' ? 'tab active' : 'tab'} onClick={() => setActiveTab('events')}>Termine</button>
        <button type="button" className={activeTab === 'tasks' ? 'tab active' : 'tab'} onClick={() => setActiveTab('tasks')}>Aufgaben</button>
      </nav>

      <section className="layout-grid">
        {activeTab === 'dashboard' && (
          <article className="card span-two">
            <h2>Dashboard-Übersicht</h2>
            <div className="kpi-grid">
              <div className="kpi">
                <span className="kpi-label">Pflanzenzahl</span>
                <strong>{state.plants.length}</strong>
              </div>
              <div className="kpi">
                <span className="kpi-label">Offene Todos</span>
                <strong>{openTodos}</strong>
              </div>
              <div className="kpi">
                <span className="kpi-label">Nächster Termin</span>
                <strong>{nextEvent ? `${nextEvent.date}: ${nextEvent.title}` : 'Kein Termin geplant'}</strong>
              </div>
            </div>
          </article>
        )}

        {activeTab === 'plants' && (
          <article className="card">
            <h2>Pflanzen</h2>
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
        )}

        {activeTab === 'events' && (
          <article className="card">
            <h2>Termine</h2>
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
        )}

        {activeTab === 'tasks' && (
          <article className="card">
            <h2>Aufgaben</h2>
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
        )}
      <section className="grid">
        <motion.article className="card" {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.1 }}>
          <h2>Meine Pflanzen</h2>
          {state.plants.length === 0 ? (
            <p className="empty-state">🪴 Noch keine Pflanzen hinzugefügt.</p>
          ) : (
            <ul>
              <AnimatePresence initial={false}>
                {state.plants.map((plant) => (
                  <motion.li
                    key={plant.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={itemTransition}
                  >
                    <strong>{plant.name}</strong>
                    {plant.note && <span> — {plant.note}</span>}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
          <form onSubmit={addPlant}>
            <input name="name" placeholder="Pflanzenname" required />
            <input name="note" placeholder="Notiz" />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} type="submit">Pflanze hinzufügen</motion.button>
      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-3xl border border-garden-line/80 bg-garden-surface p-5 shadow-soft backdrop-blur-sm sm:p-6">
          <h2 className="text-lg font-semibold">Meine Pflanzen</h2>
          <ul className="mt-3 space-y-2 text-sm">
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
        </motion.article>

        <motion.article className="card" {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.15 }}>
          <h2>Kalender</h2>
          {sortedEvents.length === 0 ? (
            <p className="empty-state">📅 Keine Termine geplant.</p>
          ) : (
            <ul>
              <AnimatePresence initial={false}>
                {sortedEvents.map((event) => (
                  <motion.li
                    key={event.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={itemTransition}
                  >
                    <strong>{event.date}</strong>: {event.title}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
          <form onSubmit={addEvent}>
            <input name="title" placeholder="Termin" required />
            <input name="date" type="date" required />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} type="submit">Termin hinzufügen</motion.button>
        <article className="rounded-3xl border border-garden-line/80 bg-garden-surface p-5 shadow-soft backdrop-blur-sm sm:p-6">
          <h2 className="text-lg font-semibold">Kalender</h2>
          <ul className="mt-3 space-y-2 text-sm">
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
        </motion.article>

        <motion.article className="card" {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.2 }}>
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
          {state.todos.length === 0 ? (
            <p className="empty-state">✨ Keine Todos offen.</p>
          ) : (
            <ul>
              <AnimatePresence initial={false}>
                {state.todos.map((todo) => (
                  <motion.li
                    key={todo.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={itemTransition}
                  >
                    <label className="todo-label">
                      <motion.input
                        type="checkbox"
                        checked={todo.done}
                        onChange={() =>
                          setState((prev) => ({
                            ...prev,
                            todos: prev.todos.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t))
                          }))
                        }
                        whileTap={{ scale: 0.9 }}
                      />{' '}
                      <motion.span
                        className={todo.done ? 'done' : ''}
                        animate={todo.done ? { scale: [1, 1.04, 1], color: '#2f8650' } : { scale: 1, color: '#102a1d' }}
                        transition={{ duration: 0.28 }}
                      >
                        <span className={`badge badge-${todo.type}`}>{todo.type}</span> {todo.task}
                      </motion.span>
                    </label>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
          <form onSubmit={addTodo}>
            <input name="task" placeholder="Aufgabe" required />
            <select name="type" defaultValue="wässern">
              <option value="wässern">wässern</option>
              <option value="düngen">düngen</option>
            </select>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} type="submit">Todo hinzufügen</motion.button>
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
                  />{' '}
                  <span className={todo.done ? 'done' : ''}>
                    [{todo.type}/{todo.priority}] {todo.task}
                    {todo.dueDate && ` · fällig: ${todo.dueDate}`}
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
            <button className="btn-primary" type="submit">Todo hinzufügen</button>
          </form>
        </motion.article>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
