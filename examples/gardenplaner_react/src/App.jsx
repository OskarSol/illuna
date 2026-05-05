import React, { useMemo } from 'react';
import { AppShell } from './components/AppShell';
import { EventsCard } from './features/EventsCard';
import { PlantsCard } from './features/PlantsCard';
import { TodosCard } from './features/TodosCard';
import { useGardenState } from './hooks/useGardenState';

export default function App() {
  const [state, setState] = useGardenState();

  const metrics = useMemo(() => {
    const openTodos = state.todos.filter((todo) => !todo.done).length;
    const today = new Date().toISOString().slice(0, 10);
    const todayTasks = state.events.filter((event) => event.date === today).length;
    const nextEvent = [...state.events].sort((a, b) => a.date.localeCompare(b.date)).find((event) => event.date >= today);

    return {
      openTodos,
      todayTasks,
      nextEvent: nextEvent ? `${nextEvent.date}: ${nextEvent.title}` : 'Kein Termin geplant'
    };
  }, [state.events, state.todos]);

  const header = (
    <div className="top-bar">
      <div>
        <h1>🌱 Gartenplaner</h1>
        <p className="context-line">Plane heute klar, was deinem Garten guttut.</p>
      </div>
      <div className="top-actions">
        <input
          className="field-control"
          type="text"
          placeholder="z. B. Hinterhof Berlin"
          value={state.gardenLocation}
          onChange={(e) => setState((prev) => ({ ...prev, gardenLocation: e.target.value }))}
        />
        <button className="btn-cta" type="button">Neuer Eintrag</button>
      </div>
    </div>
  );

  return (
    <AppShell
      header={header}
      stickyActions={<button className="btn-secondary" type="button">Heute priorisieren</button>}
    >
      <section className="kpi-row" aria-label="Statusübersicht">
        <article className="metric">
          <span className="metric-label"><span className="metric-icon" aria-hidden="true">✓</span>Heutige Aufgaben</span>
          <strong>{metrics.todayTasks}</strong>
        </article>
        <article className="metric">
          <span className="metric-label"><span className="metric-icon" aria-hidden="true">•</span>Offene Aufgaben</span>
          <strong>{metrics.openTodos}</strong>
        </article>
        <article className="metric">
          <span className="metric-label"><span className="metric-icon" aria-hidden="true">◦</span>Nächster Termin</span>
          <strong>{metrics.nextEvent}</strong>
        </article>
      </section>

      <section className="layout-grid" aria-label="Inhalte">
        <TodosCard todos={state.todos} setState={setState} className="span-two" />
        <PlantsCard plants={state.plants} setState={setState} />
        <EventsCard events={state.events} setState={setState} />
      </section>
    </AppShell>
  );
}
