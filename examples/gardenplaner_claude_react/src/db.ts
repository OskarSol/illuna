import Dexie, { type Table } from 'dexie'
import type { Plant, Task } from './store'

export interface AppSetting {
  key: string
  value: string
  valueType: 'string' | 'number' | 'boolean' | 'json'
  updatedAt: string
}

export interface UiProfile {
  id: string
  name: string
  isActive: 0 | 1
  createdAt: string
  updatedAt: string
}

export interface UiToken {
  id: string
  profileId: string
  tokenPath: string
  value: string
  valueType: 'color' | 'px' | 'rem' | 'number' | 'font' | 'url' | 'string'
  updatedAt: string
}

export interface UiComponentOverride {
  id: string
  profileId: string
  componentKey: string
  propPath: string
  value: string
  valueType: 'color' | 'px' | 'rem' | 'number' | 'font' | 'url' | 'string'
  updatedAt: string
}

export class GardenPlannerDB extends Dexie {
  plants!: Table<Plant, string>
  tasks!: Table<Task, string>
  app_settings!: Table<AppSetting, string>
  ui_profiles!: Table<UiProfile, string>
  ui_tokens!: Table<UiToken, string>
  ui_component_overrides!: Table<UiComponentOverride, string>

  constructor() {
    super('gardenplanner')
    this.version(1).stores({
      plants: 'id, name, location, updatedAt',
      tasks: 'id, plantId, dueDate, completed, taskType, updatedAt, [completed+dueDate], [plantId+dueDate]',
      app_settings: 'key, updatedAt',
      ui_profiles: 'id, isActive, updatedAt',
      ui_tokens: 'id, profileId, tokenPath, [profileId+tokenPath], updatedAt',
      ui_component_overrides: 'id, profileId, componentKey, [profileId+componentKey], [profileId+componentKey+propPath], updatedAt',
    })
  }
}

export const db = new GardenPlannerDB()

function now() {
  return new Date().toISOString()
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

const DEFAULT_THEME_TOKENS: Array<Omit<UiToken, 'id' | 'updatedAt'>> = [
  { profileId: 'default', tokenPath: 'color.primary', value: '#16a34a', valueType: 'color' },
  { profileId: 'default', tokenPath: 'color.secondary', value: '#059669', valueType: 'color' },
  { profileId: 'default', tokenPath: 'color.text.base', value: '#14532d', valueType: 'color' },
  { profileId: 'default', tokenPath: 'bg.app.gradientFrom', value: '#f0fdf4', valueType: 'color' },
  { profileId: 'default', tokenPath: 'bg.app.gradientTo', value: '#ecfdf5', valueType: 'color' },
  { profileId: 'default', tokenPath: 'bg.app.imageUrl', value: '', valueType: 'url' },
  { profileId: 'default', tokenPath: 'font.family.base', value: 'Inter, system-ui, sans-serif', valueType: 'font' },
  { profileId: 'default', tokenPath: 'font.size.base', value: '14px', valueType: 'px' },
]

export async function ensureUiSeedData() {
  const profile = await db.ui_profiles.get('default')
  if (!profile) {
    const ts = now()
    await db.ui_profiles.add({ id: 'default', name: 'Standard', isActive: 1, createdAt: ts, updatedAt: ts })
  }

  const tokenCount = await db.ui_tokens.where('profileId').equals('default').count()
  if (tokenCount === 0) {
    await db.ui_tokens.bulkAdd(DEFAULT_THEME_TOKENS.map((token) => ({
      ...token,
      id: uid(),
      updatedAt: now(),
    })))
  }
}
