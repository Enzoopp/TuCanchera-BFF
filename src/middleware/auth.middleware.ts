import { Request } from 'express'
import { User } from '@supabase/supabase-js'
import { supabase } from '../config/supabase'
import { asyncHandler } from './error.middleware'
import { UnauthorizedError } from '../errors/ApiError'

export interface AuthRequest extends Request {
  user: User
  token: string
  profileId: string  // profiles.id (distinto de auth.users.id)
}

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  console.log('[BFF] requireAuth → verificando JWT...')

  if (!token) throw new UnauthorizedError('Sin token de autenticación')

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) throw new UnauthorizedError('Token inválido o expirado')

  // Buscar el profiles.id que corresponde al auth.users.id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', data.user.id)
    .single()

  if (profileError || !profile) throw new UnauthorizedError('Perfil no encontrado')

  console.log(`[BFF] requireAuth → usuario: ${data.user.id} | perfil: ${profile.id}`)
  ;(req as AuthRequest).user = data.user
  ;(req as AuthRequest).token = token
  ;(req as AuthRequest).profileId = profile.id
  next()
})
