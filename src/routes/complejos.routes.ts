// ============================================================
// COMPLEJOS.ROUTES.TS — Endpoint público de complejos
// Un solo endpoint, sin login:
//   - GET /api/complejos → lista los complejos activos
// Lo usa la landing del front para mostrar las opciones disponibles.
// ============================================================

import { Router } from 'express'
import { supabase } from '../config/supabase'
import { asyncHandler } from '../middleware/error.middleware'
import { InternalError } from '../errors/ApiError'

const router = Router()

// GET /api/complejos — solo los activos, del más nuevo al más viejo
router.get('/', asyncHandler(async (_req, res) => {
  console.log('[BFF] GET /api/complejos → consultando Supabase')

  const { data, error } = await supabase
    .from('complejos')
    .select('*')
    .eq('activo', true)
    .order('creado_en', { ascending: false })

  if (error) throw new InternalError(error.message)

  console.log(`[BFF] Complejos OK → ${data.length} resultados`)
  res.json(data)
}))

export default router
