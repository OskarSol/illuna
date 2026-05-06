import { Router } from 'express'
import { db } from '../database.js'
import { addDays, addWeeks, addMonths, format } from 'date-fns'
import type { Request, Response } from 'express'

function uid() { return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10) }
function now() { return new Date().toISOString() }

interface RecurringRule { type: 'daily' | 'weekly' | 'monthly'; interval: number }

function nextDueDate(dueDate: string, recurring: RecurringRule): string {
  const base = new Date(dueDate)
  if (recurring.type === 'daily') return format(addDays(base, recurring.interval), 'yyyy-MM-dd')
  if (recurring.type === 'weekly') return format(addWeeks(base, recurring.interval), 'yyyy-MM-dd')
  return format(addMonths(base, recurring.interval), 'yyyy-MM-dd')
}

function rowToTask(row: Record<string, unknown>) {
  return {
    ...row,
    completed: row.completed === 1,
    recurring: row.recurring ? JSON.parse(row.recurring as string) : undefined,
  }
}

export const tasksRouter = Router()

tasksRouter.get('/', (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const rows = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC').all(userId) as Record<string, unknown>[]
  res.json(rows.map(rowToTask))
})

tasksRouter.post('/', (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const { plantId, title, taskType, dueDate, notes, recurring } = req.body ?? {}
  if (!plantId || !title || !taskType || !dueDate) {
    res.status(400).json({ error: 'plantId, title, taskType, dueDate sind erforderlich' })
    return
  }
  const ts = now()
  const id = uid()
  const recurringStr = recurring ? JSON.stringify(recurring) : null
  db.prepare(`INSERT INTO tasks (id, user_id, plant_id, title, task_type, due_date, completed, notes, recurring, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`)
    .run(id, userId, plantId, title, taskType, dueDate, notes ?? null, recurringStr, ts, ts)
  res.status(201).json(rowToTask({ id, user_id: userId, plant_id: plantId, title, task_type: taskType, due_date: dueDate, completed: 0, notes: notes ?? null, recurring: recurringStr, created_at: ts, updated_at: ts }))
})

tasksRouter.put('/:id', (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const { id } = req.params
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(id, userId) as Record<string, unknown> | undefined
  if (!existing) {
    res.status(404).json({ error: 'Aufgabe nicht gefunden' })
    return
  }
  const ts = now()
  const { title, taskType, dueDate, notes, recurring } = req.body ?? {}
  const recurringStr = recurring !== undefined ? (recurring ? JSON.stringify(recurring) : null) : existing.recurring
  db.prepare(`UPDATE tasks SET
    title = COALESCE(?, title), task_type = COALESCE(?, task_type),
    due_date = COALESCE(?, due_date), notes = ?, recurring = ?, updated_at = ?
    WHERE id = ? AND user_id = ?`)
    .run(title ?? null, taskType ?? null, dueDate ?? null, notes ?? null, recurringStr, ts, id, userId)
  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Record<string, unknown>
  res.json(rowToTask(updated))
})

tasksRouter.post('/:id/toggle', (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const { id } = req.params
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(id, userId) as Record<string, unknown> | undefined
  if (!task) {
    res.status(404).json({ error: 'Aufgabe nicht gefunden' })
    return
  }
  const ts = now()
  const newCompleted = task.completed === 0 ? 1 : 0
  db.prepare('UPDATE tasks SET completed = ?, updated_at = ? WHERE id = ?').run(newCompleted, ts, id)
  const toggled = rowToTask({ ...task, completed: newCompleted, updated_at: ts })

  let next = null
  if (newCompleted === 1 && task.recurring) {
    const recurring: RecurringRule = JSON.parse(task.recurring as string)
    const nextId = uid()
    const nextDue = nextDueDate(task.due_date as string, recurring)
    db.prepare(`INSERT INTO tasks (id, user_id, plant_id, title, task_type, due_date, completed, notes, recurring, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`)
      .run(nextId, userId, task.plant_id, task.title, task.task_type, nextDue, task.notes, task.recurring, ts, ts)
    next = rowToTask({ ...task, id: nextId, due_date: nextDue, completed: 0, created_at: ts, updated_at: ts })
  }

  res.json({ toggled, next })
})

tasksRouter.delete('/:id', (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const { id } = req.params
  const existing = db.prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?').get(id, userId)
  if (!existing) {
    res.status(404).json({ error: 'Aufgabe nicht gefunden' })
    return
  }
  db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(id, userId)
  res.status(204).send()
})
