import { useEffect, useState } from 'react'
import { liveQuery } from 'dexie'
import { db, resetUiElementsToDefault, type UiElementDefinition } from '../db'
import { useUiStore } from '../uiStore'

type Settings = {
  apiKey: string
  apiUrl: string
}

async function getSetting(key: string, fallback = '') {
  const row = await db.app_settings.get(key)
  return row?.value ?? fallback
}

const CATEGORY_LABELS: Record<UiElementDefinition['category'], string> = {
  text: 'Text & Labels',
  color: 'Farben',
  background: 'Hintergrund',
  font: 'Schrift',
  border: 'Rahmen',
  layout: 'Layout',
  icon: 'Icons & Emojis',
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({ apiKey: '', apiUrl: '' })
  const [uiElements, setUiElements] = useState<UiElementDefinition[]>([])
  const [saved, setSaved] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [activeCategory, setActiveCategory] = useState<UiElementDefinition['category'] | 'all'>('all')
  const { setElementValue, init: initUi } = useUiStore()
  useEffect(() => {
    initUi()
    ;(async () => {
      const [apiKey, apiUrl] = await Promise.all([getSetting('api.key'), getSetting('api.url')])
      setSettings({ apiKey, apiUrl })
    })()
  }, [initUi])

  useEffect(() => {
    const subscription = liveQuery(async () => {
      const active = await db.ui_profiles.where('isActive').equals(1).first()
      const profileId = active?.id ?? 'default'
      return db.ui_elements.where('profileId').equals(profileId).sortBy('elementKey')
    }).subscribe({
      next: (rows) => {
        setUiElements((prev) => {
          const prevById = Object.fromEntries(prev.map((r) => [r.id, r]))
          return rows.map((row) => {
            const local = prevById[row.id]
            if (local && (local.label !== row.label || local.description !== row.description)) {
              return local
            }
            return row
          })
        })
      },
      error: (err: unknown) => console.error('SettingsPanel liveQuery error', err),
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleReset() {
    if (!resetConfirm) {
      setResetConfirm(true)
      setTimeout(() => setResetConfirm(false), 3000)
      return
    }
    setResetConfirm(false)
    const active = await db.ui_profiles.where('isActive').equals(1).first()
    await resetUiElementsToDefault(active?.id ?? 'default')
  }

  async function saveSettings() {
    const ts = new Date().toISOString()
    await db.app_settings.bulkPut([
      { key: 'api.key', value: settings.apiKey, valueType: 'string', updatedAt: ts },
      { key: 'api.url', value: settings.apiUrl, valueType: 'string', updatedAt: ts },
    ])

    for (const element of uiElements) {
      await db.ui_elements.update(element.id, {
        label: element.label,
        description: element.description,
        value: element.value,
        updatedAt: ts,
      })
      await setElementValue(element.elementKey, element.value, element.valueType)
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const categories = Array.from(new Set(uiElements.map((e) => e.category))) as UiElementDefinition['category'][]
  const filtered = activeCategory === 'all' ? uiElements : uiElements.filter((e) => e.category === activeCategory)

  return (
    <section className="bg-white border border-green-100 rounded-2xl shadow-sm p-5 sm:p-6 space-y-5">
      <header>
        <h2 className="text-lg font-semibold text-green-900">Einstellungen</h2>
        <p className="text-sm text-green-600 mt-1">Alle UI-Elemente mit Bezeichner, Label, Beschreibung und Wert aus der Datenbank. Änderungen werden direkt in der UI sichtbar.</p>
      </header>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-green-800">API Key</span>
          <input type="password" value={settings.apiKey} onChange={(e) => setSettings((prev) => ({ ...prev, apiKey: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-green-200 px-3.5 py-2.5 text-sm" />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-green-800">API URL</span>
          <input type="text" value={settings.apiUrl} onChange={(e) => setSettings((prev) => ({ ...prev, apiUrl: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-green-200 px-3.5 py-2.5 text-sm" />
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-green-900">UI-Elemente ({uiElements.length})</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${activeCategory === 'all' ? 'bg-green-600 text-white border-green-600' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
            >
              Alle
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${activeCategory === cat ? 'bg-green-600 text-white border-green-600' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.map((element) => {
          const globalIndex = uiElements.indexOf(element)
          return (
            <article key={element.id} className="border border-green-100 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs font-semibold text-green-700 font-mono">{element.elementKey}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-600 border border-green-100">{CATEGORY_LABELS[element.category] ?? element.category}</span>
              </div>
              {element.description && <p className="text-xs text-green-500">{element.description}</p>}
              <label className="block">
                <span className="text-xs font-medium text-green-800">Label</span>
                <input
                  type="text"
                  value={element.label}
                  onChange={(e) => setUiElements((prev) => prev.map((row, i) => (i === globalIndex ? { ...row, label: e.target.value } : row)))}
                  className="mt-1 w-full rounded-lg border border-green-200 px-2.5 py-1.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-green-800">Wert</span>
                {element.valueType === 'color' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={element.value}
                      onChange={(e) => {
                        const nextValue = e.target.value
                        setUiElements((prev) => prev.map((row, i) => (i === globalIndex ? { ...row, value: nextValue } : row)))
                        void setElementValue(element.elementKey, nextValue, element.valueType)
                      }}
                      className="w-10 h-9 rounded-lg border border-green-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={element.value}
                      onChange={(e) => {
                        const nextValue = e.target.value
                        setUiElements((prev) => prev.map((row, i) => (i === globalIndex ? { ...row, value: nextValue } : row)))
                        if (/^#[0-9a-fA-F]{6}$/.test(nextValue)) {
                          void setElementValue(element.elementKey, nextValue, element.valueType)
                        }
                      }}
                      className="flex-1 rounded-lg border border-green-200 px-2.5 py-1.5 text-sm font-mono"
                      placeholder="#rrggbb"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={element.value}
                    onChange={(e) => {
                      const nextValue = e.target.value
                      setUiElements((prev) => prev.map((row, i) => (i === globalIndex ? { ...row, value: nextValue } : row)))
                      void setElementValue(element.elementKey, nextValue, element.valueType)
                    }}
                    className="mt-1 w-full rounded-lg border border-green-200 px-2.5 py-1.5 text-sm"
                  />
                )}
              </label>
              <label className="block">
                <span className="text-xs font-medium text-green-800">Beschreibung</span>
                <input
                  type="text"
                  value={element.description}
                  onChange={(e) => setUiElements((prev) => prev.map((row, i) => (i === globalIndex ? { ...row, description: e.target.value } : row)))}
                  className="mt-1 w-full rounded-lg border border-green-200 px-2.5 py-1.5 text-sm text-green-600"
                />
              </label>
            </article>
          )
        })}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={saveSettings} className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">Speichern</button>
        {saved && <span className="text-sm text-green-700">Gespeichert ✓</span>}
        <button
          onClick={handleReset}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${resetConfirm ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
        >
          {resetConfirm ? 'Wirklich zurücksetzen?' : 'Auf Standard zurücksetzen'}
        </button>
      </div>
    </section>
  )
}
