import { create } from 'zustand'
import { api } from './api/client'
import type { UiToken } from './db'

export interface UiState {
  profileId: string
  tokens: Record<string, string>
  elements: Record<string, string>
  ready: boolean
  init: () => Promise<void>
  setToken: (tokenPath: string, value: string, valueType?: UiToken['valueType']) => Promise<void>
  setElementValue: (elementKey: string, value: string, valueType?: UiToken['valueType']) => Promise<void>
}

function applyCssVariables(tokens: Record<string, string>) {
  const root = document.documentElement
  Object.entries(tokens).forEach(([path, value]) => {
    root.style.setProperty(`--${path.replaceAll('.', '-')}`, value)
  })
}

function isTokenKey(key: string) {
  return !key.startsWith('text.') && !key.startsWith('icon.')
}

function buildTokensAndElements(
  tokenRows: { tokenPath: string; value: string }[],
  elementRows: { elementKey: string; value: string }[]
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
  return { tokens, elements }
}

interface ActiveProfileResponse {
  profileId: string
  tokenRows: { tokenPath: string; value: string; valueType: string }[]
  elementRows: { elementKey: string; value: string }[]
}

export const useUiStore = create<UiState>((set, get) => ({
  profileId: '',
  tokens: {},
  elements: {},
  ready: false,

  init: async () => {
    const data = await api.get<ActiveProfileResponse>('/api/ui/active-profile')
    const { tokens, elements } = buildTokensAndElements(data.tokenRows, data.elementRows)
    applyCssVariables(tokens)
    set({ profileId: data.profileId, tokens, elements, ready: true })
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
}))
