import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!

// Cliente público — para operaciones sin auth (complejos, canchas, auth)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Cliente con JWT del usuario — RLS aplica correctamente para reservas
export function supabaseForUser(token: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  })
}
