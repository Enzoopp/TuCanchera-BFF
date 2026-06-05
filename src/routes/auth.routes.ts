import { Router } from 'express'
import { supabase } from '../config/supabase'

const router = Router()

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  console.log(`[BFF] POST /api/auth/login → email: ${email}`)

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return res.status(401).json({ error: error.message })

  console.log(`[BFF] Login OK → user: ${data.user?.id}`)
  res.json({ access_token: data.session?.access_token, user: data.user })
})

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, nombre, telefono } = req.body
  console.log(`[BFF] POST /api/auth/signup → email: ${email}`)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre, telefono, rol: 'cliente' } },
  })
  if (error) return res.status(400).json({ error: error.message })

  console.log(`[BFF] Signup OK → user: ${data.user?.id}`)
  res.json({ user: data.user })
})

export default router
