import jwt from 'jsonwebtoken'
import type { CookieOptions } from 'express'

if (!process.env.JWT_SECRET) {
  throw new Error('[auth] JWT_SECRET environment variable is required. Set it in .env or the environment before starting the server.')
}

const JWT_SECRET = process.env.JWT_SECRET

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
