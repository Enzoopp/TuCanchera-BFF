// ============================================================
// CONFIG/SUPABASE.TS — Conexión a la base de datos
// El BFF se conecta a Supabase con estas credenciales (leídas del .env).
// Expone DOS formas de cliente:
//   - supabase: cliente "público" para consultas sin usuario (complejos, canchas, login)
//   - supabaseForUser(token): cliente "a nombre del usuario" para datos privados
//     (reservas), de modo que la seguridad de filas (RLS) de Supabase aplique.
// ============================================================

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()  // carga las variables del archivo .env en process.env

// Credenciales de Supabase. El "!" le dice a TypeScript "confía, existen"
// (vienen del .env; si faltan, la app no arranca).
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!

// Cliente público — para operaciones sin auth (complejos, canchas, auth)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Cliente con JWT del usuario — RLS aplica correctamente para reservas.
// Le pasamos el token del usuario en el header, así Supabase sabe "quién es"
// y solo le deja ver/tocar sus propios datos.
export function supabaseForUser(token: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  })
}
