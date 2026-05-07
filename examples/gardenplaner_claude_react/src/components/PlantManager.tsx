import { useState } from 'react'
import { Plus, Trash2, MapPin, StickyNote, Leaf } from 'lucide-react'
import { useGardenStore, type Plant } from '../store'
import { useUiStore } from '../uiStore'
import { useShallow } from 'zustand/shallow'

const FALLBACK_EMOJIS = ['🌱', '🌿', '🍅', '🥕', '🥦', '🌹', '🌻', '🌷', '🍓', '🫐', '🍋', '🌺', '🌾', '🪴', '🫚']

interface PlantFormData {
  name: string
  emoji: string
  location: string
  notes: string
}

const EMPTY_FORM: PlantFormData = { name: '', emoji: '🌱', location: '', notes: '' }

export default function PlantManager() {
  const { plants, addPlant, removePlant } = useGardenStore()
  const { elements, isVisible } = useUiStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<PlantFormData>(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const plantEmojis = elements['text.plants.emojis']
    ? elements['text.plants.emojis'].split(',').map((e) => e.trim()).filter(Boolean)
    : FALLBACK_EMOJIS

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    addPlant({ name: form.name.trim(), emoji: form.emoji, location: form.location.trim(), notes: form.notes.trim() || undefined })
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  function handleDelete(id: string) {
    if (deleteConfirm === id) {
      removePlant(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const showHeading = isVisible('plants.heading')
  const showAddButton = isVisible('plants.addButton')
  const showLocation = isVisible('plants.locationField')
  const showNotes = isVisible('plants.notesField')

  return (
    <div className="space-y-4">
      {(showHeading || showAddButton) && (
        <div className="flex items-center justify-between">
          {showHeading ? (
            <h2 className="text-heading text-green-900 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-600" />
              {elements['text.plants.heading'] || 'Meine Pflanzen'}
              <span className="ml-1 text-sm font-normal text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                {plants.length}
              </span>
            </h2>
          ) : <span />}
          {showAddButton && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 btn-primary text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              {elements['text.plants.addButton'] || 'Pflanze hinzufügen'}
            </button>
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card-bg border border-green-200 rounded-xl p-4 shadow-sm space-y-3">
          <p className="text-sm font-medium text-green-800">{elements['text.plants.formTitle'] || 'Neue Pflanze'}</p>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-label-sm text-green-700 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="z.B. Tomaten"
                className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-label-sm text-green-700 mb-1">Emoji</label>
            <div className="flex flex-wrap gap-1.5">
              {plantEmojis.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setForm({ ...form, emoji: e })}
                  className={`w-9 h-9 text-xl rounded-lg border-2 transition-all ${form.emoji === e ? 'border-green-500 bg-green-50 scale-110' : 'border-transparent hover:border-green-300'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {showLocation && (
            <div>
              <label className="block text-label-sm text-green-700 mb-1">Standort</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="z.B. Hochbeet, Balkon, Vorgarten"
                className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          )}

          {showNotes && (
            <div>
              <label className="block text-label-sm text-green-700 mb-1">Notizen</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Besonderheiten, Hinweise…"
                className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 btn-primary text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              Hinzufügen
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
              className="px-4 text-sm text-green-700 hover:bg-green-50 rounded-lg transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {plants.map((plant) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            deleteConfirm={deleteConfirm === plant.id}
            onDelete={() => handleDelete(plant.id)}
          />
        ))}
        {plants.length === 0 && (
          <div className="col-span-2 text-center py-10 text-green-500">
            <p className="text-3xl mb-2">🌱</p>
            <p className="text-sm">{elements['text.plants.emptyState'] || 'Noch keine Pflanzen. Füge deine erste hinzu!'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function PlantCard({ plant, deleteConfirm, onDelete }: { plant: Plant; deleteConfirm: boolean; onDelete: () => void }) {
  const tasks = useGardenStore(useShallow((s) => s.tasks.filter((t) => t.plantId === plant.id && !t.completed)))
  const { elements, isVisible } = useUiStore()
  const showLocation = isVisible('plants.locationField')
  const showNotes = isVisible('plants.notesField')
  const showTaskBadges = isVisible('plants.taskBadges')

  return (
    <div className="card-bg border border-green-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{plant.emoji}</span>
          <div>
            <p className="font-semibold text-green-900">{plant.name}</p>
            {showLocation && plant.location && (
              <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {plant.location}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onDelete}
          className={`p-1.5 rounded-lg text-xs transition-all ${deleteConfirm ? 'bg-red-100 text-red-600 ring-2 ring-red-300' : 'text-green-400 hover:text-red-500 hover:bg-red-50'}`}
          title={deleteConfirm ? 'Nochmal klicken zum Bestätigen' : 'Pflanze entfernen'}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {showNotes && plant.notes && (
        <p className="mt-2 text-xs text-green-600 flex items-start gap-1">
          <StickyNote className="w-3 h-3 mt-0.5 shrink-0" />
          {plant.notes}
        </p>
      )}

      {showTaskBadges && (
        <div className="mt-3 pt-3 border-t border-green-50 flex items-center justify-between">
          <span className="text-xs text-green-500">
            {tasks.length} offene {tasks.length === 1 ? 'Aufgabe' : 'Aufgaben'}
          </span>
          <div className="flex gap-1">
            {tasks.slice(0, 3).map((t) => (
              <span key={t.id} className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                {elements[`icon.tasktype.${t.taskType}`] || t.taskType}
              </span>
            ))}
            {tasks.length > 3 && <span className="text-xs text-green-500">+{tasks.length - 3}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
