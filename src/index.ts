// ============================================================
// INDEX.TS — Punto de entrada del BFF
// Acá se arma el servidor Express y se "enchufan" todas las piezas:
//   1. CORS: permite que el front (localhost:5173) le pegue al BFF
//   2. express.json(): entiende los body en formato JSON
//   3. Un log que imprime cada request que llega (útil para la demo)
//   4. Se registran las rutas agrupadas por entidad (/api/auth, etc.)
//   5. errorHandler al final: centraliza el manejo de errores
//   6. Se levanta el servidor en el puerto 3001
//
// Es lo primero que corre cuando hacés `npm run dev`.
// ============================================================

import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import complejosRoutes from './routes/complejos.routes'
import canchasRoutes from './routes/canchas.routes'
import reservasRoutes from './routes/reservas.routes'
import { errorHandler } from './middleware/error.middleware'

const app = express()

const allowedOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173'
app.use(cors({ origin: allowedOrigin }))
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

// Middleware de errores: SIEMPRE al final de la cadena.
// Cualquier ApiError lanzado en las rutas se resuelve acá (ver error.middleware.ts)
app.use(errorHandler)

const PORT = process.env.PORT ?? 3001

app.listen(PORT, () => {
  console.log(`[BFF] Servidor corriendo en http://localhost:${PORT}`)
  console.log(`[BFF] CORS habilitado para: ${allowedOrigin}`)
  console.log('[BFF] Endpoints disponibles:')
  console.log('  POST /api/auth/login')
  console.log('  POST /api/auth/signup')
  console.log('  GET  /api/complejos')
  console.log('  GET  /api/canchas/:complejoId')
  console.log('  GET  /api/reservas         (JWT)')
  console.log('  POST /api/reservas         (JWT)')
  console.log('  POST /api/reservas/:id/cancelar (JWT)')
})
