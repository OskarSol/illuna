import jwt from 'jsonwebtoken'
import type { CookieOptions } from 'express'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'

if (!process.env.JWT_SECRET) {
  console.warn('[auth] JWT_SECRET not set – using insecure default. Set JWT_SECRET in .env for production.')
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string }
}

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}
