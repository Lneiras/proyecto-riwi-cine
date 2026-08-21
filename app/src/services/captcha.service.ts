// app/src/services/captcha.service.ts

import { AppError } from "../utils/apiResponse";

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
}

class CaptchaService {
  /**
   * Valida el token de Cloudflare Turnstile desde el backend.
   * El bypass solo existe para desarrollo y nunca se acepta en producción.
   */
  async validate(token: string, remoteIp?: string): Promise<void> {
    if (process.env.NODE_ENV !== "production" && process.env.CAPTCHA_BYPASS === "true") {
      return;
    }

    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      throw new AppError(
        "TURNSTILE_SECRET_KEY no está configurado.",
        500,
        "CAPTCHA_NOT_CONFIGURED"
      );
    }

    if (!token) {
      throw new AppError("El CAPTCHA es requerido.", 400, "CAPTCHA_REQUIRED");
    }

    const verifyUrl =
      process.env.TURNSTILE_VERIFY_URL ||
      "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          response: token,
          ...(remoteIp ? { remoteip: remoteIp } : {}),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new AppError(
          "No fue posible validar el CAPTCHA.",
          503,
          "CAPTCHA_SERVICE_UNAVAILABLE"
        );
      }

      const result = (await response.json()) as TurnstileResponse;
      if (!result.success) {
        throw new AppError("CAPTCHA inválido o expirado.", 400, "CAPTCHA_INVALID");
      }
    } catch (error) {
      if (error instanceof AppError) throw error;

      throw new AppError(
        "No fue posible validar el CAPTCHA.",
        503,
        "CAPTCHA_SERVICE_UNAVAILABLE"
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

export default new CaptchaService();
