import { Router } from 'express'
import { supabase } from '../config/supabase'

const router = Router()

// GET /api/complejos
router.get('/', async (_req, res) => {
  try {
    console.log('[BFF] GET /api/complejos → consultando Supabase')

    const { data, error } = await supabase
      .from('complejos')
      .select('*')
      .eq('activo', true)
      .order('creado_en', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })

    console.log(`[BFF] Complejos OK → ${data.length} resultados`)
    res.json(data)
  } catch (err) {
    console.error('[BFF] Error inesperado en /complejos:', err)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router
