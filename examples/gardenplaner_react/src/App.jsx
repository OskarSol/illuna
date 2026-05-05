import React from 'react';
import { AppShell } from './components/AppShell';
import { GardenLocationCard } from './components/GardenLocationCard';
import { EventsCard } from './features/EventsCard';
import { PlantsCard } from './features/PlantsCard';
import { TodosCard } from './features/TodosCard';
import { useGardenState } from './hooks/useGardenState';

export default function App() {
  const [state, setState] = useGardenState();

  return (
    <AppShell>
      <GardenLocationCard
        value={state.gardenLocation}
        onChange={(e) => setState((prev) => ({ ...prev, gardenLocation: e.target.value }))}
      />

      <section className="layout-grid">
        <PlantsCard plants={state.plants} setState={setState} />
        <EventsCard events={state.events} setState={setState} />
        <TodosCard todos={state.todos} setState={setState} />
      </section>
    </AppShell>
  );
}
