import { useState } from 'react'

const STORAGE_KEY = 'gardenplanner-settings'

type Settings = {
  apiKey: string
  apiUrl: string
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { apiKey: '', apiUrl: '' }
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      apiKey: parsed.apiKey ?? '',
      apiUrl: parsed.apiUrl ?? '',
    }
  } catch {
    return { apiKey: '', apiUrl: '' }
  }
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const [saved, setSaved] = useState(false)

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <section className="bg-white border border-green-100 rounded-2xl shadow-sm p-5 sm:p-6 space-y-5">
      <header>
        <h2 className="text-lg font-semibold text-green-900">Einstellungen</h2>
        <p className="text-sm text-green-600 mt-1">Verwalte hier deine API-Zugangsdaten.</p>
      </header>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-green-800">API Key</span>
          <input
            type="password"
            value={settings.apiKey}
            onChange={(e) => setSettings((prev) => ({ ...prev, apiKey: e.target.value }))}
            placeholder="Dein API Key"
            className="mt-1.5 w-full rounded-xl border border-green-200 px-3.5 py-2.5 text-sm text-green-900 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-green-800">API URL</span>
          <input
            type="text"
            value={settings.apiUrl}
            onChange={(e) => setSettings((prev) => ({ ...prev, apiUrl: e.target.value }))}
            placeholder="https://api.example.com"
            className="mt-1.5 w-full rounded-xl border border-green-200 px-3.5 py-2.5 text-sm text-green-900 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={saveSettings}
          className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
        >
          Speichern
        </button>
        {saved && <span className="text-sm text-green-700">Gespeichert ✓</span>}
      </div>
    </section>
  )
}
