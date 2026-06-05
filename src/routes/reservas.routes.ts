import { Router } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth.middleware'
import { supabaseForUser } from '../config/supabase'

const router = Router()

// GET /api/reservas — mis reservas (requiere JWT)
router.get('/', requireAuth, async (req, res) => {
  const { user, token } = req as AuthRequest
  console.log(`[BFF] GET /api/reservas → usuario: ${user.id}`)

  const client = supabaseForUser(token)
  const { data, error } = await client
    .from('reservas')
    .select(`
      *,
      canchas (
        nombre,
        tipo,
        precio,
        complejos ( nombre, slug )
      )
    `)
    .eq('cliente_id', user.id)
    .order('fecha', { ascending: false })
    .order('hora_inicio', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  console.log(`[BFF] Reservas OK → ${data.length} reservas`)
  res.json(data)
})

// POST /api/reservas — crear reserva (requiere JWT)
router.post('/', requireAuth, async (req, res) => {
  const { user, token } = req as AuthRequest
  const { canchaId, fecha, horaInicio, horaFin, metodoPago, precio } = req.body
  console.log(`[BFF] POST /api/reservas → usuario: ${user.id}, cancha: ${canchaId}, fecha: ${fecha}`)

  const client = supabaseForUser(token)
  const { data, error } = await client
    .from('reservas')
    .insert({
      cancha_id: canchaId,
      cliente_id: user.id,
      fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      metodo_pago: metodoPago,
      estado: 'confirmada',
      precio,
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  console.log(`[BFF] Reserva creada OK → id: ${data.id}`)
  res.status(201).json(data)
})

// POST /api/reservas/:id/cancelar — cancelar reserva (requiere JWT)
router.post('/:id/cancelar', requireAuth, async (req, res) => {
  const { id } = req.params
  const { user, token } = req as AuthRequest
  console.log(`[BFF] POST /api/reservas/${id}/cancelar → usuario: ${user.id}`)

  const client = supabaseForUser(token)
  const { data, error } = await client.rpc('cancelar_reserva_cliente', {
    p_reserva_id: id,
  })

  if (error) return res.status(500).json({ error: error.message })

  console.log(`[BFF] Cancelar OK → resultado: ${JSON.stringify(data)}`)
  res.json(data)
})

export default router
