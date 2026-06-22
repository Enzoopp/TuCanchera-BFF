// ============================================================
// AUTH.MIDDLEWARE.TS — El "portero" de las rutas privadas
// requireAuth es un middleware: se ejecuta ANTES de las rutas que
// necesitan usuario logueado (las reservas). Su trabajo:
//   1. Saca el token del header "Authorization: Bearer ..."
//   2. Le pregunta a Supabase si el token es válido y de quién es
//   3. Busca el perfil (profiles.id) de ese usuario
//   4. Si todo OK, deja pasar (next) y guarda los datos en el request
//   5. Si algo falla, lanza UnauthorizedError (401) y no deja pasar
//
// Es la pieza clave de seguridad del BFF.
// ============================================================

import { Request } from 'express'
import { User } from '@supabase/supabase-js'
import { supabase } from '../config/supabase'
import { asyncHandler } from './error.middleware'
import { UnauthorizedError } from '../errors/ApiError'

// Extendemos el Request de Express para poder colgarle datos del usuario
// autenticado, y que las rutas los puedan leer (req.profileId, req.token, etc.)
export interface AuthRequest extends Request {
  user: User
  token: string
  profileId: string  // profiles.id (distinto de auth.users.id)
}

export const requireAuth = asyncHandler(async (req, _res, next) => {
  // 1) Extraer el token del header (formato "Bearer <token>")
  const token = req.headers.authorization?.replace('Bearer ', '')
  console.log('[BFF] requireAuth → verificando JWT...')

  if (!token) throw new UnauthorizedError('Sin token de autenticación')

  // 2) Validar el token contra Supabase Auth
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) throw new UnauthorizedError('Token inválido o expirado')

  // 3) Buscar el profiles.id que corresponde al auth.users.id
  //    (en la BD el usuario de auth y su perfil tienen ids distintos)
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
