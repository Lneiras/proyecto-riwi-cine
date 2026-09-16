// app/src/controllers/notification.controller.ts

/**
 * Controlador de Notificaciones (HU-015)
 * ---------------------------------------
 * Expone los endpoints HTTP para:
 * - POST /notifications/email       : Envío/encolamiento de correos transaccionales o marketing.
 * - GET  /notifications/history     : Consulta del historial de notificaciones.
 * - GET  /notifications/preferences : Consulta de preferencias de notificación del usuario.
 * - PUT  /notifications/preferences : Actualización de preferencias de notificación.
 * - POST /notifications/resend      : Reenvío de una notificación fallida o pendiente.
 */

import { Request, Response, NextFunction } from "express";
import notificationService from "../services/notification.service";
import { validateSendEmailNotificationDto } from "../dto/send-email-notification.dto";
import { validateUpdateNotificationPreferencesDto } from "../dto/update-notification-preferences.dto";
import { validateResendNotificationDto } from "../dto/resend-notification.dto";
import { successResponse, AppError } from "../utils/apiResponse";

export class NotificationController {
  /**
   * Envía o encola un correo electrónico (HU-015 Task 1).
   */
  static async sendEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { valid, error, data } = validateSendEmailNotificationDto(req.body);
      if (!valid) {
        throw new AppError(error!, 400, "VALIDATION_ERROR");
      }

      // Si el usuario está autenticado y no especificó userId en el body, lo asociamos
      if (req.userId && !data.userId) {
        data.userId = req.userId;
      }

      const isAsync = req.query.async === "true";
      const result = await notificationService.sendEmail(data, {
        sync: !isAsync,
      });

      const statusCode =
        result.status === "failed" && result.skippedDueToPreferences
          ? 200
          : 201;
      return successResponse(res, result, statusCode);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene el historial de notificaciones del usuario autenticado (HU-015 Task 1).
   */
  static async getHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(
          "Debes tener una sesión activa.",
          401,
          "UNAUTHORIZED"
        );
      }

      const { status, type, page, limit } = req.query;

      const result = await notificationService.getHistory({
        userId,
        status: status as any,
        type: type as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return successResponse(res, result.items, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene las preferencias de notificación del usuario autenticado.
   */
  static async getPreferences(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(
          "Debes tener una sesión activa.",
          401,
          "UNAUTHORIZED"
        );
      }

      const preferences = await notificationService.getPreferences(userId);
      return successResponse(res, preferences, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza las preferencias de notificación del usuario autenticado (HU-015 Task 1).
   */
  static async updatePreferences(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(
          "Debes tener una sesión activa.",
          401,
          "UNAUTHORIZED"
        );
      }

      const { valid, error, data } = validateUpdateNotificationPreferencesDto(
        req.body
      );
      if (!valid) {
        throw new AppError(error!, 400, "VALIDATION_ERROR");
      }

      const updated = await notificationService.updatePreferences(userId, data);
      return successResponse(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reenvía una notificación específica desde el historial (HU-015 Task 1).
   */
  static async resend(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { valid, error, data } = validateResendNotificationDto(req.body);
      if (!valid) {
        throw new AppError(error!, 400, "VALIDATION_ERROR");
      }

      const result = await notificationService.resendNotification(
        data.notificationId
      );
      return successResponse(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}

export default NotificationController;
