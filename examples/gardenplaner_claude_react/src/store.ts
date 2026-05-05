import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addDays, addWeeks, addMonths, format } from 'date-fns'

export type TaskType = 'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'repotting' | 'other'

export interface RecurringRule {
  type: 'daily' | 'weekly' | 'monthly'
  interval: number
}

export interface Task {
  id: string
  plantId: string
  title: string
  taskType: TaskType
  dueDate: string // ISO date string YYYY-MM-DD
  completed: boolean
  notes?: string
  recurring?: RecurringRule
}

export interface Plant {
  id: string
  name: string
  emoji: string
  location: string
  notes?: string
}

export interface GardenStore {
  plants: Plant[]
  tasks: Task[]
  addPlant: (plant: Omit<Plant, 'id'>) => void
  removePlant: (id: string) => void
  updatePlant: (id: string, updates: Partial<Omit<Plant, 'id'>>) => void
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void
  removeTask: (id: string) => void
  toggleTask: (id: string) => void
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function nextDueDate(task: Task): string {
  if (!task.recurring) return task.dueDate
  const base = new Date(task.dueDate)
  const { type, interval } = task.recurring
  if (type === 'daily') return format(addDays(base, interval), 'yyyy-MM-dd')
  if (type === 'weekly') return format(addWeeks(base, interval), 'yyyy-MM-dd')
  return format(addMonths(base, interval), 'yyyy-MM-dd')
}

const SEED_PLANTS: Plant[] = [
  { id: 'p1', name: 'Tomaten', emoji: '🍅', location: 'Hochbeet Süd', notes: 'Sonne mind. 6h täglich' },
  { id: 'p2', name: 'Basilikum', emoji: '🌿', location: 'Fensterbrett', notes: 'Warm und windgeschützt' },
  { id: 'p3', name: 'Rosen', emoji: '🌹', location: 'Vorgarten', notes: 'Hoch- und Strauchrose' },
]

const today = format(new Date(), 'yyyy-MM-dd')

const SEED_TASKS: Task[] = [
  { id: 't1', plantId: 'p1', title: 'Tomaten gießen', taskType: 'watering', dueDate: today, completed: false, recurring: { type: 'daily', interval: 2 } },
  { id: 't2', plantId: 'p1', title: 'Tomaten düngen', taskType: 'fertilizing', dueDate: today, completed: false, recurring: { type: 'weekly', interval: 2 } },
  { id: 't3', plantId: 'p2', title: 'Basilikum gießen', taskType: 'watering', dueDate: today, completed: false, recurring: { type: 'daily', interval: 1 } },
  { id: 't4', plantId: 'p3', title: 'Rosen schneiden', taskType: 'pruning', dueDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'), completed: false },
  { id: 't5', plantId: 'p3', title: 'Rosen düngen', taskType: 'fertilizing', dueDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'), completed: false, recurring: { type: 'monthly', interval: 1 } },
]

export const useGardenStore = create<GardenStore>()(
  persist(
    (set) => ({
      plants: SEED_PLANTS,
      tasks: SEED_TASKS,

      addPlant: (plant) =>
        set((s) => ({ plants: [...s.plants, { ...plant, id: uid() }] })),

      removePlant: (id) =>
        set((s) => ({
          plants: s.plants.filter((p) => p.id !== id),
          tasks: s.tasks.filter((t) => t.plantId !== id),
        })),

      updatePlant: (id, updates) =>
        set((s) => ({
          plants: s.plants.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      addTask: (task) =>
        set((s) => ({ tasks: [...s.tasks, { ...task, id: uid(), completed: false }] })),

      removeTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.flatMap((t) => {
            if (t.id !== id) return [t]
            const toggled = { ...t, completed: !t.completed }
            if (!toggled.completed || !t.recurring) return [toggled]
            // spawn next occurrence when completing a recurring task
            const next: Task = { ...t, id: uid(), dueDate: nextDueDate(t), completed: false }
            return [toggled, next]
          }),
        })),

      updateTask: (id, updates) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
    }),
    { name: 'garden-planner-v1' }
  )
)
