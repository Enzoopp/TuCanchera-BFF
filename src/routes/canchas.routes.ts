import { Router } from 'express'
import { supabase } from '../config/supabase'

const router = Router()

// GET /api/canchas/:complejoId
router.get('/:complejoId', async (req, res) => {
  try {
    const { complejoId } = req.params
    console.log(`[BFF] GET /api/canchas/${complejoId} → consultando Supabase`)

    const { data, error } = await supabase
      .from('canchas')
      .select('*')
      .eq('complejo_id', complejoId)
      .eq('activa', true)
      .order('nombre')

    if (error) return res.status(500).json({ error: error.message })

    console.log(`[BFF] Canchas OK → ${data.length} resultados`)
    res.json(data)
  } catch (err) {
    console.error('[BFF] Error inesperado en /canchas:', err)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router
