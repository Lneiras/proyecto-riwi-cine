// app/src/services/email.service.ts

import { AppError } from "../utils/apiResponse";

interface ActivationEmailData {
  to: string;
  name: string;
  token: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

class EmailService {
  /**
   * Envía el correo de activación sin agregar una librería de correo.
   * En producción usa la API HTTP de Resend mediante el fetch nativo de Node.
   */
  async sendActivationEmail(data: ActivationEmailData): Promise<void> {
    const baseUrl = (process.env.APP_PUBLIC_URL || `http://localhost:${process.env.APP_PORT || 3000}`)
      .replace(/\/$/, "");
    const activationUrl = `${baseUrl}/auth/verify-email?token=${encodeURIComponent(data.token)}`;

    const deliveryMode =
      process.env.EMAIL_DELIVERY_MODE ||
      (process.env.NODE_ENV === "production" ? "resend" : "console");

    if (deliveryMode === "console" && process.env.NODE_ENV !== "production") {
      console.log(`✉ Activación HU-006 para ${data.to}: ${activationUrl}`)
      console.log(`activation token: ${data.token}`);
      return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      throw new AppError(
        "El servicio de correo no está configurado.",
        500,
        "EMAIL_NOT_CONFIGURED"
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [data.to],
        subject: "Activa tu cuenta de Multicine",
        html: `
          <p>Hola ${escapeHtml(data.name)},</p>
          <p>Tu registro en Multicine fue creado correctamente.</p>
          <p><a href="${activationUrl}">Activa tu cuenta aquí</a>.</p>
          <p>Este enlace es válido durante 24 horas y solo puede utilizarse una vez.</p>
        `,
      }),
    });

    if (!response.ok) {
      throw new AppError(
        "No fue posible enviar el correo de activación.",
        502,
        "EMAIL_SEND_FAILED"
      );
    }
  }
}

export default new EmailService();
