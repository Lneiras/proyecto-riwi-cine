

import crypto from "crypto";

/**
 * Genera un código alfanumérico único legible, ej: "RIWI-8F3A1B2C".
 * Usa crypto.randomBytes (criptográficamente aleatorio, no Math.random)
 * para minimizar al máximo la probabilidad de colisión.
 */
export function generateMembershipCode(): string {
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase(); // 8 caracteres hex
    return `RIWI-${randomPart}`;
}