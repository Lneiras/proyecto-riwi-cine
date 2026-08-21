// app/src/helpers/membership-code.ts

import crypto from "crypto";

/**
 * Genera un código no secuencial para la membresía digital.
 * La unicidad definitiva se valida en el repository antes de persistirlo.
 */
export function generateMembershipCode(): string {
  const datePart = new Date().getFullYear();
  const randomPart = crypto.randomBytes(5).toString("hex").toUpperCase();
  return `MC-${datePart}-${randomPart}`;
}
