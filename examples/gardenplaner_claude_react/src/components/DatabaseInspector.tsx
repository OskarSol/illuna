import { useEffect, useMemo, useState } from 'react'
import { db } from '../db'

type TableName = keyof Pick<typeof db, 'plants' | 'tasks' | 'app_settings' | 'ui_profiles' | 'ui_tokens' | 'ui_component_overrides' | 'ui_elements'>

const TABLES: TableName[] = ['plants', 'tasks', 'app_settings', 'ui_profiles', 'ui_tokens', 'ui_component_overrides', 'ui_elements']

export default function DatabaseInspector() {
  const [activeTable, setActiveTable] = useState<TableName>('plants')
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>('')

  const table = useMemo(() => db[activeTable], [activeTable])

  async function loadRows() {
    setLoading(true)
    setMessage('')
    try {
      const data = await table.toArray()
      setRows(data as Record<string, unknown>[])
      setDrafts(
        Object.fromEntries(
          data.map((row: Record<string, unknown>, index: number) => [index, JSON.stringify(row, null, 2)])
        )
      )
    } catch (error) {
      setMessage(`Fehler beim Laden: ${String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRows()
  }, [activeTable])

  async function saveRow(index: number) {
    const draft = drafts[index]
    if (!draft) return

    try {
      const parsed = JSON.parse(draft) as Record<string, unknown>
      const keyPath = table.schema.primKey.keyPath

      if (typeof keyPath === 'string') {
        const keyValue = parsed[keyPath]
        if (keyValue === undefined || keyValue === null || keyValue === '') {
          setMessage(`Primärschlüssel "${keyPath}" fehlt in Zeile ${index + 1}.`)
          return
        }
        await table.put(parsed, keyValue)
      } else {
        await table.put(parsed)
      }

      setMessage(`Zeile ${index + 1} gespeichert.`)
      await loadRows()
    } catch (error) {
      setMessage(`Speichern fehlgeschlagen: ${String(error)}`)
    }
  }

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-4">
        <h2 className="text-lg font-semibold text-green-900">Datenbank-Explorer</h2>
        <p className="text-sm text-green-700 mt-1">Tabellen ansehen und Einträge direkt als JSON bearbeiten.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {TABLES.map((name) => (
            <button
              key={name}
              onClick={() => setActiveTable(name)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                name === activeTable
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-green-700 border-green-200 hover:bg-green-50'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-green-900">Tabelle: {activeTable}</h3>
          <button onClick={loadRows} className="px-3 py-1.5 text-sm rounded-lg bg-green-100 text-green-800 hover:bg-green-200">
            Neu laden
          </button>
        </div>

        {message && <p className="text-sm text-green-700">{message}</p>}
        {loading && <p className="text-sm text-green-600">Lade Daten…</p>}

        {!loading && rows.length === 0 && <p className="text-sm text-green-600">Keine Einträge vorhanden.</p>}

        <div className="space-y-4">
          {rows.map((_, index) => (
            <article key={index} className="border border-green-100 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-green-700 font-medium">Eintrag #{index + 1}</span>
                <button
                  onClick={() => saveRow(index)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Speichern
                </button>
              </div>

              <textarea
                value={drafts[index] ?? ''}
                onChange={(event) => setDrafts((prev) => ({ ...prev, [index]: event.target.value }))}
                className="w-full h-56 text-xs font-mono border border-green-200 rounded-lg p-2"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
