// ============================================================
// AUTH.ROUTES.TS — Endpoints de autenticación
// Agrupa los 2 endpoints públicos de login/registro:
//   - POST /api/auth/login  → valida credenciales y devuelve los tokens
//   - POST /api/auth/signup → crea una cuenta nueva
// El BFF no guarda usuarios: delega en Supabase Auth y le pasa los datos.
// ============================================================

import { Router } from 'express'
import { supabase } from '../config/supabase'
import { asyncHandler } from '../middleware/error.middleware'
import { ValidationError, UnauthorizedError } from '../errors/ApiError'

const router = Router()

// POST /api/auth/login — inicia sesión
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
