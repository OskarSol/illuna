import { Router } from 'express'
import { db } from '../database.js'
import { DEFAULT_UI_ELEMENTS, ensureUserUiElements } from '../seed.js'
import type { Request, Response } from 'express'

function now() { return new Date().toISOString() }
function uid() { return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10) }

export const uiRouter = Router()

function getActiveProfile(userId: string): { id: string } | undefined {
  return db.prepare('SELECT id FROM ui_profiles WHERE user_id = ? AND is_active = 1').get(userId) as { id: string } | undefined
}

uiRouter.get('/active-profile', (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  ensureUserUiElements(userId)
  const profile = getActiveProfile(userId)
  if (!profile) {
    res.status(404).json({ error: 'Kein aktives Profil gefunden' })
    return
  }
  const tokenRows = db.prepare('SELECT token_path, value, value_type FROM ui_tokens WHERE user_id = ? AND profile_id = ?').all(userId, profile.id) as { token_path: string; value: string; value_type: string }[]
  const elementRows = db.prepare('SELECT element_key, value, skill_level FROM ui_elements WHERE user_id = ? AND profile_id = ?').all(userId, profile.id) as { element_key: string; value: string; skill_level: string }[]
  const skillLevelRow = db.prepare(`SELECT value FROM app_settings WHERE user_id = ? AND key = 'ui.skillLevel'`).get(userId) as { value: string } | undefined

  res.json({
    profileId: profile.id,
    skillLevel: skillLevelRow?.value ?? 'beginner',
    tokenRows: tokenRows.map(r => ({ tokenPath: r.token_path, value: r.value, valueType: r.value_type })),
    elementRows: elementRows.map(r => ({ elementKey: r.element_key, value: r.value, skillLevel: r.skill_level })),
  })
})

uiRouter.get('/elements', (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const profile = getActiveProfile(userId)
  if (!profile) { res.json([]); return }
  const rows = db.prepare('SELECT * FROM ui_elements WHERE user_id = ? AND profile_id = ?').all(userId, profile.id)
  res.json(rows)
})

uiRouter.put('/elements/:elementKey', (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const { elementKey } = req.params
  const { value, valueType, skillLevel } = req.body ?? {}
  if (value === undefined && skillLevel === undefined) {
    res.status(400).json({ error: 'value oder skillLevel erforderlich' })
    return
  }
  if (skillLevel !== undefined && !['all', 'beginner', 'expert'].includes(String(skillLevel))) {
    res.status(400).json({ error: 'skillLevel ungültig' })
    return
  }
  const profile = getActiveProfile(userId)
  if (!profile) { res.status(404).json({ error: 'Kein aktives Profil' }); return }
  const ts = now()
  const existing = db.prepare('SELECT id FROM ui_elements WHERE user_id = ? AND profile_id = ? AND element_key = ?').get(userId, profile.id, elementKey)
  if (existing) {
    db.prepare(`UPDATE ui_elements
        SET value = COALESCE(?, value),
            value_type = COALESCE(?, value_type),
            skill_level = COALESCE(?, skill_level),
            updated_at = ?
        WHERE user_id = ? AND profile_id = ? AND element_key = ?`)
      .run(value ?? null, valueType ?? null, skillLevel ?? null, ts, userId, profile.id, elementKey)
  } else {
    const seed = DEFAULT_UI_ELEMENTS.find(e => e.elementKey === elementKey)
    const insertedValue = value ?? seed?.value ?? ''
    db.prepare(`INSERT INTO ui_elements (id, user_id, profile_id, element_key, label, description, value, default_value, value_type, category, skill_level, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(uid(), userId, profile.id, elementKey, seed?.label ?? elementKey, seed?.description ?? '', insertedValue, seed?.value ?? insertedValue, valueType ?? seed?.valueType ?? 'string', seed?.category ?? 'text', skillLevel ?? seed?.skillLevel ?? 'all', ts)
  }
  res.json({ elementKey, value, skillLevel, updatedAt: ts })
})

uiRouter.get('/tokens', (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const profile = getActiveProfile(userId)
  if (!profile) { res.json([]); return }
  const rows = db.prepare('SELECT token_path, value, value_type FROM ui_tokens WHERE user_id = ? AND profile_id = ?').all(userId, profile.id)
  res.json(rows)
})

uiRouter.put('/tokens/:tokenPath', (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const tokenPath = decodeURIComponent(req.params.tokenPath)
  const { value, valueType } = req.body ?? {}
  if (value === undefined) { res.status(400).json({ error: 'value erforderlich' }); return }
  const profile = getActiveProfile(userId)
  if (!profile) { res.status(404).json({ error: 'Kein aktives Profil' }); return }
  const ts = now()
  db.prepare(`INSERT INTO ui_tokens (id, user_id, profile_id, token_path, value, value_type, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, profile_id, token_path) DO UPDATE SET value = excluded.value, value_type = excluded.value_type, updated_at = excluded.updated_at`)
    .run(uid(), userId, profile.id, tokenPath, value, valueType ?? 'string', ts)
  res.json({ tokenPath, value, updatedAt: ts })
})

uiRouter.post('/reset-to-default', (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const profile = getActiveProfile(userId)
  if (!profile) { res.status(404).json({ error: 'Kein aktives Profil' }); return }
  const ts = now()
  const reset = db.transaction(() => {
    for (const el of DEFAULT_UI_ELEMENTS) {
      db.prepare('UPDATE ui_elements SET value = ?, updated_at = ? WHERE user_id = ? AND profile_id = ? AND element_key = ?')
        .run(el.value, ts, userId, profile.id, el.elementKey)
      if (!el.elementKey.startsWith('text.') && !el.elementKey.startsWith('icon.')) {
        db.prepare('UPDATE ui_tokens SET value = ?, updated_at = ? WHERE user_id = ? AND profile_id = ? AND token_path = ?')
          .run(el.value, ts, userId, profile.id, el.elementKey)
      }
    }
  })
  reset()
  res.json({ ok: true })
})

uiRouter.get('/db-tables', (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const plants = db.prepare('SELECT * FROM plants WHERE user_id = ?').all(userId)
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ?').all(userId)
  const settings = db.prepare('SELECT * FROM app_settings WHERE user_id = ?').all(userId)
  const profile = getActiveProfile(userId)
  const profileId = profile?.id
  const elements = profileId ? db.prepare('SELECT * FROM ui_elements WHERE user_id = ? AND profile_id = ?').all(userId, profileId) : []
  const tokens = profileId ? db.prepare('SELECT * FROM ui_tokens WHERE user_id = ? AND profile_id = ?').all(userId, profileId) : []
  res.json({ plants, tasks, app_settings: settings, ui_elements: elements, ui_tokens: tokens })
})
