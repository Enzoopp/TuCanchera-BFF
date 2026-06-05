# TuChanchera BFF

Backend For Frontend de TuChanchera. Actúa como capa intermedia entre el front (React) y Supabase (PostgreSQL + Auth).

## Arquitectura

```
Front (React :5173) → BFF (Express :3001) → Supabase (PostgreSQL + Auth)
```

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/login` | ❌ | Login con email y password |
| POST | `/api/auth/signup` | ❌ | Registro de nuevo cliente |
| GET | `/api/complejos` | ❌ | Lista todos los complejos activos |
| GET | `/api/canchas/:complejoId` | ❌ | Lista las canchas de un complejo |
| GET | `/api/reservas` | ✅ JWT | Reservas del usuario autenticado |
| POST | `/api/reservas` | ✅ JWT | Crear una nueva reserva |
| POST | `/api/reservas/:id/cancelar` | ✅ JWT | Cancelar una reserva |

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` basado en `.env.example`:

```env
PORT=3001
SUPABASE_URL=https://<tu-proyecto>.supabase.co
SUPABASE_ANON_KEY=<tu-anon-key>
CORS_ORIGIN=http://localhost:5173
```

## Correr en desarrollo

```bash
npm run dev
```

El servidor arranca en `http://localhost:3001`.

## Patrones utilizados

- **Service Layer** — cada ruta tiene una responsabilidad única
- **Middleware de autenticación** — `requireAuth` verifica el JWT y resuelve el `profiles.id` antes de llegar a la ruta
- **Dependency Inversion** — las rutas dependen de abstracciones (`supabaseForUser`) y no de implementaciones directas
