import { create } from 'zustand'
import { addDays, addWeeks, addMonths, format } from 'date-fns'
import { db, ensureUiSeedData } from './db'
import { liveQuery } from 'dexie'

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
  createdAt?: string
  updatedAt?: string
}

export interface Plant {
  id: string
  name: string
  emoji: string
  location: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface GardenStore {
  plants: Plant[]
  tasks: Task[]
  initialized: boolean
  addPlant: (plant: Omit<Plant, 'id'>) => Promise<void>
  removePlant: (id: string) => Promise<void>
  updatePlant: (id: string, updates: Partial<Omit<Plant, 'id'>>) => Promise<void>
  addTask: (task: Omit<Task, 'id' | 'completed'>) => Promise<void>
  removeTask: (id: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => Promise<void>
  init: () => Promise<void>
}

function uid() { return Math.random().toString(36).slice(2, 10) }
function now() { return new Date().toISOString() }

function nextDueDate(task: Task): string {
  if (!task.recurring) return task.dueDate
  const base = new Date(task.dueDate)
  const { type, interval } = task.recurring
  if (type === 'daily') return format(addDays(base, interval), 'yyyy-MM-dd')
  if (type === 'weekly') return format(addWeeks(base, interval), 'yyyy-MM-dd')
  return format(addMonths(base, interval), 'yyyy-MM-dd')
}

const today = format(new Date(), 'yyyy-MM-dd')
const SEED_PLANTS: Plant[] = [
  { id: 'p1', name: 'Tomaten', emoji: '🍅', location: 'Hochbeet Süd', notes: 'Sonne mind. 6h täglich' },
  { id: 'p2', name: 'Basilikum', emoji: '🌿', location: 'Fensterbrett', notes: 'Warm und windgeschützt' },
  { id: 'p3', name: 'Rosen', emoji: '🌹', location: 'Vorgarten', notes: 'Hoch- und Strauchrose' },
]
const SEED_TASKS: Task[] = [
  { id: 't1', plantId: 'p1', title: 'Tomaten gießen', taskType: 'watering', dueDate: today, completed: false, recurring: { type: 'daily', interval: 2 } },
  { id: 't2', plantId: 'p1', title: 'Tomaten düngen', taskType: 'fertilizing', dueDate: today, completed: false, recurring: { type: 'weekly', interval: 2 } },
  { id: 't3', plantId: 'p2', title: 'Basilikum gießen', taskType: 'watering', dueDate: today, completed: false, recurring: { type: 'daily', interval: 1 } },
]


let dbSyncUnsubscribe: (() => void) | null = null

function ensureDbSync(set: (partial: Partial<GardenStore> | ((state: GardenStore) => Partial<GardenStore>)) => void) {
  if (dbSyncUnsubscribe) return

  const subscription = liveQuery(async () => {
    const [plants, tasks] = await Promise.all([db.plants.toArray(), db.tasks.toArray()])
    return { plants, tasks }
  }).subscribe({
    next: ({ plants, tasks }: { plants: Plant[]; tasks: Task[] }) => {
      set({ plants, tasks, initialized: true })
    },
    error: (error: unknown) => {
      console.error('Live DB sync failed', error)
    },
  })

  dbSyncUnsubscribe = () => subscription.unsubscribe()
}

function withTimestamps<T extends { createdAt?: string; updatedAt?: string }>(entity: T): T {
  const ts = now()
  return { ...entity, createdAt: entity.createdAt ?? ts, updatedAt: ts }
}

export const useGardenStore = create<GardenStore>((set, get) => ({
  plants: [],
  tasks: [],
  initialized: false,

  init: async () => {
    ensureDbSync(set)
    const plants = await db.plants.toArray()
    const tasks = await db.tasks.toArray()
    if (plants.length === 0 && tasks.length === 0) {
      const seededPlants = SEED_PLANTS.map(withTimestamps)
      const seededTasks = SEED_TASKS.map(withTimestamps)
      await db.plants.bulkAdd(seededPlants)
      await db.tasks.bulkAdd(seededTasks)
      set({ plants: seededPlants, tasks: seededTasks, initialized: true })
    } else {
      set({ plants, tasks, initialized: true })
    }
    await ensureUiSeedData()
  },

  addPlant: async (plant) => {
    const created = withTimestamps({ ...plant, id: uid() })
    await db.plants.add(created)
    set((s) => ({ plants: [...s.plants, created] }))
  },

  removePlant: async (id) => {
    await db.transaction('rw', db.plants, db.tasks, async () => {
      await db.plants.delete(id)
      const taskIds = (await db.tasks.where('plantId').equals(id).toArray()).map((t) => t.id)
      await db.tasks.bulkDelete(taskIds)
    })
    set((s) => ({ plants: s.plants.filter((p) => p.id !== id), tasks: s.tasks.filter((t) => t.plantId !== id) }))
  },

  updatePlant: async (id, updates) => {
    const updated = { ...updates, updatedAt: now() }
    await db.plants.update(id, updated)
    set((s) => ({ plants: s.plants.map((p) => (p.id === id ? { ...p, ...updated } : p)) }))
  },

  addTask: async (task) => {
    const created = withTimestamps({ ...task, id: uid(), completed: false })
    await db.tasks.add(created)
    set((s) => ({ tasks: [...s.tasks, created] }))
  },

  removeTask: async (id) => {
    await db.tasks.delete(id)
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
  },

  toggleTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return
    const toggled = { ...task, completed: !task.completed, updatedAt: now() }
    const next = toggled.completed && task.recurring
      ? withTimestamps({ ...task, id: uid(), dueDate: nextDueDate(task), completed: false })
      : null

    await db.transaction('rw', db.tasks, async () => {
      await db.tasks.put(toggled)
      if (next) await db.tasks.add(next)
    })

    set((s) => ({ tasks: s.tasks.flatMap((t) => t.id === id ? (next ? [toggled, next] : [toggled]) : [t]) }))
  },

  updateTask: async (id, updates) => {
    const updated = { ...updates, updatedAt: now() }
    await db.tasks.update(id, updated)
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updated } : t)) }))
  },
}))
