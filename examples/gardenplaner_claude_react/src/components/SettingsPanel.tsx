import { useEffect, useState } from 'react'
import { db, type UiElementDefinition } from '../db'
import { useUiStore } from '../uiStore'

type Settings = {
  apiKey: string
  apiUrl: string
}

async function getSetting(key: string, fallback = '') {
  const row = await db.app_settings.get(key)
  return row?.value ?? fallback
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({ apiKey: '', apiUrl: '' })
  const [uiElements, setUiElements] = useState<UiElementDefinition[]>([])
  const [saved, setSaved] = useState(false)
  const { setToken, init: initUi } = useUiStore()

  async function loadUiElements() {
    const active = await db.ui_profiles.where('isActive').equals(1).first()
    const profileId = active?.id ?? 'default'
    const rows = await db.ui_elements.where('profileId').equals(profileId).sortBy('elementKey')
    setUiElements(rows)
  }

  useEffect(() => {
    initUi()
    ;(async () => {
      const [apiKey, apiUrl] = await Promise.all([getSetting('api.key'), getSetting('api.url')])
      setSettings({ apiKey, apiUrl })
      await loadUiElements()
    })()
  }, [initUi])

  async function saveSettings() {
    const ts = new Date().toISOString()
    await db.app_settings.bulkPut([
      { key: 'api.key', value: settings.apiKey, valueType: 'string', updatedAt: ts },
      { key: 'api.url', value: settings.apiUrl, valueType: 'string', updatedAt: ts },
    ])

    await db.ui_elements.bulkPut(uiElements.map((e) => ({ ...e, updatedAt: ts })))

    await Promise.all(
      uiElements
        .filter((e) => !e.elementKey.startsWith('text.'))
        .map((e) => setToken(e.elementKey, e.value, e.valueType))
    )

    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <section className="bg-white border border-green-100 rounded-2xl shadow-sm p-5 sm:p-6 space-y-5">
      <header>
        <h2 className="text-lg font-semibold text-green-900">Einstellungen</h2>
        <p className="text-sm text-green-600 mt-1">Alle UI-Elemente haben eindeutigen Bezeichner, Label, Beschreibung und Value in der Datenbank.</p>
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
        <h3 className="text-sm font-semibold text-green-900">UI-Elemente</h3>
        {uiElements.map((element, index) => (
          <article key={element.id} className="border border-green-100 rounded-xl p-3 space-y-2">
            <p className="text-xs font-semibold text-green-700">{element.elementKey}</p>
            <p className="text-xs text-green-600">{element.description}</p>
            <label className="block">
              <span className="text-xs font-medium text-green-800">Label</span>
              <input
                type="text"
                value={element.label}
                onChange={(e) => setUiElements((prev) => prev.map((row, i) => (i === index ? { ...row, label: e.target.value } : row)))}
                className="mt-1 w-full rounded-lg border border-green-200 px-2.5 py-1.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-green-800">Value</span>
              <input
                type={element.valueType === 'color' ? 'color' : 'text'}
                value={element.value}
                onChange={(e) => setUiElements((prev) => prev.map((row, i) => (i === index ? { ...row, value: e.target.value } : row)))}
                className="mt-1 w-full rounded-lg border border-green-200 px-2.5 py-1.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-green-800">Beschreibung</span>
              <input
                type="text"
                value={element.description}
                onChange={(e) => setUiElements((prev) => prev.map((row, i) => (i === index ? { ...row, description: e.target.value } : row)))}
                className="mt-1 w-full rounded-lg border border-green-200 px-2.5 py-1.5 text-sm"
              />
            </label>
          </article>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={saveSettings} className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">Speichern</button>
        {saved && <span className="text-sm text-green-700">Gespeichert ✓</span>}
      </div>
    </section>
  )
}
