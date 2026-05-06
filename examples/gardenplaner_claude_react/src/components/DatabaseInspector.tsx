import { useEffect, useState } from 'react'
import { api } from '../api/client'

type TableName = 'plants' | 'tasks' | 'app_settings' | 'ui_elements' | 'ui_tokens'
const TABLES: TableName[] = ['plants', 'tasks', 'app_settings', 'ui_elements', 'ui_tokens']

interface DbTablesResponse {
  plants: Record<string, unknown>[]
  tasks: Record<string, unknown>[]
  app_settings: Record<string, unknown>[]
  ui_elements: Record<string, unknown>[]
  ui_tokens: Record<string, unknown>[]
}

export default function DatabaseInspector() {
  const [activeTable, setActiveTable] = useState<TableName>('plants')
  const [tableData, setTableData] = useState<DbTablesResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function loadData() {
    setLoading(true)
    setMessage('')
    try {
      const data = await api.get<DbTablesResponse>('/api/ui/db-tables')
      setTableData(data)
    } catch {
      setMessage('Fehler beim Laden der Daten')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const rows = tableData?.[activeTable] ?? []

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-semibold text-green-900">Datenbank-Explorer</h2>
            <p className="text-sm text-green-700 mt-1">Tabellen ansehen (nur deine eigenen Daten).</p>
          </div>
          <button onClick={loadData} disabled={loading} className="px-3 py-1.5 text-sm rounded-lg border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50">
            {loading ? 'Lädt…' : 'Aktualisieren'}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {TABLES.map(name => (
            <button key={name} onClick={() => setActiveTable(name)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${name === activeTable ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-700 border-green-200 hover:bg-green-50'}`}>
              {name} ({tableData?.[name]?.length ?? '…'})
            </button>
          ))}
        </div>
      </div>

      {message && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{message}</p>}

      <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-4 space-y-3">
        <p className="text-sm font-semibold text-green-800">{activeTable} · {rows.length} Einträge</p>
        {rows.length === 0 ? (
          <p className="text-sm text-green-500 italic">Keine Einträge vorhanden.</p>
        ) : (
          rows.map((row, i) => (
            <div key={i} className="border border-green-100 rounded-xl p-3">
              <pre className="text-xs font-mono text-green-900 overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(row, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
