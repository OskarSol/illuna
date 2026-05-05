import { useState } from 'react'
import { Leaf, ListChecks, CalendarDays, Sprout } from 'lucide-react'
import PlantManager from './components/PlantManager'
import TaskList from './components/TaskList'
import MonthlyCalendar from './components/MonthlyCalendar'
import WeatherWidget from './components/WeatherWidget'
import { useGardenStore } from './store'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import clsx from 'clsx'

type Tab = 'plants' | 'tasks' | 'calendar'

const TABS: { id: Tab; label: string; icon: typeof Leaf }[] = [
  { id: 'plants', label: 'Pflanzen', icon: Sprout },
  { id: 'tasks', label: 'Aufgaben', icon: ListChecks },
  { id: 'calendar', label: 'Kalender', icon: CalendarDays },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('tasks')
  const { tasks, plants } = useGardenStore()

  const openToday = tasks.filter(
    (t) => !t.completed && t.dueDate <= format(new Date(), 'yyyy-MM-dd')
  ).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white border-b border-green-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-green-900 leading-tight">Gartenplaner</h1>
              <p className="text-xs text-green-500">
                {format(new Date(), 'EEEE, d. MMMM', { locale: de })}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex gap-4">
            <Stat label="Pflanzen" value={plants.length} color="text-green-600" />
            <Stat label="Heute fällig" value={openToday} color={openToday > 0 ? 'text-amber-600' : 'text-green-600'} />
            <Stat label="Offen" value={tasks.filter((t) => !t.completed).length} color="text-green-600" />
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-3xl mx-auto px-4 flex gap-1 pb-0 pt-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all',
                activeTab === id
                  ? 'border-green-600 text-green-700 bg-green-50'
                  : 'border-transparent text-green-500 hover:text-green-700 hover:bg-green-50/50'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {id === 'tasks' && openToday > 0 && (
                <span className="ml-0.5 w-4 h-4 text-[10px] font-bold bg-amber-500 text-white rounded-full flex items-center justify-center">
                  {openToday > 9 ? '9+' : openToday}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-6">
        {activeTab === 'plants' && <PlantManager />}
        {activeTab === 'tasks' && <TaskList />}
        {activeTab === 'calendar' && <MonthlyCalendar />}
      </main>

      <WeatherWidget />

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-green-100 px-4 py-2 flex justify-around">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              'flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors relative',
              activeTab === id ? 'text-green-700' : 'text-green-400'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
            {id === 'tasks' && openToday > 0 && (
              <span className="absolute top-0.5 right-1.5 w-4 h-4 text-[9px] font-bold bg-amber-500 text-white rounded-full flex items-center justify-center">
                {openToday > 9 ? '9+' : openToday}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className={clsx('text-lg font-bold leading-tight', color)}>{value}</p>
      <p className="text-xs text-green-500">{label}</p>
    </div>
  )
}
