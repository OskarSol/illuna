import React from 'react';

export function TodosCard({ todos, setState }) {
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
    <article className="card">
      <h2>Todos (Wässern & Düngen)</h2>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} />{' '}
              <span className={todo.done ? 'done' : ''}>
                [{todo.type}] {todo.task}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <form onSubmit={addTodo}>
        <input name="task" placeholder="Aufgabe" required />
        <select name="type" defaultValue="wässern">
          <option value="wässern">wässern</option>
          <option value="düngen">düngen</option>
        </select>
        <button type="submit">Todo hinzufügen</button>
      </form>
    </article>
  );
}
