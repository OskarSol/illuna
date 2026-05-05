import { useEffect, useState } from 'react'
import { Leaf, ListChecks, CalendarDays, Sprout, Settings, Database } from 'lucide-react'
import PlantManager from './components/PlantManager'
import TaskList from './components/TaskList'
import MonthlyCalendar from './components/MonthlyCalendar'
import WeatherWidget from './components/WeatherWidget'
import ChatWidget from './components/ChatWidget'
import SettingsPanel from './components/SettingsPanel'
import DatabaseInspector from './components/DatabaseInspector'
import { useGardenStore } from './store'
import { useUiStore } from './uiStore'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import clsx from 'clsx'

type Tab = 'plants' | 'tasks' | 'calendar' | 'settings' | 'database'

const TABS: { id: Tab; label: string; icon: typeof Leaf }[] = [
  { id: 'plants', label: 'Pflanzen', icon: Sprout },
  { id: 'tasks', label: 'Aufgaben', icon: ListChecks },
  { id: 'calendar', label: 'Kalender', icon: CalendarDays },
  { id: 'settings', label: 'Einstellungen', icon: Settings },
  { id: 'database', label: 'Datenbank', icon: Database },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('tasks')
  const { tasks, plants, init, initialized } = useGardenStore()
  const { tokens, init: initUi } = useUiStore()

  useEffect(() => {
    init()
    initUi()
  }, [init, initUi])

  const openToday = tasks.filter((t) => !t.completed && t.dueDate <= format(new Date(), 'yyyy-MM-dd')).length

  const appStyle = {
    backgroundImage: tokens['bg.app.imageUrl']
      ? `url(${tokens['bg.app.imageUrl']}), linear-gradient(to bottom right, var(--bg-app-gradientFrom), var(--bg-app-gradientTo))`
      : 'linear-gradient(to bottom right, var(--bg-app-gradientFrom), var(--bg-app-gradientTo))',
    fontSize: tokens['font.size.base'] || undefined,
  } as const

  if (!initialized) return null

  return (
    <div className="min-h-screen" style={appStyle}>
      <header className="bg-white border-b border-green-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-green-900 leading-tight">Gartenplaner</h1>
              <p className="text-xs text-green-500">{format(new Date(), 'EEEE, d. MMMM', { locale: de })}</p>
            </div>
          </div>

          <div className="hidden sm:flex gap-4">
            <Stat label="Pflanzen" value={plants.length} color="text-green-600" />
            <Stat label="Heute fällig" value={openToday} color={openToday > 0 ? 'text-amber-600' : 'text-green-600'} />
            <Stat label="Offen" value={tasks.filter((t) => !t.completed).length} color="text-green-600" />
          </div>
        </div>

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
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-6">
        {activeTab === 'plants' && <PlantManager />}
        {activeTab === 'tasks' && <TaskList />}
        {activeTab === 'calendar' && <MonthlyCalendar />}
        {activeTab === 'settings' && <SettingsPanel />}
        {activeTab === 'database' && <DatabaseInspector />}
      </main>

      <WeatherWidget />
      <ChatWidget />
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
