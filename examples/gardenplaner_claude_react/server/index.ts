import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { authRouter } from './routes/auth.js'
import { plantsRouter } from './routes/plants.js'
import { tasksRouter } from './routes/tasks.js'
import { settingsRouter } from './routes/settings.js'
import { uiRouter } from './routes/ui.js'
import { requireAuth } from './middleware/requireAuth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = parseInt(process.env.PORT ?? '3001', 10)

if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
}

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRouter)
app.use('/api/plants', requireAuth, plantsRouter)
app.use('/api/tasks', requireAuth, tasksRouter)
app.use('/api/settings', requireAuth, settingsRouter)
app.use('/api/ui', requireAuth, uiRouter)

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`[server] läuft auf http://localhost:${PORT}`)
})
