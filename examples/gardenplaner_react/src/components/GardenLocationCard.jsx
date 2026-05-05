import React from 'react';

export function GardenLocationCard({ value, onChange }) {
  return (
    <section className="card-base stack-md">
      <h2 className="card-header">Standort des Gartens</h2>
      <div className="form-segment stack-sm">
        <label className="field-label" htmlFor="garden-location">Standort</label>
        <p className="field-helper">Hilft bei Wetter, Pflege-Tipps und Planung.</p>
        <input id="garden-location" className="field-control" type="text" value={value} onChange={onChange} />
      </div>
    </section>
  );
}
