import { db } from './database.js'
import { format } from 'date-fns'

function uid() { return Math.random().toString(36).slice(2, 10) }
function now() { return new Date().toISOString() }

interface UiElementSeed {
  elementKey: string
  label: string
  description: string
  value: string
  valueType: string
  category: string
}

export const DEFAULT_UI_ELEMENTS: UiElementSeed[] = [
  // ── Allgemein: Header & App ──────────────────────────────────────────────
  { elementKey: 'text.header.title', label: 'Header Titel', description: 'Haupttitel in der Top-Navigation.', value: 'Gartenplaner', valueType: 'string', category: 'text' },
  { elementKey: 'text.header.subtitle', label: 'Header Untertitel', description: 'Optionaler Untertitel unter dem Haupttitel.', value: '', valueType: 'string', category: 'text' },
  { elementKey: 'color.primary', label: 'Primärfarbe', description: 'Primäre Akzentfarbe der App.', value: '#16a34a', valueType: 'color', category: 'color' },
  { elementKey: 'color.secondary', label: 'Sekundärfarbe', description: 'Sekundäre Akzentfarbe für unterstützende UI-Elemente.', value: '#059669', valueType: 'color', category: 'color' },
  { elementKey: 'color.text.base', label: 'Textfarbe Basis', description: 'Standardfarbe für Fließtext.', value: '#14532d', valueType: 'color', category: 'color' },
  { elementKey: 'color.header.iconBg', label: 'Header: Icon-Hintergrund', description: 'Hintergrundfarbe des App-Icons im Header.', value: '#16a34a', valueType: 'color', category: 'color' },
  { elementKey: 'color.nav.active', label: 'Navigation: Aktive Farbe', description: 'Farbe des aktiven Tabs in der Navigation (Border + Text).', value: '#16a34a', valueType: 'color', category: 'color' },

  // ── Hintergrund ──────────────────────────────────────────────────────────
  { elementKey: 'bg.app.gradientFrom', label: 'Hintergrund Verlauf Start', description: 'Startfarbe des App-Hintergrundverlaufs.', value: '#f0fdf4', valueType: 'color', category: 'background' },
  { elementKey: 'bg.app.gradientTo', label: 'Hintergrund Verlauf Ende', description: 'Endfarbe des App-Hintergrundverlaufs.', value: '#ecfdf5', valueType: 'color', category: 'background' },
  { elementKey: 'bg.app.imageUrl', label: 'Hintergrundbild URL', description: 'Optionales Hintergrundbild für die gesamte App.', value: '', valueType: 'url', category: 'background' },

  // ── Schrift ───────────────────────────────────────────────────────────────
  { elementKey: 'font.family.base', label: 'Schriftfamilie Basis', description: 'Globale Schriftfamilie der Anwendung.', value: 'Inter, system-ui, sans-serif', valueType: 'font', category: 'font' },
  { elementKey: 'font.size.base', label: 'Schriftgröße Basis', description: 'Globale Basis-Schriftgröße.', value: '14px', valueType: 'px', category: 'font' },
  { elementKey: 'font.size.heading', label: 'Schriftgröße: Überschriften', description: 'Schriftgröße der Abschnitts-Überschriften (z.B. "Meine Pflanzen", "Aufgaben").', value: '1.125rem', valueType: 'string', category: 'font' },
  { elementKey: 'font.size.label', label: 'Schriftgröße: Labels', description: 'Schriftgröße kleiner Beschriftungen, Badges und Formular-Labels.', value: '0.75rem', valueType: 'string', category: 'font' },
  { elementKey: 'font.weight.heading', label: 'Schriftstärke: Überschriften', description: 'Schriftstärke der Abschnitts-Überschriften (z.B. 400, 600, 700).', value: '600', valueType: 'string', category: 'font' },
  { elementKey: 'font.weight.body', label: 'Schriftstärke: Fließtext', description: 'Schriftstärke des normalen Fließtexts (z.B. 400, 500).', value: '400', valueType: 'string', category: 'font' },
  { elementKey: 'font.style.base', label: 'Schriftstil', description: 'Globaler Schriftstil der App: "normal" oder "italic".', value: 'normal', valueType: 'string', category: 'font' },

  // ── Rahmen ────────────────────────────────────────────────────────────────
  { elementKey: 'border.radius.card', label: 'Karten-Radius', description: 'Standard-Rundung für Karten/Container.', value: '16px', valueType: 'px', category: 'border' },
  { elementKey: 'border.color.default', label: 'Standard Borderfarbe', description: 'Standardfarbe von Rahmenlinien.', value: '#bbf7d0', valueType: 'color', category: 'border' },

  // ── Navigation Tabs ───────────────────────────────────────────────────────
  { elementKey: 'text.nav.tab.plants', label: 'Tab: Pflanzen', description: 'Label für den Pflanzen-Tab in der Navigation.', value: 'Pflanzen', valueType: 'string', category: 'text' },
  { elementKey: 'text.nav.tab.tasks', label: 'Tab: Aufgaben', description: 'Label für den Aufgaben-Tab in der Navigation.', value: 'Aufgaben', valueType: 'string', category: 'text' },
  { elementKey: 'text.nav.tab.calendar', label: 'Tab: Kalender', description: 'Label für den Kalender-Tab in der Navigation.', value: 'Kalender', valueType: 'string', category: 'text' },
  { elementKey: 'text.nav.tab.settings', label: 'Tab: Einstellungen', description: 'Label für den Einstellungen-Tab in der Navigation.', value: 'Einstellungen', valueType: 'string', category: 'text' },
  { elementKey: 'text.nav.tab.database', label: 'Tab: Datenbank', description: 'Label für den Datenbank-Tab in der Navigation.', value: 'Datenbank', valueType: 'string', category: 'text' },

  // ── Header Statistiken ────────────────────────────────────────────────────
  { elementKey: 'text.stats.plants', label: 'Statistik: Pflanzen', description: 'Label für die Pflanzen-Statistik im Header.', value: 'Pflanzen', valueType: 'string', category: 'text' },
  { elementKey: 'text.stats.dueToday', label: 'Statistik: Heute fällig', description: 'Label für die "Heute fällig"-Statistik im Header.', value: 'Heute fällig', valueType: 'string', category: 'text' },
  { elementKey: 'text.stats.open', label: 'Statistik: Offen', description: 'Label für die Anzahl offener Aufgaben im Header.', value: 'Offen', valueType: 'string', category: 'text' },

  // ── Pflanzen-Bereich ──────────────────────────────────────────────────────
  { elementKey: 'text.plants.heading', label: 'Pflanzen: Überschrift', description: 'Überschrift im Pflanzen-Bereich.', value: 'Meine Pflanzen', valueType: 'string', category: 'text' },
  { elementKey: 'text.plants.addButton', label: 'Pflanzen: Button Hinzufügen', description: 'Beschriftung des Hinzufügen-Buttons im Pflanzen-Bereich.', value: 'Pflanze hinzufügen', valueType: 'string', category: 'text' },
  { elementKey: 'text.plants.formTitle', label: 'Pflanzen: Formular-Titel', description: 'Titel des Eingabeformulars für neue Pflanzen.', value: 'Neue Pflanze', valueType: 'string', category: 'text' },
  { elementKey: 'text.plants.emptyState', label: 'Pflanzen: Leer-Hinweis', description: 'Hinweistext wenn noch keine Pflanzen vorhanden sind.', value: 'Noch keine Pflanzen. Füge deine erste hinzu!', valueType: 'string', category: 'text' },
  { elementKey: 'text.plants.emojis', label: 'Pflanzen: Emoji-Auswahl', description: 'Kommagetrennte Liste der wählbaren Pflanzen-Emojis im Formular.', value: '🌱,🌿,🍅,🥕,🥦,🌹,🌻,🌷,🍓,🫐,🍋,🌺,🌾,🪴,🫚', valueType: 'string', category: 'text' },

  // ── Aufgaben-Bereich ──────────────────────────────────────────────────────
  { elementKey: 'text.tasks.heading', label: 'Aufgaben: Überschrift', description: 'Überschrift im Aufgaben-Bereich.', value: 'Aufgaben', valueType: 'string', category: 'text' },
  { elementKey: 'text.tasks.addButton', label: 'Aufgaben: Button Hinzufügen', description: 'Beschriftung des Hinzufügen-Buttons im Aufgaben-Bereich.', value: 'Aufgabe', valueType: 'string', category: 'text' },
  { elementKey: 'text.tasks.formTitle', label: 'Aufgaben: Formular-Titel', description: 'Titel des Eingabeformulars für neue Aufgaben.', value: 'Neue Aufgabe', valueType: 'string', category: 'text' },
  { elementKey: 'text.tasks.emptyState', label: 'Aufgaben: Leer-Hinweis', description: 'Hinweistext wenn noch keine Aufgaben vorhanden sind.', value: 'Noch keine Aufgaben. Füge deine erste hinzu!', valueType: 'string', category: 'text' },
  { elementKey: 'text.tasks.filterAll', label: 'Aufgaben: Filter Alle', description: 'Option "Alle Pflanzen" im Pflanzen-Filter-Dropdown.', value: 'Alle Pflanzen', valueType: 'string', category: 'text' },

  // ── Kalender-Bereich ──────────────────────────────────────────────────────
  { elementKey: 'text.calendar.heading', label: 'Kalender: Überschrift', description: 'Überschrift im Kalender-Bereich.', value: 'Monatsübersicht', valueType: 'string', category: 'text' },

  // ── Aufgaben-Gruppen: Labels ──────────────────────────────────────────────
  { elementKey: 'text.tasks.group.overdue', label: 'Gruppe: Überfällig', description: 'Label der Gruppe für überfällige Aufgaben.', value: '⚠️ Überfällig', valueType: 'string', category: 'text' },
  { elementKey: 'text.tasks.group.today', label: 'Gruppe: Heute', description: 'Label der Gruppe für heutige Aufgaben.', value: '📅 Heute', valueType: 'string', category: 'text' },
  { elementKey: 'text.tasks.group.tomorrow', label: 'Gruppe: Morgen', description: 'Label der Gruppe für morgige Aufgaben.', value: '🌅 Morgen', valueType: 'string', category: 'text' },
  { elementKey: 'text.tasks.group.upcoming', label: 'Gruppe: Demnächst', description: 'Label der Gruppe für demnächst fällige Aufgaben.', value: '🗓 Demnächst', valueType: 'string', category: 'text' },
  { elementKey: 'text.tasks.group.done', label: 'Gruppe: Erledigt', description: 'Label der Gruppe für erledigte Aufgaben.', value: '✅ Erledigt', valueType: 'string', category: 'text' },

  // ── Aufgaben-Gruppen: Farben ──────────────────────────────────────────────
  { elementKey: 'color.tasks.group.overdue', label: 'Gruppenfarbe: Überfällig', description: 'Textfarbe für die Gruppen-Überschrift "Überfällig".', value: '#dc2626', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasks.group.today', label: 'Gruppenfarbe: Heute', description: 'Textfarbe für die Gruppen-Überschrift "Heute".', value: '#15803d', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasks.group.tomorrow', label: 'Gruppenfarbe: Morgen', description: 'Textfarbe für die Gruppen-Überschrift "Morgen".', value: '#b45309', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasks.group.upcoming', label: 'Gruppenfarbe: Demnächst', description: 'Textfarbe für die Gruppen-Überschrift "Demnächst".', value: '#1d4ed8', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasks.group.done', label: 'Gruppenfarbe: Erledigt', description: 'Textfarbe für die Gruppen-Überschrift "Erledigt".', value: '#6b7280', valueType: 'color', category: 'color' },

  // ── Aufgabentypen: Labels ─────────────────────────────────────────────────
  { elementKey: 'text.tasktype.watering', label: 'Aufgabentyp: Gießen', description: 'Label für den Aufgabentyp "Gießen".', value: 'Gießen', valueType: 'string', category: 'text' },
  { elementKey: 'text.tasktype.fertilizing', label: 'Aufgabentyp: Düngen', description: 'Label für den Aufgabentyp "Düngen".', value: 'Düngen', valueType: 'string', category: 'text' },
  { elementKey: 'text.tasktype.pruning', label: 'Aufgabentyp: Schneiden', description: 'Label für den Aufgabentyp "Schneiden".', value: 'Schneiden', valueType: 'string', category: 'text' },
  { elementKey: 'text.tasktype.harvesting', label: 'Aufgabentyp: Ernten', description: 'Label für den Aufgabentyp "Ernten".', value: 'Ernten', valueType: 'string', category: 'text' },
  { elementKey: 'text.tasktype.repotting', label: 'Aufgabentyp: Umtopfen', description: 'Label für den Aufgabentyp "Umtopfen".', value: 'Umtopfen', valueType: 'string', category: 'text' },
  { elementKey: 'text.tasktype.other', label: 'Aufgabentyp: Sonstiges', description: 'Label für den Aufgabentyp "Sonstiges".', value: 'Sonstiges', valueType: 'string', category: 'text' },

  // ── Aufgabentypen: Icons ──────────────────────────────────────────────────
  { elementKey: 'icon.tasktype.watering', label: 'Icon: Gießen', description: 'Emoji/Icon für den Aufgabentyp "Gießen".', value: '💧', valueType: 'string', category: 'icon' },
  { elementKey: 'icon.tasktype.fertilizing', label: 'Icon: Düngen', description: 'Emoji/Icon für den Aufgabentyp "Düngen".', value: '🌿', valueType: 'string', category: 'icon' },
  { elementKey: 'icon.tasktype.pruning', label: 'Icon: Schneiden', description: 'Emoji/Icon für den Aufgabentyp "Schneiden".', value: '✂️', valueType: 'string', category: 'icon' },
  { elementKey: 'icon.tasktype.harvesting', label: 'Icon: Ernten', description: 'Emoji/Icon für den Aufgabentyp "Ernten".', value: '🧺', valueType: 'string', category: 'icon' },
  { elementKey: 'icon.tasktype.repotting', label: 'Icon: Umtopfen', description: 'Emoji/Icon für den Aufgabentyp "Umtopfen".', value: '🪴', valueType: 'string', category: 'icon' },
  { elementKey: 'icon.tasktype.other', label: 'Icon: Sonstiges', description: 'Emoji/Icon für den Aufgabentyp "Sonstiges".', value: '📝', valueType: 'string', category: 'icon' },

  // ── Aufgabentypen: Badge-Farben ───────────────────────────────────────────
  { elementKey: 'color.tasktype.watering.bg', label: 'Badge-BG: Gießen', description: 'Hintergrundfarbe des Typ-Badges "Gießen".', value: '#e0f2fe', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasktype.watering.text', label: 'Badge-Text: Gießen', description: 'Textfarbe des Typ-Badges "Gießen".', value: '#0369a1', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasktype.fertilizing.bg', label: 'Badge-BG: Düngen', description: 'Hintergrundfarbe des Typ-Badges "Düngen".', value: '#d1fae5', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasktype.fertilizing.text', label: 'Badge-Text: Düngen', description: 'Textfarbe des Typ-Badges "Düngen".', value: '#047857', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasktype.pruning.bg', label: 'Badge-BG: Schneiden', description: 'Hintergrundfarbe des Typ-Badges "Schneiden".', value: '#ffedd5', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasktype.pruning.text', label: 'Badge-Text: Schneiden', description: 'Textfarbe des Typ-Badges "Schneiden".', value: '#c2410c', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasktype.harvesting.bg', label: 'Badge-BG: Ernten', description: 'Hintergrundfarbe des Typ-Badges "Ernten".', value: '#fef9c3', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasktype.harvesting.text', label: 'Badge-Text: Ernten', description: 'Textfarbe des Typ-Badges "Ernten".', value: '#a16207', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasktype.repotting.bg', label: 'Badge-BG: Umtopfen', description: 'Hintergrundfarbe des Typ-Badges "Umtopfen".', value: '#fef3c7', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasktype.repotting.text', label: 'Badge-Text: Umtopfen', description: 'Textfarbe des Typ-Badges "Umtopfen".', value: '#b45309', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasktype.other.bg', label: 'Badge-BG: Sonstiges', description: 'Hintergrundfarbe des Typ-Badges "Sonstiges".', value: '#f3f4f6', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasktype.other.text', label: 'Badge-Text: Sonstiges', description: 'Textfarbe des Typ-Badges "Sonstiges".', value: '#4b5563', valueType: 'color', category: 'color' },

  // ── Aufgabentypen: Kalender-Punktfarben ───────────────────────────────────
  { elementKey: 'color.tasktype.watering.dot', label: 'Kalender-Punkt: Gießen', description: 'Farbe des Indikator-Punktes im Monatskalender für "Gießen".', value: '#38bdf8', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasktype.fertilizing.dot', label: 'Kalender-Punkt: Düngen', description: 'Farbe des Indikator-Punktes im Monatskalender für "Düngen".', value: '#10b981', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasktype.pruning.dot', label: 'Kalender-Punkt: Schneiden', description: 'Farbe des Indikator-Punktes im Monatskalender für "Schneiden".', value: '#fb923c', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasktype.harvesting.dot', label: 'Kalender-Punkt: Ernten', description: 'Farbe des Indikator-Punktes im Monatskalender für "Ernten".', value: '#facc15', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasktype.repotting.dot', label: 'Kalender-Punkt: Umtopfen', description: 'Farbe des Indikator-Punktes im Monatskalender für "Umtopfen".', value: '#f59e0b', valueType: 'color', category: 'color' },
  { elementKey: 'color.tasktype.other.dot', label: 'Kalender-Punkt: Sonstiges', description: 'Farbe des Indikator-Punktes im Monatskalender für "Sonstiges".', value: '#9ca3af', valueType: 'color', category: 'color' },

  // ── Schaltflächen ─────────────────────────────────────────────────────────
  { elementKey: 'color.button.primary.bg', label: 'Button Primär: Hintergrund', description: 'Hintergrundfarbe der primären Aktionsschaltflächen.', value: '#16a34a', valueType: 'color', category: 'color' },
  { elementKey: 'color.button.primary.hover', label: 'Button Primär: Hover', description: 'Hover-Hintergrundfarbe der primären Aktionsschaltflächen.', value: '#15803d', valueType: 'color', category: 'color' },

  // ── Karten & Container ────────────────────────────────────────────────────
  { elementKey: 'color.card.bg', label: 'Karten-Hintergrund', description: 'Hintergrundfarbe von Karten und Panel-Containern.', value: '#ffffff', valueType: 'color', category: 'color' },
  { elementKey: 'color.header.bg', label: 'Header-Hintergrund', description: 'Hintergrundfarbe der oberen Navigationsleiste.', value: '#ffffff', valueType: 'color', category: 'color' },
  { elementKey: 'color.input.border', label: 'Eingabefeld: Rahmen', description: 'Rahmenfarbe von Eingabefeldern und Dropdowns.', value: '#bbf7d0', valueType: 'color', category: 'color' },

  // ── Chat-Widget ───────────────────────────────────────────────────────────
  { elementKey: 'text.chat.botName', label: 'Chat: Bot-Name', description: 'Angezeigter Name des Chat-Assistenten im Widget-Header.', value: 'Ivy · Garten-KI', valueType: 'string', category: 'text' },
  { elementKey: 'text.chat.botStatus', label: 'Chat: Bot-Status', description: 'Statuszeile unterhalb des Bot-Namens im Widget-Header.', value: 'Online · immer für dich da', valueType: 'string', category: 'text' },
  { elementKey: 'text.chat.greeting', label: 'Chat: Begrüßung', description: 'Erste Bot-Nachricht beim Öffnen des Chats.', value: 'Hallo! 🌿 Wie kann ich dir heute helfen?', valueType: 'string', category: 'text' },
  { elementKey: 'text.chat.inputPlaceholder', label: 'Chat: Eingabe-Platzhalter', description: 'Platzhaltertext im Chat-Eingabefeld.', value: 'Schreib mir etwas… 🌱', valueType: 'string', category: 'text' },
  { elementKey: 'text.chat.tooltip', label: 'Chat: Hover-Tooltip', description: 'Tooltip-Text der beim Hovern über den Chat-Button erscheint.', value: 'Wie kann ich helfen? 🌿', valueType: 'string', category: 'text' },
]

function isTokenKey(key: string) {
  return !key.startsWith('text.') && !key.startsWith('icon.')
}

export function seedUserData(userId: string) {
  const ts = now()
  const profileId = `profile-${userId}`

  db.prepare(`INSERT OR IGNORE INTO ui_profiles (id, user_id, name, is_active, created_at, updated_at)
    VALUES (?, ?, 'Standard', 1, ?, ?)`).run(profileId, userId, ts, ts)

  const insertElement = db.prepare(`
    INSERT OR IGNORE INTO ui_elements
      (id, user_id, profile_id, element_key, label, description, value, default_value, value_type, category, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertToken = db.prepare(`
    INSERT OR IGNORE INTO ui_tokens
      (id, user_id, profile_id, token_path, value, value_type, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const seedAll = db.transaction(() => {
    for (const el of DEFAULT_UI_ELEMENTS) {
      insertElement.run(uid(), userId, profileId, el.elementKey, el.label, el.description, el.value, el.value, el.valueType, el.category, ts)
      if (isTokenKey(el.elementKey)) {
        insertToken.run(uid(), userId, profileId, el.elementKey, el.value, el.valueType, ts)
      }
    }

    const today = format(new Date(), 'yyyy-MM-dd')
    const p1 = uid(), p2 = uid(), p3 = uid()
    db.prepare(`INSERT OR IGNORE INTO plants (id, user_id, name, emoji, location, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(p1, userId, 'Tomaten', '🍅', 'Hochbeet Süd', 'Sonne mind. 6h täglich', ts, ts)
    db.prepare(`INSERT OR IGNORE INTO plants (id, user_id, name, emoji, location, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(p2, userId, 'Basilikum', '🌿', 'Fensterbrett', 'Warm und windgeschützt', ts, ts)
    db.prepare(`INSERT OR IGNORE INTO plants (id, user_id, name, emoji, location, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(p3, userId, 'Rosen', '🌹', 'Vorgarten', 'Hoch- und Strauchrose', ts, ts)

    const insertTask = db.prepare(`INSERT OR IGNORE INTO tasks
      (id, user_id, plant_id, title, task_type, due_date, completed, notes, recurring, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, NULL, ?, ?, ?)`)
    insertTask.run(uid(), userId, p1, 'Tomaten gießen', 'watering', today, JSON.stringify({ type: 'daily', interval: 2 }), ts, ts)
    insertTask.run(uid(), userId, p1, 'Tomaten düngen', 'fertilizing', today, JSON.stringify({ type: 'weekly', interval: 2 }), ts, ts)
    insertTask.run(uid(), userId, p2, 'Basilikum gießen', 'watering', today, JSON.stringify({ type: 'daily', interval: 1 }), ts, ts)
  })

  seedAll()
}

export function ensureUserUiElements(userId: string) {
  const profileRow = db.prepare(`SELECT id FROM ui_profiles WHERE user_id = ? AND is_active = 1`).get(userId) as { id: string } | undefined
  if (!profileRow) {
    seedUserData(userId)
    return
  }
  const profileId = profileRow.id
  const ts = now()
  const insertElement = db.prepare(`
    INSERT OR IGNORE INTO ui_elements
      (id, user_id, profile_id, element_key, label, description, value, default_value, value_type, category, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertToken = db.prepare(`
    INSERT OR IGNORE INTO ui_tokens
      (id, user_id, profile_id, token_path, value, value_type, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  const fill = db.transaction(() => {
    for (const el of DEFAULT_UI_ELEMENTS) {
      insertElement.run(uid(), userId, profileId, el.elementKey, el.label, el.description, el.value, el.value, el.valueType, el.category, ts)
      if (isTokenKey(el.elementKey)) {
        insertToken.run(uid(), userId, profileId, el.elementKey, el.value, el.valueType, ts)
      }
    }
  })
  fill()
}

