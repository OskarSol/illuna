import { create } from 'zustand'
import { db, type UiToken } from './db'

export interface UiState {
  profileId: string
  tokens: Record<string, string>
  elements: Record<string, string>
  ready: boolean
  init: () => Promise<void>
  setToken: (tokenPath: string, value: string, valueType?: UiToken['valueType']) => Promise<void>
  setElementValue: (elementKey: string, value: string, valueType?: UiToken['valueType']) => Promise<void>
}

function now() { return new Date().toISOString() }
function uid() { return Math.random().toString(36).slice(2, 10) }

function applyCssVariables(tokens: Record<string, string>) {
  const root = document.documentElement
  Object.entries(tokens).forEach(([path, value]) => {
    const cssVar = `--${path.replaceAll('.', '-')}`
    root.style.setProperty(cssVar, value)
  })
}

export const useUiStore = create<UiState>((set, get) => ({
  profileId: 'default',
  tokens: {},
  elements: {},
  ready: false,
  init: async () => {
    const active = await db.ui_profiles.where('isActive').equals(1).first()
    const profileId = active?.id ?? 'default'
    const tokenRows = await db.ui_tokens.where('profileId').equals(profileId).toArray()
    const elementRows = await db.ui_elements.where('profileId').equals(profileId).toArray()
    const tokens = tokenRows.reduce<Record<string, string>>((acc, token) => {
      acc[token.tokenPath] = token.value
      return acc
    }, {})
    elementRows.forEach((element) => {
      if (!element.elementKey.startsWith('text.')) tokens[element.elementKey] = element.value
    })
    const elements = elementRows.reduce<Record<string, string>>((acc, element) => {
      acc[element.elementKey] = element.value
      return acc
    }, {})
    applyCssVariables(tokens)
    set({ profileId, tokens, elements, ready: true })
  },
  setToken: async (tokenPath, value, valueType = 'string') => {
    const { profileId, tokens } = get()
    const existing = await db.ui_tokens.where('[profileId+tokenPath]').equals([profileId, tokenPath]).first()
    if (existing) {
      await db.ui_tokens.update(existing.id, { value, valueType, updatedAt: now() })
    } else {
      await db.ui_tokens.add({ id: uid(), profileId, tokenPath, value, valueType, updatedAt: now() })
    }
    const element = await db.ui_elements.where('[profileId+elementKey]').equals([profileId, tokenPath]).first()
    if (element) {
      await db.ui_elements.update(element.id, { value, updatedAt: now() })
    }

    const nextTokens = { ...tokens, [tokenPath]: value }
    applyCssVariables(nextTokens)
    set({ tokens: nextTokens })
  },
  setElementValue: async (elementKey, value, valueType = 'string') => {
    const { profileId, elements } = get()
    const existingElement = await db.ui_elements.where('[profileId+elementKey]').equals([profileId, elementKey]).first()
    if (existingElement) {
      await db.ui_elements.update(existingElement.id, { value, valueType, updatedAt: now() })
    }

    if (!elementKey.startsWith('text.')) {
      await get().setToken(elementKey, value, valueType)
    }

    set({ elements: { ...elements, [elementKey]: value } })
  },
}))
