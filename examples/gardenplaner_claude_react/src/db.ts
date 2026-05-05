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

export interface UiElementDefinition {
  id: string
  profileId: string
  elementKey: string
  label: string
  description: string
  value: string
  valueType: 'color' | 'px' | 'rem' | 'number' | 'font' | 'url' | 'string'
  category: 'text' | 'color' | 'background' | 'font' | 'border' | 'layout'
  updatedAt: string
}

export class GardenPlannerDB extends Dexie {
  plants!: Table<Plant, string>
  tasks!: Table<Task, string>
  app_settings!: Table<AppSetting, string>
  ui_profiles!: Table<UiProfile, string>
  ui_tokens!: Table<UiToken, string>
  ui_component_overrides!: Table<UiComponentOverride, string>
  ui_elements!: Table<UiElementDefinition, string>

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
    this.version(2).stores({
      plants: 'id, name, location, updatedAt',
      tasks: 'id, plantId, dueDate, completed, taskType, updatedAt, [completed+dueDate], [plantId+dueDate]',
      app_settings: 'key, updatedAt',
      ui_profiles: 'id, isActive, updatedAt',
      ui_tokens: 'id, profileId, tokenPath, [profileId+tokenPath], updatedAt',
      ui_component_overrides: 'id, profileId, componentKey, [profileId+componentKey], [profileId+componentKey+propPath], updatedAt',
      ui_elements: 'id, profileId, elementKey, [profileId+elementKey], category, updatedAt',
    })
  }
}

export const db = new GardenPlannerDB()

function now() { return new Date().toISOString() }
function uid() { return Math.random().toString(36).slice(2, 10) }

const DEFAULT_UI_ELEMENTS: Array<Omit<UiElementDefinition, 'id' | 'updatedAt'>> = [
  { profileId: 'default', elementKey: 'text.header.title', label: 'Header Titel', description: 'Haupttitel in der Top-Navigation.', value: 'Gartenplaner', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.header.subtitle', label: 'Header Untertitel', description: 'Datumszeile unter dem Haupttitel.', value: '', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'color.primary', label: 'Primärfarbe', description: 'Primäre Akzentfarbe der App.', value: '#16a34a', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.secondary', label: 'Sekundärfarbe', description: 'Sekundäre Akzentfarbe für unterstützende UI-Elemente.', value: '#059669', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.text.base', label: 'Textfarbe Basis', description: 'Standardfarbe für Fließtext.', value: '#14532d', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'bg.app.gradientFrom', label: 'Hintergrund Verlauf Start', description: 'Startfarbe des App-Hintergrundverlaufs.', value: '#f0fdf4', valueType: 'color', category: 'background' },
  { profileId: 'default', elementKey: 'bg.app.gradientTo', label: 'Hintergrund Verlauf Ende', description: 'Endfarbe des App-Hintergrundverlaufs.', value: '#ecfdf5', valueType: 'color', category: 'background' },
  { profileId: 'default', elementKey: 'bg.app.imageUrl', label: 'Hintergrundbild URL', description: 'Optionales Hintergrundbild für die gesamte App.', value: '', valueType: 'url', category: 'background' },
  { profileId: 'default', elementKey: 'font.family.base', label: 'Schriftfamilie Basis', description: 'Globale Schriftfamilie der Anwendung.', value: 'Inter, system-ui, sans-serif', valueType: 'font', category: 'font' },
  { profileId: 'default', elementKey: 'font.size.base', label: 'Schriftgröße Basis', description: 'Globale Basis-Schriftgröße.', value: '14px', valueType: 'px', category: 'font' },
  { profileId: 'default', elementKey: 'border.radius.card', label: 'Karten-Radius', description: 'Standard-Rundung für Karten/Container.', value: '16px', valueType: 'px', category: 'border' },
  { profileId: 'default', elementKey: 'border.color.default', label: 'Standard Borderfarbe', description: 'Standardfarbe von Rahmenlinien.', value: '#bbf7d0', valueType: 'color', category: 'border' },
]

export async function ensureUiSeedData() {
  const profile = await db.ui_profiles.get('default')
  if (!profile) {
    const ts = now()
    await db.ui_profiles.add({ id: 'default', name: 'Standard', isActive: 1, createdAt: ts, updatedAt: ts })
  }

  const elementCount = await db.ui_elements.where('profileId').equals('default').count()
  if (elementCount === 0) {
    await db.ui_elements.bulkAdd(DEFAULT_UI_ELEMENTS.map((element) => ({ ...element, id: uid(), updatedAt: now() })))
  }

  const tokenCount = await db.ui_tokens.where('profileId').equals('default').count()
  if (tokenCount === 0) {
    const tokenElements = DEFAULT_UI_ELEMENTS.filter((element) => !element.elementKey.startsWith('text.'))
    await db.ui_tokens.bulkAdd(tokenElements.map((token) => ({ id: uid(), profileId: 'default', tokenPath: token.elementKey, value: token.value, valueType: token.valueType, updatedAt: now() })))
  }
}
