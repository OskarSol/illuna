import React from 'react';

export function GardenLocationCard({ value, onChange }) {
  return (
    <section className="card">
      <h2>Standort des Gartens</h2>
      <input type="text" placeholder="z. B. Hinterhof Berlin" value={value} onChange={onChange} />
    </section>
  );
}
