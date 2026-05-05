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
    <article className="card">
      <h2>Kalender</h2>
      <ul>
        {sortedEvents.map((event) => (
          <li key={event.id}>
            <strong>{event.date}</strong>: {event.title}
          </li>
        ))}
      </ul>
      <form onSubmit={addEvent}>
        <input name="title" placeholder="Termin" required />
        <input name="date" type="date" required />
        <button type="submit">Termin hinzufügen</button>
      </form>
    </article>
  );
}
