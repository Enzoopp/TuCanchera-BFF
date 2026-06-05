import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import complejosRoutes from './routes/complejos.routes'
import canchasRoutes from './routes/canchas.routes'
import reservasRoutes from './routes/reservas.routes'

dotenv.config()

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Log de todas las requests que llegan al BFF
app.use((req, _res, next) => {
  console.log(`[BFF] ${req.method} ${req.path}`)
  next()
})

app.use('/api/auth', authRoutes)
app.use('/api/complejos', complejosRoutes)
app.use('/api/canchas', canchasRoutes)
app.use('/api/reservas', reservasRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'TuChanchera BFF' })
})

const PORT = process.env.PORT ?? 3001

app.listen(PORT, () => {
  console.log(`[BFF] Servidor corriendo en http://localhost:${PORT}`)
  console.log('[BFF] Endpoints disponibles:')
  console.log('  POST /api/auth/login')
  console.log('  POST /api/auth/signup')
  console.log('  GET  /api/complejos')
  console.log('  GET  /api/canchas/:complejoId')
  console.log('  GET  /api/reservas         (JWT)')
  console.log('  POST /api/reservas         (JWT)')
  console.log('  POST /api/reservas/:id/cancelar (JWT)')
})
