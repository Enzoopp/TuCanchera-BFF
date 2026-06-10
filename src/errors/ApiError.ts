// Jerarquía de errores de la API.
//
// PATRÓN: Herencia + polimorfismo.
// - ApiError es la clase base abstracta: define el contrato (statusCode, toResponse).
// - Cada subclase representa un tipo de error HTTP concreto y define su statusCode.
// - El middleware de errores (error.middleware.ts) trabaja contra la clase base
//   sin conocer el tipo concreto: resuelve el status y el body polimórficamente.

export abstract class ApiError extends Error {
  /** Código HTTP que corresponde a este tipo de error. Cada subclase define el suyo. */
  abstract readonly statusCode: number

  constructor(message: string) {
    super(message)
    // name toma el nombre de la subclase concreta (ej: "NotFoundError")
    this.name = this.constructor.name
  }

  /** Body de la respuesta HTTP. Las subclases pueden sobrescribirlo (override). */
  toResponse(): Record<string, unknown> {
    return { error: this.message }
  }
}

/** 400 — el request del cliente es inválido (faltan campos, formato incorrecto, etc.) */
export class ValidationError extends ApiError {
  readonly statusCode = 400

  constructor(message: string, private readonly details?: string[]) {
    super(message)
  }

  // Override: agrega el detalle de los campos inválidos al body
  override toResponse(): Record<string, unknown> {
    return this.details ? { error: this.message, details: this.details } : super.toResponse()
  }
}

/** 401 — sin token, token inválido o credenciales incorrectas */
export class UnauthorizedError extends ApiError {
  readonly statusCode = 401
}

/** 404 — el recurso solicitado no existe */
export class NotFoundError extends ApiError {
  readonly statusCode = 404
}

/** 500 — error interno (ej: falla de Supabase) */
export class InternalError extends ApiError {
  readonly statusCode = 500
}
