import { create } from 'zustand'
import { addDays, addWeeks, addMonths, format } from 'date-fns'
import { api } from './api/client'

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
  dueDate: string
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

// keep for local date calculations only
export function nextDueDate(task: Task): string {
  if (!task.recurring) return task.dueDate
  const base = new Date(task.dueDate)
  const { type, interval } = task.recurring
  if (type === 'daily') return format(addDays(base, interval), 'yyyy-MM-dd')
  if (type === 'weekly') return format(addWeeks(base, interval), 'yyyy-MM-dd')
  return format(addMonths(base, interval), 'yyyy-MM-dd')
}

interface ApiPlant {
  id: string; user_id: string; name: string; emoji: string; location: string; notes?: string
  created_at?: string; updated_at?: string
}
interface ApiTask {
  id: string; user_id: string; plant_id: string; title: string; task_type: string
  due_date: string; completed: boolean; notes?: string; recurring?: RecurringRule
  created_at?: string; updated_at?: string
}

function toPlant(r: ApiPlant): Plant {
  return { id: r.id, name: r.name, emoji: r.emoji, location: r.location, notes: r.notes, createdAt: r.created_at, updatedAt: r.updated_at }
}
function toTask(r: ApiTask): Task {
  return { id: r.id, plantId: r.plant_id, title: r.title, taskType: r.task_type as TaskType, dueDate: r.due_date, completed: r.completed, notes: r.notes, recurring: r.recurring, createdAt: r.created_at, updatedAt: r.updated_at }
}

export const useGardenStore = create<GardenStore>((set, get) => ({
  plants: [],
  tasks: [],
  initialized: false,

  init: async () => {
    const [plants, tasks] = await Promise.all([
      api.get<ApiPlant[]>('/api/plants'),
      api.get<ApiTask[]>('/api/tasks'),
    ])
    set({ plants: plants.map(toPlant), tasks: tasks.map(toTask), initialized: true })
  },

  addPlant: async (plant) => {
    const created = await api.post<ApiPlant>('/api/plants', plant)
    set(s => ({ plants: [...s.plants, toPlant(created)] }))
  },

  removePlant: async (id) => {
    await api.del(`/api/plants/${id}`)
    set(s => ({
      plants: s.plants.filter(p => p.id !== id),
      tasks: s.tasks.filter(t => t.plantId !== id),
    }))
  },

  updatePlant: async (id, updates) => {
    const updated = await api.put<ApiPlant>(`/api/plants/${id}`, updates)
    set(s => ({ plants: s.plants.map(p => p.id === id ? toPlant(updated) : p) }))
  },

  addTask: async (task) => {
    const payload = { plantId: task.plantId, title: task.title, taskType: task.taskType, dueDate: task.dueDate, notes: task.notes, recurring: task.recurring }
    const created = await api.post<ApiTask>('/api/tasks', payload)
    set(s => ({ tasks: [...s.tasks, toTask(created)] }))
  },

  removeTask: async (id) => {
    await api.del(`/api/tasks/${id}`)
    set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }))
  },

  toggleTask: async (id) => {
    const result = await api.post<{ toggled: ApiTask; next?: ApiTask }>(`/api/tasks/${id}/toggle`, {})
    const toggled = toTask(result.toggled)
    const next = result.next ? toTask(result.next) : null
    set(s => ({
      tasks: s.tasks.flatMap(t => t.id === id ? (next ? [toggled, next] : [toggled]) : [t])
    }))
  },

  updateTask: async (id, updates) => {
    const payload = {
      title: updates.title,
      taskType: updates.taskType,
      dueDate: updates.dueDate,
      notes: updates.notes,
      recurring: updates.recurring,
    }
    const updated = await api.put<ApiTask>(`/api/tasks/${id}`, payload)
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? toTask(updated) : t) }))
  },

  // allow external reset when user logs out
  _reset: () => set({ plants: [], tasks: [], initialized: false }),
}))
