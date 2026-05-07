import { useState } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, CalendarDays, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { useGardenStore, type Task, type TaskType } from '../store'
import { useUiStore } from '../uiStore'
import clsx from 'clsx'

const TASK_TYPE_VALUES: TaskType[] = ['watering', 'fertilizing', 'pruning', 'harvesting', 'repotting', 'other']

type GroupKey = 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'done'
const GROUP_KEYS: GroupKey[] = ['overdue', 'today', 'tomorrow', 'upcoming', 'done']

function classifyTask(task: Task): GroupKey {
  if (task.completed) return 'done'
  const d = parseISO(task.dueDate)
  if (isPast(d) && !isToday(d)) return 'overdue'
  if (isToday(d)) return 'today'
  if (isTomorrow(d)) return 'tomorrow'
  return 'upcoming'
}

function formatDueDate(dateStr: string): string {
  const d = parseISO(dateStr)
  if (isToday(d)) return 'Heute'
  if (isTomorrow(d)) return 'Morgen'
  return format(d, 'EEE, d. MMM', { locale: de })
}

interface TaskFormData {
  plantId: string
  title: string
  taskType: TaskType
  dueDate: string
  notes: string
  recurring: boolean
  recurringType: 'daily' | 'weekly' | 'monthly'
  recurringInterval: number
}

const EMPTY_TASK_FORM: TaskFormData = {
  plantId: '',
  title: '',
  taskType: 'watering',
  dueDate: format(new Date(), 'yyyy-MM-dd'),
  notes: '',
  recurring: false,
  recurringType: 'weekly',
  recurringInterval: 1,
}

export default function TaskList() {
  const { tasks, plants, toggleTask, removeTask, addTask } = useGardenStore()
  const { elements, isVisible } = useUiStore()
  const showHeading = isVisible('tasks.heading')
  const showAddButton = isVisible('tasks.addButton')
  const showFilter = isVisible('tasks.filter')
  const showRecurring = isVisible('tasks.recurringField')
  const showNotes = isVisible('tasks.notesField')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<TaskFormData>(EMPTY_TASK_FORM)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<GroupKey>>(new Set(['done']))
  const [filterPlant, setFilterPlant] = useState<string>('all')

  const filtered = filterPlant === 'all' ? tasks : tasks.filter((t) => t.plantId === filterPlant)

  const groups: Record<GroupKey, Task[]> = { overdue: [], today: [], tomorrow: [], upcoming: [], done: [] }
  for (const t of filtered) groups[classifyTask(t)].push(t)

  function toggleGroup(key: GroupKey) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.plantId) return
    addTask({
      plantId: form.plantId,
      title: form.title.trim(),
      taskType: form.taskType,
      dueDate: form.dueDate,
      notes: form.notes.trim() || undefined,
      recurring: form.recurring ? { type: form.recurringType, interval: form.recurringInterval } : undefined,
    })
    setForm({ ...EMPTY_TASK_FORM, plantId: form.plantId })
    setShowForm(false)
  }

  const taskTypeOptions = TASK_TYPE_VALUES.map((type) => ({
    value: type,
    label: elements[`text.tasktype.${type}`] || type,
    icon: elements[`icon.tasktype.${type}`] || '',
  }))

  return (
    <div className="space-y-4">
      {(showHeading || showAddButton || showFilter) && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          {showHeading ? (
            <h2 className="text-heading text-green-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-green-600" />
              {elements['text.tasks.heading'] || 'Aufgaben'}
              <span className="text-sm font-normal text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                {tasks.filter((t) => !t.completed).length} {elements['text.stats.open'] || 'offen'}
              </span>
            </h2>
          ) : <span />}
          <div className="flex gap-2 flex-wrap">
            {showFilter && (
              <select
                value={filterPlant}
                onChange={(e) => setFilterPlant(e.target.value)}
                className="text-sm border border-green-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-green-800"
              >
                <option value="all">{elements['text.tasks.filterAll'] || 'Alle Pflanzen'}</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                ))}
              </select>
            )}
            {showAddButton && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 btn-primary text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                {elements['text.tasks.addButton'] || 'Aufgabe'}
              </button>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card-bg border border-green-200 rounded-xl p-4 shadow-sm space-y-3">
          <p className="text-sm font-medium text-green-800">{elements['text.tasks.formTitle'] || 'Neue Aufgabe'}</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-label-sm text-green-700 mb-1">Pflanze *</label>
              <select
                value={form.plantId}
                onChange={(e) => setForm({ ...form, plantId: e.target.value })}
                className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              >
                <option value="">Auswählen…</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-label-sm text-green-700 mb-1">Typ</label>
              <select
                value={form.taskType}
                onChange={(e) => setForm({ ...form, taskType: e.target.value as TaskType })}
                className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {taskTypeOptions.map((t) => (
                  <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-green-700 mb-1">Bezeichnung *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="z.B. Tomaten gießen"
              className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-label-sm text-green-700 mb-1">Fällig am</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            {showNotes && (
              <div>
                <label className="block text-label-sm text-green-700 mb-1">Notiz</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional…"
                  className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            )}
          </div>

          {showRecurring && (
            <div>
              <label className="flex items-center gap-2 text-sm text-green-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.recurring}
                  onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
                  className="accent-green-600"
                />
                <RefreshCw className="w-4 h-4 text-green-600" />
                Wiederholt sich
              </label>
              {form.recurring && (
                <div className="mt-2 flex gap-2 items-center pl-6">
                  <span className="text-xs text-green-600">Alle</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={form.recurringInterval}
                    onChange={(e) => setForm({ ...form, recurringInterval: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-14 border border-green-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 text-center"
                  />
                  <select
                    value={form.recurringType}
                    onChange={(e) => setForm({ ...form, recurringType: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                    className="border border-green-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <option value="daily">Tag(e)</option>
                    <option value="weekly">Woche(n)</option>
                    <option value="monthly">Monat(e)</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="submit" className="flex-1 btn-primary text-white text-sm font-medium py-2 rounded-lg transition-colors">
              Hinzufügen
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_TASK_FORM) }} className="px-4 text-sm text-green-700 hover:bg-green-50 rounded-lg transition-colors">
              Abbrechen
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {GROUP_KEYS.map((key) => {
          const group = groups[key]
          if (group.length === 0) return null
          const label = elements[`text.tasks.group.${key}`] || key
          const color = elements[`color.tasks.group.${key}`]
          const collapsed = collapsedGroups.has(key)
          return (
            <div key={key} className="card-bg border border-green-100 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleGroup(key)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-green-50 transition-colors"
              >
                <span className="text-sm font-semibold" style={color ? { color } : undefined}>{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded-full">{group.length}</span>
                  {collapsed ? <ChevronDown className="w-4 h-4 text-green-400" /> : <ChevronUp className="w-4 h-4 text-green-400" />}
                </div>
              </button>
              {!collapsed && (
                <ul className="divide-y divide-green-50">
                  {group
                    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                    .map((task) => (
                      <TaskItem key={task.id} task={task} onToggle={() => toggleTask(task.id)} onDelete={() => removeTask(task.id)} />
                    ))}
                </ul>
              )}
            </div>
          )
        })}

        {tasks.length === 0 && (
          <div className="text-center py-10 text-green-500 card-bg rounded-xl border border-green-100">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm">{elements['text.tasks.emptyState'] || 'Noch keine Aufgaben. Füge deine erste hinzu!'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TaskItem({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  const plant = useGardenStore((s) => s.plants.find((p) => p.id === task.plantId))
  const { elements } = useUiStore()

  const icon = elements[`icon.tasktype.${task.taskType}`] || ''
  const label = elements[`text.tasktype.${task.taskType}`] || task.taskType
  const bg = elements[`color.tasktype.${task.taskType}.bg`]
  const textColor = elements[`color.tasktype.${task.taskType}.text`]

  return (
    <li className="flex items-center gap-3 px-4 py-3 hover:bg-green-50/50 transition-colors group">
      <button onClick={onToggle} className="shrink-0 text-green-500 hover:text-green-700 transition-colors">
        {task.completed
          ? <CheckCircle2 className="w-5 h-5 text-green-500" />
          : <Circle className="w-5 h-5" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm font-medium truncate', task.completed ? 'line-through text-green-400' : 'text-green-900')}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {plant && (
            <span className="text-xs text-green-600">
              {plant.emoji} {plant.name}
            </span>
          )}
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={bg ? { backgroundColor: bg, color: textColor } : undefined}
          >
            {icon} {label}
          </span>
          <span className="text-xs text-green-500 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {formatDueDate(task.dueDate)}
          </span>
          {task.recurring && (
            <span className="text-xs text-blue-500 flex items-center gap-0.5">
              <RefreshCw className="w-3 h-3" />
              {task.recurring.interval > 1 ? `${task.recurring.interval}×` : ''}
              {task.recurring.type === 'daily' ? 'tägl.' : task.recurring.type === 'weekly' ? 'wöch.' : 'mtl.'}
            </span>
          )}
        </div>
        {task.notes && <p className="text-xs text-green-500 mt-0.5 truncate">{task.notes}</p>}
      </div>

      <button
        onClick={onDelete}
        className="shrink-0 opacity-0 group-hover:opacity-100 p-1.5 text-green-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </li>
  )
}
