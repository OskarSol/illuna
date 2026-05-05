import React from 'react';
import { createRoot } from 'react-dom/client';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

  const doneToday = state.todos.filter((todo) => todo.done).length;
  const totalTodos = state.todos.length;
  const progress = totalTodos === 0 ? 0 : Math.round((doneToday / totalTodos) * 100);

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

      <motion.section className="card" {...cardMotion}>
        <h2>Standort des Gartens</h2>
        <input
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
          </form>
        </motion.article>

        <motion.article className="card" {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.2 }}>
          <h2>Todos (Wässern & Düngen)</h2>
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
          </form>
        </motion.article>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
