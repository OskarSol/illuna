import { create } from 'zustand'
import { api } from './api/client'
import type { SkillLevel, UiToken } from './db'

export interface UiState {
  profileId: string
  tokens: Record<string, string>
  elements: Record<string, string>
  elementSkillLevels: Record<string, SkillLevel>
  skillLevel: SkillLevel
  ready: boolean
  init: () => Promise<void>
  setToken: (tokenPath: string, value: string, valueType?: UiToken['valueType']) => Promise<void>
  setElementValue: (elementKey: string, value: string, valueType?: UiToken['valueType']) => Promise<void>
  setElementSkillLevel: (elementKey: string, skillLevel: SkillLevel) => Promise<void>
  setSkillLevel: (skillLevel: SkillLevel) => Promise<void>
  isVisible: (elementKey: string) => boolean
  startPolling: (intervalMs?: number) => void
  stopPolling: () => void
}

function applyCssVariables(tokens: Record<string, string>) {
  const root = document.documentElement
  Object.entries(tokens).forEach(([path, value]) => {
    root.style.setProperty(`--${path.replaceAll('.', '-')}`, value)
  })
}

function isTokenKey(key: string) {
  return !key.startsWith('text.') && !key.startsWith('icon.') && !key.startsWith('visibility.')
}

interface ElementRow { elementKey: string; value: string; skillLevel?: string }

function buildTokensAndElements(
  tokenRows: { tokenPath: string; value: string }[],
  elementRows: ElementRow[]
) {
  const tokens = tokenRows.reduce<Record<string, string>>((acc, t) => {
    acc[t.tokenPath] = t.value
    return acc
  }, {})
  elementRows.forEach(e => {
    if (isTokenKey(e.elementKey)) tokens[e.elementKey] = e.value
  })
  const elements = elementRows.reduce<Record<string, string>>((acc, e) => {
    acc[e.elementKey] = e.value
    return acc
  }, {})
  const elementSkillLevels = elementRows.reduce<Record<string, SkillLevel>>((acc, e) => {
    const lvl = e.skillLevel === 'beginner' || e.skillLevel === 'expert' ? e.skillLevel : 'all'
    acc[e.elementKey] = lvl
    return acc
  }, {})
  return { tokens, elements, elementSkillLevels }
}

interface ActiveProfileResponse {
  profileId: string
  skillLevel?: string
  tokenRows: { tokenPath: string; value: string; valueType: string }[]
  elementRows: ElementRow[]
}

function normalizeSkillLevel(value: string | undefined): SkillLevel {
  return value === 'expert' || value === 'all' ? value : 'beginner'
}

let _pollTimer: ReturnType<typeof setInterval> | null = null

export const useUiStore = create<UiState>((set, get) => ({
  profileId: '',
  tokens: {},
  elements: {},
  elementSkillLevels: {},
  skillLevel: 'beginner',
  ready: false,

  init: async () => {
    const data = await api.get<ActiveProfileResponse>('/api/ui/active-profile')
    const { tokens, elements, elementSkillLevels } = buildTokensAndElements(data.tokenRows, data.elementRows)
    applyCssVariables(tokens)
    set({
      profileId: data.profileId,
      tokens,
      elements,
      elementSkillLevels,
      skillLevel: normalizeSkillLevel(data.skillLevel),
      ready: true,
    })
  },

  startPolling: (intervalMs = 3000) => {
    if (_pollTimer) clearInterval(_pollTimer)
    _pollTimer = setInterval(async () => {
      try {
        const data = await api.get<ActiveProfileResponse>('/api/ui/active-profile')
        const next = buildTokensAndElements(data.tokenRows, data.elementRows)
        const cur = get()
        const tokensChanged = Object.keys(next.tokens).some(k => cur.tokens[k] !== next.tokens[k])
        const elementsChanged = Object.keys(next.elements).some(k => cur.elements[k] !== next.elements[k])
        const skillsChanged = Object.keys(next.elementSkillLevels).some(k => cur.elementSkillLevels[k] !== next.elementSkillLevels[k])
        const skillLevel = normalizeSkillLevel(data.skillLevel)
        const skillLevelChanged = cur.skillLevel !== skillLevel
        if (tokensChanged || elementsChanged || skillsChanged || skillLevelChanged) {
          applyCssVariables(next.tokens)
          set({
            tokens: next.tokens,
            elements: next.elements,
            elementSkillLevels: next.elementSkillLevels,
            skillLevel,
          })
        }
      } catch {
        // silently ignore poll errors
      }
    }, intervalMs)
  },

  stopPolling: () => {
    if (_pollTimer) {
      clearInterval(_pollTimer)
      _pollTimer = null
    }
  },

  setToken: async (tokenPath, value, valueType = 'string') => {
    await api.put(`/api/ui/tokens/${encodeURIComponent(tokenPath)}`, { value, valueType })
    set((state) => {
      const nextTokens = { ...state.tokens, [tokenPath]: value }
      applyCssVariables(nextTokens)
      return { tokens: nextTokens }
    })
  },

  setElementValue: async (elementKey, value, valueType = 'string') => {
    await api.put(`/api/ui/elements/${encodeURIComponent(elementKey)}`, { value, valueType })
    if (isTokenKey(elementKey)) {
      await get().setToken(elementKey, value, valueType)
    }
    set((state) => ({ elements: { ...state.elements, [elementKey]: value } }))
  },

  setElementSkillLevel: async (elementKey, skillLevel) => {
    await api.put(`/api/ui/elements/${encodeURIComponent(elementKey)}`, { skillLevel })
    set((state) => ({ elementSkillLevels: { ...state.elementSkillLevels, [elementKey]: skillLevel } }))
  },

  setSkillLevel: async (skillLevel) => {
    await api.put('/api/settings/ui.skillLevel', { value: skillLevel, valueType: 'string' })
    set({ skillLevel })
  },

  isVisible: (key: string) => {
    const state = get()
    const visKey = key.startsWith('visibility.') ? key : `visibility.${key}`
    const flag = state.elements[visKey]
    if (flag === 'false') return false
    const lvl = state.elementSkillLevels[visKey] ?? 'all'
    if (lvl !== 'all' && lvl !== state.skillLevel) return false
    return true
  },
}))
