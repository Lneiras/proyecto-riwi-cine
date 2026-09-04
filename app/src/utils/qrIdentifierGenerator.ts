

import crypto from "crypto";

/**
 * Genera el identificador que se codifica en el QR de membresía
 * (HU-008 Task 3). Independiente del `membershipCode` de HU-006:
 * ese identifica el registro de membresía para trazabilidad/soporte,
 * este es exclusivamente el valor visual del QR.
 */
export function generateQrIdentifier(): string {
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `QR-${randomPart}`;
}