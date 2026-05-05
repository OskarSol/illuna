import React, { useEffect, useState } from 'react';

export function PlantsCard({ plants, setState }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!showSuccess) return undefined;
    const timer = window.setTimeout(() => setShowSuccess(false), 1400);
    return () => window.clearTimeout(timer);
  }, [showSuccess]);

  const addPlant = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const note = String(formData.get('note') || '').trim();
    if (!name) {
      setIsSubmitting(false);
      return;
    }

    setState((prev) => ({
      ...prev,
      plants: [...prev.plants, { id: crypto.randomUUID(), name, note }]
    }));
    e.currentTarget.reset();
    setShowSuccess(true);
    window.setTimeout(() => setIsSubmitting(false), 250);
  };

  return (
    <article className="card-base stack-md">
      <div className="card-top">
        <h2 className="card-header"><span aria-hidden="true">🪴</span> Meine Pflanzen</h2>
        <button className="btn-secondary" type="button">Übersicht</button>
      </div>
      {plants.length === 0 ? (
        <p className="empty-state">Noch keine Pflanzen vorhanden. Füge deine erste Pflanze hinzu.</p>
      ) : (
        <ul>
          {plants.map((plant) => (
            <li key={plant.id}>
              <strong>{plant.name}</strong>
              {plant.note && <span> — {plant.note}</span>}
            </li>
          ))}
        </ul>
      )}
      <form className="stack-md" onSubmit={addPlant}>
        <div className="form-segment stack-sm">
          <label className="field-label" htmlFor="plant-name">Pflanzenname</label>
          <p className="field-helper">Gib den Namen ein, wie du ihn im Garten erkennst.</p>
          <input id="plant-name" className="field-control" name="name" required />
        </div>
        <div className="form-segment stack-sm">
          <label className="field-label" htmlFor="plant-note">Notiz</label>
          <p className="field-helper">Optional: Standort oder Pflegehinweis.</p>
          <input id="plant-note" className="field-control" name="note" />
        </div>
        <div className="form-action-row">
          <button className="btn-cta" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? 'Wird hinzugefügt …' : 'Pflanze hinzufügen'}
          </button>
          <span className={`success-feedback ${showSuccess ? 'is-visible' : ''}`} aria-live="polite">Erfolgreich hinzugefügt.</span>
        </div>
      </form>
    </article>
  );
}
