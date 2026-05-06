import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { api, ApiError } from '../api/client'

export interface AuthUser {
  id: string
  username: string
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<AuthUser>('/api/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handle = () => setUser(null)
    window.addEventListener('auth:logout', handle)
    return () => window.removeEventListener('auth:logout', handle)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const u = await api.post<AuthUser>('/api/auth/login', { username, password })
    setUser(u)
  }, [])

  const register = useCallback(async (username: string, password: string) => {
    const u = await api.post<AuthUser>('/api/auth/register', { username, password })
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    await api.post('/api/auth/logout', {})
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden')
  return ctx
}
