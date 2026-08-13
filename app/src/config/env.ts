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
];

/**
 * Verifica que todas las variables de entorno obligatorias estén definidas.
 * Lanza un Error descriptivo indicando cuáles faltan.
 */
export function validateEnv(): void {
  const missing = requiredVars.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno obligatorias: ${missing.join(", ")}. ` +
        "Revisa tu archivo .env (ver .env.example)."
    );
  }
}
