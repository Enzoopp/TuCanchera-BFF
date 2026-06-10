import { Router } from 'express'
import { supabase } from '../config/supabase'
import { asyncHandler } from '../middleware/error.middleware'
import { ValidationError, UnauthorizedError } from '../errors/ApiError'

const router = Router()

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    throw new ValidationError('Faltan campos obligatorios', ['email', 'password'])
  }
  console.log(`[BFF] POST /api/auth/login → email: ${email}`)

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new UnauthorizedError(error.message)

  console.log(`[BFF] Login OK → user: ${data.user?.id}`)
  // refresh_token es necesario para que el front restaure la sesión
  // con supabase.auth.setSession()
  res.json({
    access_token: data.session?.access_token,
    refresh_token: data.session?.refresh_token,
    user: data.user,
  })
}))

// POST /api/auth/signup
router.post('/signup', asyncHandler(async (req, res) => {
  const { email, password, nombre, telefono, rol, emailRedirectTo } = req.body
  if (!email || !password) {
    throw new ValidationError('Faltan campos obligatorios', ['email', 'password'])
  }
  console.log(`[BFF] POST /api/auth/signup → email: ${email}`)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // rol viene del front (cliente o admin); por defecto cliente
      data: { nombre, telefono, rol: rol ?? 'cliente' },
      ...(emailRedirectTo ? { emailRedirectTo } : {}),
    },
  })
  if (error) throw new ValidationError(error.message)

  console.log(`[BFF] Signup OK → user: ${data.user?.id}`)
  res.json({ user: data.user })
}))

export default router
