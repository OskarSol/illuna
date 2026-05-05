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
  category: 'text' | 'color' | 'background' | 'font' | 'border' | 'layout' | 'icon'
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
  // ── Allgemein: Header & App ──────────────────────────────────────────────
  { profileId: 'default', elementKey: 'text.header.title', label: 'Header Titel', description: 'Haupttitel in der Top-Navigation.', value: 'Gartenplaner', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.header.subtitle', label: 'Header Untertitel', description: 'Optionaler Untertitel unter dem Haupttitel.', value: '', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'color.primary', label: 'Primärfarbe', description: 'Primäre Akzentfarbe der App.', value: '#16a34a', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.secondary', label: 'Sekundärfarbe', description: 'Sekundäre Akzentfarbe für unterstützende UI-Elemente.', value: '#059669', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.text.base', label: 'Textfarbe Basis', description: 'Standardfarbe für Fließtext.', value: '#14532d', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.header.iconBg', label: 'Header: Icon-Hintergrund', description: 'Hintergrundfarbe des App-Icons im Header.', value: '#16a34a', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.nav.active', label: 'Navigation: Aktive Farbe', description: 'Farbe des aktiven Tabs in der Navigation (Border + Text).', value: '#16a34a', valueType: 'color', category: 'color' },

  // ── Hintergrund ──────────────────────────────────────────────────────────
  { profileId: 'default', elementKey: 'bg.app.gradientFrom', label: 'Hintergrund Verlauf Start', description: 'Startfarbe des App-Hintergrundverlaufs.', value: '#f0fdf4', valueType: 'color', category: 'background' },
  { profileId: 'default', elementKey: 'bg.app.gradientTo', label: 'Hintergrund Verlauf Ende', description: 'Endfarbe des App-Hintergrundverlaufs.', value: '#ecfdf5', valueType: 'color', category: 'background' },
  { profileId: 'default', elementKey: 'bg.app.imageUrl', label: 'Hintergrundbild URL', description: 'Optionales Hintergrundbild für die gesamte App.', value: '', valueType: 'url', category: 'background' },

  // ── Schrift ───────────────────────────────────────────────────────────────
  { profileId: 'default', elementKey: 'font.family.base', label: 'Schriftfamilie Basis', description: 'Globale Schriftfamilie der Anwendung.', value: 'Inter, system-ui, sans-serif', valueType: 'font', category: 'font' },
  { profileId: 'default', elementKey: 'font.size.base', label: 'Schriftgröße Basis', description: 'Globale Basis-Schriftgröße.', value: '14px', valueType: 'px', category: 'font' },

  // ── Rahmen ────────────────────────────────────────────────────────────────
  { profileId: 'default', elementKey: 'border.radius.card', label: 'Karten-Radius', description: 'Standard-Rundung für Karten/Container.', value: '16px', valueType: 'px', category: 'border' },
  { profileId: 'default', elementKey: 'border.color.default', label: 'Standard Borderfarbe', description: 'Standardfarbe von Rahmenlinien.', value: '#bbf7d0', valueType: 'color', category: 'border' },

  // ── Navigation Tabs ───────────────────────────────────────────────────────
  { profileId: 'default', elementKey: 'text.nav.tab.plants', label: 'Tab: Pflanzen', description: 'Label für den Pflanzen-Tab in der Navigation.', value: 'Pflanzen', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.nav.tab.tasks', label: 'Tab: Aufgaben', description: 'Label für den Aufgaben-Tab in der Navigation.', value: 'Aufgaben', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.nav.tab.calendar', label: 'Tab: Kalender', description: 'Label für den Kalender-Tab in der Navigation.', value: 'Kalender', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.nav.tab.settings', label: 'Tab: Einstellungen', description: 'Label für den Einstellungen-Tab in der Navigation.', value: 'Einstellungen', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.nav.tab.database', label: 'Tab: Datenbank', description: 'Label für den Datenbank-Tab in der Navigation.', value: 'Datenbank', valueType: 'string', category: 'text' },

  // ── Header Statistiken ────────────────────────────────────────────────────
  { profileId: 'default', elementKey: 'text.stats.plants', label: 'Statistik: Pflanzen', description: 'Label für die Pflanzen-Statistik im Header.', value: 'Pflanzen', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.stats.dueToday', label: 'Statistik: Heute fällig', description: 'Label für die "Heute fällig"-Statistik im Header.', value: 'Heute fällig', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.stats.open', label: 'Statistik: Offen', description: 'Label für die Anzahl offener Aufgaben im Header.', value: 'Offen', valueType: 'string', category: 'text' },

  // ── Pflanzen-Bereich ──────────────────────────────────────────────────────
  { profileId: 'default', elementKey: 'text.plants.heading', label: 'Pflanzen: Überschrift', description: 'Überschrift im Pflanzen-Bereich.', value: 'Meine Pflanzen', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.plants.addButton', label: 'Pflanzen: Button Hinzufügen', description: 'Beschriftung des Hinzufügen-Buttons im Pflanzen-Bereich.', value: 'Pflanze hinzufügen', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.plants.formTitle', label: 'Pflanzen: Formular-Titel', description: 'Titel des Eingabeformulars für neue Pflanzen.', value: 'Neue Pflanze', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.plants.emptyState', label: 'Pflanzen: Leer-Hinweis', description: 'Hinweistext wenn noch keine Pflanzen vorhanden sind.', value: 'Noch keine Pflanzen. Füge deine erste hinzu!', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.plants.emojis', label: 'Pflanzen: Emoji-Auswahl', description: 'Kommagetrennte Liste der wählbaren Pflanzen-Emojis im Formular.', value: '🌱,🌿,🍅,🥕,🥦,🌹,🌻,🌷,🍓,🫐,🍋,🌺,🌾,🪴,🫚', valueType: 'string', category: 'text' },

  // ── Aufgaben-Bereich ──────────────────────────────────────────────────────
  { profileId: 'default', elementKey: 'text.tasks.heading', label: 'Aufgaben: Überschrift', description: 'Überschrift im Aufgaben-Bereich.', value: 'Aufgaben', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.tasks.addButton', label: 'Aufgaben: Button Hinzufügen', description: 'Beschriftung des Hinzufügen-Buttons im Aufgaben-Bereich.', value: 'Aufgabe', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.tasks.formTitle', label: 'Aufgaben: Formular-Titel', description: 'Titel des Eingabeformulars für neue Aufgaben.', value: 'Neue Aufgabe', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.tasks.emptyState', label: 'Aufgaben: Leer-Hinweis', description: 'Hinweistext wenn noch keine Aufgaben vorhanden sind.', value: 'Noch keine Aufgaben. Füge deine erste hinzu!', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.tasks.filterAll', label: 'Aufgaben: Filter Alle', description: 'Option "Alle Pflanzen" im Pflanzen-Filter-Dropdown.', value: 'Alle Pflanzen', valueType: 'string', category: 'text' },

  // ── Kalender-Bereich ──────────────────────────────────────────────────────
  { profileId: 'default', elementKey: 'text.calendar.heading', label: 'Kalender: Überschrift', description: 'Überschrift im Kalender-Bereich.', value: 'Monatsübersicht', valueType: 'string', category: 'text' },

  // ── Aufgaben-Gruppen: Labels ──────────────────────────────────────────────
  { profileId: 'default', elementKey: 'text.tasks.group.overdue', label: 'Gruppe: Überfällig', description: 'Label der Gruppe für überfällige Aufgaben.', value: '⚠️ Überfällig', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.tasks.group.today', label: 'Gruppe: Heute', description: 'Label der Gruppe für heutige Aufgaben.', value: '📅 Heute', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.tasks.group.tomorrow', label: 'Gruppe: Morgen', description: 'Label der Gruppe für morgige Aufgaben.', value: '🌅 Morgen', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.tasks.group.upcoming', label: 'Gruppe: Demnächst', description: 'Label der Gruppe für demnächst fällige Aufgaben.', value: '🗓 Demnächst', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.tasks.group.done', label: 'Gruppe: Erledigt', description: 'Label der Gruppe für erledigte Aufgaben.', value: '✅ Erledigt', valueType: 'string', category: 'text' },

  // ── Aufgaben-Gruppen: Farben ──────────────────────────────────────────────
  { profileId: 'default', elementKey: 'color.tasks.group.overdue', label: 'Gruppenfarbe: Überfällig', description: 'Textfarbe für die Gruppen-Überschrift "Überfällig".', value: '#dc2626', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasks.group.today', label: 'Gruppenfarbe: Heute', description: 'Textfarbe für die Gruppen-Überschrift "Heute".', value: '#15803d', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasks.group.tomorrow', label: 'Gruppenfarbe: Morgen', description: 'Textfarbe für die Gruppen-Überschrift "Morgen".', value: '#b45309', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasks.group.upcoming', label: 'Gruppenfarbe: Demnächst', description: 'Textfarbe für die Gruppen-Überschrift "Demnächst".', value: '#1d4ed8', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasks.group.done', label: 'Gruppenfarbe: Erledigt', description: 'Textfarbe für die Gruppen-Überschrift "Erledigt".', value: '#6b7280', valueType: 'color', category: 'color' },

  // ── Aufgabentypen: Labels ─────────────────────────────────────────────────
  { profileId: 'default', elementKey: 'text.tasktype.watering', label: 'Aufgabentyp: Gießen', description: 'Label für den Aufgabentyp "Gießen".', value: 'Gießen', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.tasktype.fertilizing', label: 'Aufgabentyp: Düngen', description: 'Label für den Aufgabentyp "Düngen".', value: 'Düngen', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.tasktype.pruning', label: 'Aufgabentyp: Schneiden', description: 'Label für den Aufgabentyp "Schneiden".', value: 'Schneiden', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.tasktype.harvesting', label: 'Aufgabentyp: Ernten', description: 'Label für den Aufgabentyp "Ernten".', value: 'Ernten', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.tasktype.repotting', label: 'Aufgabentyp: Umtopfen', description: 'Label für den Aufgabentyp "Umtopfen".', value: 'Umtopfen', valueType: 'string', category: 'text' },
  { profileId: 'default', elementKey: 'text.tasktype.other', label: 'Aufgabentyp: Sonstiges', description: 'Label für den Aufgabentyp "Sonstiges".', value: 'Sonstiges', valueType: 'string', category: 'text' },

  // ── Aufgabentypen: Icons ──────────────────────────────────────────────────
  { profileId: 'default', elementKey: 'icon.tasktype.watering', label: 'Icon: Gießen', description: 'Emoji/Icon für den Aufgabentyp "Gießen".', value: '💧', valueType: 'string', category: 'icon' },
  { profileId: 'default', elementKey: 'icon.tasktype.fertilizing', label: 'Icon: Düngen', description: 'Emoji/Icon für den Aufgabentyp "Düngen".', value: '🌿', valueType: 'string', category: 'icon' },
  { profileId: 'default', elementKey: 'icon.tasktype.pruning', label: 'Icon: Schneiden', description: 'Emoji/Icon für den Aufgabentyp "Schneiden".', value: '✂️', valueType: 'string', category: 'icon' },
  { profileId: 'default', elementKey: 'icon.tasktype.harvesting', label: 'Icon: Ernten', description: 'Emoji/Icon für den Aufgabentyp "Ernten".', value: '🧺', valueType: 'string', category: 'icon' },
  { profileId: 'default', elementKey: 'icon.tasktype.repotting', label: 'Icon: Umtopfen', description: 'Emoji/Icon für den Aufgabentyp "Umtopfen".', value: '🪴', valueType: 'string', category: 'icon' },
  { profileId: 'default', elementKey: 'icon.tasktype.other', label: 'Icon: Sonstiges', description: 'Emoji/Icon für den Aufgabentyp "Sonstiges".', value: '📝', valueType: 'string', category: 'icon' },

  // ── Aufgabentypen: Badge-Farben (Hintergrund + Text für Listen-Ansicht) ───
  { profileId: 'default', elementKey: 'color.tasktype.watering.bg', label: 'Badge-BG: Gießen', description: 'Hintergrundfarbe des Typ-Badges "Gießen" in der Aufgabenliste.', value: '#e0f2fe', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasktype.watering.text', label: 'Badge-Text: Gießen', description: 'Textfarbe des Typ-Badges "Gießen" in der Aufgabenliste.', value: '#0369a1', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasktype.fertilizing.bg', label: 'Badge-BG: Düngen', description: 'Hintergrundfarbe des Typ-Badges "Düngen" in der Aufgabenliste.', value: '#d1fae5', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasktype.fertilizing.text', label: 'Badge-Text: Düngen', description: 'Textfarbe des Typ-Badges "Düngen" in der Aufgabenliste.', value: '#047857', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasktype.pruning.bg', label: 'Badge-BG: Schneiden', description: 'Hintergrundfarbe des Typ-Badges "Schneiden" in der Aufgabenliste.', value: '#ffedd5', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasktype.pruning.text', label: 'Badge-Text: Schneiden', description: 'Textfarbe des Typ-Badges "Schneiden" in der Aufgabenliste.', value: '#c2410c', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasktype.harvesting.bg', label: 'Badge-BG: Ernten', description: 'Hintergrundfarbe des Typ-Badges "Ernten" in der Aufgabenliste.', value: '#fef9c3', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasktype.harvesting.text', label: 'Badge-Text: Ernten', description: 'Textfarbe des Typ-Badges "Ernten" in der Aufgabenliste.', value: '#a16207', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasktype.repotting.bg', label: 'Badge-BG: Umtopfen', description: 'Hintergrundfarbe des Typ-Badges "Umtopfen" in der Aufgabenliste.', value: '#fef3c7', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasktype.repotting.text', label: 'Badge-Text: Umtopfen', description: 'Textfarbe des Typ-Badges "Umtopfen" in der Aufgabenliste.', value: '#b45309', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasktype.other.bg', label: 'Badge-BG: Sonstiges', description: 'Hintergrundfarbe des Typ-Badges "Sonstiges" in der Aufgabenliste.', value: '#f3f4f6', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasktype.other.text', label: 'Badge-Text: Sonstiges', description: 'Textfarbe des Typ-Badges "Sonstiges" in der Aufgabenliste.', value: '#4b5563', valueType: 'color', category: 'color' },

  // ── Aufgabentypen: Kalender-Punktfarben ───────────────────────────────────
  { profileId: 'default', elementKey: 'color.tasktype.watering.dot', label: 'Kalender-Punkt: Gießen', description: 'Farbe des Indikator-Punktes im Monatskalender für "Gießen".', value: '#38bdf8', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasktype.fertilizing.dot', label: 'Kalender-Punkt: Düngen', description: 'Farbe des Indikator-Punktes im Monatskalender für "Düngen".', value: '#10b981', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasktype.pruning.dot', label: 'Kalender-Punkt: Schneiden', description: 'Farbe des Indikator-Punktes im Monatskalender für "Schneiden".', value: '#fb923c', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasktype.harvesting.dot', label: 'Kalender-Punkt: Ernten', description: 'Farbe des Indikator-Punktes im Monatskalender für "Ernten".', value: '#facc15', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasktype.repotting.dot', label: 'Kalender-Punkt: Umtopfen', description: 'Farbe des Indikator-Punktes im Monatskalender für "Umtopfen".', value: '#f59e0b', valueType: 'color', category: 'color' },
  { profileId: 'default', elementKey: 'color.tasktype.other.dot', label: 'Kalender-Punkt: Sonstiges', description: 'Farbe des Indikator-Punktes im Monatskalender für "Sonstiges".', value: '#9ca3af', valueType: 'color', category: 'color' },
]

export async function ensureUiSeedData() {
  const profile = await db.ui_profiles.get('default')
  if (!profile) {
    const ts = now()
    await db.ui_profiles.add({ id: 'default', name: 'Standard', isActive: 1, createdAt: ts, updatedAt: ts })
  }

  const existingElements = await db.ui_elements.where('profileId').equals('default').toArray()
  const existingElementKeys = new Set(existingElements.map((e) => e.elementKey))
  const missingElements = DEFAULT_UI_ELEMENTS.filter((e) => !existingElementKeys.has(e.elementKey))
  if (missingElements.length > 0) {
    await db.ui_elements.bulkAdd(missingElements.map((e) => ({ ...e, id: uid(), updatedAt: now() })))
  }

  const existingTokens = await db.ui_tokens.where('profileId').equals('default').toArray()
  const existingTokenPaths = new Set(existingTokens.map((t) => t.tokenPath))
  const tokenElements = DEFAULT_UI_ELEMENTS.filter(
    (e) => !e.elementKey.startsWith('text.') && !e.elementKey.startsWith('icon.')
  )
  const missingTokens = tokenElements.filter((e) => !existingTokenPaths.has(e.elementKey))
  if (missingTokens.length > 0) {
    await db.ui_tokens.bulkAdd(
      missingTokens.map((t) => ({ id: uid(), profileId: 'default', tokenPath: t.elementKey, value: t.value, valueType: t.valueType, updatedAt: now() }))
    )
  }
}
