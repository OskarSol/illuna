import React from 'react';

export function PlantsCard({ plants, setState }) {
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

  return (
    <article className="card">
      <h2>Meine Pflanzen</h2>
      <ul>
        {plants.map((plant) => (
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
  );
}
