import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { db } from '../database.js'
import { signToken, verifyToken, COOKIE_OPTIONS } from '../auth.js'
import { seedUserData, ensureUserUiElements } from '../seed.js'
import type { Request, Response } from 'express'

export const authRouter = Router()

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false })
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false })

authRouter.post('/register', registerLimiter, async (req: Request, res: Response) => {
  const { username, password } = req.body ?? {}
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Benutzername und Passwort erforderlich' })
    return
  }
  if (username.trim().length < 2) {
    res.status(400).json({ error: 'Benutzername muss mindestens 2 Zeichen lang sein' })
    return
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen lang sein' })
    return
  }
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username.trim())
  if (existing) {
    res.status(409).json({ error: 'Registrierung fehlgeschlagen' })
    return
  }
  const hash = await bcrypt.hash(password, 12)
  const id = randomUUID()
  db.prepare('INSERT INTO users (id, username, password, created_at) VALUES (?, ?, ?, ?)').run(id, username.trim(), hash, new Date().toISOString())
  seedUserData(id)
  const token = signToken(id)
  res.cookie('auth_token', token, COOKIE_OPTIONS)
  res.json({ id, username: username.trim() })
})

authRouter.post('/login', loginLimiter, async (req: Request, res: Response) => {
  const { username, password } = req.body ?? {}
  if (!username || !password) {
    res.status(400).json({ error: 'Benutzername und Passwort erforderlich' })
    return
  }
  const user = db.prepare('SELECT id, username, password FROM users WHERE username = ?').get(username.trim()) as { id: string; username: string; password: string } | undefined
  if (!user) {
    res.status(401).json({ error: 'Ungültige Anmeldedaten' })
    return
  }
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    res.status(401).json({ error: 'Ungültige Anmeldedaten' })
    return
  }
  ensureUserUiElements(user.id)
  const token = signToken(user.id)
  res.cookie('auth_token', token, COOKIE_OPTIONS)
  res.json({ id: user.id, username: user.username })
})

authRouter.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('auth_token', { httpOnly: true, sameSite: 'strict', secure: COOKIE_OPTIONS.secure })
  res.json({ ok: true })
})

authRouter.get('/me', (req: Request, res: Response) => {
  const token = req.cookies?.auth_token
  if (!token) {
    res.status(401).json({ error: 'Nicht eingeloggt' })
    return
  }
  try {
    const { userId } = verifyToken(token)
    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(userId) as { id: string; username: string } | undefined
    if (!user) {
      res.status(401).json({ error: 'Nutzer nicht gefunden' })
      return
    }
    res.json(user)
  } catch {
    res.status(401).json({ error: 'Sitzung abgelaufen' })
  }
})
