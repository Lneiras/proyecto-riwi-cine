// app/src/config/env.ts

/**
 * Validación de Variables de Entorno
 * ----------------------------------
 * HU-001, Escenario 2: si falta una variable obligatoria, la API debe
 * fallar al iniciar con un mensaje claro indicando cuál falta.
 *
 * Se invoca en `src/index.ts` antes de levantar el servidor.
 */

const requiredVars = [
  "POSTGRES_DB",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "NODE_ENV",
  "JWT_SECRET",
  "REDIS_URL",
  "SEAT_LOCK_TTL_SECONDS",
  "SEAT_LOCK_SWEEP_MS",
  "MAX_SEATS_PER_LOCK",
  "SOCKET_PORT",
  "PREFERENTIAL_SEAT_POLICY",
];

/**
 * Verifica que todas las variables de entorno obligatorias estén definidas.
 * Lanza un Error descriptivo indicando cuáles faltan.
 */
export function validateEnv(): void {
  const missing = requiredVars.filter(
    (name) => !process.env[name]
  );

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno obligatorias: ${missing.join(
        ", "
      )}. Revisa tu archivo .env.`
    );
  }
}

export function validateSeatConfig(): void {
  const ttl = Number(
    process.env.SEAT_LOCK_TTL_SECONDS
  );

  const sweep = Number(
    process.env.SEAT_LOCK_SWEEP_MS
  );

  const maxSeats = Number(
    process.env.MAX_SEATS_PER_LOCK
  );

  const socketPort = Number(
    process.env.SOCKET_PORT
  );

  const preferentialPolicy =
    process.env.PREFERENTIAL_SEAT_POLICY;

  if (!Number.isInteger(ttl) || ttl <= 0) {
    throw new Error(
      "SEAT_LOCK_TTL_SECONDS debe ser un entero mayor que 0"
    );
  }

  if (!Number.isInteger(sweep) || sweep <= 0) {
    throw new Error(
      "SEAT_LOCK_SWEEP_MS debe ser un entero mayor que 0"
    );
  }

  if (
    !Number.isInteger(maxSeats) ||
    maxSeats <= 0
  ) {
    throw new Error(
      "MAX_SEATS_PER_LOCK debe ser un entero mayor que 0"
    );
  }

  if (
    !Number.isInteger(socketPort) ||
    socketPort <= 0
  ) {
    throw new Error(
      "SOCKET_PORT debe ser un puerto válido"
    );
  }

  if (
    preferentialPolicy !== "allow" &&
    preferentialPolicy !== "deny"
  ) {
    throw new Error(
      "PREFERENTIAL_SEAT_POLICY debe ser 'allow' o 'deny'"
    );
  }
}

export function validateCartConfig(): void {
  const ttl = Number(
    process.env.CART_TTL_SECONDS || 600
  );

  const tax = Number(
    process.env.CART_TAX_PERCENT || 19
  );

  if (
    !Number.isInteger(ttl) ||
    ttl <= 0
  ) {
    throw new Error(
      "CART_TTL_SECONDS debe ser un entero mayor que 0"
    );
  }

  if (
    !Number.isFinite(tax) ||
    tax < 0 ||
    tax > 100
  ) {
    throw new Error(
      "CART_TAX_PERCENT debe estar entre 0 y 100"
    );
  }
}
