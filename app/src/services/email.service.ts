// app/src/services/email.service.ts

import { AppError } from "../utils/apiResponse";

interface ActivationEmailData {
  to: string;
  name: string;
  token: string;
}

interface EmailChangeVerificationData {
  to: string;
  name: string;
  token: string;
}

interface PasswordResetEmailData {
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
    const activationUrl = `${baseUrl}/users/auth/verify-email?token=${encodeURIComponent(data.token)}`;

    await this.send({
      to: data.to,
      subject: "Activa tu cuenta de Multicine",
      consoleLabel: `✉ Activación HU-006 para ${data.to}`,
      html: `
        <p>Hola ${escapeHtml(data.name)},</p>
        <p>Tu registro en Multicine fue creado correctamente.</p>
        <p><a href="${activationUrl}">Activa tu cuenta aquí</a>.</p>
        <p>Este enlace es válido durante 24 horas y solo puede utilizarse una vez.</p>
      `,
      debugToken: data.token,
    });
  }

  /**
   * Envía el correo de recuperación de contraseña (HU-007).
   * El token es de un solo uso y expira en 30 minutos.
   */
  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
    const baseUrl = (process.env.APP_PUBLIC_URL || `http://localhost:${process.env.APP_PORT || 3000}`)
      .replace(/\/$/, "");
    const resetUrl = `${baseUrl}/users/auth/reset-password?token=${encodeURIComponent(data.token)}`;

    await this.send({
      to: data.to,
      subject: "Recupera tu contraseña de Multicine",
      consoleLabel: `✉ Recuperación HU-007 para ${data.to}`,
      html: `
        <p>Hola ${escapeHtml(data.name)},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p><a href="${resetUrl}">Restablece tu contraseña aquí</a>.</p>
        <p>Este enlace es válido durante 30 minutos y solo puede utilizarse una vez. Si no solicitaste este cambio, ignora este mensaje.</p>
      `,
      debugToken: data.token,
    });
  }

  /**
   * Envía un correo usando el modo configurado:
   * - "console": imprime en consola (solo desarrollo).
   * - "resend": API HTTP de Resend mediante fetch nativo.
   */
  private async send(options: {
    to: string;
    subject: string;
    consoleLabel: string;
    html: string;
    debugToken?: string;
  }): Promise<void> {
    const deliveryMode =
      process.env.EMAIL_DELIVERY_MODE ||
      (process.env.NODE_ENV === "production" ? "resend" : "console");

    if (deliveryMode === "console" && process.env.NODE_ENV !== "production") {
      console.log(`${options.consoleLabel}: ${options.subject}`)
      if (options.debugToken) {
        console.log(`token: ${options.debugToken}`);
      }
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
        to: [options.to],
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      throw new AppError(
        "No fue posible enviar el correo.",
        502,
        "EMAIL_SEND_FAILED"
      );
    }
  }

  /**
 * HU-008 RN-034: correo de confirmación cuando el usuario cambia su
 * dirección de correo desde su perfil. Reutiliza la misma
 * infraestructura de envío (Resend/consola) que sendActivationEmail.
 */
  async sendEmailChangeVerification(data: EmailChangeVerificationData): Promise<void> {
    const baseUrl = (process.env.APP_PUBLIC_URL || `http://localhost:${process.env.APP_PORT || 3000}`)
      .replace(/\/$/, "");
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${encodeURIComponent(data.token)}`;

    const deliveryMode =
      process.env.EMAIL_DELIVERY_MODE ||
      (process.env.NODE_ENV === "production" ? "resend" : "console");

    if (deliveryMode === "console" && process.env.NODE_ENV !== "production") {
      console.log(`verification token para ${data.to}: ${verificationUrl}`);
      return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      throw new AppError("El servicio de correo no está configurado.", 500, "EMAIL_NOT_CONFIGURED");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [data.to],
        subject: "Confirma tu nuevo correo en Multicine",
        html: `
          <p>Hola ${escapeHtml(data.name)},</p>
          <p>Solicitaste cambiar el correo asociado a tu cuenta de Multicine.</p>
          <p><a href="${verificationUrl}">Confirma tu nuevo correo aquí</a>.</p>
          <p>Este enlace es válido durante 24 horas y solo puede utilizarse una vez. Si no fuiste tú, ignora este mensaje.</p>
        `,
      }),
    });

    if (!response.ok) {
      throw new AppError("No fue posible enviar el correo de verificación.", 502, "EMAIL_SEND_FAILED");
    }
  }
}

export default new EmailService();
