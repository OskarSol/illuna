import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useUiStore } from '../uiStore'
import type { SkillLevel, UiElementDefinition } from '../db'

type Settings = {
  apiKey: string
  apiUrl: string
}

const CATEGORY_LABELS: Record<UiElementDefinition['category'], string> = {
  text: 'Text & Labels',
  color: 'Farben',
  background: 'Hintergrund',
  font: 'Schrift',
  border: 'Rahmen',
  layout: 'Layout',
  icon: 'Icons & Emojis',
  visibility: 'Sichtbarkeit',
}

const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  all: 'Immer sichtbar',
  beginner: 'Nur Anfängermodus',
  expert: 'Nur Expertenmodus',
}

interface ApiElement {
  id: string
  element_key: string
  label: string
  description: string
  value: string
  default_value: string
  value_type: UiElementDefinition['valueType']
  category: UiElementDefinition['category']
  skill_level: SkillLevel
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({ apiKey: '', apiUrl: '' })
  const [uiElements, setUiElements] = useState<ApiElement[]>([])
  const [saved, setSaved] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [activeCategory, setActiveCategory] = useState<UiElementDefinition['category'] | 'all'>('visibility')
  const {
    setElementValue,
    setElementSkillLevel,
    setSkillLevel,
    skillLevel,
    init: initUi,
    elements,
    elementSkillLevels,
  } = useUiStore()

  useEffect(() => {
    initUi()
    api.get<Record<string, { value: string }>>('/api/settings').then(s => {
      setSettings({ apiKey: s['api.key']?.value ?? '', apiUrl: s['api.url']?.value ?? '' })
    }).catch(() => {})
    api.get<ApiElement[]>('/api/ui/elements').then(rows => {
      setUiElements(rows.sort((a, b) => a.element_key.localeCompare(b.element_key)))
    }).catch(() => {})
  }, [initUi])

  // Sync local element values + skill levels when store changes (polling/AI updates)
  useEffect(() => {
    setUiElements(prev => {
      let changed = false
      const next = prev.map(el => {
        const storeVal = elements[el.element_key]
        const storeLvl = elementSkillLevels[el.element_key]
        let updated = el
        if (storeVal !== undefined && storeVal !== el.value) {
          updated = { ...updated, value: storeVal }
          changed = true
        }
        if (storeLvl !== undefined && storeLvl !== el.skill_level) {
          updated = { ...updated, skill_level: storeLvl }
          changed = true
        }
        return updated
      })
      return changed ? next : prev
    })
  }, [elements, elementSkillLevels])

  async function handleReset() {
    if (!resetConfirm) {
      setResetConfirm(true)
      setTimeout(() => setResetConfirm(false), 3000)
      return
    }
    setResetConfirm(false)
    await api.post('/api/ui/reset-to-default', {})
    const rows = await api.get<ApiElement[]>('/api/ui/elements')
    setUiElements(rows.sort((a, b) => a.element_key.localeCompare(b.element_key)))
    await initUi()
  }

  async function saveSettings() {
    await Promise.all([
      api.put('/api/settings/api.key', { value: settings.apiKey, valueType: 'string' }),
      api.put('/api/settings/api.url', { value: settings.apiUrl, valueType: 'string' }),
    ])
    for (const element of uiElements) {
      await setElementValue(element.element_key, element.value, element.value_type)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  // Hide expert-only elements when in beginner mode (and vice versa)
  const allowedBySkill = uiElements.filter(el => el.skill_level === 'all' || el.skill_level === skillLevel)
  const categories = Array.from(new Set(allowedBySkill.map(e => e.category))) as UiElementDefinition['category'][]
  const filtered = activeCategory === 'all' ? allowedBySkill : allowedBySkill.filter(e => e.category === activeCategory)

  return (
    <section className="card-bg border border-green-100 rounded-2xl shadow-sm p-5 sm:p-6 space-y-5">
      <header>
        <h2 className="text-heading text-green-900">Einstellungen</h2>
        <p className="text-sm text-green-600 mt-1">Alle UI-Elemente mit Bezeichner, Label, Beschreibung und Wert. Änderungen werden direkt in der UI sichtbar.</p>
      </header>

      <div className="border border-green-100 rounded-xl p-4 bg-green-50/40">
        <p className="text-sm font-semibold text-green-900 mb-1">Modus</p>
        <p className="text-xs text-green-600 mb-3">Wechselt die Komplexität der Oberfläche. Anfängermodus blendet erweiterte Optionen aus.</p>
        <div className="flex gap-2">
          {(['beginner', 'expert'] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => void setSkillLevel(lvl)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                skillLevel === lvl
                  ? 'btn-primary text-white border-transparent'
                  : 'border-green-200 text-green-700 hover:bg-green-50'
              }`}
            >
              {lvl === 'beginner' ? '🌱 Anfänger' : '🌿 Experte'}
            </button>
          ))}
        </div>
      </div>

      {(skillLevel === 'expert') && (
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-green-800">API Key</span>
            <input type="password" value={settings.apiKey} onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-green-200 px-3.5 py-2.5 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-green-800">API URL</span>
            <input type="text" value={settings.apiUrl} onChange={(e) => setSettings(prev => ({ ...prev, apiUrl: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-green-200 px-3.5 py-2.5 text-sm" />
          </label>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-green-900">UI-Elemente ({allowedBySkill.length})</h3>
          <div className="flex flex-wrap gap-1">
            <button onClick={() => setActiveCategory('all')} className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${activeCategory === 'all' ? 'btn-primary text-white border-transparent' : 'border-green-200 text-green-700 hover:bg-green-50'}`}>Alle</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${activeCategory === cat ? 'btn-primary text-white border-transparent' : 'border-green-200 text-green-700 hover:bg-green-50'}`}>
                {CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.map((element) => {
          const globalIndex = uiElements.findIndex(e => e.id === element.id)
          const isBoolean = element.value_type === 'boolean' || element.category === 'visibility'
          return (
            <article key={element.id} className="border border-green-100 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs font-semibold text-green-700 font-mono">{element.element_key}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-600 border border-green-100">{CATEGORY_LABELS[element.category] ?? element.category}</span>
                <select
                  value={element.skill_level}
                  onChange={e => {
                    const lvl = e.target.value as SkillLevel
                    setUiElements(prev => prev.map((row, i) => i === globalIndex ? { ...row, skill_level: lvl } : row))
                    void setElementSkillLevel(element.element_key, lvl)
                  }}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-green-200 text-green-700 ml-auto"
                  title="Modus-Sichtbarkeit"
                >
                  {(['all', 'beginner', 'expert'] as const).map(lvl => (
                    <option key={lvl} value={lvl}>{SKILL_LEVEL_LABELS[lvl]}</option>
                  ))}
                </select>
              </div>
              {element.description && <p className="text-xs text-green-500">{element.description}</p>}
              {element.category !== 'visibility' && (
                <label className="block">
                  <span className="text-label-sm font-medium text-green-800">Label</span>
                  <input type="text" value={element.label}
                    onChange={e => setUiElements(prev => prev.map((row, i) => i === globalIndex ? { ...row, label: e.target.value } : row))}
                    className="mt-1 w-full rounded-lg border border-green-200 px-2.5 py-1.5 text-sm" />
                </label>
              )}
              <label className="block">
                <span className="text-label-sm font-medium text-green-800">Wert</span>
                {isBoolean ? (
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const v = element.value === 'true' ? 'false' : 'true'
                        setUiElements(prev => prev.map((row, i) => i === globalIndex ? { ...row, value: v } : row))
                        void setElementValue(element.element_key, v, 'boolean')
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${element.value === 'true' ? 'bg-green-600' : 'bg-gray-300'}`}
                      role="switch"
                      aria-checked={element.value === 'true'}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${element.value === 'true' ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                    <span className="text-sm text-green-800">{element.value === 'true' ? 'Sichtbar' : 'Ausgeblendet'}</span>
                  </div>
                ) : element.value_type === 'color' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={element.value}
                      onChange={e => {
                        const v = e.target.value
                        setUiElements(prev => prev.map((row, i) => i === globalIndex ? { ...row, value: v } : row))
                        void setElementValue(element.element_key, v, element.value_type)
                      }}
                      className="w-10 h-9 rounded-lg border border-green-200 cursor-pointer p-0.5" />
                    <input type="text" value={element.value}
                      onChange={e => {
                        const v = e.target.value
                        setUiElements(prev => prev.map((row, i) => i === globalIndex ? { ...row, value: v } : row))
                        if (/^#[0-9a-fA-F]{6}$/.test(v)) void setElementValue(element.element_key, v, element.value_type)
                      }}
                      className="flex-1 rounded-lg border border-green-200 px-2.5 py-1.5 text-sm font-mono" placeholder="#rrggbb" />
                  </div>
                ) : (
                  <input type="text" value={element.value}
                    onChange={e => {
                      const v = e.target.value
                      setUiElements(prev => prev.map((row, i) => i === globalIndex ? { ...row, value: v } : row))
                      void setElementValue(element.element_key, v, element.value_type)
                    }}
                    className="mt-1 w-full rounded-lg border border-green-200 px-2.5 py-1.5 text-sm" />
                )}
              </label>
              {element.category !== 'visibility' && (
                <label className="block">
                  <span className="text-label-sm font-medium text-green-800">Beschreibung</span>
                  <input type="text" value={element.description}
                    onChange={e => setUiElements(prev => prev.map((row, i) => i === globalIndex ? { ...row, description: e.target.value } : row))}
                    className="mt-1 w-full rounded-lg border border-green-200 px-2.5 py-1.5 text-sm text-green-600" />
                </label>
              )}
            </article>
          )
        })}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={saveSettings} className="px-4 py-2 rounded-xl btn-primary text-white text-sm font-medium transition-colors">Speichern</button>
        {saved && <span className="text-sm text-green-700">Gespeichert ✓</span>}
        <button onClick={handleReset} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${resetConfirm ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' : 'border-red-200 text-red-600 hover:bg-red-50'}`}>
          {resetConfirm ? 'Wirklich zurücksetzen?' : 'Auf Standard zurücksetzen'}
        </button>
      </div>
    </section>
  )
}
