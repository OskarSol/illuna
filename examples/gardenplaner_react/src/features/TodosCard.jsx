import React, { useEffect, useState } from 'react';

export function TodosCard({ todos, setState, className = '' }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!showSuccess) return undefined;
    const timer = window.setTimeout(() => setShowSuccess(false), 1400);
    return () => window.clearTimeout(timer);
  }, [showSuccess]);

  const addTodo = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const task = String(formData.get('task') || '').trim();
    const type = String(formData.get('type') || 'wässern');
    if (!task) {
      setIsSubmitting(false);
      return;
    }

    setState((prev) => ({ ...prev, todos: [...prev.todos, { id: crypto.randomUUID(), task, type, done: false }] }));
    e.currentTarget.reset();
    setShowSuccess(true);
    window.setTimeout(() => setIsSubmitting(false), 250);
  };

  const toggleTodo = (todoId) => {
    setState((prev) => ({ ...prev, todos: prev.todos.map((todo) => (todo.id === todoId ? { ...todo, done: !todo.done } : todo)) }));
  };

  return (
    <article className={`card-base stack-md ${className}`.trim()}>
      <div className="card-top">
        <h2 className="card-header"><span className="feature-icon" aria-hidden="true">☑️</span> Aufgaben</h2>
        <button className="btn-secondary" type="button">Fokus</button>
      </div>
      {todos.length === 0 ? (
        <p className="empty-state">Keine Aufgaben offen. Lege jetzt deine erste Aufgabe an.</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              <label className="todo-item">
                <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} />{' '}
                <span className={todo.done ? 'todo-item done' : 'todo-item'}>
                  <span className={todo.type === 'wässern' ? 'chip chip-wasser' : 'chip chip-duenger'}><span aria-hidden="true" className="chip-icon">{todo.type === 'wässern' ? '💧' : '🧪'}</span>{todo.type}</span> {todo.task}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
      <form className="stack-md" onSubmit={addTodo}>
        <div className="form-segment stack-sm">
          <label className="field-label" htmlFor="todo-task">Aufgabe</label>
          <p className="field-helper">Beschreibe kurz, was erledigt werden soll.</p>
          <input id="todo-task" className="field-control" name="task" required />
        </div>
        <div className="form-segment stack-sm">
          <label className="field-label" htmlFor="todo-type">Typ</label>
          <p className="field-helper">Wähle die Art der Pflege-Aufgabe.</p>
          <select id="todo-type" className="field-control" name="type" defaultValue="wässern">
            <option value="wässern">wässern</option>
            <option value="düngen">düngen</option>
          </select>
        </div>
        <div className="form-action-row">
          <button className="btn-cta" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>{isSubmitting ? 'Wird hinzugefügt …' : 'Todo hinzufügen'}</button>
          <span className={`success-feedback ${showSuccess ? 'is-visible' : ''}`} aria-live="polite">Todo angelegt.</span>
        </div>
      </form>
    </article>
  );
}
