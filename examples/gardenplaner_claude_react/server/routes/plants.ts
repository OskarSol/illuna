import { Router } from 'express'
import { db } from '../database.js'
import type { Request, Response } from 'express'

function uid() { return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10) }
function now() { return new Date().toISOString() }

export const plantsRouter = Router()

plantsRouter.get('/', (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const plants = db.prepare('SELECT * FROM plants WHERE user_id = ? ORDER BY created_at ASC').all(userId)
  res.json(plants)
})

plantsRouter.post('/', (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const { name, emoji, location, notes } = req.body ?? {}
  if (!name || !emoji) {
    res.status(400).json({ error: 'name und emoji sind erforderlich' })
    return
  }
  const ts = now()
  const id = uid()
  db.prepare(`INSERT INTO plants (id, user_id, name, emoji, location, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(id, userId, name, emoji, location ?? '', notes ?? null, ts, ts)
  res.status(201).json({ id, user_id: userId, name, emoji, location: location ?? '', notes: notes ?? null, created_at: ts, updated_at: ts })
})

plantsRouter.put('/:id', (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const { id } = req.params
  const existing = db.prepare('SELECT id FROM plants WHERE id = ? AND user_id = ?').get(id, userId)
  if (!existing) {
    res.status(404).json({ error: 'Pflanze nicht gefunden' })
    return
  }
  const { name, emoji, location, notes } = req.body ?? {}
  const ts = now()
  db.prepare(`UPDATE plants SET name = COALESCE(?, name), emoji = COALESCE(?, emoji),
    location = COALESCE(?, location), notes = ?, updated_at = ? WHERE id = ? AND user_id = ?`)
    .run(name ?? null, emoji ?? null, location ?? null, notes ?? null, ts, id, userId)
  const updated = db.prepare('SELECT * FROM plants WHERE id = ?').get(id)
  res.json(updated)
})

plantsRouter.delete('/:id', (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const { id } = req.params
  const existing = db.prepare('SELECT id FROM plants WHERE id = ? AND user_id = ?').get(id, userId)
  if (!existing) {
    res.status(404).json({ error: 'Pflanze nicht gefunden' })
    return
  }
  db.transaction(() => {
    db.prepare('DELETE FROM tasks WHERE plant_id = ? AND user_id = ?').run(id, userId)
    db.prepare('DELETE FROM plants WHERE id = ? AND user_id = ?').run(id, userId)
  })()
  res.status(204).send()
})
