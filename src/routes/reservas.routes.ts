import { Router } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth.middleware'
import { supabaseForUser } from '../config/supabase'
import { asyncHandler } from '../middleware/error.middleware'
import { InternalError, ValidationError } from '../errors/ApiError'

const router = Router()

// GET /api/reservas — mis reservas (requiere JWT)
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { profileId, token } = req as AuthRequest
  console.log(`[BFF] GET /api/reservas → perfil: ${profileId}`)

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
    .eq('cliente_id', profileId)
    .order('fecha', { ascending: false })
    .order('hora_inicio', { ascending: false })

  if (error) throw new InternalError(error.message)

  console.log(`[BFF] Reservas OK → ${data.length} reservas`)
  res.json(data)
}))

// POST /api/reservas — crear reserva (requiere JWT)
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { profileId, token } = req as AuthRequest
  const { canchaId, fecha, horaInicio, horaFin, metodoPago, precio } = req.body

  if (!canchaId || !fecha || !horaInicio || !horaFin) {
    throw new ValidationError('Faltan campos obligatorios', ['canchaId', 'fecha', 'horaInicio', 'horaFin'])
  }
  console.log(`[BFF] POST /api/reservas → perfil: ${profileId}, cancha: ${canchaId}, fecha: ${fecha}`)

  const client = supabaseForUser(token)
  const { data, error } = await client
    .from('reservas')
    .insert({
      cancha_id:   canchaId,
      cliente_id:  profileId,
      fecha,
      hora_inicio: horaInicio,
      hora_fin:    horaFin,
      metodo_pago: metodoPago,
      estado:      'confirmada',
      precio,
    })
    .select()
    .single()

  if (error) throw new InternalError(error.message)

  console.log(`[BFF] Reserva creada OK → id: ${data.id}`)
  res.status(201).json(data)
}))

// POST /api/reservas/:id/cancelar — cancelar reserva (requiere JWT)
router.post('/:id/cancelar', requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params
  const { profileId, token } = req as AuthRequest
  console.log(`[BFF] POST /api/reservas/${id}/cancelar → perfil: ${profileId}`)

  const client = supabaseForUser(token)
  const { data, error } = await client.rpc('cancelar_reserva_cliente', {
    p_reserva_id: id,
  })

  if (error) throw new InternalError(error.message)

  console.log(`[BFF] Cancelar OK → ${JSON.stringify(data)}`)
  res.json(data)
}))

export default router
