import { Router } from 'express'
import { db } from '../database.js'
import { encrypt, decrypt } from '../encryption.js'
import type { Request, Response } from 'express'

function now() { return new Date().toISOString() }

const ENCRYPTED_KEYS = new Set(['api.key'])

export const settingsRouter = Router()

settingsRouter.get('/', (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const rows = db.prepare('SELECT key, value, value_type, updated_at FROM app_settings WHERE user_id = ?').all(userId) as { key: string; value: string; value_type: string; updated_at: string }[]
  const settings: Record<string, { value: string; valueType: string; updatedAt: string }> = {}
  try {
    for (const row of rows) {
      const value = ENCRYPTED_KEYS.has(row.key) ? decrypt(row.value) : row.value
      settings[row.key] = { value, valueType: row.value_type, updatedAt: row.updated_at }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim Entschlüsseln von Einstellungen'
    res.status(500).json({ error: message })
    return
  }
  res.json(settings)
})

settingsRouter.put('/:key', (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const key = req.params['key'] as string
  const { value, valueType } = req.body ?? {}
  if (value === undefined) {
    res.status(400).json({ error: 'value ist erforderlich' })
    return
  }
  const plainValue = String(value)
  let storedValue = plainValue
  if (ENCRYPTED_KEYS.has(key)) {
    try {
      storedValue = encrypt(plainValue)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fehler beim Verschlüsseln von Einstellungen'
      res.status(500).json({ error: message })
      return
    }
  }
  const ts = now()
  db.prepare(`INSERT INTO app_settings (user_id, key, value, value_type, updated_at) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, value_type = excluded.value_type, updated_at = excluded.updated_at`)
    .run(userId, key, storedValue, valueType ?? 'string', ts)
  res.json({ key, value: plainValue, valueType: valueType ?? 'string', updatedAt: ts })
})
