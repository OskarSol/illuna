import React, { useEffect, useMemo, useState } from 'react';

export function EventsCard({ events, setState }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const sortedEvents = useMemo(() => [...events].sort((a, b) => a.date.localeCompare(b.date)), [events]);

  useEffect(() => {
    if (!showSuccess) return undefined;
    const timer = window.setTimeout(() => setShowSuccess(false), 1400);
    return () => window.clearTimeout(timer);
  }, [showSuccess]);

  const addEvent = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const title = String(formData.get('title') || '').trim();
    const date = String(formData.get('date') || '').trim();
    if (!title || !date) {
      setIsSubmitting(false);
      return;
    }

    setState((prev) => ({ ...prev, events: [...prev.events, { id: crypto.randomUUID(), title, date }] }));
    e.currentTarget.reset();
    setShowSuccess(true);
    window.setTimeout(() => setIsSubmitting(false), 250);
  };

  return (
    <article className="card-base stack-md">
      <div className="card-top">
        <h2 className="card-header"><span className="feature-icon" aria-hidden="true">🗓️</span> Kalender</h2>
        <button className="btn-secondary" type="button">Nächster</button>
      </div>
      {sortedEvents.length === 0 ? (
        <p className="empty-state">Noch keine Termine geplant. Plane jetzt deinen ersten Termin.</p>
      ) : (
        <ul>
          {sortedEvents.map((event) => (
            <li key={event.id}><strong>{event.date}</strong>: {event.title}</li>
          ))}
        </ul>
      )}
      <form className="stack-md" onSubmit={addEvent}>
        <div className="form-segment stack-sm">
          <label className="field-label" htmlFor="event-title">Terminname</label>
          <p className="field-helper">Zum Beispiel: Aussaat, Umtopfen oder Ernte.</p>
          <input id="event-title" className="field-control" name="title" required />
        </div>
        <div className="form-segment stack-sm">
          <label className="field-label" htmlFor="event-date">Datum</label>
          <p className="field-helper">Wann soll der Termin stattfinden?</p>
          <input id="event-date" className="field-control" name="date" type="date" required />
        </div>
        <div className="form-action-row">
          <button className="btn-cta" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>{isSubmitting ? 'Wird hinzugefügt …' : 'Termin hinzufügen'}</button>
          <span className={`success-feedback ${showSuccess ? 'is-visible' : ''}`} aria-live="polite">Termin gespeichert.</span>
        </div>
      </form>
    </article>
  );
}
