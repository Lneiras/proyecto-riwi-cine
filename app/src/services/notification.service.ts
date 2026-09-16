// app/src/services/notification.service.ts

/**
 * Servicio de Notificaciones (HU-015)
 * -----------------------------------
 * Orquesta el envío de correos transaccionales y de marketing:
 * - Valida y respeta las preferencias del usuario (Escenario 3).
 * - Renderiza plantillas HTML corporativas (Task 4).
 * - Aplica política de reintentos con backoff (hasta 3 intentos) (Escenario 2).
 * - Registra cada evento en el historial de notificaciones (Escenario 1).
 * - Soporta reenvío de notificaciones (Task 1).
 */

import emailService from "./email.service";
import notificationHistoryRepository from "../repositories/notification-history.repository";
import notificationPreferenceRepository from "../repositories/notification-preference.repository";
import UserRepository from "../repositories/user.repository";
import { SendEmailNotificationDto } from "../dto/send-email-notification.dto";
import { UpdateNotificationPreferencesDto } from "../dto/update-notification-preferences.dto";
import NotificationHistory, {
  NotificationStatus,
  NotificationType,
} from "../models/notification-history.model";
import NotificationPreference from "../models/notification-preference.model";
import { AppError } from "../utils/apiResponse";
import {
  renderAccountEmail,
  renderPurchaseEmail,
  renderReservationEmail,
  renderMarketingEmail,
} from "../templates/email-templates";

export interface SendEmailResult {
  notificationId: number;
  recipient: string;
  type: string;
  status: NotificationStatus;
  attempts: number;
  sentAt: Date | null;
  errorMessage: string | null;
  skippedDueToPreferences?: boolean;
}

export class NotificationService {
  private readonly maxRetries = 3;

  /**
   * Calcula el tiempo de backoff entre reintentos.
   * En entorno de test usa delays mínimos (10ms) para no demorar los tests.
   */
  private getBackoffMs(attempt: number): number {
    if (process.env.NODE_ENV === "test") return 10;
    // Intento 1: 500ms, Intento 2: 1500ms, Intento 3: 3000ms
    return Math.min(500 * Math.pow(2, attempt - 1), 5000);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Renderiza el contenido HTML según el tipo de notificación y sus datos.
   */
  public renderHtml(
    type: NotificationType,
    data?: Record<string, unknown>,
    customHtml?: string
  ): string {
    if (customHtml) return customHtml;

    const payload = data || {};
    switch (type) {
      case "purchase":
        return renderPurchaseEmail({
          userName: payload.userName as string,
          orderNumber: (payload.orderNumber as string) || `ORD-${Date.now()}`,
          movieTitle: payload.movieTitle as string,
          cinemaName: payload.cinemaName as string,
          showtime: payload.showtime as string,
          items: payload.items as any,
          totalAmount: Number(payload.totalAmount || 0),
          paymentMethod: payload.paymentMethod as string,
          qrCodeUrl: payload.qrCodeUrl as string,
        });

      case "reservation":
        return renderReservationEmail({
          userName: payload.userName as string,
          reservationCode:
            (payload.reservationCode as string) || `RES-${Date.now()}`,
          movieTitle: (payload.movieTitle as string) || "Función Multicine",
          cinemaName: (payload.cinemaName as string) || "Complejo Multicine",
          roomName: (payload.roomName as string) || "Sala Principal",
          showtime:
            (payload.showtime as string) || new Date().toLocaleString("es-CO"),
          seats: (payload.seats as string[]) || ["General"],
          qrCodeUrl: payload.qrCodeUrl as string,
          expiresAt: payload.expiresAt as string,
        });

      case "marketing":
        return renderMarketingEmail({
          userName: payload.userName as string,
          campaignTitle:
            (payload.campaignTitle as string) ||
            "Novedades y Estrenos Multicine",
          campaignBody:
            (payload.campaignBody as string) ||
            "¡No te pierdas los increíbles estrenos y beneficios exclusivos que tenemos para ti!",
          movies: payload.movies as any,
          promoCode: payload.promoCode as string,
          discountText: payload.discountText as string,
          ctaText: (payload.ctaText as string) || "Ver Cartelera",
          ctaUrl:
            (payload.ctaUrl as string) || "https://multicine.com/cartelera",
        });

      case "account":
      default:
        return renderAccountEmail({
          userName: payload.userName as string,
          actionTitle:
            (payload.actionTitle as string) || "Notificación de tu Cuenta",
          actionMessage:
            (payload.actionMessage as string) ||
            "Hemos registrado actividad reciente en tu cuenta de Multicine.",
          buttonText: payload.buttonText as string,
          buttonUrl: payload.buttonUrl as string,
          extraDetails: payload.extraDetails as Record<string, string>,
        });
    }
  }

  /**
   * Envía una notificación por correo electrónico.
   * - Si es de marketing y el usuario tiene commercialEnabled=false, no se envía (Escenario 3).
   * - Realiza hasta 3 reintentos con backoff en caso de fallo (Escenario 2).
   * - Guarda el resultado en el historial de notificaciones (Escenario 1).
   */
  async sendEmail(
    dto: SendEmailNotificationDto,
    options?: { sync?: boolean }
  ): Promise<SendEmailResult> {
    let targetUserId = dto.userId;

    // Si no se proporcionó userId, buscamos si el correo pertenece a un usuario registrado
    if (!targetUserId) {
      const existingUser = await UserRepository.findByEmail(dto.recipient);
      if (existingUser) {
        targetUserId = existingUser.id;
      }
    }

    // Escenario 3: Respeto de preferencias de marketing
    if (dto.type === "marketing" && targetUserId) {
      const preferences =
        await notificationPreferenceRepository.findByUserId(targetUserId);
      // Si el usuario tiene las comunicaciones comerciales deshabilitadas
      if (preferences && !preferences.commercialEnabled) {
        // Registramos en historial el intento descartado por preferencias
        const historyRecord = await notificationHistoryRepository.create({
          userId: targetUserId,
          recipient: dto.recipient,
          type: dto.type,
          subject: dto.subject,
          bodyHtml: null,
          status: "failed",
          attempts: 0,
          errorMessage:
            "Envío omitido: El usuario tiene desactivadas las comunicaciones comerciales (Escenario 3).",
          payload: dto.templateData || null,
          sentAt: null,
        });

        return {
          notificationId: historyRecord.id,
          recipient: dto.recipient,
          type: dto.type,
          status: "failed",
          attempts: 0,
          sentAt: null,
          errorMessage:
            "Comunicaciones comerciales desactivadas por el usuario",
          skippedDueToPreferences: true,
        };
      }
    }

    // Renderizamos la plantilla HTML con branding corporativo (Task 4)
    const htmlBody = this.renderHtml(
      dto.type,
      dto.templateData,
      dto.customHtml
    );

    // Creamos el registro inicial en el historial
    const historyRecord = await notificationHistoryRepository.create({
      userId: targetUserId || null,
      recipient: dto.recipient,
      type: dto.type,
      subject: dto.subject,
      bodyHtml: htmlBody,
      status: "pending",
      attempts: 0,
      errorMessage: null,
      payload: dto.templateData || null,
      sentAt: null,
    });

    const executionPromise = this.executeSendWithRetries(historyRecord.id, {
      recipient: dto.recipient,
      subject: dto.subject,
      html: htmlBody,
    });

    // Si se requiere ejecución sincrónica (ej. tests o flujo directo)
    if (options?.sync !== false) {
      return await executionPromise;
    }

    // Ejecución asíncrona desacoplada en segundo plano
    executionPromise.catch((err) => {
      console.error(
        `[NotificationService] Error enviando notificación ${historyRecord.id}:`,
        err
      );
    });

    return {
      notificationId: historyRecord.id,
      recipient: dto.recipient,
      type: dto.type,
      status: "processing",
      attempts: 0,
      sentAt: null,
      errorMessage: null,
    };
  }

  /**
   * Ejecuta el envío con hasta 3 reintentos y backoff progresivo (Escenario 2).
   */
  public async executeSendWithRetries(
    notificationId: number,
    emailData: { recipient: string; subject: string; html: string }
  ): Promise<SendEmailResult> {
    let lastError: Error | null = null;
    let attempts = 0;

    await notificationHistoryRepository.update(notificationId, {
      status: "processing",
    });

    while (attempts < this.maxRetries) {
      attempts++;
      try {
        await emailService.sendRawHtmlEmail({
          to: emailData.recipient,
          subject: emailData.subject,
          html: emailData.html,
          consoleLabel: `✉ [Intento ${attempts}/${this.maxRetries}] ${emailData.subject} para ${emailData.recipient}`,
        });

        // Envío exitoso (Escenario 1)
        const sentAt = new Date();
        await notificationHistoryRepository.update(notificationId, {
          status: "sent",
          attempts,
          sentAt,
          errorMessage: null,
        });

        return {
          notificationId,
          recipient: emailData.recipient,
          type: "email",
          status: "sent",
          attempts,
          sentAt,
          errorMessage: null,
        };
      } catch (err: any) {
        lastError = err;
        await notificationHistoryRepository.incrementAttempts(
          notificationId,
          err.message
        );

        if (attempts < this.maxRetries) {
          const backoff = this.getBackoffMs(attempts);
          await this.delay(backoff);
        }
      }
    }

    // Fallaron todos los 3 reintentos -> se marca como fallida en el historial (Escenario 2)
    const finalErrorMessage = lastError
      ? lastError.message
      : "Error desconocido al enviar el correo";
    await notificationHistoryRepository.markAsFailed(
      notificationId,
      finalErrorMessage
    );

    return {
      notificationId,
      recipient: emailData.recipient,
      type: "email",
      status: "failed",
      attempts,
      sentAt: null,
      errorMessage: finalErrorMessage,
    };
  }

  /**
   * Reenvía una notificación registrada previamente en el historial (Task 1).
   */
  async resendNotification(notificationId: number): Promise<SendEmailResult> {
    const record = await notificationHistoryRepository.findById(notificationId);
    if (!record) {
      throw new AppError(
        "Notificación no encontrada en el historial.",
        404,
        "NOTIFICATION_NOT_FOUND"
      );
    }

    // Si no tiene cuerpo HTML, lo regeneramos
    const htmlBody =
      record.bodyHtml ||
      this.renderHtml(record.type, record.payload || undefined);

    // Reseteamos el estado a pending para reintentar
    await record.update({
      status: "pending",
      attempts: 0,
      errorMessage: null,
    });

    return await this.executeSendWithRetries(record.id, {
      recipient: record.recipient,
      subject: record.subject,
      html: htmlBody,
    });
  }

  /**
   * Obtiene el historial de notificaciones con paginación y filtros opcionales.
   */
  async getHistory(options: {
    userId?: number;
    recipient?: string;
    status?: NotificationStatus;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(Number(options.page) || 1, 1);
    const limit = Math.min(Math.max(Number(options.limit) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const { rows, count } = await notificationHistoryRepository.findHistory({
      userId: options.userId,
      recipient: options.recipient,
      status: options.status,
      type: options.type,
      limit,
      offset,
    });

    return {
      items: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Obtiene las preferencias de notificación de un usuario.
   */
  async getPreferences(userId: number): Promise<NotificationPreference> {
    let preferences =
      await notificationPreferenceRepository.findByUserId(userId);
    if (!preferences) {
      preferences = await notificationPreferenceRepository.create(
        userId,
        false
      );
    }
    return preferences;
  }

  /**
   * Actualiza las preferencias de notificación de un usuario (Task 1).
   */
  async updatePreferences(
    userId: number,
    dto: UpdateNotificationPreferencesDto
  ): Promise<NotificationPreference> {
    const updated = await notificationPreferenceRepository.updateByUserId(
      userId,
      dto
    );
    if (!updated) {
      throw new AppError(
        "No fue posible actualizar las preferencias.",
        500,
        "PREFERENCES_UPDATE_FAILED"
      );
    }
    return updated;
  }
}

export default new NotificationService();
