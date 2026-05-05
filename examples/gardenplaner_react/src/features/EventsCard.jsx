import React, { useMemo } from 'react';

export function EventsCard({ events, setState }) {
  const sortedEvents = useMemo(() => [...events].sort((a, b) => a.date.localeCompare(b.date)), [events]);

  const addEvent = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = String(formData.get('title') || '').trim();
    const date = String(formData.get('date') || '').trim();
    if (!title || !date) return;

    setState((prev) => ({
      ...prev,
      events: [...prev.events, { id: crypto.randomUUID(), title, date }]
    }));
    e.currentTarget.reset();
  };

  return (
    <article className="card-base stack-md">
      <h2 className="card-header">Kalender</h2>
      <ul>
        {sortedEvents.map((event) => (
          <li key={event.id}>
            <strong>{event.date}</strong>: {event.title}
          </li>
        ))}
      </ul>
      <form className="stack-md" onSubmit={addEvent}>
        <input className="field-control" name="title" placeholder="Termin" required />
        <input className="field-control" name="date" type="date" required />
        <button className="btn-cta" type="submit">Termin hinzufügen</button>
      </form>
    </article>
  );
}
