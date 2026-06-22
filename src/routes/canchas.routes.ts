// ============================================================
// CANCHAS.ROUTES.TS — Endpoint público de canchas
// Un solo endpoint, sin login:
//   - GET /api/canchas/:complejoId → lista las canchas de un complejo
// Primero valida que el complejo exista (si no, responde 404).
// ============================================================

import { Router } from 'express'
import { supabase } from '../config/supabase'
import { asyncHandler } from '../middleware/error.middleware'
import { InternalError, NotFoundError } from '../errors/ApiError'

const router = Router()

// GET /api/canchas/:complejoId — canchas activas de un complejo
router.get('/:complejoId', asyncHandler(async (req, res) => {
  const { complejoId } = req.params
  console.log(`[BFF] GET /api/canchas/${complejoId} → consultando Supabase`)

  // Validar que el complejo exista (404 si no)
  const { data: complejo } = await supabase
    .from('complejos')
    .select('id')
    .eq('id', complejoId)
    .maybeSingle()

  if (!complejo) throw new NotFoundError(`No existe el complejo ${complejoId}`)

  const { data, error } = await supabase
    .from('canchas')
    .select('*')
    .eq('complejo_id', complejoId)
    .eq('activa', true)
    .order('nombre')

  if (error) throw new InternalError(error.message)

  console.log(`[BFF] Canchas OK → ${data.length} resultados`)
  res.json(data)
}))

export default router
