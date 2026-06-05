import { Request, Response, NextFunction } from 'express'
import { User } from '@supabase/supabase-js'
import { supabase } from '../config/supabase'

export interface AuthRequest extends Request {
  user: User
  token: string
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  console.log('[BFF] requireAuth → verificando JWT...')

  if (!token) {
    console.log('[BFF] requireAuth → sin token, rechazado')
    return res.status(401).json({ error: 'Sin token de autenticación' })
  }

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    console.log('[BFF] requireAuth → token inválido')
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }

  console.log(`[BFF] requireAuth → usuario verificado: ${data.user.id}`)
  ;(req as AuthRequest).user = data.user
  ;(req as AuthRequest).token = token
  next()
}
