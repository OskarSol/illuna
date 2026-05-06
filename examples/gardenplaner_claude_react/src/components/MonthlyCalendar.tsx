import { useState } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isToday, parseISO, addMonths, subMonths,
  getDay,
} from 'date-fns'
import { de } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, CalendarDays } from 'lucide-react'
import { useGardenStore, type Task } from '../store'
import { useUiStore } from '../uiStore'
import clsx from 'clsx'

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const TASK_TYPES = ['watering', 'fertilizing', 'pruning', 'harvesting', 'repotting', 'other']

function mondayIndex(date: Date): number {
  const d = getDay(date)
  return d === 0 ? 6 : d - 1
}

export default function MonthlyCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date())

  const { tasks, toggleTask } = useGardenStore()
  const { elements, isVisible } = useUiStore()
  const showHeading = isVisible('calendar.heading')
  const showLegend = isVisible('calendar.legend')
  const showDayDetails = isVisible('calendar.dayDetails')

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const leadingBlanks = mondayIndex(monthStart)
  const trailingBlanks = 6 - mondayIndex(monthEnd)

  function tasksOnDay(day: Date): Task[] {
    return tasks.filter((t) => isSameDay(parseISO(t.dueDate), day))
  }

  const selectedDayTasks = selectedDay ? tasksOnDay(selectedDay) : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {showHeading ? (
          <h2 className="text-heading text-green-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-green-600" />
            {elements['text.calendar.heading'] || 'Monatsübersicht'}
          </h2>
        ) : <span />}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1 text-sm font-medium text-green-800 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            {format(currentMonth, 'MMMM yyyy', { locale: de })}
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="card-bg border border-green-100 rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-green-100">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-green-600 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`lead-${i}`} className="h-16 border-b border-r border-green-50 bg-green-50/30" />
          ))}

          {days.map((day) => {
            const dayTasks = tasksOnDay(day)
            const pending = dayTasks.filter((t) => !t.completed)
            const done = dayTasks.filter((t) => t.completed)
            const selected = selectedDay && isSameDay(day, selectedDay)
            const today = isToday(day)

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(selected ? null : day)}
                className={clsx(
                  'h-16 border-b border-r border-green-50 p-1 text-left transition-colors relative',
                  selected ? 'bg-green-100 ring-2 ring-inset ring-green-400' : 'hover:bg-green-50',
                )}
              >
                <span
                  className={clsx(
                    'inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-medium',
                    today ? 'text-white' : 'text-green-800',
                  )}
                  style={today ? { backgroundColor: elements['color.primary'] || '#16a34a' } : undefined}
                >
                  {format(day, 'd')}
                </span>

                <div className="mt-0.5 flex flex-wrap gap-0.5">
                  {pending.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: elements[`color.tasktype.${t.taskType}.dot`] || '#9ca3af' }}
                      title={t.title}
                    />
                  ))}
                  {pending.length > 3 && (
                    <span className="text-[9px] text-green-500 leading-none mt-0.5">+{pending.length - 3}</span>
                  )}
                </div>

                {done.length > 0 && (
                  <span className="absolute bottom-1 right-1 text-[9px] text-green-400">✓{done.length}</span>
                )}
              </button>
            )
          })}

          {Array.from({ length: trailingBlanks }).map((_, i) => (
            <div key={`trail-${i}`} className="h-16 border-b border-r border-green-50 bg-green-50/30" />
          ))}
        </div>
      </div>

      {/* Legende */}
      {showLegend && (
        <div className="flex flex-wrap gap-3 px-1">
          {TASK_TYPES.map((type) => (
            <span key={type} className="flex items-center gap-1.5 text-xs text-green-600">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: elements[`color.tasktype.${type}.dot`] || '#9ca3af' }}
              />
              {elements[`icon.tasktype.${type}`] || ''} {elements[`text.tasktype.${type}`] || type}
            </span>
          ))}
        </div>
      )}

      {/* Tagesdetails */}
      {showDayDetails && selectedDay && (
        <div className="card-bg border border-green-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-green-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-green-900">
              {format(selectedDay, 'EEEE, d. MMMM yyyy', { locale: de })}
            </h3>
            <span className="text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
              {selectedDayTasks.length} Aufgabe{selectedDayTasks.length !== 1 ? 'n' : ''}
            </span>
          </div>

          {selectedDayTasks.length === 0 ? (
            <div className="py-8 text-center text-green-400 text-sm">
              <p>🌞 Keine Aufgaben an diesem Tag</p>
            </div>
          ) : (
            <ul className="divide-y divide-green-50">
              {selectedDayTasks.map((task) => (
                <DayTaskItem key={task.id} task={task} onToggle={() => toggleTask(task.id)} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function DayTaskItem({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const plant = useGardenStore((s) => s.plants.find((p) => p.id === task.plantId))
  const { elements } = useUiStore()

  const icon = elements[`icon.tasktype.${task.taskType}`] || ''
  const typeLabel = elements[`text.tasktype.${task.taskType}`] || task.taskType
  const dotColor = elements[`color.tasktype.${task.taskType}.dot`] || '#9ca3af'

  return (
    <li
      className="flex items-center gap-3 px-4 py-3 hover:bg-green-50/50 transition-colors cursor-pointer"
      onClick={onToggle}
    >
      <span className="shrink-0 text-green-500">
        {task.completed
          ? <CheckCircle2 className="w-5 h-5 text-green-500" />
          : <Circle className="w-5 h-5" />}
      </span>
      <span className="text-xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm font-medium', task.completed ? 'line-through text-green-400' : 'text-green-900')}>
          {task.title}
        </p>
        {plant && (
          <p className="text-xs text-green-600 mt-0.5">{plant.emoji} {plant.name}</p>
        )}
      </div>
      <span
        className="text-xs px-2 py-0.5 rounded-full text-white"
        style={{ backgroundColor: dotColor }}
      >
        {typeLabel}
      </span>
    </li>
  )
}
