import { Router } from 'express'
import { supabase } from '../config/supabase'
import { asyncHandler } from '../middleware/error.middleware'
import { InternalError } from '../errors/ApiError'

const router = Router()

// GET /api/complejos
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
