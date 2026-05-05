import React from 'react';

export function GardenLocationCard({ value, onChange }) {
  return (
    <section className="card-base stack-md">
      <h2 className="card-header">Standort des Gartens</h2>
      <input className="field-control" type="text" placeholder="z. B. Hinterhof Berlin" value={value} onChange={onChange} />
    </section>
  );
}
