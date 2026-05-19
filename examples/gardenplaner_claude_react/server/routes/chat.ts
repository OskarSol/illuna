import { Router } from 'express'
import { db } from '../database.js'
import { decrypt } from '../encryption.js'
import type { Request, Response } from 'express'

export const chatRouter = Router()

chatRouter.post('/', async (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId

  const keyRow = db.prepare("SELECT value FROM app_settings WHERE user_id = ? AND key = 'api.key'").get(userId) as { value: string } | undefined
  const urlRow = db.prepare("SELECT value FROM app_settings WHERE user_id = ? AND key = 'api.url'").get(userId) as { value: string } | undefined

  if (!keyRow?.value || !urlRow?.value) {
    res.status(400).json({ error: 'API-Einstellungen fehlen' })
    return
  }

  const apiKey = decrypt(keyRow.value)
  const apiUrl = urlRow.value

  try {
    const upstream = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'x-api-key': apiKey,
      },
      body: JSON.stringify(req.body),
    })

    const text = await upstream.text()

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `Upstream-Fehler: ${upstream.status}` })
      return
    }

    res.json({ reply: text })
  } catch {
    res.status(502).json({ error: 'Upstream nicht erreichbar' })
  }
})
