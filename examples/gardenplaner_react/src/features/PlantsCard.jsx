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
    <article className="card-base stack-md">
      <div className="card-top">
        <h2 className="card-header"><span aria-hidden="true">🪴</span> Meine Pflanzen</h2>
        <button className="btn-secondary" type="button">Übersicht</button>
      </div>
      <ul>
        {plants.map((plant) => (
          <li key={plant.id}>
            <strong>{plant.name}</strong>
            {plant.note && <span> — {plant.note}</span>}
          </li>
        ))}
      </ul>
      <form className="stack-md" onSubmit={addPlant}>
        <input className="field-control" name="name" placeholder="Pflanzenname" required />
        <input className="field-control" name="note" placeholder="Notiz" />
        <button className="btn-cta" type="submit">Pflanze hinzufügen</button>
      </form>
    </article>
  );
}
