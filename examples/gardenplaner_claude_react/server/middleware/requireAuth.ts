import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../auth.js'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.auth_token
  if (!token) {
    res.status(401).json({ error: 'Nicht eingeloggt' })
    return
  }
  try {
    const { userId } = verifyToken(token)
    ;(req as Request & { userId: string }).userId = userId
    next()
  } catch {
    res.status(401).json({ error: 'Sitzung abgelaufen' })
  }
}
