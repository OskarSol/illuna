import { useEffect, useState } from 'react'
import { db } from '../db'
import { useUiStore } from '../uiStore'

type Settings = {
  apiKey: string
  apiUrl: string
  baseFontSize: string
  primaryColor: string
  backgroundImageUrl: string
}

async function getSetting(key: string, fallback = '') {
  const row = await db.app_settings.get(key)
  return row?.value ?? fallback
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({ apiKey: '', apiUrl: '', baseFontSize: '14px', primaryColor: '#16a34a', backgroundImageUrl: '' })
  const [saved, setSaved] = useState(false)
  const { setToken, init: initUi } = useUiStore()

  useEffect(() => {
    initUi()
    ;(async () => {
      const [apiKey, apiUrl, baseFontSize, primaryColor, backgroundImageUrl] = await Promise.all([
        getSetting('api.key'),
        getSetting('api.url'),
        getSetting('ui.font.size.base', '14px'),
        getSetting('ui.color.primary', '#16a34a'),
        getSetting('ui.bg.app.imageUrl', ''),
      ])
      setSettings({ apiKey, apiUrl, baseFontSize, primaryColor, backgroundImageUrl })
    })()
  }, [initUi])

  async function saveSettings() {
    const ts = new Date().toISOString()
    await db.app_settings.bulkPut([
      { key: 'api.key', value: settings.apiKey, valueType: 'string', updatedAt: ts },
      { key: 'api.url', value: settings.apiUrl, valueType: 'string', updatedAt: ts },
      { key: 'ui.font.size.base', value: settings.baseFontSize, valueType: 'string', updatedAt: ts },
      { key: 'ui.color.primary', value: settings.primaryColor, valueType: 'string', updatedAt: ts },
      { key: 'ui.bg.app.imageUrl', value: settings.backgroundImageUrl, valueType: 'string', updatedAt: ts },
    ])

    await Promise.all([
      setToken('font.size.base', settings.baseFontSize, 'px'),
      setToken('color.primary', settings.primaryColor, 'color'),
      setToken('bg.app.imageUrl', settings.backgroundImageUrl, 'url'),
    ])

    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <section className="bg-white border border-green-100 rounded-2xl shadow-sm p-5 sm:p-6 space-y-5">
      <header>
        <h2 className="text-lg font-semibold text-green-900">Einstellungen</h2>
        <p className="text-sm text-green-600 mt-1">App-/API-Settings und UI-Token aus der lokalen Dexie-Datenbank.</p>
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

        <label className="block">
          <span className="text-sm font-medium text-green-800">Primärfarbe</span>
          <input type="color" value={settings.primaryColor} onChange={(e) => setSettings((prev) => ({ ...prev, primaryColor: e.target.value }))} className="mt-1.5 h-10 w-full rounded-xl border border-green-200" />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-green-800">Basis-Schriftgröße</span>
          <input type="text" value={settings.baseFontSize} onChange={(e) => setSettings((prev) => ({ ...prev, baseFontSize: e.target.value }))} placeholder="14px" className="mt-1.5 w-full rounded-xl border border-green-200 px-3.5 py-2.5 text-sm" />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-green-800">Background-Image URL</span>
          <input type="text" value={settings.backgroundImageUrl} onChange={(e) => setSettings((prev) => ({ ...prev, backgroundImageUrl: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-green-200 px-3.5 py-2.5 text-sm" />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={saveSettings} className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">Speichern</button>
        {saved && <span className="text-sm text-green-700">Gespeichert ✓</span>}
      </div>
    </section>
  )
}
