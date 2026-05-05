import React from 'react';

export function TodosCard({ todos, setState, className = '' }) {
  const addTodo = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const task = String(formData.get('task') || '').trim();
    const type = String(formData.get('type') || 'wässern');
    if (!task) return;

    setState((prev) => ({
      ...prev,
      todos: [...prev.todos, { id: crypto.randomUUID(), task, type, done: false }]
    }));
    e.currentTarget.reset();
  };

  const toggleTodo = (todoId) => {
    setState((prev) => ({
      ...prev,
      todos: prev.todos.map((todo) => (todo.id === todoId ? { ...todo, done: !todo.done } : todo))
    }));
  };

  return (
    <article className={`card-base stack-md ${className}`.trim()}>
      <div className="card-top">
        <h2 className="card-header"><span aria-hidden="true">✅</span> Todos (Wässern & Düngen)</h2>
        <button className="btn-secondary" type="button">Fokus</button>
      </div>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <label className="todo-item">
              <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} />{' '}
              <span className={todo.done ? 'todo-item done' : 'todo-item'}>
                <span className={todo.type === 'wässern' ? 'chip chip-wasser' : 'chip chip-duenger'}>{todo.type}</span> {todo.task}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <form className="stack-md" onSubmit={addTodo}>
        <input className="field-control" name="task" placeholder="Aufgabe" required />
        <select className="field-control" name="type" defaultValue="wässern">
          <option value="wässern">wässern</option>
          <option value="düngen">düngen</option>
        </select>
        <button className="btn-cta" type="submit">Todo hinzufügen</button>
      </form>
    </article>
  );
}
