// app/src/utils/jwt.ts

/**
 * Utilidades JWT
 * --------------
 * Firma y verificación de tokens de acceso y de refresco.
 * Las claves y expiraciones se leen de variables de entorno.
 */

import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

export interface AccessTokenPayload {
  sub: number;
  roleId: number;
}

export interface RefreshTokenPayload {
  sub: number;
  jti: string;
}

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET no está configurado en las variables de entorno");
  }
  return secret;
};

/**
 * Firma un token de acceso (corto plazo).
 */
export function signAccessToken(userId: number, roleId: number): string {
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ||
    "15m") as jwt.SignOptions["expiresIn"];
  return jwt.sign({ sub: userId, roleId } as AccessTokenPayload, getSecret(), {
    expiresIn,
  });
}

/**
 * Firma un token de refresco (largo plazo).
 *
 * Se incluye un `jti` (JWT ID) único para garantizar que dos tokens del
 * mismo usuario emitidos en el mismo segundo no sean idénticos, evitando
 * colisiones con la columna `unique` de la tabla `refreshTokens`.
 */
export function signRefreshToken(userId: number): string {
  const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ||
    "7d") as jwt.SignOptions["expiresIn"];
  return jwt.sign({ sub: userId, jti: randomUUID() } as RefreshTokenPayload, getSecret(), {
    expiresIn,
  });
}

/**
 * Verifica y decodifica un token JWT.
 * Lanza un error si el token es inválido o expiró.
 */
export function verifyToken(token: string): AccessTokenPayload | RefreshTokenPayload {
  return jwt.verify(token, getSecret()) as unknown as
    | AccessTokenPayload
    | RefreshTokenPayload;
}
