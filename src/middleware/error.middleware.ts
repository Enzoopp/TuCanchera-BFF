import { Request, Response, NextFunction, RequestHandler } from 'express'
import { ApiError } from '../errors/ApiError'

// Middleware centralizado de manejo de errores.
// Se registra al final de la cadena en index.ts: cualquier error lanzado
// (o pasado a next()) en una ruta termina acá.
//
// POLIMORFISMO: trabajamos contra la clase base ApiError sin saber el tipo
// concreto. err.statusCode y err.toResponse() se resuelven en runtime según
// la subclase (UnauthorizedError → 401, NotFoundError → 404, etc.).
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    console.log(`[BFF] ${err.name} (${err.statusCode}) en ${req.method} ${req.path}: ${err.message}`)
    return res.status(err.statusCode).json(err.toResponse())
  }

  // Error no tipado: no exponemos detalles internos al cliente
  console.error(`[BFF] Error no controlado en ${req.method} ${req.path}:`, err)
  res.status(500).json({ error: 'Error interno del servidor' })
}

// Express 4 no propaga automáticamente los errores de handlers async.
// Este wrapper captura la promesa rechazada y la deriva al errorHandler,
// lo que nos permite eliminar los try/catch repetidos en cada ruta.
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
